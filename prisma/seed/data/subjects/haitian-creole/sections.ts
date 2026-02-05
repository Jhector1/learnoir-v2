import type { SectionDef } from "../_types";
import { HC_MOD0, HC_PREFIX0 } from "./constants";
import { HC_TOPICS } from "./topics";

export const HC_SECTIONS = [
  {
    moduleSlug: HC_MOD0,
    prefix: HC_PREFIX0,
    genKey: "haitian_creole_part1",
    topics: HC_TOPICS[HC_MOD0],
    section: {
      slug: "haitian-creole-0-foundations",
      order: 0,
      title: "Haitian Creole 0 — Foundations",
      description: "Greetings, pronouns, simple sentences, numbers, and everyday phrases.",
      meta: {
        module: 0,
        weeks: "Weeks 0–2",
        bullets: [
          "Greetings and common replies",
          "Core pronouns (mwen, ou, li, nou, yo)",
          "Simple sentence patterns (Mwen se…, Mwen renmen…)",
          "Numbers 1–20",
          "Everyday phrases (mèsi, tanpri, eskize m)",
        ],
      },
    },
  },
] satisfies SectionDef[];
