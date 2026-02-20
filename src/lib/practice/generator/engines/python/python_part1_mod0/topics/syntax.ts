// src/lib/practice/generator/engines/python/python_part1_mod0/topics/syntax.ts
import type { SingleChoiceExercise } from "../../../../../types";
import type { Handler } from "../../python_shared/_shared";

export const M0_SYNTAX_VALID_KEYS = [
    "m0_syntax_definition",
    "m0_syntax_syntaxerror",
    "m0_syntax_indentation_rule",
] as const;

export const M0_SYNTAX_HANDLERS: Record<(typeof M0_SYNTAX_VALID_KEYS)[number], Handler> = {
    m0_syntax_definition: ({ diff, id, topic }) => {
        const exercise: SingleChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "single_choice",
            title: "Syntax meaning",
            prompt: "In programming, what does **syntax** mean?",
            options: [
                { id: "a", text: "The rules for how code must be written" },
                { id: "b", text: "The speed of your computer fan" },
                { id: "c", text: "A type of keyboard" },
            ],
            hint: "Syntax = writing rules the language requires.",
        };
        return { archetype: "m0_syntax_definition", exercise, expected: { kind: "single_choice", optionId: "a" } };
    },

    m0_syntax_syntaxerror: ({ diff, id, topic }) => {
        const exercise: SingleChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "single_choice",
            title: "SyntaxError",
            prompt: "If you break Python’s syntax rules, you often get:",
            options: [
                { id: "a", text: "SyntaxError" },
                { id: "b", text: "WiFiError" },
                { id: "c", text: "KeyboardError" },
            ],
            hint: "SyntaxError means Python couldn’t understand your code structure.",
        };
        return { archetype: "m0_syntax_syntaxerror", exercise, expected: { kind: "single_choice", optionId: "a" } };
    },

    m0_syntax_indentation_rule: ({ diff, id, topic }) => {
        const exercise: SingleChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "single_choice",
            title: "Indentation matters",
            prompt: "Why is indentation important in Python?",
            options: [
                { id: "a", text: "It makes the code run faster" },
                { id: "b", text: "Python uses it as part of its syntax (structure)" },
                { id: "c", text: "It changes your font size" },
            ],
            hint: "Indentation is part of Python’s structure, not just style.",
        };
        return { archetype: "m0_syntax_indentation_rule", exercise, expected: { kind: "single_choice", optionId: "b" } };
    },
};
