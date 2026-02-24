import type { Difficulty, ExerciseKind } from "../../../../types";
import type { GenOut } from "../../../shared/expected";
import type { RNG } from "../../../shared/rng";
import type { TopicContext } from "../../../generatorTypes";

import { makePythonModuleGenerator } from "../_shared";

import { M0_WORKSPACE_TOPIC } from "./topics/workspace";
import { M0_SYNTAX_TOPIC } from "./topics/syntax";
import { M0_PROGRAMMING_TOPIC } from "./topics/programming";
import { M0_COMPUTER_TOPIC } from "./topics/computer";
import { M0_COMMENTS_TOPIC } from "./topics/comments";

export function makeGenPythonStatementsPart1Mod0(ctx: TopicContext) {
    return makePythonModuleGenerator({
        engineName: "python_part1_mod0",
        ctx,
        defaultPurpose: "quiz",
        enablePurpose: true,
        topics: [M0_WORKSPACE_TOPIC, M0_SYNTAX_TOPIC, M0_PROGRAMMING_TOPIC, M0_COMPUTER_TOPIC, M0_COMMENTS_TOPIC],
    }) as unknown as (rng: RNG, diff: Difficulty, id: string) => GenOut<ExerciseKind>;
}