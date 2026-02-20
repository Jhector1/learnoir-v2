// src/lib/practice/generator/engines/python/python_part1_mod0/topics/programming.ts
import type { SingleChoiceExercise } from "../../../../../types";
import type { Handler } from "../../python_shared/_shared";

export const M0_PROGRAMMING_VALID_KEYS = [
    "m0_prog_language_definition",
    "m0_prog_python_is_language",
    "m0_prog_instructions_precise",
] as const;

export const M0_PROGRAMMING_HANDLERS: Record<(typeof M0_PROGRAMMING_VALID_KEYS)[number], Handler> = {
    m0_prog_language_definition: ({ diff, id, topic }) => {
        const exercise: SingleChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "single_choice",
            title: "Programming language",
            prompt: "A **programming language** is best described as:",
            options: [
                { id: "a", text: "A way to communicate instructions to a computer" },
                { id: "b", text: "A type of internet browser" },
                { id: "c", text: "A folder on your desktop" },
            ],
            hint: "We use programming languages to give computers instructions.",
        };
        return { archetype: "m0_prog_language_definition", exercise, expected: { kind: "single_choice", optionId: "a" } };
    },

    m0_prog_python_is_language: ({ diff, id, topic }) => {
        const exercise: SingleChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "single_choice",
            title: "Python",
            prompt: "Python is a:",
            options: [
                { id: "a", text: "Programming language" },
                { id: "b", text: "Computer brand" },
                { id: "c", text: "Keyboard shortcut" },
            ],
            hint: "Python is a language used to write programs.",
        };
        return { archetype: "m0_prog_python_is_language", exercise, expected: { kind: "single_choice", optionId: "a" } };
    },

    m0_prog_instructions_precise: ({ diff, id, topic }) => {
        const exercise: SingleChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "single_choice",
            title: "Precision",
            prompt: "Computers usually need instructions that are:",
            options: [
                { id: "a", text: "Vague so they can guess what you mean" },
                { id: "b", text: "Clear and precise (step-by-step)" },
                { id: "c", text: "Written only in emojis" },
            ],
            hint: "Computers follow exact instructions.",
        };
        return { archetype: "m0_prog_instructions_precise", exercise, expected: { kind: "single_choice", optionId: "b" } };
    },
};
