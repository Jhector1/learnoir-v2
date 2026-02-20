// src/lib/practice/generator/engines/python/python_part1_mod1/topics/variables_types.ts
import type { SingleChoiceExercise } from "../../../../../types";
import type { Handler } from "../../python_shared/_shared";
import { pickSnakeCandidate } from "../../python_shared/_shared";

export const M1_VARIABLES_TYPES_VALID_KEYS = [
    "m1_vars_assignment_direction",
    "m1_vars_input_is_string",
    "m1_vars_snake_case",
] as const;

export const M1_VARIABLES_TYPES_HANDLERS: Record<(typeof M1_VARIABLES_TYPES_VALID_KEYS)[number], Handler> = {
    m1_vars_assignment_direction: ({ diff, id, topic }) => {
        const exercise: SingleChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "single_choice",
            title: "Assignment stores a value",
            prompt: "After this runs, what is the value of **x**?\n\n~~~python\nx = 7\n~~~",
            options: [
                { id: "a", text: "7" },
                { id: "b", text: "x" },
                { id: "c", text: "print(x)" },
            ],
            hint: "Assignment stores the value on the right into the variable on the left.",
        };
        return { archetype: "m1_vars_assignment_direction", exercise, expected: { kind: "single_choice", optionId: "a" } };
    },

    m1_vars_input_is_string: ({ diff, id, topic }) => {
        const exercise: SingleChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "single_choice",
            title: "input() type",
            prompt: "What type does `input()` return in Python?",
            options: [
                { id: "a", text: "int" },
                { id: "b", text: "float" },
                { id: "c", text: "str" },
            ],
            hint: "input() always returns a string (str).",
        };
        return { archetype: "m1_vars_input_is_string", exercise, expected: { kind: "single_choice", optionId: "c" } };
    },

    m1_vars_snake_case: ({ rng, diff, id, topic }) => {
        const good = pickSnakeCandidate(rng);
        const exercise: SingleChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "single_choice",
            title: "snake_case",
            prompt: "Which variable name follows **snake_case** style?",
            options: [
                { id: "a", text: "TotalScore" },
                { id: "b", text: good },
                { id: "c", text: "total-score" },
            ],
            hint: "snake_case uses lowercase letters and underscores.",
        };
        return { archetype: "m1_vars_snake_case", exercise, expected: { kind: "single_choice", optionId: "b" } };
    },
};
