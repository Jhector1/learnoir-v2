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
  },
] satisfies ModuleSeed[];
