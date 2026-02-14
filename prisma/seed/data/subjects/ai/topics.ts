import { PracticeKind } from "@prisma/client";
import type { TopicDefCompat } from "../_types";
import { AI_MOD0 } from "./constants";

export const AI_TOPICS = {
    [AI_MOD0]: [
        {
            id: "capabilities",
            meta: {
                label: "What ChatGPT is good at (drafting, explaining, organizing)",
                minutes: 10,
                pool: [
                    { key: "ai_capabilities_best_for_mcq", w: 4, kind: PracticeKind.single_choice },
                    { key: "ai_capabilities_examples_multi", w: 3, kind: PracticeKind.multi_choice },
                    { key: "ai_capabilities_limits_mcq", w: 3, kind: PracticeKind.single_choice },
                ],
            },
        },

        {
            id: "workflow",
            meta: {
                label: "Ask → Refine → Finalize workflow",
                minutes: 8,
                pool: [
                    { key: "ai_workflow_order_drag", w: 4 }, // can be drag_reorder exercise
                    { key: "ai_workflow_refine_best_mcq", w: 3, kind: PracticeKind.single_choice },
                    { key: "ai_workflow_finalize_prompt_text", w: 3 },
                ],
            },
        },

        {
            id: "asking_format",
            meta: {
                label: "Asking for format (bullets / steps) at a basic level",
                minutes: 7,
                pool: [
                    { key: "ai_format_choose_mcq", w: 3, kind: PracticeKind.single_choice },
                    { key: "ai_format_bullets_text", w: 4 },
                    { key: "ai_format_steps_text", w: 3 },
                ],
            },
        },

        {
            id: "dont_paste",
            meta: {
                label: "What not to paste (PII / PHI / secrets)",
                minutes: 8,
                pool: [
                    { key: "ai_dontpaste_identify_multi", w: 4, kind: PracticeKind.multi_choice },
                    { key: "ai_dontpaste_scenario_mcq", w: 4, kind: PracticeKind.single_choice },
                    { key: "ai_dontpaste_safe_alt_text", w: 2 },
                ],
            },
        },

        {
            id: "redaction",
            meta: {
                label: "Redaction basics (replace names with roles, remove IDs)",
                minutes: 6,
                pool: [
                    { key: "ai_redaction_replace_text", w: 5 },
                    { key: "ai_redaction_best_practice_mcq", w: 3, kind: PracticeKind.single_choice },
                    { key: "ai_redaction_remove_multi", w: 2, kind: PracticeKind.multi_choice },
                ],
            },
        },

        {
            id: "data_controls",
            meta: {
                label: "Data Controls: what it is and why it matters",
                minutes: 6,
                pool: [
                    { key: "ai_datacontrols_where_mcq", w: 4, kind: PracticeKind.single_choice },
                    { key: "ai_datacontrols_why_mcq", w: 3, kind: PracticeKind.single_choice },
                    { key: "ai_datacontrols_terms_multi", w: 3, kind: PracticeKind.multi_choice },
                ],
            },
        },

        {
            id: "lab_ui",
            meta: {
                label: "Lab (UI): Find Data Controls in settings",
                minutes: 0,
                pool: [{ key: "ai_lab_ui_check_mcq", w: 1, kind: PracticeKind.single_choice }],
            },
        },

        {
            id: "lab_prompt",
            meta: {
                label: `Lab (Prompt): "Explain what you can help me with in 5 bullets..."`,
                minutes: 0,
                pool: [{ key: "ai_lab_prompt_text", w: 1 }],
            },
        },

        {
            id: "lab_submit",
            variant: null,
            meta: {
                label: "Lab (Submit): paste bullets + answers",
                minutes: 0,
                pool: [{ key: "ai_lab_submit_text", w: 1 }],
            },
        },
    ],
} satisfies Record<string, TopicDefCompat[]>;
