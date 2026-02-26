// src/prisma/seed/data/subjects/haitian-creole/modules.ts
import type {ModuleMeta, ModuleSeed} from "../_types";
import { HC_MOD0, HC_SUBJECT_SLUG } from "./constants";

/**
 * Small helper so "meta" stays consistent across modules.
 * - outcomes/why/prereqs are always arrays of strings
 * - estimatedMinutes is always a number
 * - videoUrl is optional
 */
// type ModuleMeta = {
//   estimatedMinutes: number;
//   videoUrl?: string;
//   prereqs: string[];
//   outcomes: string[];
//   why: string[];
// };

function hcMeta(meta: ModuleMeta): ModuleMeta {
  return meta;
}

export const HC_MODULES = [
  {
    slug: HC_MOD0,
    subjectSlug: HC_SUBJECT_SLUG,
    order: 0,
    title: "Haitian Creole 0 — Foundations",
    description: "Greetings, pronouns, basic sentences, numbers, and everyday phrases.",
    weekStart: 0,
    weekEnd: 2,

    meta: hcMeta({
      estimatedMinutes: 40,
      videoUrl: "https://youtu.be/1LCE5nqTeAs?si=IzrX0bvQjI2bxQAh",
      prereqs: ["None — you can start here"],
      outcomes: [
        "Greet people and respond politely in everyday situations",
        "Introduce yourself (name, how you are, where you’re from)",
        "Use core pronouns and simple sentence patterns",
        "Use basic numbers for age, time, and small quantities",
      ],
      why: [
        "Gives you the most-used phrases first, so you can speak immediately",
        "Builds the core sentence patterns you’ll reuse in every later module",
      ],
    }),
  },
] satisfies ModuleSeed[];