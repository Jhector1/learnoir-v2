// src/app/api/practice/validate/route.ts
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
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
  return NextResponse.json(extra ? { message, ...extra } : { message }, {
    status,
  });
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

  // HARD GUARD: answer kind must match instance kind (when submitting)
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

  // --- 7) Attempts policy
  // const sess = instance.session ?? null;
  // const isAssignment = Boolean(sess?.assignmentId);
  const isSessionRun = Boolean(sess?.id); // session exists => locked run
  const isLockedRun = isAssignment || isSessionRun;

  const maxAttempts = computeMaxAttempts({
    isLockedRun,
    assignmentMaxAttempts: sess?.assignment?.maxAttempts ?? null,
  });

  // block submitting new attempts when finalized
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

  if (!isReveal && priorNonRevealAttempts >= maxAttempts) {
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

  // optional sanity check: instance.kind must match expected.kind (if present)
  if (expectedCanon.kind && expectedCanon.kind !== instance.kind) {
    const res = json("Server bug: expected.kind mismatch.", 500, {
      debug: { instanceKind: instance.kind, expectedKind: expectedCanon.kind },
    });
    return attachGuestCookie(res, setGuestId);
  }

  // --- 9) Grade
  const showDebug = Boolean(sess?.assignment?.showDebug);

  const graded = await gradeInstance({
    instance,
    expectedCanon,
    answer: isReveal ? null : (answer ?? null),
    isReveal,
    showDebug,
  });

  // --- 10) Finalization + persist attempt + session updates
  const nextNonRevealAttempts = isReveal
    ? priorNonRevealAttempts
    : priorNonRevealAttempts + 1;

  // reveal never finalizes (practice/review + assignment)
  const finalized = isReveal
    ? false
    : graded.ok || nextNonRevealAttempts >= maxAttempts;

  const persisted = await persistAttemptAndFinalize(prisma, {
    instance,
    actor,
    isReveal,
    answerPayload: isReveal ? { reveal: true } : (answer ?? Prisma.JsonNull),
    ok: isReveal ? false : graded.ok,
    finalized,
  });

  // --- 11) Response shaping (avoid leaking numeric expected when not revealing)
  const includeExpected = isReveal;

  let publicExplanation = graded.explanation;
  if (!includeExpected && instance.kind === "numeric" && !graded.ok) {
    publicExplanation = "Not correct.";
  }
  const returnUrl = sess?.returnUrl ?? null;
  const res = NextResponse.json({
    ok: isReveal ? false : graded.ok,
    revealAnswer: isReveal ? graded.revealAnswer : null,
    expected: null, // keep hidden (single source of truth remains secretPayload.expected)
    explanation: includeExpected ? graded.explanation : publicExplanation,
    finalized,
    attempts: {
      used: nextNonRevealAttempts,
      max: maxAttempts,
      left: Math.max(0, maxAttempts - nextNonRevealAttempts),
    },
    sessionComplete: persisted.sessionComplete,
    summary: persisted.sessionSummary,
    // ✅ NEW: lets client redirect on completion
    returnUrl,
  });

  return attachGuestCookie(res, setGuestId);
}
