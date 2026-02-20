// src/lib/practice/generator/engines/python/python_part1_mod1/_shared.ts
export const PY_MOD1_PREFIX = "py1" as const;

export const PY_MOD1_BASE_TOPICS = [
    "variables_types_intro",
    "operators_expressions",
    "string_basics",
    "input_output_patterns",
] as const;

export type PyMod1BaseTopic = (typeof PY_MOD1_BASE_TOPICS)[number];
