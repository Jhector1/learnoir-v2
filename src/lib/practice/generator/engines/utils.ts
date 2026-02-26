// import {PracticeKind, PracticePurpose} from "@prisma/client";
import {RNG} from "@/lib/practice/generator/shared/rng";
import {Difficulty, ExerciseKind, SingleChoiceExercise} from "@/lib/practice/types";
import {GenOut} from "@/lib/practice/generator/shared/expected";
// import {Handler} from "@/lib/practice/generator/engines/python/_shared";
import {TopicContext} from "@/lib/practice/generator/generatorTypes";
import {PracticeKind} from "@prisma/client";
export type PracticePurpose = "quiz" | "project";

export type PoolItem = {
    key: string;
    w: number;
    kind?: PracticeKind;
    purpose?: PracticePurpose;
};

export function parseTopicSlug(raw: string) {
    const s = String(raw ?? "").trim();
    const parts = s.split(".").filter(Boolean);
    const base = parts.length ? parts[parts.length - 1] : s;
    const prefix = parts.length > 1 ? parts[0] : null;
    return { raw: s, base, prefix };
}
export function readPoolFromMeta(meta: any): PoolItem[] {
    const pool = meta?.pool;
    if (!Array.isArray(pool)) return [];
    return pool
        .map((p: any) => ({
            key: String(p?.key ?? "").trim(),
            w: Number(p?.w ?? 0),
            kind: p?.kind ? (String(p.kind).trim() as PracticeKind) : undefined,
            purpose: p?.purpose ? (String(p.purpose).trim() as PracticePurpose) : undefined,
        }))
        .filter((p) => p.key && Number.isFinite(p.w) && p.w > 0);
}

export function weightedKey(rng: RNG, pool: PoolItem[]): string {
    if (!Array.isArray(pool) || pool.length === 0) {
        const err = new Error("weightedKey() called with empty pool.");
        (err as any).code = "EMPTY_POOL";
        throw err;
    }
    const picked = rng.weighted(pool.map((p) => ({ value: p.key, w: p.w })));
    return String(picked);
}
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

export type HandlerArgs = { rng: RNG; diff: Difficulty; id: string; topic: string };
export type Handler = (args: HandlerArgs) => GenOut<ExerciseKind>;

export type TopicBundle = {
    slug: string; // base slug
    pool: readonly PoolItem[];
    handlers: Record<string, Handler>;
};

export function defineTopic(
    slug: string,
    pool: readonly PoolItem[],
    handlers: Record<string, Handler>,
): TopicBundle {
    return { slug, pool, handlers };
}

