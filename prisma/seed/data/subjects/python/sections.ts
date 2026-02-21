// src/lib/subjects/python/sections.ts
import type { SectionDef } from "../_types";
import { PY_MOD0, PY_MOD1, PY_MOD2, PY_PREFIX0, PY_PREFIX1, PY_PREFIX2 } from "./constants";
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
      description: "Workspace + programming basics: IPO model, syntax, and comments.",
      meta: {
        module: 0,
        weeks: "Weeks 0–2",
        bullets: [
          "Workspace tour (editor, run, terminal)",
          "Input → Processing → Output",
          "Syntax rules + SyntaxError",
          "Comments as notes to humans",
        ],
      },
    },
  },

  {
    moduleSlug: PY_MOD1,
    prefix: PY_PREFIX1,
    genKey: "python_part1",
    topics: PY_TOPICS[PY_MOD1],
    section: {
      slug: "python-1-core-building-blocks",
      order: 1,
      title: "Python 1 — Core Building Blocks",
      description: "Variables/types, operators/expressions, strings, and mini-program patterns.",
      meta: {
        module: 1,
        weeks: "Weeks 3–5",
        bullets: [
          "Variables + data types",
          "Operators + expressions",
          "String basics + clean output",
          "Ask → Convert → Compute → Show mini-programs",
        ],
      },
    },
  },

  {
    moduleSlug: PY_MOD2,
    prefix: PY_PREFIX2, // ✅ should be "py2"
    genKey: "python_part1",
    topics: PY_TOPICS[PY_MOD2],
    section: {
      slug: "python-2-control-flow-collections",
      order: 2,
      title: "Python 2 — Control Flow + Collections",
      description: "Conditionals, loops, lists, and functions — stitched into story-based mini-projects.",
      meta: {
        module: 2,
        weeks: "Weeks 6–8",
        bullets: [
          "Conditionals (if / elif / else + boolean logic)",
          "Loops (while / for / break / continue)",
          "Lists (store many values + iterate)",
          "Functions (parameters, return, reuse)",
        ],
      },
    },
  },
] satisfies SectionDef[];