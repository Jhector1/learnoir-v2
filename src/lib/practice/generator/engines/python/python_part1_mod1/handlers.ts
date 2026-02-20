// src/lib/practice/generator/engines/python/python_part1_mod1/handlers.ts
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

import { M1_VARIABLES_TYPES_HANDLERS, M1_VARIABLES_TYPES_VALID_KEYS } from "./topics/variables_types";
import { M1_OPERATORS_HANDLERS, M1_OPERATORS_VALID_KEYS } from "./topics/operators_expressions";
import { M1_STRINGS_HANDLERS, M1_STRINGS_VALID_KEYS } from "./topics/string_basics";
import { M1_IO_HANDLERS, M1_IO_VALID_KEYS } from "./topics/input_output_patterns";

const TOPIC_HANDLERS: Record<string, Record<string, Handler>> = {
    variables_types_intro: M1_VARIABLES_TYPES_HANDLERS,
    operators_expressions: M1_OPERATORS_HANDLERS,
    string_basics: M1_STRINGS_HANDLERS,
    input_output_patterns: M1_IO_HANDLERS,
};

const TOPIC_VALID_KEYS: Record<string, string[]> = {
    variables_types_intro: [...M1_VARIABLES_TYPES_VALID_KEYS],
    operators_expressions: [...M1_OPERATORS_VALID_KEYS],
    string_basics: [...M1_STRINGS_VALID_KEYS],
    input_output_patterns: [...M1_IO_VALID_KEYS],
};

function safeMixedPoolFor(validKeys: string[]): PoolItem[] {
    return validKeys.map((key) => ({ key, w: 1 }));
}

export function makeGenPythonStatementsPart1Mod1(ctx: TopicContext) {
    return (rng: RNG, diff: Difficulty, id: string): GenOut<ExerciseKind> => {
        const R: RNG = (ctx as any).rng ?? rng;

        const { raw: topicSlugRaw, base: topicSlugBase } = parseTopicSlug(String(ctx.topicSlug));
        const topic = topicSlugRaw;

        const handlers = TOPIC_HANDLERS[topicSlugBase];
        const validKeys = TOPIC_VALID_KEYS[topicSlugBase];

        if (!handlers || !validKeys?.length) {
            throw new Error(`python_part1_mod1: unknown topicSlug="${topicSlugRaw}" (base="${topicSlugBase}")`);
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
        if (!handler) throw new Error(`python_part1_mod1: missing handler key="${chosen}" topicSlug="${topicSlugRaw}"`);

        return handler({ rng: R, diff, id, topic });
    };
}