function toKeySet(v: any): Set<string> {
    const out = new Set<string>();
    if (Array.isArray(v)) for (const x of v) out.add(String(x));
    return out;
}
export function normalizeExcludedKeys(ctx: TopicContext): Set<string> {
    const anyCtx = ctx as any;
    const s = new Set<string>();

    for (const k of toKeySet(anyCtx.excludedKeys)) s.add(k);
    for (const k of toKeySet(anyCtx.seenKeys)) s.add(k);
    for (const k of toKeySet(anyCtx.usedKeys)) s.add(k);

    for (const k of toKeySet(anyCtx.meta?.excludedKeys)) s.add(k);
    for (const k of toKeySet(anyCtx.meta?.seenKeys)) s.add(k);

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



function normalizePurpose(p?: PracticePurpose | null): PracticePurpose {
    return p === "project" || p === "quiz" ? p : "quiz";
}

function safeMixedPoolFor(validKeys: string[], defaultPurpose: PracticePurpose): PoolItem[] {
    // last resort: you forgot to define any pool
    return validKeys.map((key) => ({ key, w: 1, purpose: defaultPurpose }));
}
export function makeSubjectModuleGenerator(args: {
    engineName: string;
    ctx: TopicContext;
    topics: readonly TopicBundle[];
    defaultPurpose?: PracticePurpose;
    enablePurpose?: boolean;
}) {
    const topicHandlers: Record<string, Record<string, Handler>> = Object.fromEntries(
        args.topics.map((t) => [t.slug, t.handlers]),
    );

    const topicValidKeys: Record<string, string[]> = Object.fromEntries(
        args.topics.map((t) => [t.slug, t.pool.map((p) => p.key)]),
    );

    const topicDefaultPools: Record<string, PoolItem[]> = Object.fromEntries(
        args.topics.map((t) => [t.slug, t.pool.map((p) => ({ ...p }))]),
    );

    return makeSubjectTopicGenerator({
        engineName: args.engineName,
        ctx: args.ctx,
        topicHandlers,
        topicValidKeys,
        topicDefaultPools,
        defaultPurpose: args.defaultPurpose ?? "quiz",
        enablePurpose: args.enablePurpose ?? true,
    });
}



export function makeSubjectTopicGenerator(args: {
    engineName: string;
    ctx: TopicContext;

    topicHandlers: Record<string, Record<string, Handler>>;
    topicValidKeys: Record<string, string[]>;

    topicDefaultPools?: Record<string, PoolItem[]>;
    defaultPurpose?: PracticePurpose;
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
        const topic = topicSlugRaw;

        const handlers = topicHandlers[topicSlugBase];
        const validKeys = topicValidKeys[topicSlugBase];

        if (!handlers || !validKeys?.length) {
            const err = new Error(
                `${engineName}: unknown topicSlug="${topicSlugRaw}" (base="${topicSlugBase}") valid=[${Object.keys(
                    topicHandlers,
                ).join(", ")}]`,
            );
            (err as any).code = "UNKNOWN_TOPIC";
            throw err;
        }

        const metaPoolRaw = readPoolFromMeta(ctx.meta).filter((p) => validKeys.includes(p.key));
        const fallbackPoolRaw = (topicDefaultPools?.[topicSlugBase] ?? []).filter((p) =>
            validKeys.includes(p.key),
        );

        const preferKindRaw = (ctx as any).preferKind ?? (ctx as any).meta?.preferKind ?? null;
        const preferPurposeRaw = (ctx as any).preferPurpose ?? (ctx as any).meta?.preferPurpose ?? null;

        const preferKind = preferKindRaw ? (String(preferKindRaw) as PracticeKind) : null;
        const preferPurpose =
            enablePurpose && preferPurposeRaw ? normalizePurpose(String(preferPurposeRaw) as any) : null;

        const applyFilters = (base: PoolItem[]) => {
            const kindFiltered = preferKind ? base.filter((p) => !p.kind || p.kind === preferKind) : base;

            const purposeFiltered = preferPurpose
                ? kindFiltered.filter(
                    (p) => normalizePurpose((p as any).purpose ?? defaultPurpose) === preferPurpose,
                )
                : kindFiltered;

            return purposeFiltered;
        };

        // base pool: DB meta -> fallback -> last resort
        let basePool =
            metaPoolRaw.length
                ? metaPoolRaw
                : fallbackPoolRaw.length
                    ? fallbackPoolRaw
                    : safeMixedPoolFor(validKeys, defaultPurpose);

        let filtered = applyFilters(basePool);

        // if meta pool exists but yields nothing, try fallback pool
        if (filtered.length === 0 && metaPoolRaw.length && fallbackPoolRaw.length) {
            basePool = fallbackPoolRaw;
            filtered = applyFilters(basePool);
        }

        // still nothing => this topic cannot satisfy the requested purpose/kind
        if (filtered.length === 0) {
            const err = new Error(
                `${engineName}: NO_QUESTIONS_AVAILABLE topic="${topicSlugRaw}" base="${topicSlugBase}" preferPurpose="${preferPurpose ?? ""}" preferKind="${preferKind ?? ""}"`,
            );
            (err as any).code = "NO_QUESTIONS_AVAILABLE";
            (err as any).details = {
                engineName,
                topicSlugRaw,
                topicSlugBase,
                preferKind,
                preferPurpose,
                metaPoolCount: metaPoolRaw.length,
                fallbackPoolCount: fallbackPoolRaw.length,
                validKeysCount: validKeys.length,
            };
            throw err;
        }

        // uniqueness is SOFT: if uniq empties, allow repeats (this is what lets 30 work even if only 1 exists)
        const excluded = normalizeExcludedKeys(ctx);
        const uniq = filterExcluded(filtered, excluded);
        const pool = uniq.length ? uniq : filtered;

        if (!pool.length) {
            const err = new Error(
                `${engineName}: EMPTY_POOL topic="${topicSlugRaw}" base="${topicSlugBase}" preferPurpose="${preferPurpose ?? ""}" preferKind="${preferKind ?? ""}"`,
            );
            (err as any).code = "EMPTY_POOL";
            throw err;
        }

        // force keys only if present in the *filtered* pool (prevents forcing a "project" key during quiz runs)
        const forceKey = String((ctx as any).meta?.forceKey ?? "").trim();
        const exerciseKey = String((ctx as any).exerciseKey ?? "").trim();

        const forced =
            (exerciseKey && pool.some((p) => p.key === exerciseKey) ? exerciseKey : "") ||
            (forceKey && pool.some((p) => p.key === forceKey) ? forceKey : "");

        const chosen = forced || weightedKey(R, pool);

        const handler = handlers[chosen];
        if (!handler) {
            const err = new Error(`${engineName}: missing handler key="${chosen}" topicSlug="${topicSlugRaw}"`);
            (err as any).code = "MISSING_HANDLER";
            throw err;
        }

        const chosenItem = pool.find((p) => p.key === chosen) ?? null;
        const chosenPurpose = normalizePurpose((chosenItem as any)?.purpose ?? defaultPurpose);

        const out = handler({ rng: R, diff, id, topic });

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

export function makeNoGenerator(engineName: string, topicSlugRaw: string) {
    return (_rng: RNG, _diff: Difficulty, id: string): GenOut<ExerciseKind> => {
        const err = new Error(
            `${engineName}: no generator registered for topicSlug="${topicSlugRaw}" (exercise id=${id})`
        );
        (err as any).code = "NO_GENERATOR";
        (err as any).topicSlug = topicSlugRaw;
        (err as any).engineName = engineName;
        throw err;
    };
}