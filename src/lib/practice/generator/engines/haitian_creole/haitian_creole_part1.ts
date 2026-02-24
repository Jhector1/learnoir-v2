// src/lib/practice/generator/engines/haitian/haitian_creole_part1.ts
import type { Difficulty, ExerciseKind } from "../../../types";
import type { GenOut } from "../../shared/expected";
import type { RNG } from "../../shared/rng";
import type { TopicContext } from "../../generatorTypes";

// Reuse the same slug parser you use for Python (recommended).
// If you prefer, copy it into engines/haitian/_shared.ts and import from "./_shared" instead.
import {makeGenHaitianCreolePart1Mod0} from "@/lib/practice/generator/engines/haitian_creole/haitian_creole_mod0/handlers";
import {parseTopicSlug} from "@/lib/practice/generator/engines/utils";

// import { makeGenHaitianCreolePart1Mod0 } from "./haitian_creole_part1_mod0/handlers";
// import { makeGenHaitianCreolePart1Mod1 } from "./haitian_creole_part1_mod1/handlers";
// import { makeGenHaitianCreolePart1Mod2 } from "./haitian_creole_part1_mod2/handlers";

/**
 * Base slugs (no prefix)
 * These should match your TopicBundle slugs (defineTopic("...")) in each module.
 */
const MOD0_BASE = new Set<string>([
    "hc_greetings",
    "hc_introductions",
    "hc_pronouns",
]);

const MOD1_BASE = new Set<string>([
    // examples (fill when you add mod1 topics):
    "hc_numbers",
    "hc_days_times",
    "hc_polite_phrases",
]);

const MOD2_BASE = new Set<string>([
    // examples (fill when you add mod2 topics):
    "hc_food_drink",
    "hc_questions_basics",
]);

/**
 * Prefixes your app uses (analogous to py0/py1/py2)
 * Use whatever you actually store in topicSlug prefixes.
 */
const MOD0_PREFIX = "ht0";
const MOD1_PREFIX = "ht1";
const MOD2_PREFIX = "ht2";

export function makeGenHaitianCreolePart1(ctx: TopicContext) {
    const { raw, base, prefix } = parseTopicSlug(String(ctx.topicSlug));

    // Prefer explicit prefix routing if present
    if (prefix === MOD0_PREFIX) return makeGenHaitianCreolePart1Mod0(ctx);
    // if (prefix === MOD1_PREFIX) return makeGenHaitianCreolePart1Mod1(ctx);
    // if (prefix === MOD2_PREFIX) return makeGenHaitianCreolePart1Mod2(ctx);

    // Fallback: route by base
    if (MOD0_BASE.has(base)) return makeGenHaitianCreolePart1Mod0(ctx);
    // if (MOD1_BASE.has(base)) return makeGenHaitianCreolePart1Mod1(ctx);
    // if (MOD2_BASE.has(base)) return makeGenHaitianCreolePart1Mod2(ctx);

    return (_rng: RNG, _diff: Difficulty, id: string): GenOut<ExerciseKind> => {
        throw new Error(
            `haitian_creole_part1: no generator registered for topicSlug="${raw}" (exercise id=${id})`,
        );
    };
}