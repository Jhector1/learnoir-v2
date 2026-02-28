// src/app/api/practice/validate/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { attachGuestCookie } from "@/lib/practice/actor";
import { verifyPracticeKey } from "@/lib/practice/key";
import { requireEntitledUser } from "@/lib/billing/requireEntitledUser";

import { BodySchema, normalizeKey, type ValidateBody } from "@/lib/practice/api/validate/schemas";
import { resolveActorForPayload, isActorMismatch } from "@/lib/practice/api/validate/actorBinding";
import { loadInstance } from "@/lib/practice/api/validate/load";
import { getExpectedCanon } from "@/lib/practice/api/validate/expected";
import {
  computeCanReveal,
  computeMaxAttempts,
  countPriorNonRevealAttempts,
  type RunMode,
} from "@/lib/practice/api/validate/policies";
import { gradeInstance } from "@/lib/practice/api/validate/grade";
import { persistAttemptAndFinalize } from "@/lib/practice/api/validate/persist";
import { gatePracticeModuleAccess } from "@/lib/billing/gatePracticeModuleAccess";
import { getLocaleFromCookie } from "@/serverUtils";

// ✅ add (shared redis/kv limiter)
import { rateLimit } from "@/lib/security/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* --------------------------------- helpers -------------------------------- */

async function readJson(req: Request) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

function harden(res: NextResponse) {
  res.headers.set("Cache-Control", "no-store, max-age=0");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "same-origin");
  res.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  res.headers.set("Content-Security-Policy", "default-src 'none'");
  return res;
}

function json(requestId: string, message: string, status: number, extra?: any) {
  const res = NextResponse.json(extra ? { message, ...extra, requestId } : { message, requestId }, { status });
  res.headers.set("X-Request-Id", requestId);
  return harden(res);
}

function getClientIp(req: Request) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() ?? "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
}

function safeSameOriginUrl(req: Request, input: string | null | undefined) {
  if (!input) return null;
  if (input.startsWith("/")) return input;

  const allowedOrigin = process.env.APP_ORIGIN ?? new URL(req.url).origin;
  try {
    const u = new URL(input);
    if (u.origin !== allowedOrigin) return null;
    return u.pathname + u.search + u.hash;
  } catch {
    return null;
  }
}

function enforceSameOriginPost(req: Request) {
  // CSRF guard for cookie-auth POSTs (prod only)
  if (process.env.NODE_ENV !== "production") return true;

  const origin = req.headers.get("origin");
  const allowed = process.env.APP_ORIGIN;
  if (!allowed) return false; // fail closed: set APP_ORIGIN in prod

  return origin === allowed;
}

