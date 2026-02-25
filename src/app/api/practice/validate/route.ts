// src/app/api/practice/validate/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { attachGuestCookie } from "@/lib/practice/actor";
import { verifyPracticeKey } from "@/lib/practice/key";
import { requireEntitledUser } from "@/lib/billing/requireEntitledUser";

import {
  BodySchema,
  normalizeKey,
  type ValidateBody,
} from "@/lib/practice/api/validate/schemas";

import {
  resolveActorForPayload,
  isActorMismatch,
} from "@/lib/practice/api/validate/actorBinding";

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

export const runtime = "nodejs";

async function readJson(req: Request) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

function json(message: string, status: number, extra?: any) {
  return NextResponse.json(extra ? { message, ...extra } : { message }, { status });
}

export async function POST(req: Request) {
  // --- 1) Validate request body
  const raw = await readJson(req);
  const parsed = BodySchema.safeParse(raw);

  if (!parsed.success) {
    return json("Invalid body.", 400, { issues: parsed.error.issues });
  }

  const body: ValidateBody = parsed.data;
  const isReveal = Boolean(body.reveal);
  const answer = body.answer;

  // ✅ FIX: Prisma.InputJsonValue does NOT accept Prisma.JsonNull.
  // If not revealing, answer must exist (so we can persist real JSON).
  if (!isReveal && !answer) {
    return json("Missing answer.", 400);
  }

  const key = normalizeKey(body.key);
  if (!key) return json("Missing key.", 400);

  // --- 2) Verify key (must include instanceId and actor binding)
  const payload = verifyPracticeKey(key);
  if (!payload) return json("Invalid or expired key.", 401);

  // --- 3) Resolve actor + guest cookie (and adopt key guestId if needed)
  const { actor, setGuestId } = await resolveActorForPayload(payload);

  // actor binding prevents key sharing
  if (isActorMismatch(payload, actor)) {
    const res = json("Actor mismatch.", 401);
    return attachGuestCookie(res, setGuestId);
  }

  // --- 4) Load instance + session (+ assignment fields)
  const instance = await loadInstance(prisma, (payload as any).instanceId);
  if (!instance) {
    const res = json("Instance not found.", 404);
    return attachGuestCookie(res, setGuestId);
  }

  const sess = instance.session ?? null;
  const isAssignment = Boolean(sess?.assignmentId);
  const hasSession = Boolean(sess?.id);

  // --- 4.1) HARD GUARD: answer kind must match instance kind (when submitting)
  if (!isReveal && answer && answer.kind !== instance.kind) {
    const res = json("Answer kind mismatch.", 400, {
      debug: { instanceKind: instance.kind, answerKind: answer.kind },
    });
    return attachGuestCookie(res, setGuestId);
  }

  // --- 5) Ownership + entitlement gates (assignment only)
  if (isAssignment) {
    const gate = await requireEntitledUser();
    if (!gate.ok) return gate.res;

    if (sess?.userId && sess.userId !== gate.userId) {
      const res = json("Forbidden.", 403);
      return attachGuestCookie(res, setGuestId);
    }
  }

  // session owner must match actor (practice + assignment)
  if (
      (sess?.userId && sess.userId !== (actor.userId ?? null)) ||
      (sess?.guestId && sess.guestId !== (actor.guestId ?? null))
  ) {
    const res = json("Forbidden.", 403);
    return attachGuestCookie(res, setGuestId);
  }

  // --- 6) Reveal policy
  const canReveal = computeCanReveal({
    isAssignment,
    allowRevealFromKey: Boolean((payload as any).allowReveal),
    allowRevealFromAssignment: Boolean(sess?.assignment?.allowReveal),
  });

  if (isReveal && !canReveal) {
    const res = json("Reveal is disabled for this question.", 403);
    return attachGuestCookie(res, setGuestId);
  }

  // --- 7) Attempts policy (server truth)
  const mode: RunMode = isAssignment ? "assignment" : hasSession ? "session" : "practice";

  const maxAttempts = computeMaxAttempts({
    mode,
    assignmentMaxAttempts: sess?.assignment?.maxAttempts ?? null,
  });

  // block submitting new attempts when already finalized (answeredAt set)
  if (!isReveal && instance.answeredAt) {
    const res = NextResponse.json(
        { message: "This question is already finalized.", finalized: true },
        { status: 409 },
    );
    return attachGuestCookie(res, setGuestId);
  }

  const priorNonRevealAttempts = await countPriorNonRevealAttempts(prisma, {
    instanceId: instance.id,
    actor,
  });

  // enforce attempts only if finite
  if (!isReveal && maxAttempts != null && priorNonRevealAttempts >= maxAttempts) {
    const res = NextResponse.json(
        {
          message: "No attempts left for this question.",
          attempts: { used: priorNonRevealAttempts, max: maxAttempts, left: 0 },
          finalized: true,
        },
        { status: 409 },
    );
    return attachGuestCookie(res, setGuestId);
  }

  // --- 8) Canonical expected (secretPayload.expected)
  const expectedCanon = getExpectedCanon(instance);
  if (!expectedCanon) {
    const res = json("Server bug: missing secretPayload.expected.", 500);
    return attachGuestCookie(res, setGuestId);
  }

  if ((expectedCanon as any).kind && (expectedCanon as any).kind !== instance.kind) {
    const res = json("Server bug: expected.kind mismatch.", 500, {
      debug: { instanceKind: instance.kind, expectedKind: (expectedCanon as any).kind },
    });
    return attachGuestCookie(res, setGuestId);
  }

  // --- 9) Grade
  const showDebug = Boolean(sess?.assignment?.showDebug);

  const graded = await gradeInstance({
    instance,
    expectedCanon,
    answer: isReveal ? null : answer!, // ✅ guaranteed above
    isReveal,
    showDebug,
  });

  // --- 10) Finalization + persist attempt + session updates
  const nextNonRevealAttempts = isReveal ? priorNonRevealAttempts : priorNonRevealAttempts + 1;

  const finalizeOnExhaust = mode === "assignment" || mode === "session";
  const exhausted = maxAttempts != null && nextNonRevealAttempts >= maxAttempts;

  const finalized = isReveal ? false : Boolean(graded.ok) || (finalizeOnExhaust && exhausted);

  const persisted = await persistAttemptAndFinalize(prisma, {
    instance,
    actor,
    isReveal,
    // ✅ NO Prisma.JsonNull ever. Must be real JSON.
    answerPayload: isReveal ? { reveal: true } : answer!,
    ok: isReveal ? false : Boolean(graded.ok),
    finalized,
  });

  // --- 11) Response shaping
  const includeExpected = isReveal;

  let publicExplanation = graded.explanation;
  if (!includeExpected && instance.kind === "numeric" && !graded.ok) {
    publicExplanation = "Not correct.";
  }

  const left = maxAttempts == null ? null : Math.max(0, maxAttempts - nextNonRevealAttempts);
  const returnUrl = sess?.returnUrl ?? null;

  const res = NextResponse.json({
    ok: isReveal ? false : Boolean(graded.ok),
    revealAnswer: isReveal ? graded.revealAnswer : null,
    expected: null,
    explanation: includeExpected ? graded.explanation : publicExplanation,
    finalized,
    attempts: {
      used: nextNonRevealAttempts,
      max: maxAttempts,
      left,
    },
    sessionComplete: persisted.sessionComplete,
    summary: persisted.sessionSummary,
    returnUrl,
  });

  return attachGuestCookie(res, setGuestId);
}