// src/lib/practice/generator/engines/python/python_part1_mod2/handlers.ts
import type { Difficulty, ExerciseKind } from "../../../../types";
import type { GenOut } from "../../../shared/expected";
import type { RNG } from "../../../shared/rng";
import type { TopicContext } from "../../../generatorTypes";

import { type Handler, makePythonTopicGenerator } from "../python_shared/_shared";

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

export function makeGenPythonStatementsPart1Mod2(ctx: TopicContext) {
    return makePythonTopicGenerator({
        engineName: "python_part1_mod2",
        ctx,
        topicHandlers: TOPIC_HANDLERS,
        topicValidKeys: TOPIC_VALID_KEYS,
        defaultPurpose: "quiz",
        enablePurpose: true,
    }) as unknown as (rng: RNG, diff: Difficulty, id: string) => GenOut<ExerciseKind>;
}