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
export type PoolItem = { key: string; w: number; kind?: PracticeKind };

export function readPoolFromMeta(meta: any): PoolItem[] {
    const pool = meta?.pool;
    if (!Array.isArray(pool)) return [];
    return pool
        .map((p: any) => ({
            key: String(p?.key ?? "").trim(),
            w: Number(p?.w ?? 0),
            kind: p?.kind ? (String(p.kind).trim() as PracticeKind) : undefined,
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
