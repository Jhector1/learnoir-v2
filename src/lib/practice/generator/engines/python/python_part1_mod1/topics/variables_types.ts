// src/lib/practice/generator/engines/python/python_part1_mod1/topics/variables_types.ts
import type { SingleChoiceExercise, CodeInputExercise } from "../../../../../types";
import {defineTopic, Handler, makeSingleChoiceOut, TopicBundle} from "@/lib/practice/generator/engines/utils";
import {  makeCodeExpected, pickName, safeInt } from "../../_shared";

/**
 * ✅ QUIZ-ONLY pool (purpose: "quiz")
 * If you later want “projects”, add purpose:"project" items too,
 * but quiz practice will only pick the quiz ones.
 */
export const M1_VARIABLES_POOL = [
    { key: "m1_vars_what_is_variable_sc", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "m1_vars_assignment_operator_sc", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "m1_vars_type_guessing_sc", w: 1, kind: "single_choice", purpose: "quiz" },

    // optional: code_input but still “quiz” (short check, not a “project”)
    { key: "m1_vars_swap_values_code", w: 1, kind: "code_input", purpose: "project" },
] as const;

export type M1VariablesKey = (typeof M1_VARIABLES_POOL)[number]["key"];

export const M1_VARIABLES_TYPES_HANDLERS: Record<M1VariablesKey, Handler> = {
    m1_vars_what_is_variable_sc: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "m1_vars_what_is_variable_sc",
            id,
            topic,
            diff,
            title: "Variables = labeled boxes",
            prompt: "In Python, a variable is best described as:",
            options: [
                { id: "a", text: "A place to store a value (with a name)" },
                { id: "b", text: "A special kind of comment" },
                { id: "c", text: "A function that prints text" },
            ],
            answerOptionId: "a",
            hint: "A variable holds a value so you can reuse it later by name.",
        }),

    m1_vars_assignment_operator_sc: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "m1_vars_assignment_operator_sc",
            id,
            topic,
            diff,
            title: "Assignment uses =",
            prompt: "Which line correctly assigns the number 5 to a variable named `x`?",
            options: [
                { id: "a", text: "`x == 5`" },
                { id: "b", text: "`x = 5`" },
                { id: "c", text: "`5 = x`" },
            ],
            answerOptionId: "b",
            hint: "`=` assigns. `==` compares.",
        }),

    m1_vars_type_guessing_sc: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "m1_vars_type_guessing_sc",
            id,
            topic,
            diff,
            title: "Types: str vs int",
            prompt: "Which value is a **string** in Python?",
            options: [
                { id: "a", text: "`42`" },
                { id: "b", text: "`\"42\"`" },
                { id: "c", text: "`3.14`" },
            ],
            answerOptionId: "b",
            hint: "Quotes make it a string.",
        }),

    m1_vars_swap_values_code: ({ rng, diff, id, topic }) => {
        const a1 = safeInt(rng, 1, 9);
        const b1 = safeInt(rng, 1, 9);
        const a2 = safeInt(rng, 10, 99);
        const b2 = safeInt(rng, 10, 99);

        const exercise: CodeInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "code_input",
            title: "Swap two values",
            prompt: String.raw`
Read **TWO integers** (a then b).

Swap them, then print:
1) the new a
2) the new b

~~~terminal
$ input
2
9

$ output
9
2
~~~
`.trim(),
            language: "python",
            starterCode: String.raw`a = int(input())
b = int(input())
# TODO: swap a and b
# TODO: print a then b
`,
            hint: "Python swap: a, b = b, a",
        };

        const expected = makeCodeExpected({
            language: "python",
            tests: [
                { stdin: `${a1}\n${b1}\n`, stdout: `${b1}\n${a1}\n`, match: "exact" },
                { stdin: `${a2}\n${b2}\n`, stdout: `${b2}\n${a2}\n`, match: "exact" },
            ],
            solutionCode: `a = int(input())\nb = int(input())\na, b = b, a\nprint(a)\nprint(b)\n`,
        });

        return { archetype: "m1_vars_swap_values_code", exercise, expected };
    },
};

/**
 * ✅ Export bundle for module handler
 */
export const M1_VARIABLES_TOPIC: TopicBundle = defineTopic(
    "variables_types_intro",
    M1_VARIABLES_POOL as any,
    M1_VARIABLES_TYPES_HANDLERS as any,
);