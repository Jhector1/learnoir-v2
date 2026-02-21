// src/lib/practice/api/practiceGet/handler.ts
import type { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { PracticeKind } from "@prisma/client";

import type {
  Difficulty,
  Exercise,
  GenKey,
  TopicSlug,
} from "@/lib/practice/types";
import type { TopicContext } from "@/lib/practice/generator/generatorTypes";

import { DIFFICULTIES, rngFromActor } from "@/lib/practice/catalog";
import { getExerciseWithExpected } from "@/lib/practice/generator";

import type { GetParams } from "./schemas";
import { toPracticeKindOrThrow } from "./enums";
import { createInstance } from "./instance";
import { resolveTopicFromDb } from "./topic";
import { signKey } from "./key";
import { resolveRequestSalt } from "./salt";
import {
  loadSession,
  assertSessionActive,
  assertSessionOwnership,
  enforceAssignmentEntitlement,
  computeAllowRevealEffective,
  getAssignmentDifficulty,
} from "./session";











// --- Quiz-only policy (server enforced) -------------------------

// Keep this as strings to avoid enum mismatch / compile issues if you rename kinds.
const QUIZ_ONLY_KINDS = new Set<string>([
  "single_choice",
  "multi_choice",
  "numeric",
  "drag_reorder",
  "text_input",
  "voice_input",
  "matrix_input",
  "vector_drag_target",
  "vector_drag_dot",
  "code_input", // include if you consider code exercises "quiz-like"
  // add/remove as needed
]);

function isQuizOnlySession(session: any) {
  // ✅ Most secure: apply to ALL session runs that come from module practice start
  // Your /api/modules/[moduleSlug]/practice/start always creates session with assignmentId: null
  return Boolean(session?.id) && session?.assignmentId == null;
}

function isAllowedQuizKind(kind: unknown) {
  const k = String(kind ?? "");
  return QUIZ_ONLY_KINDS.has(k);
}






export type PracticeGetResult =
  | { kind: "json"; status: number; body: any }
  | { kind: "res"; res: NextResponse };

function statusOf(err: any, fallback = 500) {
  return Number(err?.status) || fallback;
}

function buildRunMeta(args: {
  session: any | null;
  diff: Difficulty;
  allowRevealEffective: boolean;
}) {
  const { session, diff, allowRevealEffective } = args;

  const isAssignment = Boolean(session?.assignmentId);
  const isSessionRun = Boolean(session?.id);

  const returnUrl =
    typeof session?.returnUrl === "string" ? session.returnUrl : null;

  if (isAssignment) {
    return {
      mode: "assignment" as const,
      lockDifficulty: diff,
      lockTopic: "all" as const,
      allowReveal: false,
      showDebug: Boolean(session?.assignment?.showDebug),
      targetCount: session?.targetCount ?? 10,
      maxAttempts: session?.assignment?.maxAttempts ?? 3,
      returnUrl,
    };
  }

  if (isSessionRun) {
    return {
      mode: "session" as const,
      lockDifficulty: diff,
      lockTopic: "all" as const,
      allowReveal: false,
      showDebug: false,
      targetCount: session?.targetCount ?? 0,
      maxAttempts: 3,
      returnUrl,
    };
  }

  return {
    mode: "practice" as const,
    lockDifficulty: null,
    lockTopic: null,
    targetCount: 10,
    allowReveal: allowRevealEffective,
    showDebug: false,
    maxAttempts: 5,
    returnUrl: null,
  };
}

/**
 * ✅ Answer leakage policy (statusOnly):
 * - Assignments: ONLY if assignment.allowReveal === true
 * - Non-assignments: OK (practice/session) — these are not graded assignments
 *
 * If you want to be even stricter, you can require `session.status === "completed"`
 * before returning expected, but I kept it simple and safe for assignments.
 */
function canRevealExpectedForStatusOnly(session: any): boolean {
  if (!session) return false;
  if (session.assignmentId) return Boolean(session.assignment?.allowReveal);
  return true;
}

// function pickExpectedPayload(secretPayload: any) {
//   const sp = secretPayload ?? null;
//   if (!sp || typeof sp !== "object") return null;
//   return (
//     (sp as any).expectedAnswerPayload ??
//     (sp as any).expected ??
//     (sp as any).answer ??
//     (sp as any).correct ??
//     null
//   );
// }

// function pickExplanation(secretPayload: any) {
//   const sp = secretPayload ?? null;
//   if (!sp || typeof sp !== "object") return null;
//   return (sp as any).explanation ?? (sp as any).rationale ?? null;
// }
function sanitizeExpectedForHistory(kind: string, raw: any) {
  const k = String(kind);

  if (k === "single_choice") {
    const optionId =
        raw?.optionId ?? raw?.correctOptionId ?? raw?.correct ?? raw;
    return optionId ? { kind: "single_choice", optionId: String(optionId) } : null;
  }

  if (k === "multi_choice") {
    const ids = raw?.optionIds ?? raw?.correctOptionIds ?? raw?.correct ?? raw;
    return Array.isArray(ids) && ids.length
        ? { kind: "multi_choice", optionIds: ids.map((x) => String(x)) }
        : null;
  }

  if (k === "drag_reorder") {
    const order = raw?.order ?? raw;
    return Array.isArray(order) && order.length
        ? { kind: "drag_reorder", order: order.map((x) => String(x)) }
        : null;
  }

  // ✅ everything else: do NOT include expected via statusOnly/history
  return null;
}

function pickExpectedPayload(kind: string, secretPayload: any) {
  const k = String(kind);

  // 🚫 hard block
  if (k === "code_input") return null;

  const sp = secretPayload ?? null;
  if (!sp || typeof sp !== "object") return null;

  // ✅ preferred: explicit safe payload you store
  const safe = (sp as any).expectedAnswerPayload ?? null;
  if (safe != null) return sanitizeExpectedForHistory(k, safe);

  // legacy fallback (sanitized + safe kinds only)
  const legacy =
      (sp as any).expected ??
      (sp as any).answer ??
      (sp as any).correct ??
      null;

  return sanitizeExpectedForHistory(k, legacy);
}

function pickExplanation(kind: string, secretPayload: any) {
  const k = String(kind);

  // 🚫 don’t ship explanations for code_input via statusOnly
  if (k === "code_input") return null;

  // ✅ optionally restrict to safe kinds
  if (k !== "single_choice" && k !== "multi_choice" && k !== "drag_reorder") return null;

  const sp = secretPayload ?? null;
  if (!sp || typeof sp !== "object") return null;
  return (sp as any).explanation ?? (sp as any).rationale ?? null;
}

export async function handlePracticeGet(args: {
  prisma: PrismaClient;
  actor: { userId?: string | null; guestId?: string | null };
  params: GetParams;
}): Promise<PracticeGetResult> {
  const { prisma, actor, params } = args;

  const {
    subject,
    module,
    topic,
    difficulty,
    section,
    sessionId,
    allowReveal,
    preferKind,
    salt,
    statusOnly,

    // ✅ persist returnUrl once
    returnUrl,
    returnTo,

    // ✅ optional status extras
    includeMissed,
    // includeHistory is read via (params as any).includeHistory to avoid breaking
    // if your schema doesn't include it yet.
  } = params as any;

  // ------------------------------------------------------------
  // 1) session (optional)
  // ------------------------------------------------------------
  const session = sessionId ? await loadSession(prisma, sessionId) : null;

  if (sessionId && !session) {
    return { kind: "json", status: 404, body: { message: "Session not found." } };
  }

  if (session) {
    // ownership always (even statusOnly)
    try {
      assertSessionOwnership(session, actor);
    } catch (e: any) {
      return { kind: "json", status: statusOf(e, 400), body: { message: e.message } };
    }

    // entitlement always (even statusOnly)
    const gate = await enforceAssignmentEntitlement(session);
    if (gate.kind === "res") return gate;

    // Persist returnUrl ONCE (first time only)
    const ru =
      typeof returnUrl === "string"
        ? returnUrl
        : typeof returnTo === "string"
          ? returnTo
          : null;

    if (ru && !session.returnUrl) {
      await prisma.practiceSession.update({
        where: { id: session.id },
        data: { returnUrl: ru },
        select: { id: true },
      });
      (session as any).returnUrl = ru;
    }
  }

  // ------------------------------------------------------------
  // STATUS ONLY (summary + refresh-safe)
  // ------------------------------------------------------------
  if (statusOnly === "true") {
    if (!session) {
      return {
        kind: "json",
        status: 400,
        body: { message: "statusOnly requires sessionId." },
      };
    }

    const answeredCount = await prisma.practiceQuestionInstance.count({
      where: { sessionId: session.id, answeredAt: { not: null } },
    });

    const targetCount = Number(session.targetCount ?? 0);
    const pct = targetCount > 0 ? Math.min(1, answeredCount / targetCount) : 0;

    const complete =
      session.status === "completed" ||
      (targetCount > 0 && answeredCount >= targetCount);

    const allowRevealEffective = computeAllowRevealEffective(session, allowReveal);

    const assignmentDiff = getAssignmentDifficulty(session);
    const diff: Difficulty =
      assignmentDiff ?? (session?.difficulty as any as Difficulty) ?? "easy";

    const run = buildRunMeta({ session, diff, allowRevealEffective });

    const actorOR = [
      actor.userId ? { userId: actor.userId } : null,
      actor.guestId ? { guestId: actor.guestId } : null,
    ].filter(Boolean) as any[];

    const includeMissedParam =
      includeMissed === "true" || (params as any)?.includeMissed === "true";

    const includeHistoryParam =
      (params as any)?.includeHistory === "true";

    const canRevealExpected = canRevealExpectedForStatusOnly(session);

    // ---------------------------
    // Missed (optional)
    // ---------------------------
    let missed: any[] = [];

    if (includeMissedParam) {
      const rows = await prisma.practiceQuestionInstance.findMany({
        where: { sessionId: session.id, answeredAt: { not: null } },
        orderBy: { answeredAt: "asc" },
        select: {
          id: true,
          answeredAt: true,
          createdAt: true,
          kind: true,
          title: true,
          prompt: true,
          publicPayload: true,
          secretPayload: true,
          topic: { select: { slug: true } },
          attempts: {
            where: {
              revealUsed: false,
              ...(actorOR.length ? { OR: actorOR } : {}),
            },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { answerPayload: true, ok: true, createdAt: true },
          },
        },
      });

      const sigFromRow = (row: any) =>
        [
          String(row?.topic?.slug ?? ""),
          String(row?.kind ?? ""),
          String(row?.title ?? ""),
          String(row?.prompt ?? ""),
        ].join("||");

      const unresolved = new Map<string, { row: any; last: any }>();

      for (const row of rows as any[]) {
        const sig = sigFromRow(row);
        if (!sig) continue;

        const last = Array.isArray(row.attempts) ? row.attempts[0] : null;
        const ok = Boolean(last?.ok);

        if (ok) unresolved.delete(sig);
        else unresolved.set(sig, { row, last });
      }

      missed = Array.from(unresolved.values()).map(({ row, last }) => {
        const topicSlug = String(row?.topic?.slug ?? "all");

        // ✅ Only include expected/explanation when allowed
        const expected = canRevealExpected ? pickExpectedPayload(row.kind, row.secretPayload) : null;
        const explanation = canRevealExpected ? pickExplanation(row.kind, row.secretPayload) : null;
        return {
          id: `${row.id}-missed`,
          at: last?.createdAt
            ? new Date(last.createdAt).getTime()
            : row?.answeredAt
              ? new Date(row.answeredAt).getTime()
              : row?.createdAt
                ? new Date(row.createdAt).getTime()
                : 0,

          topic: topicSlug,
          kind: String(row?.kind ?? ""),
          title: String(row?.title ?? ""),
          prompt: String(row?.prompt ?? ""),
          publicPayload: row.publicPayload ?? null,

          userAnswer: last?.answerPayload ?? null,
          expected,
          explanation,
        };
      });
    }

    // ---------------------------
    // History (optional) — ALL answered questions (correct + incorrect)
    // ---------------------------
    let history: any[] = [];

    if (includeHistoryParam) {
      // attempt counts (non-reveal) per instance for this actor
      const counts = await prisma.practiceAttempt.groupBy({
        by: ["instanceId"],
        where: {
          sessionId: session.id,
          revealUsed: false,
          ...(actorOR.length ? { OR: actorOR } : {}),
        },
        _count: { _all: true },
      });
      const countMap = new Map(counts.map((c) => [c.instanceId, c._count._all]));

      // Pull all attempts once (small: targetCount * attempts)
      const attemptRows = await prisma.practiceAttempt.findMany({
        where: {
          sessionId: session.id,
          ...(actorOR.length ? { OR: actorOR } : {}),
        },
        orderBy: { createdAt: "desc" },
        select: {
          instanceId: true,
          ok: true,
          revealUsed: true,
          createdAt: true,
          answerPayload: true,
        },
      });

      const lastNonReveal = new Map<string, any>();
      const revealUsedAny = new Map<string, boolean>();

      for (const a of attemptRows) {
        if (a.revealUsed) {
          revealUsedAny.set(a.instanceId, true);
          continue;
        }
        if (!lastNonReveal.has(a.instanceId)) lastNonReveal.set(a.instanceId, a);
      }

      const instances = await prisma.practiceQuestionInstance.findMany({
        where: {
          sessionId: session.id,
          answeredAt: { not: null }, // ✅ only finalized/answered questions
        },
        orderBy: { answeredAt: "asc" },
        select: {
          id: true,
          createdAt: true,
          answeredAt: true,

          kind: true,
          difficulty: true,
          title: true,
          prompt: true,
          publicPayload: true,
          secretPayload: true,

          topic: { select: { slug: true } },
        },
      });

      history = instances.map((row) => {
        const last = lastNonReveal.get(row.id) ?? null;

        const expectedAnswerPayload = canRevealExpected
            ? pickExpectedPayload(row.kind, row.secretPayload)
            : null;

        const explanation = canRevealExpected
            ? pickExplanation(row.kind, row.secretPayload)
            : null;

        return {
          instanceId: row.id,
          createdAt: row.createdAt,
          answeredAt: row.answeredAt,

          topic: row.topic?.slug ?? "all",
          kind: row.kind,
          difficulty: row.difficulty,
          title: row.title,
          prompt: row.prompt,

          publicPayload: row.publicPayload ?? null,

          attempts: countMap.get(row.id) ?? 0,
          lastOk: last ? Boolean(last.ok) : null,
          lastRevealUsed: Boolean(revealUsedAny.get(row.id) ?? false),
          lastAnswerPayload: last?.answerPayload ?? null,
          lastAttemptAt: last?.createdAt ?? null,

          // ✅ used by client to show correct selection when incorrect
          expectedAnswerPayload,
          explanation,
        };
      });
    }

    return {
      kind: "json",
      status: 200,
      body: {
        complete,
        pct,
        status: session.status,
        answeredCount,
        targetCount,

        // ✅ new keys (what your client expects)
        correctCount: session.correct ?? 0,
        totalCount: session.total ?? 0,

        // ✅ legacy keys (keep so nothing else breaks)
        correct: session.correct ?? 0,
        total: session.total ?? 0,

        assignmentId: session.assignmentId ?? null,
        sessionId: session.id,

        missed,
        history,

        run,
        returnUrl: run.returnUrl,
      },
    };
  }

  // ------------------------------------------------------------
  // ✅ Only enforce "active" for REAL exercise generation
  // ------------------------------------------------------------
  if (session) {
    try {
      assertSessionActive(session);
    } catch (e: any) {
      return {
        kind: "json",
        status: statusOf(e, 400),
        body: { message: e.message },
      };
    }
  }

  // ------------------------------------------------------------
  // 2) allowReveal policy
  // ------------------------------------------------------------
  const allowRevealEffective = computeAllowRevealEffective(session, allowReveal);

  // ------------------------------------------------------------
  // 3) difficulty
  // ------------------------------------------------------------
  const assignmentDiff = getAssignmentDifficulty(session);
  const diff: Difficulty =
    assignmentDiff ??
    (session ? (session.difficulty as any as Difficulty) : null) ??
    (difficulty === "easy" || difficulty === "medium" || difficulty === "hard"
      ? difficulty
      : rngFromActor({
          userId: actor.userId,
          guestId: actor.guestId,
          sessionId: session?.id,
          salt: "diff-pick",
        }).pick(DIFFICULTIES));

  // ------------------------------------------------------------
  // 4) request salt (stable or random)
  // ------------------------------------------------------------
  const { reqSalt } = resolveRequestSalt(salt);

  // ------------------------------------------------------------
  // 5) resolve topic (db-driven)
  // ------------------------------------------------------------
  const moduleIdFromSession = session?.section?.moduleId ?? null;
  const assignmentIdFromSession = session?.assignmentId ?? null;

  const resolved = await resolveTopicFromDb({
    prisma,
    subjectSlug: session ? undefined : subject,
    moduleSlug: session ? undefined : module,
    sectionSlug: session?.section?.slug ?? section,
    rawTopic: topic,

    subjectIdFromSession: session?.section?.subjectId ?? null,
    moduleIdFromSession,
    assignmentIdFromSession,

    rngSeedParts: {
      userId: actor.userId,
      guestId: actor.guestId,
      sessionId: session?.id ?? null,
    },
    topicPickSalt: `topic-pick|${reqSalt}`,
  });

  if (resolved.kind !== "ok") {
    return {
      kind: "json",
      status: 500,
      body: { message: "Practice API failed", explanation: resolved.message },
    };
  }

  const topicSlug = resolved.topicSlug;
  const topicIdHint = resolved.topicId;
  const genKey = resolved.genKey;

  if (!genKey) {
    return {
      kind: "json",
      status: 500,
      body: {
        message: "Practice API failed",
        explanation: `Topic "${topicSlug}" has no genKey in DB.`,
      },
    };
  }

  const preferKindEnum: PracticeKind | null = preferKind
    ? toPracticeKindOrThrow(preferKind)
    : null;

  // ------------------------------------------------------------
  // 6) deterministic generation rng
  // ------------------------------------------------------------
  const actorPart = actor.userId
    ? `user:${actor.userId}`
    : actor.guestId
      ? `guest:${actor.guestId}`
      : "anon";

  const seedPolicy = (params as any).seedPolicy === "global" ? "global" : "actor";

  const rngArgs =
      seedPolicy === "global"
          ? { userId: null, guestId: null, sessionId: null }
          : { userId: actor.userId, guestId: actor.guestId, sessionId: session?.id ?? null };

  const exerciseRng = rngFromActor({
    ...rngArgs,
    salt: [
      "practice-ex",
      `seedPolicy=${seedPolicy}`,
      `genKey=${genKey}`,
      `topic=${topicSlug}`,
      `diff=${diff}`,
      `preferKind=${preferKindEnum ?? ""}`,
      `exerciseKey=${(params as any).exerciseKey ?? ""}`,
      `salt=${reqSalt ?? ""}`,
    ].join("|"),
  });


  // ------------------------------------------------------------
  // 7) generate exercise (+ expected)
  // ------------------------------------------------------------
  let out: any;
  const meta2 = {
    ...(resolved.meta ?? {}),
    forceKey: (params as any).exerciseKey ?? undefined,
  };

  try {
    out = await getExerciseWithExpected(genKey as GenKey, diff, {
      topicSlug,
      variant: resolved.variant ?? null,
      meta: meta2,
      subjectSlug: subject ?? null,
      moduleSlug: module ?? null,
      preferKind: preferKindEnum ?? null,
      rng: exerciseRng as any,


      salt: reqSalt ?? null,
      exerciseKey: ((params as any).exerciseKey ?? null) as any,

    } as TopicContext);
  } catch (e: any) {
    return {
      kind: "json",
      status: 500,
      body: {
        message: "Generator failed",
        explanation: e?.message ?? "Unknown generator error",
        meta: { genKey, topic: topicSlug, variant: resolved.variant ?? null },
      },
    };
  }

  const ex0 = out?.exercise;
  const kind0 = ex0?.kind;

  if (!ex0 || typeof kind0 !== "string" || !kind0.trim()) {
    return {
      kind: "json",
      status: 500,
      body: {
        message: "Generator returned invalid exercise",
        explanation: `Missing/invalid kind. genKey="${genKey}" topic="${topicSlug}" variant="${resolved.variant ?? "null"}"`,
        got: { exercise: ex0 },
      },
    };
  }

  const exercise = { ...(ex0 as any), topic: topicSlug } as Exercise;

  // ------------------------------------------------------------
  // 8) create instance
  // ------------------------------------------------------------
  const instance = await createInstance({
    prisma,
    sessionId: session?.id ?? null,
    exercise,
    expected: out?.expected,
    topicSlug: topicSlug as TopicSlug,
    difficulty: diff,
    topicIdHint,
  });

  // ------------------------------------------------------------
  // 9) sign key
  // ------------------------------------------------------------
  const key = signKey({
    instanceId: instance.id,
    sessionId: instance.sessionId ?? null,
    userId: actor.userId ?? null,
    guestId: actor.guestId ?? null,
    allowReveal: allowRevealEffective,
  });

  const run = buildRunMeta({ session, diff, allowRevealEffective });

  // ------------------------------------------------------------
  // 10) return
  // ------------------------------------------------------------
  return {
    kind: "json",
    status: 200,
    body: {
      exercise,
      key,
      sessionId: session?.id ?? null,
      run,
      meta: {
        genKey,
        topic: topicSlug,
        variant: resolved.variant ?? null,
        allowReveal: allowRevealEffective,
        salt: reqSalt ?? null,
      },
    },
  };
}
