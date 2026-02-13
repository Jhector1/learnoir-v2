import type { ModuleSeed } from "../_types";
import { PY_MOD0, PY_SUBJECT_SLUG } from "./constants";

export const PY_MODULES = [
  {
    slug: PY_MOD0,
    subjectSlug: PY_SUBJECT_SLUG,
    order: 0,
    title: "Python 0 — Foundations",
    description: "Print/input, variables, strings, arithmetic, and common errors.",
    weekStart: 0,
    weekEnd: 2,
    meta: {
      estimatedMinutes: 70,
      videoUrl: "https://youtu.be/QXeEoD0pB3E?si=3N8WDibvE4bghpea", // or "https://..."
      prereqs: [
        "None — you can start here",
      ],
      outcomes: [
        "Use print() with sep/end and basic formatting",
        "Read input() and store values in variables",
        "Work confidently with strings and len()",
        "Apply arithmetic + operator precedence correctly",
        "Read tracebacks and fix common beginner errors",
      ],
      why: [
        "This is the foundation for every Python topic that follows",
        "It prevents the most common beginner mistakes early",
        "It makes later topics (functions, lists, files) much easier",
      ],
    },
  },
] satisfies ModuleSeed[];
