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
            slug: "ai-0-kickstart-genai-foundations",
            order: 0,
            title: "Module 0 — Setup + Safety Gate",
            description: "Prompting basics + verification + safe use (PII/PHI/secrets, redaction, Data Controls).",
            meta: {
                module: 0,
                weeks: "Week 0",
                bullets: [
                    "What ChatGPT is good at (drafting/explaining/organizing)",
                    "Ask → Refine → Finalize workflow",
                    "Requesting output format (bullets/steps/tables)",
                    "Safety: do not paste PII/PHI/secrets",
                    "Redaction basics + Data Controls",
                    "Hands-on lab: find Data Controls + run your first prompt",
                ],
            },
        },
    },
] satisfies SectionDef[];
