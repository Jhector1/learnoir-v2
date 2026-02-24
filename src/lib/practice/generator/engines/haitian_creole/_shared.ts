import type { Difficulty, ExerciseKind } from "../../../types";
import type { GenOut } from "../../shared/expected";
import type { RNG } from "../../shared/rng";
import type { TopicContext } from "../../generatorTypes";
import type { PracticeKind, PracticePurpose } from "@prisma/client";
import {
    makeSubjectModuleGenerator,
    readPoolFromMeta,
    TopicBundle,
    weightedKey
} from "@/lib/practice/generator/engines/utils";
import {PoolItem} from "@/seed/data/subjects/_types";
// import {filterExcluded, normalizeExcludedKeys, parseTopicSlug} from "@/lib/practice/generator/engines/python/_shared";

/* -------------------------------- types -------------------------------- */

// export type HandlerArgs = { rng: RNG; diff: Difficulty; id: string; topic: string };
// export type Handler = (args: HandlerArgs) => GenOut<ExerciseKind>;

// export type PoolItem = {
//     key: string;
//     w: number;
//     kind?: PracticeKind;
//     purpose?: PracticePurpose;
// };
//
// export type TopicBundle = {
//     slug: string;
//     pool: readonly PoolItem[];
//     handlers: Record<string, Handler>;
// };

/* -------------------------------- topic -------------------------------- */

// export function defineTopic(
//     slug: string,
//     pool: readonly PoolItem[],
//     handlers: Record<string, Handler>,
// ): TopicBundle {
//     return { slug, pool, handlers };
// }

/* ----------------------------- pool helpers ----------------------------- */

// export function readPoolFromMeta(meta: any): PoolItem[] {
//     const pool = meta?.pool;
//     if (!Array.isArray(pool)) return [];
//
//     return pool
//         .map((p: any) => ({
//             key: String(p?.key ?? "").trim(),
//             w: Number(p?.w ?? 0),
//             kind: p?.kind ? (String(p.kind).trim() as PracticeKind) : undefined,
//             purpose: p?.purpose ? (String(p.purpose).trim() as PracticePurpose) : undefined,
//         }))
//         .filter((p) => p.key && Number.isFinite(p.w) && p.w > 0);
// }

// export function weightedKey(rng: RNG, pool: PoolItem[]): string {
//     const picked = rng.weighted(pool.map((p) => ({ value: p.key, w: p.w })));
//     return String(picked);
// }

/* ---------------------------- expected helpers -------------------------- */

export type TextExpected = { kind: "text_input"; answers: string[]; match?: "exact" | "includes" };
export type DragExpected = { kind: "drag_reorder"; order: string[] };
export type VoiceExpected = { kind: "voice_input"; answers: string[]; match?: "exact" | "includes" };

export function makeTextExpected(
    answers: string[],
    match: "exact" | "includes" = "exact",
): TextExpected {
    return { kind: "text_input", answers, match };
}

export function makeDragExpected(order: string[]): DragExpected {
    return { kind: "drag_reorder", order };
}

export function makeVoiceExpected(
    answers: string[],
    match: "exact" | "includes" = "exact",
): VoiceExpected {
    return { kind: "voice_input", answers, match };
}

/* ---------------------------- content helpers --------------------------- */

export function pickName(rng: RNG) {
    return rng.pick(["Jean", "Mads", "Sophia", "Daniella", "Alex", "Maria"] as const);
}

export function pickTime(rng: RNG) {
    return rng.pick(["morning", "evening"] as const);
}

/* ------------------------- module generator (mod1-style) ------------------------- */

// function mergeHandlers(topics: TopicBundle[]) {
//     const out: Record<string, Handler> = {};
//     for (const t of topics) Object.assign(out, t.handlers);
//     return out;
// }

// function mergePool(topics: TopicBundle[]) {
//     const out: PoolItem[] = [];
//     for (const t of topics) out.push(...(t.pool as PoolItem[]));
//     return out;
// }

