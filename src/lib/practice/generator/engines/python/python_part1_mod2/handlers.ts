import type { Difficulty, ExerciseKind } from "../../../../types";
import type { GenOut } from "../../../shared/expected";
import type { RNG } from "../../../shared/rng";
import type { TopicContext } from "../../../generatorTypes";

import { makePythonModuleGenerator } from "../_shared";

import { M2_CONDITIONALS_TOPIC } from "./topics/conditionals";
import { M2_LOOPS_TOPIC } from "./topics/loops";
import { M2_LISTS_TOPIC } from "./topics/lists";
import { M2_FUNCTIONS_TOPIC } from "./topics/functions";

export function makeGenPythonStatementsPart1Mod2(ctx: TopicContext) {
    return makePythonModuleGenerator({
        engineName: "python_part1_mod2",
        ctx,
        defaultPurpose: "project",
        enablePurpose: true,
        topics: [M2_CONDITIONALS_TOPIC, M2_LOOPS_TOPIC, M2_LISTS_TOPIC, M2_FUNCTIONS_TOPIC],
    }) as unknown as (rng: RNG, diff: Difficulty, id: string) => GenOut<ExerciseKind>;
}