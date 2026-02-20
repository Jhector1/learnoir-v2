// src/lib/practice/generator/engines/python/python_part1_mod0/handlers.ts
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

import { M0_WORKSPACE_HANDLERS, M0_WORKSPACE_VALID_KEYS } from "./topics/workspace";
import { M0_SYNTAX_HANDLERS, M0_SYNTAX_VALID_KEYS } from "./topics/syntax";
import { M0_PROGRAMMING_HANDLERS, M0_PROGRAMMING_VALID_KEYS } from "./topics/programming";
import { M0_COMPUTER_HANDLERS, M0_COMPUTER_VALID_KEYS } from "./topics/computer";
import { M0_COMMENTS_HANDLERS, M0_COMMENTS_VALID_KEYS } from "./topics/comments";

const TOPIC_HANDLERS: Record<string, Record<string, Handler>> = {
    editor_workspace_overview: M0_WORKSPACE_HANDLERS,
    syntax_intro: M0_SYNTAX_HANDLERS,
    programming_intro: M0_PROGRAMMING_HANDLERS,
    computer_intro: M0_COMPUTER_HANDLERS,
    comments_intro: M0_COMMENTS_HANDLERS,
};

const TOPIC_VALID_KEYS: Record<string, string[]> = {
    editor_workspace_overview: [...M0_WORKSPACE_VALID_KEYS],
    syntax_intro: [...M0_SYNTAX_VALID_KEYS],
    programming_intro: [...M0_PROGRAMMING_VALID_KEYS],
    computer_intro: [...M0_COMPUTER_VALID_KEYS],
    comments_intro: [...M0_COMMENTS_VALID_KEYS],
};

function safeMixedPoolFor(validKeys: string[]): PoolItem[] {
    return validKeys.map((key) => ({ key, w: 1 }));
}

export function makeGenPythonStatementsPart1Mod0(ctx: TopicContext) {
    return (rng: RNG, diff: Difficulty, id: string): GenOut<ExerciseKind> => {
        const R: RNG = (ctx as any).rng ?? rng;

        const { raw: topicSlugRaw, base: topicSlugBase } = parseTopicSlug(String(ctx.topicSlug));
        const topic = topicSlugRaw; // keep RAW for progress

        const handlers = TOPIC_HANDLERS[topicSlugBase];
        const validKeys = TOPIC_VALID_KEYS[topicSlugBase];

        if (!handlers || !validKeys?.length) {
            throw new Error(`python_part1_mod0: unknown topicSlug="${topicSlugRaw}" (base="${topicSlugBase}")`);
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
        if (!handler) throw new Error(`python_part1_mod0: missing handler key="${chosen}" topicSlug="${topicSlugRaw}"`);

        return handler({ rng: R, diff, id, topic });
    };
}
