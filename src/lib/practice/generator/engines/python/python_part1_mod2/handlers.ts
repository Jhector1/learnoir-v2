// src/lib/practice/generator/engines/python/python_part1_mod2/handlers.ts
import type { Difficulty, ExerciseKind } from "../../../../types";
import type { GenOut } from "../../../shared/expected";
import type { RNG } from "../../../shared/rng";
import type { TopicContext } from "../../../generatorTypes";
import type { PracticeKind } from "@prisma/client";

import {
    filterExcluded,
    normalizeExcludedKeys,
    parseTopicSlug,
    readPoolFromMeta,
    weightedKey,
    type Handler,
    type PoolItem,
} from "../python_shared/_shared";

import { M2_CONDITIONALS_HANDLERS, M2_CONDITIONALS_VALID_KEYS } from "./topics/conditionals";
import { M2_LOOPS_HANDLERS, M2_LOOPS_VALID_KEYS } from "./topics/loops";
import { M2_LISTS_HANDLERS, M2_LISTS_VALID_KEYS } from "./topics/lists";
import { M2_FUNCTIONS_HANDLERS, M2_FUNCTIONS_VALID_KEYS } from "./topics/functions";

const TOPIC_HANDLERS: Record<string, Record<string, Handler>> = {
    conditionals_basics: M2_CONDITIONALS_HANDLERS,
    loops_basics: M2_LOOPS_HANDLERS,
    lists_basics: M2_LISTS_HANDLERS,
    functions_basics: M2_FUNCTIONS_HANDLERS,
};

const TOPIC_VALID_KEYS: Record<string, string[]> = {
    conditionals_basics: [...M2_CONDITIONALS_VALID_KEYS],
    loops_basics: [...M2_LOOPS_VALID_KEYS],
    lists_basics: [...M2_LISTS_VALID_KEYS],
    functions_basics: [...M2_FUNCTIONS_VALID_KEYS],
};

function safeMixedPoolFor(validKeys: string[]): PoolItem[] {
    return validKeys.map((key) => ({ key, w: 1 }));
}

export function makeGenPythonStatementsPart1Mod2(ctx: TopicContext) {
    return (rng: RNG, diff: Difficulty, id: string): GenOut<ExerciseKind> => {
        const R: RNG = (ctx as any).rng ?? rng;

        const { raw: topicSlugRaw, base: topicSlugBase } = parseTopicSlug(String(ctx.topicSlug));
        const topic = topicSlugRaw; // keep RAW for progress

        const handlers = TOPIC_HANDLERS[topicSlugBase];
        const validKeys = TOPIC_VALID_KEYS[topicSlugBase];

        if (!handlers || !validKeys?.length) {
            throw new Error(`python_part1_mod2: unknown topicSlug="${topicSlugRaw}" (base="${topicSlugBase}")`);
        }

        const basePool = readPoolFromMeta(ctx.meta).filter((p) => validKeys.includes(p.key));

        const preferKind = (ctx.preferKind ?? (ctx as any).meta?.preferKind ?? null) as PracticeKind | null;
        const kindFiltered = preferKind ? basePool.filter((p) => !p.kind || p.kind === preferKind) : basePool;

        const excluded = normalizeExcludedKeys(ctx);
        const uniqFiltered = filterExcluded(kindFiltered.length ? kindFiltered : basePool, excluded);

        const pool = uniqFiltered.length
            ? uniqFiltered
            : (kindFiltered.length ? kindFiltered : basePool).length
                ? (kindFiltered.length ? kindFiltered : basePool)
                : safeMixedPoolFor(validKeys);

        const forceKey = String((ctx as any).meta?.forceKey ?? "").trim();
        const exerciseKey = String((ctx as any).exerciseKey ?? "").trim();

        const chosen =
            (exerciseKey && validKeys.includes(exerciseKey) ? exerciseKey : "") ||
            (forceKey && validKeys.includes(forceKey) ? forceKey : "") ||
            weightedKey(R, pool);

        const handler = handlers[chosen];
        if (!handler) throw new Error(`python_part1_mod2: missing handler key="${chosen}" topicSlug="${topicSlugRaw}"`);

        return handler({ rng: R, diff, id, topic });
    };
}