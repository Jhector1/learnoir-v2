import { PracticeKind } from "@prisma/client";
import { RNG } from "@/lib/practice/generator/shared/rng";
import {
    CodeInputExercise,
    CodeLanguage,
    Difficulty,
    ExerciseKind,
    MultiChoiceExercise,
    SingleChoiceExercise,
} from "@/lib/practice/types";
import { GenOut } from "@/lib/practice/generator/shared/expected";
import { TopicContext } from "@/lib/practice/generator/generatorTypes";
import {pickName, safeInt} from "@/lib/practice/generator/engines/python/_shared";

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
}): GenOut<"single_choice"> {
    const exercise: SingleChoiceExercise = {
        id: args.id,
        topic: args.topic,
        difficulty: args.diff,
        kind: "single_choice",
        title: args.title,
        prompt: args.prompt,
        options: args.options,
        ...(args.hint ? { hint: args.hint } : {}),
    };

    return {
        archetype: args.archetype,
        exercise,
        expected: { kind: "single_choice", optionId: args.answerOptionId },
    };
}

export type Opt = { id: string; text: string };

export type DragExpected = { kind: "drag_reorder"; tokenIds: string[] };
export type MultiExpected = { kind: "multi_choice"; optionIds: string[] };
export type TextExpected = { kind: "text_input"; answers: string[]; match?: "exact" | "includes" };

export function makeTextExpected(
    answers: string[],
    match: "exact" | "includes" = "includes"
): TextExpected {
    return { kind: "text_input", answers, match };
}

export function makeDragExpected(tokenIds: string[]): DragExpected {
    return { kind: "drag_reorder", tokenIds };
}

export function makeMultiExpected(optionIds: string[]): MultiExpected {
    return { kind: "multi_choice", optionIds };
}

export function makeMultiChoiceOut(args: {
    archetype: string;
    id: string;
    topic: string;
    diff: Difficulty;
    title: string;
    prompt: string;
    options: Opt[];
    answerOptionIds: string[];
    hint?: string;
}): GenOut<"multi_choice"> {
    const exercise: MultiChoiceExercise = {
        id: args.id,
        topic: args.topic,
        difficulty: args.diff,
        kind: "multi_choice",
        title: args.title,
        prompt: args.prompt,
        options: args.options,
        ...(args.hint ? { hint: args.hint } : {}),
    };

    return {
        archetype: args.archetype,
        exercise,
        expected: makeMultiExpected(args.answerOptionIds),
    };
}

export function makeCodeInputOut(args: {
    archetype: string;
    id: string;
    topic: string;
    diff: Difficulty;
    title: string;
    prompt: string;
    starterCode: string;
    language?: CodeLanguage;
    expected: any;
    hint?: string;
    editorHeight?: number;
    allowLanguageSwitch?: boolean;
    stdinHint?: string;
    examples?: Array<{ stdin?: string; stdout: string }>;
}): GenOut<"code_input"> {
    const exercise: CodeInputExercise = {
        id: args.id,
        topic: args.topic,
        difficulty: args.diff,
        kind: "code_input",
        title: args.title,
        prompt: args.prompt,
        language: args.language ?? "python",
        starterCode: args.starterCode,
        ...(args.hint ? { hint: args.hint } : {}),
        ...(args.editorHeight != null ? { editorHeight: args.editorHeight } : {}),
        ...(args.allowLanguageSwitch != null ? { allowLanguageSwitch: args.allowLanguageSwitch } : {}),
        ...(args.stdinHint ? { stdinHint: args.stdinHint } : {}),
        ...(args.examples ? { examples: args.examples } : {}),
    };

    return {
        archetype: args.archetype,
        exercise,
        expected: args.expected,
    };
}

export type HandlerArgs = {
    rng: RNG;
    diff: Difficulty;
    id: string;
    topic: string;
    ctx: TopicContext;
};

export type Handler = (args: HandlerArgs) => GenOut<ExerciseKind>;

export type TopicBundle = {
    slug: string;
    pool: readonly PoolItem[];
    handlers: Record<string, Handler>;
};

export function defineTopic(
    slug: string,
    pool: readonly PoolItem[],
    handlers: Record<string, Handler>
): TopicBundle {
    return { slug, pool, handlers };
}

function toKeySet(v: any): Set<string> {
    const out = new Set<string>();
    if (Array.isArray(v)) {
        for (const x of v) out.add(String(x));
    }
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
        args.topics.map((t) => [t.slug, t.handlers])
    );

    const topicValidKeys: Record<string, string[]> = Object.fromEntries(
        args.topics.map((t) => [t.slug, t.pool.map((p) => p.key)])
    );

    const topicDefaultPools: Record<string, PoolItem[]> = Object.fromEntries(
        args.topics.map((t) => [t.slug, t.pool.map((p) => ({ ...p }))])
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
                    topicHandlers
                ).join(", ")}]`
            );
            (err as any).code = "UNKNOWN_TOPIC";
            throw err;
        }

        const metaPoolRaw = readPoolFromMeta(ctx.meta).filter((p) => validKeys.includes(p.key));
        const fallbackPoolRaw = (topicDefaultPools?.[topicSlugBase] ?? []).filter((p) =>
            validKeys.includes(p.key)
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
                    (p) => normalizePurpose((p as any).purpose ?? defaultPurpose) === preferPurpose
                )
                : kindFiltered;

            return purposeFiltered;
        };

        let basePool =
            metaPoolRaw.length
                ? metaPoolRaw
                : fallbackPoolRaw.length
                    ? fallbackPoolRaw
                    : safeMixedPoolFor(validKeys, defaultPurpose);

        let filtered = applyFilters(basePool);

        if (filtered.length === 0 && metaPoolRaw.length && fallbackPoolRaw.length) {
            basePool = fallbackPoolRaw;
            filtered = applyFilters(basePool);
        }

        if (filtered.length === 0) {
            const err = new Error(
                `${engineName}: NO_QUESTIONS_AVAILABLE topic="${topicSlugRaw}" base="${topicSlugBase}" preferPurpose="${preferPurpose ?? ""}" preferKind="${preferKind ?? ""}"`
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

        const excluded = normalizeExcludedKeys(ctx);
        const uniq = filterExcluded(filtered, excluded);
        const pool = uniq.length ? uniq : filtered;

        if (!pool.length) {
            const err = new Error(
                `${engineName}: EMPTY_POOL topic="${topicSlugRaw}" base="${topicSlugBase}" preferPurpose="${preferPurpose ?? ""}" preferKind="${preferKind ?? ""}"`
            );
            (err as any).code = "EMPTY_POOL";
            throw err;
        }

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

        const out = handler({ rng: R, diff, id, topic, ctx });

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

export function pickDifferentName(rng: any, avoid: string) {
    let x = pickName(rng);
    for (let i = 0; i < 6 && x === avoid; i++) x = pickName(rng);
    return x;
}
export function pickDifferentInt(rng: any, lo: number, hi: number, avoid: number) {
    let x = safeInt(rng, lo, hi);
    for (let i = 0; i < 6 && x === avoid; i++) x = safeInt(rng, lo, hi);
    return x;
}