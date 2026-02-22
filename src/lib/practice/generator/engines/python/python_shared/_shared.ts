// src/lib/practice/generator/engines/python/python_shared/_shared.ts
import type {
    CodeInputExercise,
    CodeLanguage,
    Difficulty,
    ExerciseKind,
    SingleChoiceExercise,
} from "../../../../types";
import type { GenOut } from "../../../shared/expected";
import type { RNG } from "../../../shared/rng";
import type { TopicContext } from "../../../generatorTypes";
import type { PracticeKind } from "@prisma/client";

// ------------------------------------------------------------
// Topic slug parsing (fixes py0.comments_intro issue)
// ------------------------------------------------------------
export function parseTopicSlug(raw: string) {
    const s = String(raw ?? "").trim();
    const parts = s.split(".").filter(Boolean);
    const base = parts.length ? parts[parts.length - 1] : s; // comments_intro
    const prefix = parts.length > 1 ? parts[0] : null;       // py0
    return { raw: s, base, prefix };
}

// ------------------------------------------------------------
// Random helpers (shared across topics)
// ------------------------------------------------------------
export function pickWord(rng: RNG) {
    return rng.pick(["piano", "tacos", "coding", "soccer", "mystery", "coffee"] as const);
}
export function pickName(rng: RNG) {
    return rng.pick(["alex", "sam", "jordan", "taylor", "maria", "leo", "maya"] as const);
}
export function safeInt(rng: RNG, lo: number, hi: number) {
    return rng.int(lo, hi);
}
export type PracticePurpose = "quiz" | "project";

export function pickSnakeCandidate(rng: RNG) {
    return rng.pick(["user_name", "total_score", "my_var", "age_years", "first_name"] as const);
}

// ------------------------------------------------------------
// Canonical expected shape for code_input
// ------------------------------------------------------------
export type CodeTest = {
    stdin?: string;
    stdout: string;
    match?: "exact" | "includes";
};

export type CodeExpected = {
    kind: "code_input";
    language?: CodeLanguage;
    tests: CodeTest[];
    // legacy convenience fields:
    stdin?: string;
    stdout?: string;
    solutionCode?: string;
};

export function makeCodeExpected(args: {
    language?: CodeLanguage;
    stdin?: string;
    stdout?: string;
    match?: "exact" | "includes";
    tests?: CodeTest[];
    solutionCode?: string;
}): CodeExpected {
    const lang = args.language ?? "python";

    const tests: CodeTest[] =
        Array.isArray(args.tests) && args.tests.length
            ? args.tests.map((t) => ({
                stdin: typeof t.stdin === "string" ? t.stdin : "",
                stdout: String(t.stdout ?? ""),
                match: t.match ?? "exact",
            }))
            : [
                {
                    stdin: typeof args.stdin === "string" ? args.stdin : "",
                    stdout: String(args.stdout ?? ""),
                    match: args.match ?? "exact",
                },
            ];

    for (const t of tests) {
        if (typeof t.stdout !== "string") t.stdout = String(t.stdout ?? "");
    }

    return {
        kind: "code_input",
        language: lang,
        tests,
        stdin: typeof args.stdin === "string" ? args.stdin : tests[0]?.stdin ?? "",
        stdout: typeof args.stdout === "string" ? args.stdout : tests[0]?.stdout ?? "",
        solutionCode: typeof args.solutionCode === "string" ? args.solutionCode : undefined,
    };
}

// ------------------------------------------------------------
// Pool helpers
// ------------------------------------------------------------
export type PoolItem = {
    key: string;
    w: number;
    kind?: PracticeKind;
    purpose?: "quiz" | "project"; // ✅ NEW (string is fine; DB uses enum)
};
export function readPoolFromMeta(meta: any): PoolItem[] {
    const pool = meta?.pool;
    if (!Array.isArray(pool)) return [];
    return pool
        .map((p: any) => ({
            key: String(p?.key ?? "").trim(),
            w: Number(p?.w ?? 0),
            kind: p?.kind ? (String(p.kind).trim() as PracticeKind) : undefined,
            purpose: p?.purpose ? String(p.purpose).trim() : undefined, // ✅ NEW
        }))
        .filter((p) => p.key && Number.isFinite(p.w) && p.w > 0);
}

