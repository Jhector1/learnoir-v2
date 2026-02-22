// src/lib/practice/generator/engines/python/python_part1_mod0/handlers.ts
import type { Difficulty, ExerciseKind } from "../../../../types";
import type { GenOut } from "../../../shared/expected";
import type { RNG } from "../../../shared/rng";
import type { TopicContext } from "../../../generatorTypes";

import {
    type Handler,
    type PoolItem,
    makePythonTopicGenerator, // ✅ NEW
} from "../python_shared/_shared";

import { M0_WORKSPACE_HANDLERS, M0_WORKSPACE_VALID_KEYS, M0_WORKSPACE_POOL } from "./topics/workspace";
import { M0_SYNTAX_HANDLERS, M0_SYNTAX_VALID_KEYS, M0_SYNTAX_POOL } from "./topics/syntax";
import { M0_PROGRAMMING_HANDLERS, M0_PROGRAMMING_VALID_KEYS, M0_PROGRAMMING_POOL } from "./topics/programming";
import { M0_COMPUTER_HANDLERS, M0_COMPUTER_VALID_KEYS, M0_COMPUTER_POOL } from "./topics/computer";
import { M0_COMMENTS_HANDLERS, M0_COMMENTS_VALID_KEYS, M0_COMMENTS_POOL } from "./topics/comments";

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

// ✅ purpose-aware fallback pools (keeps weights/purpose if meta is empty)
const TOPIC_DEFAULT_POOLS: Record<string, PoolItem[]> = {
    editor_workspace_overview: (M0_WORKSPACE_POOL as any) ?? [],
    syntax_intro: (M0_SYNTAX_POOL as any) ?? [],
    programming_intro: (M0_PROGRAMMING_POOL as any) ?? [],
    computer_intro: (M0_COMPUTER_POOL as any) ?? [],
    comments_intro: (M0_COMMENTS_POOL as any) ?? [],
};

export function makeGenPythonStatementsPart1Mod0(ctx: TopicContext) {
    return makePythonTopicGenerator({
        engineName: "python_part1_mod0",
        ctx,
        topicHandlers: TOPIC_HANDLERS,
        topicValidKeys: TOPIC_VALID_KEYS,
        topicDefaultPools: TOPIC_DEFAULT_POOLS,
        defaultPurpose: "quiz",
        enablePurpose: true,
    }) as unknown as (rng: RNG, diff: Difficulty, id: string) => GenOut<ExerciseKind>;
}