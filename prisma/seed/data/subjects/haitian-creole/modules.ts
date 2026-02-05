import type { ModuleSeed } from "../_types";
import { HC_MOD0, HC_SUBJECT_SLUG } from "./constants";

export const HC_MODULES = [
  {
    slug: HC_MOD0,
    subjectSlug: HC_SUBJECT_SLUG,
    order: 0,
    title: "Haitian Creole 0 — Foundations",
    description: "Greetings, pronouns, basic sentences, numbers, and everyday phrases.",
    weekStart: 0,
    weekEnd: 2,
  },
] satisfies ModuleSeed[];
