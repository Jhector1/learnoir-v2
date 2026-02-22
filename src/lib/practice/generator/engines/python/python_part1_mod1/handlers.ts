// src/lib/practice/generator/engines/python/python_part1_mod1/handlers.ts
import type { Difficulty, ExerciseKind } from "../../../../types";
import type { GenOut } from "../../../shared/expected";
import type { RNG } from "../../../shared/rng";
import type { TopicContext } from "../../../generatorTypes";

import { type Handler, makePythonTopicGenerator } from "../python_shared/_shared";

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

export function makeGenPythonStatementsPart1Mod1(ctx: TopicContext) {
    return makePythonTopicGenerator({
        engineName: "python_part1_mod1",
        ctx,
        topicHandlers: TOPIC_HANDLERS,
        topicValidKeys: TOPIC_VALID_KEYS,
        defaultPurpose: "quiz",
        enablePurpose: true, // harmless; will default to quiz if pools don’t specify purpose
    }) as unknown as (rng: RNG, diff: Difficulty, id: string) => GenOut<ExerciseKind>;
}