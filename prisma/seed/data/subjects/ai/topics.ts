// prisma/seed/data/subjects/ai/topics.ts
import { PracticeKind } from "@prisma/client";
import type { TopicDefCompat } from "../_types";
import { AI_MOD0 } from "./constants";

export const AI_TOPICS = {
    [AI_MOD0]: [
        {
            id: "ai_basics",
            meta: {
                label: "AI basics: what it is (and isn’t)",
                minutes: 10,
                pool: [
                    { key: "ai0_what_is_ai_mcq", w: 5, kind: PracticeKind.single_choice },
                    { key: "ai0_best_for_mcq", w: 4, kind: PracticeKind.single_choice },
                    { key: "ai0_always_correct_mcq", w: 4, kind: PracticeKind.single_choice },
                ],
            },
        },

        {
            id: "clear_prompts",
            meta: {
                label: "Clear prompts: goal, context, constraints",
                minutes: 12,
                pool: [
                    { key: "ai0_best_prompt_mcq", w: 5, kind: PracticeKind.single_choice },
                    { key: "ai0_prompt_recipe_drag", w: 4, kind: PracticeKind.drag_reorder },
                    { key: "ai0_followup_mcq", w: 4, kind: PracticeKind.single_choice },
                ],
            },
        },

        {
            id: "accuracy_checking",
            meta: {
                label: "Checking answers: verify important facts",
                minutes: 12,
                pool: [
                    { key: "ai0_verify_text", w: 5, kind: PracticeKind.text_input },
                    { key: "ai0_making_up_mcq", w: 4, kind: PracticeKind.single_choice },
                    { key: "ai0_always_correct_mcq", w: 3, kind: PracticeKind.single_choice },
                ],
            },
        },

        {
            id: "privacy_safety",
            meta: {
                label: "Privacy & safety: what not to share",
                minutes: 10,
                pool: [
                    { key: "ai0_privacy_mcq", w: 5, kind: PracticeKind.single_choice },
                    { key: "ai0_yes_no_private_text", w: 4, kind: PracticeKind.text_input },
                ],
            },
        },

        {
            id: "simple_workflow",
            meta: {
                label: "Simple workflow: ask → read → check → improve",
                minutes: 10,
                pool: [
                    { key: "ai0_workflow_drag", w: 5, kind: PracticeKind.drag_reorder },
                    { key: "ai0_followup_mcq", w: 4, kind: PracticeKind.single_choice },
                    { key: "ai0_best_for_mcq", w: 2, kind: PracticeKind.single_choice },
                ],
            },
        },

        {
            id: "foundations",
            variant: null, // ✅ mixed
            meta: {
                label: "AI foundations (mixed)",
                minutes: 0,
                pool: [
                    { key: "ai0_what_is_ai_mcq", w: 2, kind: PracticeKind.single_choice },
                    { key: "ai0_best_prompt_mcq", w: 2, kind: PracticeKind.single_choice },
                    { key: "ai0_verify_text", w: 2, kind: PracticeKind.text_input },
                    { key: "ai0_privacy_mcq", w: 2, kind: PracticeKind.single_choice },
                    { key: "ai0_prompt_recipe_drag", w: 1, kind: PracticeKind.drag_reorder },
                    { key: "ai0_workflow_drag", w: 1, kind: PracticeKind.drag_reorder },
                    { key: "ai0_making_up_mcq", w: 1, kind: PracticeKind.single_choice },
                ],
            },
        },
    ],
} satisfies Record<string, TopicDefCompat[]>;