export function weightedKey(rng: RNG, pool: PoolItem[]): string {
    const picked = rng.weighted(pool.map((p) => ({ value: p.key, w: p.w })));
    return String(picked);
}

// ------------------------------------------------------------
// Uniqueness support
// ------------------------------------------------------------
function toKeySet(v: any): Set<string> {
    const out = new Set<string>();
    if (Array.isArray(v)) for (const x of v) out.add(String(x));
    return out;
}

/**
 * Reads “already used” keys from ctx so generator can avoid repeats.
 * Supports a bunch of shapes so you don’t have to be strict in the caller.
 */
export function normalizeExcludedKeys(ctx: TopicContext): Set<string> {
    const anyCtx = ctx as any;
    const s = new Set<string>();

    // common patterns your app might use:
    for (const k of toKeySet(anyCtx.excludedKeys)) s.add(k);
    for (const k of toKeySet(anyCtx.seenKeys)) s.add(k);
    for (const k of toKeySet(anyCtx.usedKeys)) s.add(k);

    // optionally in meta:
    for (const k of toKeySet(anyCtx.meta?.excludedKeys)) s.add(k);
    for (const k of toKeySet(anyCtx.meta?.seenKeys)) s.add(k);

    // if you store history as objects:
    const hist = anyCtx.history;
    if (Array.isArray(hist)) {
        for (const h of hist) {
            if (h?.archetype) s.add(String(h.archetype));
            if (h?.key) s.add(String(h.key));
        }
    }

    return s;
}

export function filterExcluded(pool: PoolItem[], excluded: Set<string>): PoolItem[] {
    if (!excluded.size) return pool;
    return pool.filter((p) => !excluded.has(p.key));
}

// ------------------------------------------------------------
// Handler types
// ------------------------------------------------------------
export type HandlerArgs = { rng: RNG; diff: Difficulty; id: string; topic: string };
export type Handler = (args: HandlerArgs) => GenOut<ExerciseKind>;

// Re-export types that topic files often use
export type { SingleChoiceExercise, CodeInputExercise, CodeLanguage };
// Pool helper (UI-safe): use string literal kinds like "code_input", "single_choice", etc.
// Pool helper
export function poolFromKeys(
    keys: readonly string[],
    kind?: string,
    w = 1,
    purpose?: PracticePurpose,
): Array<{ key: string; w: number; kind?: string; purpose?: PracticePurpose }> {
    return keys.map((key) =>
        kind || purpose ? { key, w, kind, purpose } : { key, w }
    );
}



// ✅ Shared “single_choice” builder so topic handlers stay consistent
export function makeSingleChoiceOut(args: {
    archetype: string;
    id: string;
    topic: string;
    diff: Difficulty;
    title: string;
    prompt: string;
    options: Array<{ id: string; text: string }>;
    answerOptionId: string;
    hint?: string;
}): GenOut<ExerciseKind> {
    const exercise: SingleChoiceExercise = {
        id: args.id,
        topic: args.topic,
        difficulty: args.diff,
        kind: "single_choice",
        title: args.title,
        prompt: args.prompt,
        options: args.options,
        hint: args.hint,
    };

    return {
        archetype: args.archetype,
        exercise,
        expected: { kind: "single_choice", optionId: args.answerOptionId },
    };
}









// src/lib/practice/generator/engines/python/python_shared/_shared.ts

// import type { Difficulty, ExerciseKind } from "../../../types";
// import type { GenOut } from "../../../shared/expected";
// import type { RNG } from "../../../shared/rng";
// import type { TopicContext } from "../../../generatorTypes";
// import type { PracticeKind } from "@prisma/client";

// NOTE: these are already in your _shared.ts exports per your handlers usage:
// - parseTopicSlug
// - readPoolFromMeta
// - normalizeExcludedKeys
// - filterExcluded
// - weightedKey
// - type Handler
// - type PoolItem
// - type PracticePurpose

function normalizePurpose(p?: PracticePurpose | null): PracticePurpose {
    return p === "project" || p === "quiz" ? p : "quiz";
}

function safeMixedPoolFor(validKeys: string[], defaultPurpose: PracticePurpose): PoolItem[] {
    return validKeys.map((key) => ({ key, w: 1, purpose: defaultPurpose as any }));
}

