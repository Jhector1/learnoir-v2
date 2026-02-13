// prisma/seed/data/subjects/ai/subject.ts
import { defineSubject } from "../_builder";
import { AI_SUBJECT_SLUG } from "./constants";
import { AI_MODULES } from "./modules";
import { AI_SECTIONS } from "./sections";

export const AI_SUBJECT = defineSubject({
    subject: {
        slug: AI_SUBJECT_SLUG,
        order: 25,
        title: "AI",
        description: "Beginner-friendly AI practice: prompts, safety, and checking answers.",
    },
    modules: AI_MODULES,
    topicGroups: AI_SECTIONS,
});

export const AI_TOPIC = AI_SUBJECT.TOPIC;
