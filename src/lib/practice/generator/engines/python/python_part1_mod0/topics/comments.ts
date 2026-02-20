// src/lib/practice/generator/engines/python/python_part1_mod0/topics/comments.ts
import type { SingleChoiceExercise } from "../../../../../types";
import type { Handler } from "../../python_shared/_shared";

export const M0_COMMENTS_VALID_KEYS = [
    "m0_comments_symbol",
    "m0_comments_ignored_by_python",
    "m0_comments_best_reason",
] as const;

export const M0_COMMENTS_HANDLERS: Record<(typeof M0_COMMENTS_VALID_KEYS)[number], Handler> = {
    m0_comments_symbol: ({ diff, id, topic }) => {
        const exercise: SingleChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "single_choice",
            title: "Comment symbol",
            prompt: "Which symbol starts a single-line comment in Python?",
            options: [
                { id: "a", text: "//" },
                { id: "b", text: "#" },
                { id: "c", text: "/* */" },
            ],
            hint: "Python uses # for single-line comments.",
        };
        return { archetype: "m0_comments_symbol", exercise, expected: { kind: "single_choice", optionId: "b" } };
    },

    m0_comments_ignored_by_python: ({ diff, id, topic }) => {
        const exercise: SingleChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "single_choice",
            title: "Python ignores comments",
            prompt: "Comments are mainly for:",
            options: [
                { id: "a", text: "Humans reading the code" },
                { id: "b", text: "Making Python run faster" },
                { id: "c", text: "Changing the output automatically" },
            ],
            hint: "Python ignores comments; they help humans.",
        };
        return { archetype: "m0_comments_ignored_by_python", exercise, expected: { kind: "single_choice", optionId: "a" } };
    },

    m0_comments_best_reason: ({ diff, id, topic }) => {
        const exercise: SingleChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "single_choice",
            title: "Best comments",
            prompt: "Which is the best reason to write a comment?",
            options: [
                { id: "a", text: "To repeat exactly what the code already says" },
                { id: "b", text: "To explain intent or a tricky step" },
                { id: "c", text: "To make the file longer" },
            ],
            hint: "Good comments explain why / intent.",
        };
        return { archetype: "m0_comments_best_reason", exercise, expected: { kind: "single_choice", optionId: "b" } };
    },
};
