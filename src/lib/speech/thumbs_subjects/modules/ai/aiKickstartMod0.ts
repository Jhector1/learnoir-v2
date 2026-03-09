import type { ReviewModule } from "@/lib/subjects/types";
import { AI_SECTION_MOD0, AI_TOPIC } from "@/lib/practice/catalog/subjects/ai/slugs";
import { AI_MOD0 } from "../../../../../prisma/seed/data/subjects/ai/constants";

export const aiKickstartMod0: ReviewModule = {
    id: AI_MOD0,
    title: "ChatGPT Kickstart: GenAI Foundations",
    subtitle: "Absolute beginners learn prompting, verification, and safe use (Setup + Safety Gate).",

    startPracticeHref: (topicSlug) =>
        `/practice?section=${AI_SECTION_MOD0}&difficulty=easy&topic=${encodeURIComponent(topicSlug)}`,

    topics: [
        // -------------------- 0.0 START HERE --------------------
        {
            id: "ai_intro",
            label: "0.0.1 — Intro to Generative AI",
            minutes: 8,
            summary: "Learn AI/model/prompt/ChatGPT with zero jargon so the rest feels easy.",
            cards: [
                {
                    type: "sketch",
                    id: "ai0_intro_s0",
                    title: "AI basics (quick read)",
                    sketchId: "ai.intro",
                    height: 520,
                },
            ],
        },

        {
            id: "ai_get_started",
            label: "0.0.2 — Open ChatGPT + start your first chat",
            minutes: 6,
            summary: "A simple checklist so beginners don’t get stuck.",
            cards: [
                {
                    type: "sketch",
                    id: "ai_get_started_s1",
                    title: "Get started (quick checklist)",
                    sketchId: "ai.getstarted",
                    height: 560,
                },
                {
                    type: "sketch",
                    id: "ai_get_started_s2",
                    title: "Get started (quick checklist)",
                    sketchId: "ai.getstarted",
                    height: 560,
                },
            ],
        },

        {
            id: "ai_verify_intro",
            label: "0.0.3 — Verification basics (so you trust AI the right way)",
            minutes: 6,
            summary: "A fast checklist to avoid confidently wrong answers.",
            cards: [
                {
                    type: "sketch",
                    id: "ai0_verify_s0",
                    title: "Verification checklist (quick read)",
                    sketchId: "ai.verify",
                    height: 520,
                },
            ],
        },

        // -------------------- 0.1 --------------------
        {
            id: "ai_capabilities",
            label: "0.1.1 — What ChatGPT is good at",
            minutes: 10,
            summary: "Drafting, explaining, organizing — and quick reality checks.",
            cards: [
                {
                    type: "sketch",
                    id: "ai0_s1",
                    title: "Use-cases (prompt templates)",
                    sketchId: "ai.usecases",
                    height: 560,
                },
                {
                    type: "quiz",
                    id: "ai0_q1",
                    title: "Quick check",
                    spec: {
                        subject: "ai",
                        module: AI_MOD0,
                        section: AI_SECTION_MOD0,
                        topic: AI_TOPIC.capabilities,
                        difficulty: "easy",
                        n: 5,
                        allowReveal: true,
                    },
                },
            ],
        },

        {
            id: "ai_workflow",
            label: "0.1.2 — Ask → Refine → Finalize",
            minutes: 8,
            summary: "A simple workflow that instantly improves results.",
            cards: [
                {
                    type: "sketch",
                    id: "ai0_s2",
                    title: "Ask → Refine → Finalize (summary)",
                    sketchId: "ai.workflow",
                    height: 560,
                },
                {
                    type: "quiz",
                    id: "ai0_q2",
                    title: "Quick check",
                    spec: {
                        subject: "ai",
                        module: AI_MOD0,
                        section: AI_SECTION_MOD0,
                        topic: AI_TOPIC.workflow,
                        difficulty: "easy",
                        n: 5,
                        allowReveal: true,
                    },
                },
            ],
        },

        {
            id: "ai_format",
            label: "0.1.3 — Asking for format",
            minutes: 7,
            summary: "Bullets/steps/tables on demand.",
            cards: [
                {
                    type: "sketch",
                    id: "ai0_s3",
                    title: "Format examples (quick read)",
                    sketchId: "ai.format",
                    height: 520,
                },
                {
                    type: "quiz",
                    id: "ai0_q3",
                    title: "Quick check",
                    spec: {
                        subject: "ai",
                        module: AI_MOD0,
                        section: AI_SECTION_MOD0,
                        topic: AI_TOPIC.asking_format,
                        difficulty: "easy",
                        n: 4,
                        allowReveal: true,
                    },
                },
            ],
        },

        // -------------------- 0.2 --------------------
        {
            id: "ai_dont_paste",
            label: "0.2.1 — What not to paste (PII/PHI/secrets)",
            minutes: 8,
            summary: "Avoid sensitive info: IDs, passwords, medical details, private customer data.",
            cards: [
                {
                    type: "sketch",
                    id: "ai0_s4",
                    title: "Safety examples (paste / redact / never)",
                    sketchId: "ai.safety",
                    height: 620,
                },
                {
                    type: "quiz",
                    id: "ai0_q4",
                    title: "Quick check",
                    spec: {
                        subject: "ai",
                        module: AI_MOD0,
                        section: AI_SECTION_MOD0,
                        topic: AI_TOPIC.dont_paste,
                        difficulty: "easy",
                        n: 5,
                        allowReveal: true,
                    },
                },
            ],
        },

        {
            id: "ai_redaction",
            label: "0.2.2 — Redaction basics",
            minutes: 6,
            summary: "Replace names with roles; remove IDs; keep only what’s needed.",
            cards: [
                {
                    type: "sketch",
                    id: "ai0_s5",
                    title: "Redaction examples (quick read)",
                    sketchId: "ai.redaction",
                    height: 560,
                },
                {
                    type: "quiz",
                    id: "ai0_q5",
                    title: "Quick check",
                    spec: {
                        subject: "ai",
                        module: AI_MOD0,
                        section: AI_SECTION_MOD0,
                        topic: AI_TOPIC.redaction,
                        difficulty: "easy",
                        n: 4,
                        allowReveal: true,
                    },
                },
            ],
        },

        {
            id: "ai_data_controls",
            label: "0.2.3 — Data Controls",
            minutes: 6,
            summary: "Where to find them and what they affect.",
            cards: [
                {
                    type: "sketch",
                    id: "ai0_s6",
                    title: "Data Controls (what + where to find it)",
                    sketchId: "ai.datacontrols",
                    height: 520,
                },
                {
                    type: "quiz",
                    id: "ai0_q6",
                    title: "Quick check",
                    spec: {
                        subject: "ai",
                        module: AI_MOD0,
                        section: AI_SECTION_MOD0,
                        topic: AI_TOPIC.data_controls,
                        difficulty: "easy",
                        n: 4,
                        allowReveal: true,
                    },
                },
            ],
        },

        // -------------------- 0.3 LAB --------------------
        {
            id: "ai_lab",
            label: "0.3 — ChatGPT Lab: First Interaction",
            minutes: 8,
            summary: "Run your first prompt, then submit your results.",
            cards: [
                {
                    type: "sketch",
                    id: "ai0_lab",
                    title: "First lab (copy prompt + submit)",
                    sketchId: "ai.lab",
                    height: 620,
                },
            ],
        },
    ],
};
