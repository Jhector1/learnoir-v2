import type { SectionDef } from "../_types";
import { PY_MOD0, PY_PREFIX0 } from "./constants";
import { PY_TOPICS } from "./topics";

export const PY_SECTIONS = [
  {
    moduleSlug: PY_MOD0,
    prefix: PY_PREFIX0,
    genKey: "python_part1",
    topics: PY_TOPICS[PY_MOD0],
    section: {
      slug: "python-0-foundations",
      order: 0,
      title: "Python 0 — Foundations",
      description: "Print/input, variables, strings, arithmetic, and common errors.",
      meta: {
        module: 0,
        weeks: "Weeks 0–2",
        bullets: [
          "print() formatting (sep/end)",
          "input() and variables",
          "Strings and len()",
          "Arithmetic + precedence",
          "Comments/docstrings + reading tracebacks",
        ],
      },
    },
  },
] satisfies SectionDef[];
