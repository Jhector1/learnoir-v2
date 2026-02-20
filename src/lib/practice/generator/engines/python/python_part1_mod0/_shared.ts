// src/lib/practice/generator/engines/python/python_part1_mod0/_shared.ts
export const PY_MOD0_PREFIX = "py0" as const;

export const PY_MOD0_BASE_TOPICS = [
    "editor_workspace_overview",
    "syntax_intro",
    "programming_intro",
    "computer_intro",
    "comments_intro",
] as const;

export type PyMod0BaseTopic = (typeof PY_MOD0_BASE_TOPICS)[number];