export function makePythonTopicGenerator(args: {
    engineName: string;
    ctx: TopicContext;

    topicHandlers: Record<string, Record<string, Handler>>;
    topicValidKeys: Record<string, string[]>;

    /** Optional per-topic fallback pools (useful for mod0 where pool items have purpose). */
    topicDefaultPools?: Record<string, PoolItem[]>;

    /** Default purpose when pool items omit it. */
    defaultPurpose?: PracticePurpose;

    /** Enables preferPurpose filtering (safe even if pools omit purpose; defaults to quiz). */
    enablePurpose?: boolean;
}) {
    const {
        engineName,
        ctx,
        topicHandlers,
        topicValidKeys,
        topicDefaultPools,
        defaultPurpose = "quiz",
        enablePurpose = true,
    } = args;

    return (rng: RNG, diff: Difficulty, id: string): GenOut<ExerciseKind> => {
        const R: RNG = (ctx as any).rng ?? rng;

        const { raw: topicSlugRaw, base: topicSlugBase } = parseTopicSlug(String(ctx.topicSlug));
        const topic = topicSlugRaw; // keep RAW for progress keys

        const handlers = topicHandlers[topicSlugBase];
        const validKeys = topicValidKeys[topicSlugBase];

        if (!handlers || !validKeys?.length) {
            throw new Error(
                `${engineName}: unknown topicSlug="${topicSlugRaw}" (base="${topicSlugBase}") valid=[${Object.keys(
                    topicHandlers,
                ).join(", ")}]`,
            );
        }

        // 1) meta pool from DB
        const metaPool = readPoolFromMeta(ctx.meta).filter((p) => validKeys.includes(p.key));

        // 2) optional hardcoded fallback pool (keeps purpose/weights if you have them)
        const fallbackPool = (topicDefaultPools?.[topicSlugBase] ?? []).filter((p) => validKeys.includes(p.key));

        const basePool =
            metaPool.length ? metaPool : fallbackPool.length ? fallbackPool : safeMixedPoolFor(validKeys, defaultPurpose);

        // preferences (safe reads; ctx fields may not exist on type)
        const preferKindRaw = (ctx as any).preferKind ?? (ctx as any).meta?.preferKind ?? null;
        const preferPurposeRaw = (ctx as any).preferPurpose ?? (ctx as any).meta?.preferPurpose ?? null;

        const preferKind = preferKindRaw ? (String(preferKindRaw) as PracticeKind) : null;
        const preferPurpose = enablePurpose && preferPurposeRaw ? normalizePurpose(String(preferPurposeRaw) as any) : null;

        const kindFiltered = preferKind ? basePool.filter((p) => !p.kind || p.kind === preferKind) : basePool;

        // purpose filter (missing purpose defaults to defaultPurpose)
        const purposeFiltered = preferPurpose
            ? kindFiltered.filter((p) => normalizePurpose((p as any).purpose ?? defaultPurpose) === preferPurpose)
            : kindFiltered;

        const excluded = normalizeExcludedKeys(ctx);
        const uniqFiltered = filterExcluded(purposeFiltered, excluded);

        const pool = uniqFiltered.length ? uniqFiltered : purposeFiltered;

        const forceKey = String((ctx as any).meta?.forceKey ?? "").trim();
        const exerciseKey = String((ctx as any).exerciseKey ?? "").trim();

        const chosen =
            (exerciseKey && validKeys.includes(exerciseKey) ? exerciseKey : "") ||
            (forceKey && validKeys.includes(forceKey) ? forceKey : "") ||
            weightedKey(R, pool);

        const handler = handlers[chosen];
        if (!handler) {
            throw new Error(`${engineName}: missing handler key="${chosen}" topicSlug="${topicSlugRaw}"`);
        }

        const chosenItem = pool.find((p) => p.key === chosen) ?? null;
        const chosenPurpose = normalizePurpose((chosenItem as any)?.purpose ?? defaultPurpose);

        const out = handler({ rng: R, diff, id, topic });

        // Always tag the chosen key; tag purpose too (safe even if you don’t use it elsewhere)
        return {
            ...(out as any),
            meta: {
                ...((out as any).meta ?? {}),
                key: chosen,
                purpose: chosenPurpose,
            },
        } as any;
    };
}