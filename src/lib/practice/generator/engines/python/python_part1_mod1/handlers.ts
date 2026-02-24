// src/lib/practice/generator/engines/python/python_part1_mod1/handlers.ts
import type { Difficulty, ExerciseKind } from "../../../../types";
import type { GenOut } from "../../../shared/expected";
import type { RNG } from "../../../shared/rng";
import type { TopicContext } from "../../../generatorTypes";

import { makePythonModuleGenerator } from "../_shared";

import { M1_VARIABLES_TOPIC } from "./topics/variables_types";
import { M1_OPERATORS_TOPIC } from "./topics/operators_expressions";
import { M1_STRINGS_TOPIC } from "./topics/string_basics";
import { M1_IO_TOPIC } from "./topics/input_output_patterns";

export function makeGenPythonStatementsPart1Mod1(ctx: TopicContext) {
    return makePythonModuleGenerator({
        engineName: "python_part1_mod1",
        ctx,
        defaultPurpose: "quiz",
        enablePurpose: true,
        topics: [M1_VARIABLES_TOPIC, M1_OPERATORS_TOPIC, M1_STRINGS_TOPIC, M1_IO_TOPIC],
    }) as unknown as (rng: RNG, diff: Difficulty, id: string) => GenOut<ExerciseKind>;
}