// export function makeHaitianModuleGenerator(opts: {
//     engineName: string;
//     ctx: TopicContext;
//     defaultPurpose: PracticePurpose;
//     enablePurpose: boolean;
//     topics: TopicBundle[];
// }) {
//     const topicBySlug = new Map(opts.topics.map((t) => [t.slug, t] as const));
//     const ALL_HANDLERS = mergeHandlers(opts.topics);
//     const SAFE_MIXED_POOL: PoolItem[] = Object.keys(ALL_HANDLERS).map((key) => ({ key, w: 1 }));
//
//     return (rng: RNG, diff: Difficulty, id: string): GenOut<ExerciseKind> => {
//         const R: RNG = (opts.ctx as any).rng ?? rng;
//         const topicSlug = String(opts.ctx.topicSlug ?? "");
//         const topic = topicSlug || "hc_unknown_topic";
//
//         // If we recognize the topic slug, prefer its pool/handlers.
//         // If not, we still work by falling back to ALL_HANDLERS + SAFE_MIXED_POOL.
//         const bundle = topicBySlug.get(topicSlug) ?? null;
//         const handlers = bundle?.handlers ?? ALL_HANDLERS;
//
//         // Meta pool overrides defaults (same idea as your Python engines).
//         const metaPool = readPoolFromMeta(opts.ctx.meta).filter((p) => p.key in handlers);
//         const basePool = metaPool.length ? metaPool : (bundle?.pool?.filter((p) => p.key in handlers) ?? SAFE_MIXED_POOL);
//
//         // Prefer kind filter (practice UI forcing a kind)
//         const preferKind = ((opts.ctx as any).preferKind ?? opts.ctx.meta?.preferKind ?? null) as PracticeKind | null;
//         let filtered = preferKind ? basePool.filter((p) => !p.kind || p.kind === preferKind) : basePool;
//
//         // Purpose filter (quiz vs project), if enabled
//         if (opts.enablePurpose) {
//             const want = ((opts.ctx as any).purpose ?? opts.ctx.meta?.purpose ?? opts.defaultPurpose) as PracticePurpose;
//             filtered = filtered.filter((p) => !p.purpose || p.purpose === want);
//         }
//
//         const pool = filtered.length ? filtered : basePool.length ? basePool : SAFE_MIXED_POOL;
//
//         const key = weightedKey(R, pool);
//         const handler = handlers[key] ?? handlers["fallback"] ?? ALL_HANDLERS["fallback"];
//
//         // If absolutely nothing matches, last resort: pick the first handler key.
//         const finalHandler =
//             handler ??
//             (() => {
//                 const first = Object.keys(handlers)[0];
//                 return handlers[first];
//             })();
//
//         return finalHandler({ rng: R, diff, id, topic });
//     };
// }













function normalizePurpose(p?: PracticePurpose | null): PracticePurpose {
    return p === "project" || p === "quiz" ? p : "quiz";
}



function safeMixedPoolFor(validKeys: string[], defaultPurpose: PracticePurpose): PoolItem[] {
    // last resort: you forgot to define any pool
    return validKeys.map((key) => ({ key, w: 1, purpose: defaultPurpose }));
}



