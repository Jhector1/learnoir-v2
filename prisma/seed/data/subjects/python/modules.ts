// src/lib/subjects/python/modules.ts
import type { ModuleSeed } from "../_types";
import { PY_MOD0, PY_MOD1, PY_MOD2, PY_SUBJECT_SLUG } from "./constants";

export const PY_MODULES = [
  {
    slug: PY_MOD0,
    subjectSlug: PY_SUBJECT_SLUG,
    order: 0,
    title: "Python 0 — Foundations",
    description: "Workspace + programming basics: IPO model, syntax, and comments.",
    weekStart: 0,
    weekEnd: 2,
    meta: {
      estimatedMinutes: 40,
      videoUrl: "https://youtu.be/QXeEoD0pB3E?si=3N8WDibvE4bghpea",
      prereqs: ["None — you can start here"],
      outcomes: [
        "Navigate the editor, Run button, and terminal",
        "Explain Input → Processing → Output",
        "Understand what syntax is and why SyntaxError happens",
        "Use # comments intentionally while learning",
      ],
      why: [
        "Sets up the mental model + workspace skills",
        "Prevents beginner confusion before writing bigger programs",
      ],
    },
  },

  {
    slug: PY_MOD1,
    subjectSlug: PY_SUBJECT_SLUG,
    order: 1,
    title: "Python 1 — Core Building Blocks",
    description: "Variables/types, operators/expressions, strings, and mini-program patterns.",
    weekStart: 3,
    weekEnd: 5,
    meta: {
      estimatedMinutes: 90,
      videoUrl: undefined,
      prereqs: ["Python 0 — Foundations"],
      outcomes: [
        "Store values in variables and explain types",
        "Use operators + expressions to compute results",
        "Work with strings (print, f-strings, indexing, methods)",
        "Build mini-programs using Ask → Convert → Compute → Show",
      ],
      why: [
        "These are the building blocks behind almost every beginner program",
        "Makes conditionals/loops feel natural in the next module",
      ],
    },
  },

  {
    slug: PY_MOD2,
    subjectSlug: PY_SUBJECT_SLUG,
    order: 2,
    title: "Python 2 — Control Flow + Collections",
    description: "Conditionals, loops, lists, and functions — stitched into story-based mini-projects.",
    weekStart: 6,
    weekEnd: 8,
    meta: {
      estimatedMinutes: 110,
      videoUrl: undefined,
      prereqs: ["Python 1 — Core Building Blocks"],
      outcomes: [
        "Use if/elif/else with comparisons and boolean logic",
        "Write while loops for validation and repeating actions",
        "Use for loops to iterate ranges and lists",
        "Create and use lists to store many values",
        "Write reusable functions with parameters and return values",
      ],
      why: [
        "This is where programs start to feel 'alive' (decisions + repetition)",
        "Lists + functions unlock real mini-app structure",
      ],
    },
  },
] satisfies ModuleSeed[];