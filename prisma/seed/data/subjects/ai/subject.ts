import { defineSubject } from "../_builder";
import { AI_SUBJECT_SLUG } from "./constants";
import { AI_MODULES } from "./modules";
import { AI_SECTIONS } from "./sections";

export const AI_SUBJECT = defineSubject({
    subject: {
        slug: AI_SUBJECT_SLUG,
        order: 5,
        title: "AI Literacy",
        description: "Beginner-friendly AI and ChatGPT fundamentals with safe-use habits.",
    },
    modules: AI_MODULES,
    topicGroups: AI_SECTIONS,
});

export const AI_TOPIC = AI_SUBJECT.TOPIC;
