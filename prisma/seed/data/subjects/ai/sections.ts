// prisma/seed/data/subjects/ai/sections.ts
import type { SectionDef } from "../_types";
import { AI_MOD0, AI_PREFIX0 } from "./constants";
import { AI_TOPICS } from "./topics";

export const AI_SECTIONS = [
    {
        moduleSlug: AI_MOD0,
        prefix: AI_PREFIX0,
        genKey: "ai_mod0",
        topics: AI_TOPICS[AI_MOD0],
        section: {
            slug: "ai-0-foundations",
            order: 0,
            title: "AI 0 — Foundations",
            description:
                "Learn what AI is, how to ask good questions, how to check answers, and how to protect privacy.",
            meta: {
                module: 0,
                weeks: "Weeks 0–2",
                bullets: [
                    "What AI is (and what it isn’t)",
                    "How to write clear prompts",
                    "How to verify important information",
                    "Privacy basics: what not to share",
                    "A simple step-by-step workflow for using AI",
                ],
            },
        },
    },
] satisfies SectionDef[];
