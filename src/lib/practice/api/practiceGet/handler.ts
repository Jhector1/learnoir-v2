import type { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { PracticeKind, PracticePurpose } from "@prisma/client";

import type { Difficulty, Exercise, GenKey, TopicSlug } from "@/lib/practice/types";
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
import {PurposeMode, PurposePolicy} from "@/lib/subjects/types";
import {coercePurposeMode, coercePurposePolicy} from "@/lib/subjects/quizClient";
// import {computeMaxAttempts} from "@/lib/practice/policies/attempts";

export type PracticeGetResult =
    | { kind: "json"; status: number; body: any }
    | { kind: "res"; res: NextResponse };

function statusOf(err: any, fallback = 500) {
    return Number(err?.status) || fallback;
}
import { computeMaxAttemptsCore, type RunMode } from "@/lib/practice/policies/attempts";

function buildRunMeta(args: {
    session: any | null;
    diff: Difficulty;
    allowRevealEffective: boolean;
}) {
    const { session, diff, allowRevealEffective } = args;

    const mode: RunMode = session?.assignmentId
        ? "assignment"
        : session?.id
            ? "session"
            : "practice";

    const maxAttempts = computeMaxAttemptsCore({
        mode,
        assignmentMaxAttempts: session?.assignment?.maxAttempts ?? null,
        // sessionMaxAttempts: (session as any)?.maxAttempts ?? null, // optional later
        // practiceMaxAttempts: null, // optional env override later
    });

    const returnUrl = typeof session?.returnUrl === "string" ? session.returnUrl : null;

    if (mode === "assignment") {
        return {
            mode: "assignment" as const,
            lockDifficulty: diff,
            lockTopic: "all" as const,
            allowReveal: false,
            showDebug: Boolean(session?.assignment?.showDebug),
            targetCount: session?.targetCount ?? 10,
            maxAttempts, // ✅ number | null
            returnUrl,
        };
    }

    if (mode === "session") {
        return {
            mode: "session" as const,
            lockDifficulty: diff,
            lockTopic: "all" as const,
            allowReveal: false,
            showDebug: false,
            targetCount: session?.targetCount ?? 0,
            maxAttempts, // ✅ number | null
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
        maxAttempts, // ✅ null => unlimited (no more hardcoded 5)
        returnUrl: null,
    };
}

/* -------------------------- statusOnly helpers -------------------------- */

function canRevealExpectedForStatusOnly(session: any): boolean {
    if (!session) return false;
    if (session.assignmentId) return Boolean(session.assignment?.allowReveal);
    return true;
}

function sanitizeExpectedForHistory(kind: string, raw: any) {
    const k = String(kind);

    if (k === "single_choice") {
        const optionId = raw?.optionId ?? raw?.correctOptionId ?? raw?.correct ?? raw;
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

    return null;
}

function pickExpectedPayload(kind: string, secretPayload: any) {
    const k = String(kind);
    if (k === "code_input") return null;

    const sp = secretPayload ?? null;
    if (!sp || typeof sp !== "object") return null;

    const safe = (sp as any).expectedAnswerPayload ?? null;
    if (safe != null) return sanitizeExpectedForHistory(k, safe);

    const legacy = (sp as any).expected ?? (sp as any).answer ?? (sp as any).correct ?? null;
    return sanitizeExpectedForHistory(k, legacy);
}

function pickExplanation(kind: string, secretPayload: any) {
    const k = String(kind);
    if (k === "code_input") return null;
    if (k !== "single_choice" && k !== "multi_choice" && k !== "drag_reorder") return null;

    const sp = secretPayload ?? null;
    if (!sp || typeof sp !== "object") return null;
    return (sp as any).explanation ?? (sp as any).rationale ?? null;
}

/* -------------------------- purpose (param + preset) -------------------------- */



function pickAllowedPurposesFromSession(session: any): Array<"quiz" | "project"> {
    const p1 = session?.preset?.allowedPurposes;
    if (Array.isArray(p1) && p1.length) return p1.map(String) as any;

    const p2 = session?.section?.module?.practicePreset?.allowedPurposes;
    if (Array.isArray(p2) && p2.length) return p2.map(String) as any;

    return [];
}

// function coercePurposeMode(v: any): PurposeMode | null {
//     const s = String(v ?? "").trim();
//     return s === "quiz" || s === "project" || s === "mixed" ? (s as PurposeMode) : null;
// }
//
// function coercePolicy(v: any): PurposePolicy {
//     const s = String(v ?? "").trim();
//     return s === "strict" ? "strict" : "fallback";
// }

/**
 * Long-term rule:
 * - assignments ignore param
 * - otherwise param overrides, but must be allowed by preset
 * - mixed means "no filter" (quiz+project)
 * - strict => error if request not allowed
 */
function computePurposeDecision(args: {
    session: any | null;
    preferPurposeParam?: any;
    purposePolicyParam?: any;
}):
    | {
    ok: true;
    effective: PurposeMode;
    requested: PurposeMode | null;
    allowed: Array<"quiz" | "project">;
    policy: PurposePolicy;
    source: "assignment" | "param" | "session" | "default";
    reason?: string | null;
}
    | { ok: false; status: number; message: string; detail?: any } {
    const { session } = args;
    const allowed = session ? pickAllowedPurposesFromSession(session) : [];
    const policy: PurposePolicy = coercePurposePolicy(args.purposePolicyParam) ?? "fallback";
    // assignments: ignore param
    if (session?.assignmentId) {
        return {
            ok: true,
            effective: "quiz",
            requested: coercePurposeMode(args.preferPurposeParam),
            allowed,
            policy,
            source: "assignment",
            reason: "assignments_ignore_preferPurpose",
        };
    }

    const requested = coercePurposeMode(args.preferPurposeParam);

    // session stores only quiz/project
    const fromSession: PurposeMode =
        String(session?.preferPurpose ?? "quiz") === "project" ? "project" : "quiz";

    const desired: PurposeMode = requested ?? (session ? fromSession : "quiz");

    const allowAll = allowed.length === 0;

    // ✅ strict enforcement (only if param explicitly asked)
    if (policy === "strict" && requested) {
        if (requested === "mixed") {
            const okMixed = allowAll || (allowed.includes("quiz") && allowed.includes("project"));
            if (!okMixed) {
                return {
                    ok: false,
                    status: 403,
                    message: "This run does not allow mixed (quiz + project).",
                    detail: { allowed },
                };
            }
            return { ok: true, effective: "mixed", requested, allowed, policy, source: "param", reason: null };
        }

        // quiz/project strict
        if (!allowAll && !allowed.includes(requested as any)) {
            return {
                ok: false,
                status: 403,
                message: `This run does not allow purpose="${requested}".`,
                detail: { allowed },
            };
        }

        return { ok: true, effective: requested, requested, allowed, policy, source: "param", reason: null };
    }

    // ✅ fallback behavior
    if (desired === "mixed") {
        const okMixed = allowAll || (allowed.includes("quiz") && allowed.includes("project"));
        if (okMixed) {
            return { ok: true, effective: "mixed", requested, allowed, policy, source: requested ? "param" : "default" };
        }
        // degrade
        if (allowed.includes("quiz")) {
            return { ok: true, effective: "quiz", requested, allowed, policy, source: requested ? "param" : "default", reason: "mixed_not_allowed_fallback_to_quiz" };
        }
        if (allowed.includes("project")) {
            return { ok: true, effective: "project", requested, allowed, policy, source: requested ? "param" : "default", reason: "mixed_not_allowed_fallback_to_project" };
        }
        // allowed empty already handled by okMixed; this means allowed=[ ]? impossible here
        return { ok: true, effective: "quiz", requested, allowed, policy, source: "default", reason: "mixed_fallback_default_quiz" };
    }

    // desired quiz/project
    if (allowAll || allowed.includes(desired as any)) {
        return {
            ok: true,
            effective: desired,
            requested,
            allowed,
            policy,
            source: requested ? "param" : session ? "session" : "default",
            reason: null,
        };
    }

    // degrade
    if (allowed.includes("quiz")) {
        return { ok: true, effective: "quiz", requested, allowed, policy, source: requested ? "param" : "session", reason: "purpose_not_allowed_fallback_to_quiz" };
    }
    if (allowed.includes("project")) {
        return { ok: true, effective: "project", requested, allowed, policy, source: requested ? "param" : "session", reason: "purpose_not_allowed_fallback_to_project" };
    }

    // if preset is misconfigured (allowedPurposes empty array isn't used here; it's allowAll)
    return { ok: true, effective: "quiz", requested, allowed, policy, source: "default", reason: "no_allowedPurposes_default_quiz" };
}

/* -------------------------- retry helper -------------------------- */

function isGeneratorTopicMismatch(e: any) {
    const code = String((e as any)?.code ?? "");
    if (
        code === "UNKNOWN_TOPIC" ||
        code === "MISSING_HANDLER" ||
        code === "EMPTY_POOL" ||
        code === "NO_QUESTIONS_AVAILABLE" ||
        code === "NO_GENERATOR" // ✅ ADD
    ) {
        return true;
    }
    const msg = String(e?.message ?? "");
    return (
        msg.includes("unknown topicSlug=") ||
        msg.includes("no generator registered for topicSlug=") ||
        msg.includes("missing handler key=") ||
        msg.includes("NO_QUESTIONS_AVAILABLE") ||
        msg.includes("EMPTY_POOL") ||
        msg.includes("empty_pool")
    );
}

/* ----------------------------------- main ----------------------------------- */

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
        preferPurpose: preferPurposeParam,
        purposePolicy: purposePolicyParam,
        salt,
        statusOnly,
        returnUrl,
        returnTo,
        includeMissed,
    } = params as any;

    // 1) session
    const session = sessionId ? await loadSession(prisma, sessionId) : null;

    if (sessionId && !session) {
        return { kind: "json", status: 404, body: { message: "Session not found." } };
    }

    if (session) {
        try {
            assertSessionOwnership(session, actor);
        } catch (e: any) {
            return { kind: "json", status: statusOf(e, 400), body: { message: e.message } };
        }

        const gate = await enforceAssignmentEntitlement(session);
        if (gate.kind === "res") return gate;

        const ru =
            typeof returnUrl === "string" ? returnUrl : typeof returnTo === "string" ? returnTo : null;

        if (ru && !session.returnUrl) {
            await prisma.practiceSession.update({
                where: { id: session.id },
                data: { returnUrl: ru },
                select: { id: true },
            });
            (session as any).returnUrl = ru;
        }
    }

    // ✅ decide purpose early
    const decision = computePurposeDecision({
        session,
        preferPurposeParam,
        purposePolicyParam,
    });

    if (!decision.ok) {
        return { kind: "json", status: decision.status, body: { message: decision.message, detail: decision.detail } };
    }

    const purposeMode: PurposeMode = decision.effective; // quiz | project | mixed

    // ✅ persist session preference only when quiz/project (never store mixed)
    if (session && !session.assignmentId && (purposeMode === "quiz" || purposeMode === "project")) {
        const cur = String(session.preferPurpose ?? "quiz");
        if (cur !== purposeMode) {
            await prisma.practiceSession.update({
                where: { id: session.id },
                data: { preferPurpose: purposeMode as PracticePurpose },
                select: { id: true },
            });
            (session as any).preferPurpose = purposeMode;
        }
    }

    // STATUS ONLY (unchanged logic except include purpose info)
    if (statusOnly === "true") {
        if (!session) {
            return { kind: "json", status: 400, body: { message: "statusOnly requires sessionId." } };
        }

        const answeredCount = await prisma.practiceQuestionInstance.count({
            where: { sessionId: session.id, answeredAt: { not: null } },
        });

        const targetCount = Number(session.targetCount ?? 0);
        const pct = targetCount > 0 ? Math.min(1, answeredCount / targetCount) : 0;

        const complete =
            session.status === "completed" || (targetCount > 0 && answeredCount >= targetCount);

        const allowRevealEffective = computeAllowRevealEffective(session, allowReveal);

        const assignmentDiff = getAssignmentDifficulty(session);
        const diff: Difficulty = assignmentDiff ?? (session?.difficulty as any as Difficulty) ?? "easy";

        const run = buildRunMeta({ session, diff, allowRevealEffective });

        const actorOR = [
            actor.userId ? { userId: actor.userId } : null,
            actor.guestId ? { guestId: actor.guestId } : null,
        ].filter(Boolean) as any[];

        const includeMissedParam = includeMissed === "true" || (params as any)?.includeMissed === "true";
        const includeHistoryParam = (params as any)?.includeHistory === "true";
        const canRevealExpected = canRevealExpectedForStatusOnly(session);

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
                        where: { revealUsed: false, ...(actorOR.length ? { OR: actorOR } : {}) },
                        orderBy: { createdAt: "desc" },
                        take: 1,
                        select: { answerPayload: true, ok: true, createdAt: true },
                    },
                },
            });

            const sigFromRow = (row: any) =>
                [String(row?.topic?.slug ?? ""), String(row?.kind ?? ""), String(row?.title ?? ""), String(row?.prompt ?? "")].join("||");

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

        let history: any[] = [];
        if (includeHistoryParam) {
            const counts = await prisma.practiceAttempt.groupBy({
                by: ["instanceId"],
                where: { sessionId: session.id, revealUsed: false, ...(actorOR.length ? { OR: actorOR } : {}) },
                _count: { _all: true },
            });
            const countMap = new Map(counts.map((c) => [c.instanceId, c._count._all]));

            const attemptRows = await prisma.practiceAttempt.findMany({
                where: { sessionId: session.id, ...(actorOR.length ? { OR: actorOR } : {}) },
                orderBy: { createdAt: "desc" },
                select: { instanceId: true, ok: true, revealUsed: true, createdAt: true, answerPayload: true },
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
                where: { sessionId: session.id, answeredAt: { not: null } },
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

                const expectedAnswerPayload = canRevealExpected ? pickExpectedPayload(row.kind, row.secretPayload) : null;
                const explanation = canRevealExpected ? pickExplanation(row.kind, row.secretPayload) : null;

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
                correctCount: session.correct ?? 0,
                totalCount: session.total ?? 0,
                correct: session.correct ?? 0,
                total: session.total ?? 0,
                assignmentId: session.assignmentId ?? null,
                sessionId: session.id,

                // ✅ purpose debug
                purpose: {
                    effective: purposeMode,
                    requested: decision.requested,
                    allowed: decision.allowed,
                    policy: decision.policy,
                    source: decision.source,
                    reason: decision.reason ?? null,
                },

                missed,
                history,
                run,
                returnUrl: run.returnUrl,
            },
        };
    }

    // only enforce active for generation
    if (session) {
        try {
            assertSessionActive(session);
        } catch (e: any) {
            return { kind: "json", status: statusOf(e, 400), body: { message: e.message } };
        }
    }

    const allowRevealEffective = computeAllowRevealEffective(session, allowReveal);

    // difficulty pick
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

    const { reqSalt } = resolveRequestSalt(salt);

    // ✅ generator purpose: mixed => null (no filter)
    const preferPurposeForGenerator: "quiz" | "project" | null =
        purposeMode === "mixed" ? null : purposeMode;

    const moduleIdFromSession = session?.section?.moduleId ?? null;
    const assignmentIdFromSession = session?.assignmentId ?? null;
    const excludedTopicSlugs = new Set<string>();

    const preferKindEnum: PracticeKind | null = preferKind ? toPracticeKindOrThrow(preferKind) : null;

    const seedPolicy = (params as any).seedPolicy === "global" ? "global" : "actor";
    const rngArgs =
        seedPolicy === "global"
            ? { userId: null, guestId: null, sessionId: null }
            : { userId: actor.userId, guestId: actor.guestId, sessionId: session?.id ?? null };

    let resolved: any = null;
    let out: any = null;
    let lastGenErr: any = null;

    for (let attempt = 0; attempt < 6; attempt++) {
        resolved = await resolveTopicFromDb({
            prisma,
            subjectSlug: session ? undefined : subject,
            moduleSlug: session ? undefined : module,
            sectionSlug: session?.section?.slug ?? section,

            rawTopic: attempt === 0 ? topic : null,

            subjectIdFromSession: session?.section?.subjectId ?? null,
            moduleIdFromSession,
            assignmentIdFromSession,

            rngSeedParts: {
                userId: actor.userId,
                guestId: actor.guestId,
                sessionId: session?.id ?? null,
            },
            topicPickSalt: `topic-pick|${reqSalt}`,

            fallbackOnMissing: true,
            excludeTopicSlugs: Array.from(excludedTopicSlugs),
        } as any);

        if (resolved.kind !== "ok") {
            return { kind: "json", status: 400, body: { message: "Invalid topic/filters", explanation: resolved.message } };
        }

        const topicSlug = resolved.topicSlug as TopicSlug;
        const genKey = resolved.genKey as GenKey | null;

        if (!genKey) {
            excludedTopicSlugs.add(String(topicSlug));
            lastGenErr = new Error(`Topic "${topicSlug}" has no genKey in DB.`);
            continue;
        }

        // ✅ include purposeMode in RNG salt so mixed isn’t identical to quiz
        const exerciseRng = rngFromActor({
            ...rngArgs,
            salt: [
                "practice-ex",
                `seedPolicy=${seedPolicy}`,
                `purposeMode=${purposeMode}`,
                `genKey=${genKey}`,
                `topic=${topicSlug}`,
                `diff=${diff}`,
                `preferKind=${preferKindEnum ?? ""}`,
                `preferPurpose=${preferPurposeForGenerator ?? ""}`,
                `exerciseKey=${(params as any).exerciseKey ?? ""}`,
                `salt=${reqSalt ?? ""}`,
            ].join("|"),
        });

        const meta2 = {
            ...(resolved.meta ?? {}),
            forceKey: (params as any).exerciseKey ?? undefined,
            preferPurpose: preferPurposeForGenerator,
        };

        try {
            out = await getExerciseWithExpected(genKey as GenKey, diff, {
                topicSlug,
                variant: resolved.variant ?? null,
                meta: meta2,
                subjectSlug: subject ?? null,
                moduleSlug: module ?? null,
                preferKind: preferKindEnum ?? null,
                preferPurpose: preferPurposeForGenerator,
                rng: exerciseRng as any,
                salt: reqSalt ?? null,
                exerciseKey: ((params as any).exerciseKey ?? null) as any,
            } as TopicContext);

            lastGenErr = null;
            break;
        } catch (e: any) {
            lastGenErr = e;
            if (isGeneratorTopicMismatch(e)) {
                excludedTopicSlugs.add(String(topicSlug));
                continue;
            }
            break;
        }
    }

    if (!resolved || resolved.kind !== "ok" || !out) {
        return {
            kind: "json",
            status: 404,
            body: {
                message: `No ${purposeMode} questions available for this scope yet.`,
                explanation: lastGenErr?.message ?? "All eligible topics were filtered out.",
                meta: {
                    purposeMode,
                    preferKind: preferKindEnum ?? null,
                    excludedTopicSlugs: Array.from(excludedTopicSlugs),
                    lastTopicTried: resolved?.kind === "ok" ? resolved.topicSlug : null,
                },
            },
        };
    }

    const topicSlug = resolved.topicSlug as TopicSlug;
    const topicIdHint = resolved.topicId as string;
    const genKey = resolved.genKey as GenKey;

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

    // ✅ for mixed: persist whichever was chosen by pool item meta
    const chosenPurpose: "quiz" | "project" =
        (out as any)?.meta?.purpose === "project" ? "project" : "quiz";

    const instance = await createInstance({
        prisma,
        sessionId: session?.id ?? null,
        exercise,
        expected: out?.expected,
        topicSlug: topicSlug as TopicSlug,
        difficulty: diff,
        topicIdHint,
        purpose: purposeMode === "mixed" ? chosenPurpose : (purposeMode as any),
    });

    const key = signKey({
        instanceId: instance.id,
        sessionId: instance.sessionId ?? null,
        userId: actor.userId ?? null,
        guestId: actor.guestId ?? null,
        allowReveal: allowRevealEffective,
    });

    const run = buildRunMeta({ session, diff, allowRevealEffective });

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

                // ✅ useful debug
                purposeMode,
                preferPurposeForGenerator,
                chosenPurpose,
                excludedTopicSlugs: Array.from(excludedTopicSlugs),
                purpose: {
                    effective: purposeMode,
                    requested: decision.requested,
                    allowed: decision.allowed,
                    policy: decision.policy,
                    source: decision.source,
                    reason: decision.reason ?? null,
                },
            },
        },
    };
}