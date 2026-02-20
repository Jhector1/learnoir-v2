// src/lib/practice/generator/engines/python/python_part1.ts
import type { Difficulty, ExerciseKind } from "../../../types";
import type { GenOut } from "../../shared/expected";
import type { RNG } from "../../shared/rng";
import type { TopicContext } from "../../generatorTypes";

import { parseTopicSlug } from "./python_shared/_shared";
import { makeGenPythonStatementsPart1Mod0 } from "./python_part1_mod0/handlers";
import { makeGenPythonStatementsPart1Mod1 } from "./python_part1_mod1/handlers";

// Base slugs (no prefix)
const MOD0_BASE = new Set<string>([
  "editor_workspace_overview",
  "syntax_intro",
  "programming_intro",
  "computer_intro",
  "comments_intro",
]);

const MOD1_BASE = new Set<string>([
  "variables_types_intro",
  "operators_expressions",
  "string_basics",
  "input_output_patterns",
]);

// Prefixes your app uses
const MOD0_PREFIX = "py0";
const MOD1_PREFIX = "py1";

export function makeGenPythonStatementsPart1(ctx: TopicContext) {
  const { raw, base, prefix } = parseTopicSlug(String(ctx.topicSlug));

  // Prefer explicit prefix routing if present
  if (prefix === MOD0_PREFIX) return makeGenPythonStatementsPart1Mod0(ctx);
  if (prefix === MOD1_PREFIX) return makeGenPythonStatementsPart1Mod1(ctx);

  // Fallback: route by base
  if (MOD0_BASE.has(base)) return makeGenPythonStatementsPart1Mod0(ctx);
  if (MOD1_BASE.has(base)) return makeGenPythonStatementsPart1Mod1(ctx);

  // Hard stop: prevents accidental generation outside allowed topics
  return (_rng: RNG, _diff: Difficulty, id: string): GenOut<ExerciseKind> => {
    throw new Error(`python_part1: no generator registered for topicSlug="${raw}" (exercise id=${id})`);
  };
}