export function makeHaitianModuleGenerator(args: {
    // engineName: string;
    // ctx: TopicContext;
    //
    // topicHandlers: Record<string, Record<string, Handler>>;
    // topicValidKeys: Record<string, string[]>;
    //
    // topicDefaultPools?: Record<string, PoolItem[]>;
    // defaultPurpose?: PracticePurpose;
    // enablePurpose?: boolean;
    engineName: string;
    ctx: TopicContext;
    topics: readonly TopicBundle[];
    defaultPurpose?: PracticePurpose;
    enablePurpose?: boolean;
}) {
    return makeSubjectModuleGenerator(args)

}
// export function makeHaitianModuleGenerator(args: {
//     engineName: string;
//     ctx: TopicContext;
//
//     topicHandlers: Record<string, Record<string, Handler>>;
//     topicValidKeys: Record<string, string[]>;
//
//     topicDefaultPools?: Record<string, PoolItem[]>;
//     defaultPurpose?: PracticePurpose;
//     enablePurpose?: boolean;
// }) {
//     const {
//         engineName,
//         ctx,
//         topicHandlers,
//         topicValidKeys,
//         topicDefaultPools,
//         defaultPurpose = "quiz",
//         enablePurpose = true,
//     } = args;
//
//     return (rng: RNG, diff: Difficulty, id: string): GenOut<ExerciseKind> => {
//         const R: RNG = (ctx as any).rng ?? rng;
//
//         const { raw: topicSlugRaw, base: topicSlugBase } = parseTopicSlug(String(ctx.topicSlug));
//         const topic = topicSlugRaw;
//
//         const handlers = topicHandlers[topicSlugBase];
//         const validKeys = topicValidKeys[topicSlugBase];
//
//         if (!handlers || !validKeys?.length) {
//             const err = new Error(
//                 `${engineName}: unknown topicSlug="${topicSlugRaw}" (base="${topicSlugBase}") valid=[${Object.keys(
//                     topicHandlers,
//                 ).join(", ")}]`,
//             );
//             (err as any).code = "UNKNOWN_TOPIC";
//             throw err;
//         }
//
//         const metaPoolRaw = readPoolFromMeta(ctx.meta).filter((p) => validKeys.includes(p.key));
//         const fallbackPoolRaw = (topicDefaultPools?.[topicSlugBase] ?? []).filter((p) =>
//             validKeys.includes(p.key),
//         );
//
//         const preferKindRaw = (ctx as any).preferKind ?? (ctx as any).meta?.preferKind ?? null;
//         const preferPurposeRaw = (ctx as any).preferPurpose ?? (ctx as any).meta?.preferPurpose ?? null;
//
//         const preferKind = preferKindRaw ? (String(preferKindRaw) as PracticeKind) : null;
//         const preferPurpose =
//             enablePurpose && preferPurposeRaw ? normalizePurpose(String(preferPurposeRaw) as any) : null;
//
//         const applyFilters = (base: PoolItem[]) => {
//             const kindFiltered = preferKind ? base.filter((p) => !p.kind || p.kind === preferKind) : base;
//
//             const purposeFiltered = preferPurpose
//                 ? kindFiltered.filter(
//                     (p) => normalizePurpose((p as any).purpose ?? defaultPurpose) === preferPurpose,
//                 )
//                 : kindFiltered;
//
//             return purposeFiltered;
//         };
//
//         // base pool: DB meta -> fallback -> last resort
//         let basePool =
//             metaPoolRaw.length
//                 ? metaPoolRaw
//                 : fallbackPoolRaw.length
//                     ? fallbackPoolRaw
//                     : safeMixedPoolFor(validKeys, defaultPurpose);
//
//         let filtered = applyFilters(basePool);
//
//         // if meta pool exists but yields nothing, try fallback pool
//         if (filtered.length === 0 && metaPoolRaw.length && fallbackPoolRaw.length) {
//             basePool = fallbackPoolRaw;
//             filtered = applyFilters(basePool);
//         }
//
//         // still nothing => this topic cannot satisfy the requested purpose/kind
//         if (filtered.length === 0) {
//             const err = new Error(
//                 `${engineName}: NO_QUESTIONS_AVAILABLE topic="${topicSlugRaw}" base="${topicSlugBase}" preferPurpose="${preferPurpose ?? ""}" preferKind="${preferKind ?? ""}"`,
//             );
//             (err as any).code = "NO_QUESTIONS_AVAILABLE";
//             (err as any).details = {
//                 engineName,
//                 topicSlugRaw,
//                 topicSlugBase,
//                 preferKind,
//                 preferPurpose,
//                 metaPoolCount: metaPoolRaw.length,
//                 fallbackPoolCount: fallbackPoolRaw.length,
//                 validKeysCount: validKeys.length,
//             };
//             throw err;
//         }
//
//         // uniqueness is SOFT: if uniq empties, allow repeats (this is what lets 30 work even if only 1 exists)
//         const excluded = normalizeExcludedKeys(ctx);
//         const uniq = filterExcluded(filtered, excluded);
//         const pool = uniq.length ? uniq : filtered;
//
//         if (!pool.length) {
//             const err = new Error(
//                 `${engineName}: EMPTY_POOL topic="${topicSlugRaw}" base="${topicSlugBase}" preferPurpose="${preferPurpose ?? ""}" preferKind="${preferKind ?? ""}"`,
//             );
//             (err as any).code = "EMPTY_POOL";
//             throw err;
//         }
//
//         // force keys only if present in the *filtered* pool (prevents forcing a "project" key during quiz runs)
//         const forceKey = String((ctx as any).meta?.forceKey ?? "").trim();
//         const exerciseKey = String((ctx as any).exerciseKey ?? "").trim();
//
//         const forced =
//             (exerciseKey && pool.some((p) => p.key === exerciseKey) ? exerciseKey : "") ||
//             (forceKey && pool.some((p) => p.key === forceKey) ? forceKey : "");
//
//         const chosen = forced || weightedKey(R, pool);
//
//         const handler = handlers[chosen];
//         if (!handler) {
//             const err = new Error(`${engineName}: missing handler key="${chosen}" topicSlug="${topicSlugRaw}"`);
//             (err as any).code = "MISSING_HANDLER";
//             throw err;
//         }
//
//         const chosenItem = pool.find((p) => p.key === chosen) ?? null;
//         const chosenPurpose = normalizePurpose((chosenItem as any)?.purpose ?? defaultPurpose);
//
//         const out = handler({ rng: R, diff, id, topic });
//
//         return {
//             ...(out as any),
//             meta: {
//                 ...((out as any).meta ?? {}),
//                 key: chosen,
//                 purpose: chosenPurpose,
//             },
//         } as any;
//     };
// }