// src/lib/practice/generator/engines/python/python_part1_mod1/topics/variables.ts
import type { CodeInputExercise } from "../../../../../types";
import {defineTopic, Handler, makeSingleChoiceOut, TopicBundle} from "@/lib/practice/generator/engines/utils";
import { makeCodeExpected, pickName, safeInt } from "../../_shared";

/**
 * Module 1 — Variables (only)
 * Goal: strong mental model + real-world stories.
 * Mix: single_choice + code_input.
 */
export const M1_VARS_POOL = [
    // Single choice (quiz)
    { key: "m1_vars_what_is_variable_sc", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "m1_vars_assignment_operator_sc", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "m1_vars_valid_name_sc", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "m1_vars_update_value_sc", w: 1, kind: "single_choice", purpose: "quiz" },

    // Code input (project / short practice)
    { key: "m1_vars_boxes_print_code", w: 1, kind: "code_input", purpose: "project" },
    { key: "m1_vars_swap_values_code", w: 1, kind: "code_input", purpose: "project" },
    { key: "m1_vars_running_total_code", w: 1, kind: "code_input", purpose: "project" },
] as const;

export type M1VarsKey = (typeof M1_VARS_POOL)[number]["key"];

export const M1_VARS_HANDLERS: Record<M1VarsKey, Handler> = {
    /* ------------------------------ single choice ------------------------------ */

    m1_vars_what_is_variable_sc: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "m1_vars_what_is_variable_sc",
            id,
            topic,
            diff,
            title: "Variables = labeled boxes",
            prompt: "In Python, a variable is best described as:",
            options: [
                { id: "a", text: "A name that points to a value so you can reuse it" },
                { id: "b", text: "A special kind of comment" },
                { id: "c", text: "A function that prints text" },
            ],
            answerOptionId: "a",
            hint: "A variable lets you store a value under a name and reuse it later.",
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

    m1_vars_valid_name_sc: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "m1_vars_valid_name_sc",
            id,
            topic,
            diff,
            title: "Valid variable names",
            prompt: "Which variable name is valid in Python?",
            options: [
                { id: "a", text: "`2cool`" },
                { id: "b", text: "`student name`" },
                { id: "c", text: "`student_name`" },
            ],
            answerOptionId: "c",
            hint: "Use letters/numbers/underscore, and don’t start with a number.",
        }),

    m1_vars_update_value_sc: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "m1_vars_update_value_sc",
            id,
            topic,
            diff,
            title: "Updating a variable",
            prompt: String.raw`
A game starts with \`score = 10\`.
Then the player earns 5 points.

Which line correctly updates \`score\`?
`.trim(),
            options: [
                { id: "a", text: "`score = score + 5`" },
                { id: "b", text: "`score + 5`" },
                { id: "c", text: "`score == score + 5`" },
            ],
            answerOptionId: "a",
            hint: "You must assign the new value back into the variable.",
        }),

    /* -------------------------------- code input -------------------------------- */

    m1_vars_boxes_print_code: ({ rng, diff, id, topic }) => {
        const name1 = pickName(rng);
        const age1 = safeInt(rng, 10, 40);
        const name2 = pickName(rng);
        const age2 = safeInt(rng, 10, 40);

        const exercise: CodeInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "code_input",
            title: "Store inputs in variables and print cleanly",
            prompt: String.raw`
A teacher is collecting student info.

Read TWO inputs:
1) name
2) age

Store them in variables, then print EXACTLY:

name = <name>
age = <age>

Example:

~~~terminal
$ input
Maya
16

$ output
name = Maya
age = 16
~~~
`.trim(),
            language: "python",
            starterCode: String.raw`# Read inputs
# TODO

# Print exactly:
# name = <name>
# age = <age>
`,
            hint: "Use input() twice. Convert age with int(...) if you want, but printing a string age is OK if it matches.",
        };

        const expected = makeCodeExpected({
            language: "python",
            tests: [
                { stdin: `${name1}\n${age1}\n`, stdout: `name = ${name1}\nage = ${age1}\n`, match: "exact" },
                { stdin: `${name2}\n${age2}\n`, stdout: `name = ${name2}\nage = ${age2}\n`, match: "exact" },
            ],
            solutionCode:
                `name = input()\n` +
                `age = input()\n` +
                `print(f"name = {name}")\n` +
                `print(f"age = {age}")\n`,
        });

        return { archetype: "m1_vars_boxes_print_code", exercise, expected };
    },

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
A cashier accidentally typed the two quantities in the wrong order.

Read TWO integers (a then b).
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

    m1_vars_running_total_code: ({ rng, diff, id, topic }) => {
        // Story: daily steps; compute total steps across 3 days.
        const d1 = safeInt(rng, 1000, 12000);
        const d2 = safeInt(rng, 1000, 12000);
        const d3 = safeInt(rng, 1000, 12000);

        const e1 = safeInt(rng, 1000, 12000);
        const e2 = safeInt(rng, 1000, 12000);
        const e3 = safeInt(rng, 1000, 12000);

        const exercise: CodeInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "code_input",
            title: "Running total (3 days of steps)",
            prompt: String.raw`
A fitness app tracks your steps for 3 days.

Read THREE integers:
day1
day2
day3

Compute total = day1 + day2 + day3

Print EXACTLY:
Total = <total>

~~~terminal
$ input
3000
2500
4000

$ output
Total = 9500
~~~
`.trim(),
            language: "python",
            starterCode: String.raw`day1 = int(input())
day2 = int(input())
day3 = int(input())
# TODO
`,
            hint: "total = day1 + day2 + day3",
        };

        const expected = makeCodeExpected({
            language: "python",
            tests: [
                { stdin: `${d1}\n${d2}\n${d3}\n`, stdout: `Total = ${d1 + d2 + d3}\n`, match: "exact" },
                { stdin: `${e1}\n${e2}\n${e3}\n`, stdout: `Total = ${e1 + e2 + e3}\n`, match: "exact" },
            ],
            solutionCode:
                `day1 = int(input())\n` +
                `day2 = int(input())\n` +
                `day3 = int(input())\n` +
                `total = day1 + day2 + day3\n` +
                `print(f"Total = {total}")\n`,
        });

        return { archetype: "m1_vars_running_total_code", exercise, expected };
    },
};
export const M1_VARS_TOPIC: TopicBundle = defineTopic(
    "variables_intro",
    M1_VARS_POOL as any,
    M1_VARS_HANDLERS as any,
);