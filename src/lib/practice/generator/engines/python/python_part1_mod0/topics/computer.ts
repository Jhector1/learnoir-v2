// src/lib/practice/generator/engines/python/python_part1_mod0/topics/computer.ts
import type { SingleChoiceExercise } from "../../../../../types";
import type { Handler } from "../../python_shared/_shared";

export const M0_COMPUTER_VALID_KEYS = [
    "m0_computer_ipo_order",
    "m0_computer_algorithm_definition",
    "m0_computer_input_examples",
] as const;

export const M0_COMPUTER_HANDLERS: Record<(typeof M0_COMPUTER_VALID_KEYS)[number], Handler> = {
    m0_computer_ipo_order: ({ diff, id, topic }) => {
        const exercise: SingleChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "single_choice",
            title: "IPO model",
            prompt: "Which order matches the basic computer cycle?",
            options: [
                { id: "a", text: "Output → Input → Processing" },
                { id: "b", text: "Input → Processing → Output" },
                { id: "c", text: "Processing → Output → Input" },
            ],
            hint: "First you give input, then it’s processed, then you see output.",
        };
        return { archetype: "m0_computer_ipo_order", exercise, expected: { kind: "single_choice", optionId: "b" } };
    },

    m0_computer_algorithm_definition: ({ diff, id, topic }) => {
        const exercise: SingleChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "single_choice",
            title: "Algorithm",
            prompt: "An **algorithm** is:",
            options: [
                { id: "a", text: "A step-by-step set of instructions to solve a task" },
                { id: "b", text: "A type of monitor" },
                { id: "c", text: "A programming mistake" },
            ],
            hint: "Algorithm = steps to complete a task.",
        };
        return { archetype: "m0_computer_algorithm_definition", exercise, expected: { kind: "single_choice", optionId: "a" } };
    },

    m0_computer_input_examples: ({ diff, id, topic }) => {
        const exercise: SingleChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "single_choice",
            title: "Input examples",
            prompt: "Which is an example of **input** to a computer?",
            options: [
                { id: "a", text: "Typing on a keyboard" },
                { id: "b", text: "Text showing on your screen" },
                { id: "c", text: "Sound coming out of speakers" },
            ],
            hint: "Input = what you give the computer (keyboard, mouse, mic).",
        };
        return { archetype: "m0_computer_input_examples", exercise, expected: { kind: "single_choice", optionId: "a" } };
    },
};
