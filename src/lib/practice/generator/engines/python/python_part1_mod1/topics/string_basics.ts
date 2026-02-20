// src/lib/practice/generator/engines/python/python_part1_mod1/topics/string_basics.ts
import type { SingleChoiceExercise } from "../../../../../types";
import type { Handler } from "../../python_shared/_shared";
import { pickWord } from "../../python_shared/_shared";

export const M1_STRINGS_VALID_KEYS = [
    "m1_str_quotes",
    "m1_str_fstring",
    "m1_str_indexing",
] as const;

export const M1_STRINGS_HANDLERS: Record<(typeof M1_STRINGS_VALID_KEYS)[number], Handler> = {
    m1_str_quotes: ({ diff, id, topic }) => {
        const exercise: SingleChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "single_choice",
            title: "String literals",
            prompt: "Which is a valid string literal in Python?",
            options: [
                { id: "a", text: `"hello"` },
                { id: "b", text: `hello` },
                { id: "c", text: `{hello}` },
            ],
            hint: "Strings must be inside quotes.",
        };
        return { archetype: "m1_str_quotes", exercise, expected: { kind: "single_choice", optionId: "a" } };
    },

    m1_str_fstring: ({ rng, diff, id, topic }) => {
        const w = pickWord(rng);
        const exercise: SingleChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "single_choice",
            title: "f-strings",
            prompt: `Which line correctly inserts the value of x into text if \`x = "${w}"\`?`,
            options: [
                { id: "a", text: `print("x is {x}")` },
                { id: "b", text: `print(f"x is {x}")` },
                { id: "c", text: `print("x is " + {x})` },
            ],
            hint: "f-strings need the leading f and use {x}.",
        };
        return { archetype: "m1_str_fstring", exercise, expected: { kind: "single_choice", optionId: "b" } };
    },

    m1_str_indexing: ({ diff, id, topic }) => {
        const exercise: SingleChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "single_choice",
            title: "String indexing",
            prompt: "In Python, string indexing starts at:",
            options: [
                { id: "a", text: "0" },
                { id: "b", text: "1" },
                { id: "c", text: "-1" },
            ],
            hint: "The first character is index 0.",
        };
        return { archetype: "m1_str_indexing", exercise, expected: { kind: "single_choice", optionId: "a" } };
    },
};
