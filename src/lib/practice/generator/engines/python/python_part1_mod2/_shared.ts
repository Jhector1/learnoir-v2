// src/lib/practice/generator/engines/python/python_part1_mod2/_shared.ts
export const PY_MOD2_PREFIX = "py2" as const;

export const PY_MOD2_BASE_TOPICS = [
    "conditionals_basics",
    "loops_basics",
    "lists_basics",
    "functions_basics",
] as const;

export type PyMod2BaseTopic = (typeof PY_MOD2_BASE_TOPICS)[number];