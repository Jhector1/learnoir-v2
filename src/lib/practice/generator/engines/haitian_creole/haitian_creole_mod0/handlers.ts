import type { Difficulty, ExerciseKind } from "../../../../types";
import type { GenOut } from "../../../shared/expected";
import type { RNG } from "../../../shared/rng";
import type { TopicContext } from "../../../generatorTypes";

import { makeHaitianModuleGenerator } from "../_shared";

import { HC_GREETINGS_TOPIC } from "./topics/greetings";
import { HC_INTRO_TOPIC } from "./topics/introductions";
import { HC_PRONOUNS_TOPIC } from "./topics/pronouns";
import {HC_NUMBERS_TOPIC} from "@/lib/practice/generator/engines/haitian_creole/haitian_creole_mod0/topics/numbers";
import {HC_QUESTIONS_TOPIC} from "@/lib/practice/generator/engines/haitian_creole/haitian_creole_mod0/topics/questions";
import {HC_SENTENCES_TOPIC} from "@/lib/practice/generator/engines/haitian_creole/haitian_creole_mod0/topics/sentences";

export function makeGenHaitianCreolePart1Mod0(ctx: TopicContext) {
    return makeHaitianModuleGenerator({
        engineName: "haitian_creole_part1",
        ctx,
        defaultPurpose: "quiz",
        enablePurpose: true,
        topics: [HC_GREETINGS_TOPIC,  HC_PRONOUNS_TOPIC, HC_NUMBERS_TOPIC, HC_QUESTIONS_TOPIC, HC_SENTENCES_TOPIC],
    }) as unknown as (rng: RNG, diff: Difficulty, id: string) => GenOut<ExerciseKind>;
}