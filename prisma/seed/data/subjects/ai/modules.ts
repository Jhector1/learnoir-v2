import type { ModuleSeed } from "../_types";
import { AI_MOD0, AI_SUBJECT_SLUG } from "./constants";

export const AI_MODULES = [
    {
        slug: AI_MOD0,
        subjectSlug: AI_SUBJECT_SLUG,
        order: 0,
        title: "ChatGPT Kickstart — GenAI Foundations",
        description: "Setup + Safety Gate: prompting basics, verification, redaction, and Data Controls.",
        weekStart: 0,
        weekEnd: 1,
        meta: {
            outcomes: [
                "Understand what AI is.",
                "Familiarize with different ai tools and a focus on Chatgpt.",
                "Know what ChatGPT is good at (and what it’s not).",
                "Use Ask → Refine → Finalize to get better results.",
                "Request formats like bullets/steps/tables reliably.",
                "Avoid sharing sensitive info (PII/PHI/secrets).",
                "Redact safely and understand Data Controls.",
            ],
            why:[
                "This module will help you a lot in understanding in your job research.",
                "Knowing how responsibly is vital skill"

            ],
            prereqs: ["None — designed for absolute beginners."],
            estimatedMinutes: 45,
        },
    },
] satisfies ModuleSeed[];
