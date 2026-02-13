// prisma/seed/data/subjects/ai/modules.ts
import type { ModuleSeed } from "../_types";
import { AI_MOD0, AI_SUBJECT_SLUG } from "./constants";

export const AI_MODULES = [
    {
        slug: AI_MOD0,
        subjectSlug: AI_SUBJECT_SLUG,
        order: 0,
        title: "AI 0 — Foundations",
        description:
            "What AI is (and isn’t), how to ask good questions, check answers, and stay safe with privacy.",
        weekStart: 0,
        weekEnd: 2,
    },
] satisfies ModuleSeed[];