/* ---------------------------------- route --------------------------------- */

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();

  // ✅ CSRF / origin guard
  if (!enforceSameOriginPost(req)) {
    return json(requestId, "Forbidden.", 403);
  }

  // ✅ Require JSON
  const ct = req.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    return json(requestId, "Unsupported content-type.", 415);
  }

  // ✅ Rate limit (prod-safe)
  try {
    const ip = getClientIp(req);
    const rl = await rateLimit(`validate:${ip}`);
    if (!rl.ok) {
      const res = json(requestId, "Too many requests.", 429);
      const retryAfter = Math.max(1, Math.ceil((rl.resetMs - Date.now()) / 1000));
      res.headers.set("Retry-After", String(retryAfter));
      return res;
    }
  } catch {
    return json(requestId, "Service unavailable.", 503);
  }

  // --- 1) Validate request body
  const raw = await readJson(req);
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return json(requestId, "Invalid body.", 400, { issues: parsed.error.issues });
  }

  const body: ValidateBody = parsed.data;
  const isReveal = Boolean(body.reveal);
  const answer = body.answer;

  if (!isReveal && !answer) return json(requestId, "Missing answer.", 400);

  const key = normalizeKey(body.key);
  if (!key) return json(requestId, "Missing key.", 400);

  // --- 2) Verify key
  const payload = verifyPracticeKey(key);
  if (!payload) return json(requestId, "Invalid or expired key.", 401);

  // --- 3) Resolve actor + guest cookie
  const { actor, setGuestId } = await resolveActorForPayload(payload);

  if (isActorMismatch(payload, actor)) {
    const res = attachGuestCookie(json(requestId, "Actor mismatch.", 401), setGuestId);
    return res;
  }

  // --- 4) Load instance + session
  const instance = await loadInstance(prisma, (payload as any).instanceId);
  if (!instance) return attachGuestCookie(json(requestId, "Instance not found.", 404), setGuestId);

  const sess = instance.session ?? null;
  const locale = await getLocaleFromCookie();

  const gate = await gatePracticeModuleAccess({
    prisma,
    actor,
    locale,
    sessionId: sess?.id ?? null,
    // ✅ sanitize any stored returnUrl before using it
    returnUrl: safeSameOriginUrl(req, sess?.returnUrl ?? null),
    back: null,
    bypass: false,
  });

  if (!gate.ok) {
    const r = attachGuestCookie(gate.res as NextResponse, setGuestId);
    r.headers.set("X-Request-Id", requestId);
    return harden(r);
  }

  const isAssignment = Boolean(sess?.assignmentId);
  const hasSession = Boolean(sess?.id);

  // --- 4.1) Answer kind must match instance kind
  if (!isReveal && answer && answer.kind !== instance.kind) {
    return attachGuestCookie(
        json(requestId, "Answer kind mismatch.", 400, {
          debug: { instanceKind: instance.kind, answerKind: answer.kind },
        }),
        setGuestId,
    );
  }

  // --- 5) Assignment entitlement
  if (isAssignment) {
    const g = await requireEntitledUser();
    if (!g.ok) {
      // ✅ keep guest cookie consistent even on entitlement failure
      return attachGuestCookie(g.res as NextResponse, setGuestId);
    }
    if (sess?.userId && sess.userId !== g.userId) {
      return attachGuestCookie(json(requestId, "Forbidden.", 403), setGuestId);
    }
  }

  // session owner must match actor
  if (
      (sess?.userId && sess.userId !== (actor.userId ?? null)) ||
      (sess?.guestId && sess.guestId !== (actor.guestId ?? null))
  ) {
    return attachGuestCookie(json(requestId, "Forbidden.", 403), setGuestId);
  }

  // --- 6) Reveal policy
  const canReveal = computeCanReveal({
    isAssignment,
    allowRevealFromKey: Boolean((payload as any).allowReveal),
    allowRevealFromAssignment: Boolean(sess?.assignment?.allowReveal),
  });

  if (isReveal && !canReveal) {
    return attachGuestCookie(json(requestId, "Reveal is disabled for this question.", 403), setGuestId);
  }

  // --- 7) Attempts policy
  const mode: RunMode = isAssignment ? "assignment" : hasSession ? "session" : "practice";
  const maxAttempts = computeMaxAttempts({
    mode,
    assignmentMaxAttempts: sess?.assignment?.maxAttempts ?? null,
  });

  if (!isReveal && instance.answeredAt) {
    return attachGuestCookie(
        json(requestId, "This question is already finalized.", 409, { finalized: true }),
        setGuestId,
    );
  }

  const priorNonRevealAttempts = await countPriorNonRevealAttempts(prisma, {
    instanceId: instance.id,
    actor,
  });

  if (!isReveal && maxAttempts != null && priorNonRevealAttempts >= maxAttempts) {
    return attachGuestCookie(
        json(requestId, "No attempts left for this question.", 409, {
          attempts: { used: priorNonRevealAttempts, max: maxAttempts, left: 0 },
          finalized: true,
        }),
        setGuestId,
    );
  }

  // --- 8) Canonical expected
  const expectedCanon = getExpectedCanon(instance);
  if (!expectedCanon) {
    return attachGuestCookie(json(requestId, "Server bug: missing secretPayload.expected.", 500), setGuestId);
  }

  // --- 9) Grade
  const showDebug = Boolean(sess?.assignment?.showDebug);
  const graded = await gradeInstance({
    instance,
    expectedCanon,
    answer: isReveal ? null : answer!,
    isReveal,
    showDebug,
  });

  // --- 10) Persist + finalize
  const nextNonRevealAttempts = isReveal ? priorNonRevealAttempts : priorNonRevealAttempts + 1;
  const finalizeOnExhaust = mode === "assignment" || mode === "session";
  const exhausted = maxAttempts != null && nextNonRevealAttempts >= maxAttempts;
  const finalized = isReveal ? false : Boolean(graded.ok) || (finalizeOnExhaust && exhausted);

  const persisted = await persistAttemptAndFinalize(prisma, {
    instance,
    actor,
    isReveal,
    answerPayload: isReveal ? { reveal: true } : answer!,
    ok: isReveal ? false : Boolean(graded.ok),
    finalized,
  });

  // --- 11) Response
  const includeExpected = isReveal;

  let publicExplanation = graded.explanation;
  if (!includeExpected && instance.kind === "numeric" && !graded.ok) {
    publicExplanation = "Not correct.";
  }

  const left = maxAttempts == null ? null : Math.max(0, maxAttempts - nextNonRevealAttempts);
  const returnUrl = safeSameOriginUrl(req, sess?.returnUrl ?? null);

  const okOut: boolean | null = isReveal ? null : Boolean(graded.ok);

  const res = NextResponse.json({
    ok: okOut,
    revealUsed: isReveal,
    revealAnswer: isReveal ? graded.revealAnswer : null,
    expected: null,
    explanation: includeExpected ? graded.explanation : publicExplanation,
    finalized,
    attempts: { used: nextNonRevealAttempts, max: maxAttempts, left },
    sessionComplete: persisted.sessionComplete,
    summary: persisted.sessionSummary,
    returnUrl,
    requestId,
  });

  res.headers.set("X-Request-Id", requestId);
  return attachGuestCookie(harden(res), setGuestId);
}