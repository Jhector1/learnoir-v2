// src/lib/practice/generator/engines/python/python_part1_mod1/topics/types.ts
import type { CodeInputExercise } from "../../../../../types";
import {defineTopic, Handler, makeSingleChoiceOut, TopicBundle} from "@/lib/practice/generator/engines/utils";
import { makeCodeExpected, pickName, safeInt } from "../../_shared";

/**
 * Module 1 — Types + Conversion (only)
 * Mix: single_choice + code_input, real-world prompts.
 */
export const M1_TYPES_POOL = [
    // Single choice (quiz)
    { key: "m1_types_string_vs_int_sc", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "m1_types_int_vs_float_sc", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "m1_types_bool_sc", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "m1_types_none_sc", w: 1, kind: "single_choice", purpose: "quiz" },

    // Code input (project)
    { key: "m1_types_convert_next_year_code", w: 1, kind: "code_input", purpose: "project" },
    { key: "m1_types_tip_total_code", w: 1, kind: "code_input", purpose: "project" },
    { key: "m1_types_c_to_f_code", w: 1, kind: "code_input", purpose: "project" },
] as const;

export type M1TypesKey = (typeof M1_TYPES_POOL)[number]["key"];

export const M1_TYPES_HANDLERS: Record<M1TypesKey, Handler> = {
    /* ------------------------------ single choice ------------------------------ */

    m1_types_string_vs_int_sc: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "m1_types_string_vs_int_sc",
            id,
            topic,
            diff,
            title: "Quotes change the type",
            prompt: "Which value is a string (`str`) in Python?",
            options: [
                { id: "a", text: "`42`" },
                { id: "b", text: "`\"42\"`" },
                { id: "c", text: "`3.14`" },
            ],
            answerOptionId: "b",
            hint: "Quotes make it text (a string).",
        }),

    m1_types_int_vs_float_sc: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "m1_types_int_vs_float_sc",
            id,
            topic,
            diff,
            title: "int vs float",
            prompt: "Which value is a float (`float`)?",
            options: [
                { id: "a", text: "`7`" },
                { id: "b", text: "`7.0`" },
                { id: "c", text: "`\"7.0\"`" },
            ],
            answerOptionId: "b",
            hint: "Decimals are floats (unless they’re quoted).",
        }),

    m1_types_bool_sc: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "m1_types_bool_sc",
            id,
            topic,
            diff,
            title: "Booleans are True/False",
            prompt: "Which value is a boolean (`bool`)?",
            options: [
                { id: "a", text: "`True`" },
                { id: "b", text: "`\"True\"`" },
                { id: "c", text: "`1.0`" },
            ],
            answerOptionId: "a",
            hint: "Booleans are the keywords True or False (without quotes).",
        }),

    m1_types_none_sc: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "m1_types_none_sc",
            id,
            topic,
            diff,
            title: "None means “no value yet”",
            prompt: "Which value represents “no value yet” in Python?",
            options: [
                { id: "a", text: "`0`" },
                { id: "b", text: "`\"\"` (empty string)" },
                { id: "c", text: "`None`" },
            ],
            answerOptionId: "c",
            hint: "None is its own special value.",
        }),

    /* -------------------------------- code input -------------------------------- */

    m1_types_convert_next_year_code: ({ rng, diff, id, topic }) => {
        const name1 = pickName(rng);
        const age1 = safeInt(rng, 10, 40);
        const name2 = pickName(rng);
        const age2 = safeInt(rng, 10, 40);

        const exercise: CodeInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "code_input",
            title: "Convert age to int and compute next year",
            prompt: String.raw`
A signup form collects:
1) name
2) age

Read TWO inputs:
- name (text)
- age (text, but it represents a number)

Convert age to an integer, then print EXACTLY:
Hi <name>! Next year you'll be <age+1>.

~~~terminal
$ input
Maya
16

$ output
Hi Maya! Next year you'll be 17.
~~~
`.trim(),
            language: "python",
            starterCode: String.raw`name = input()
age = input()
# TODO: convert age
# TODO: print message
`,
            hint: "age = int(age)",
        };

        const expected = makeCodeExpected({
            language: "python",
            tests: [
                { stdin: `${name1}\n${age1}\n`, stdout: `Hi ${name1}! Next year you'll be ${age1 + 1}.\n`, match: "exact" },
                { stdin: `${name2}\n${age2}\n`, stdout: `Hi ${name2}! Next year you'll be ${age2 + 1}.\n`, match: "exact" },
            ],
            solutionCode:
                `name = input()\n` +
                `age = int(input())\n` +
                `print(f"Hi {name}! Next year you'll be {age + 1}.")\n`,
        });

        return { archetype: "m1_types_convert_next_year_code", exercise, expected };
    },

    m1_types_tip_total_code: ({ rng, diff, id, topic }) => {
        const bill1 = safeInt(rng, 10, 80);
        const pct1 = safeInt(rng, 10, 25);
        const tip1 = Math.floor((bill1 * pct1) / 100);
        const total1 = bill1 + tip1;

        const bill2 = safeInt(rng, 10, 80);
        const pct2 = safeInt(rng, 10, 25);
        const tip2 = Math.floor((bill2 * pct2) / 100);
        const total2 = bill2 + tip2;

        const exercise: CodeInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "code_input",
            title: "Restaurant tip + total (ints)",
            prompt: String.raw`
A restaurant app asks for:
1) bill (integer)
2) tip percent (integer)

Compute:
tip = bill * pct // 100
total = bill + tip

Print EXACTLY:
Tip = <tip>
Total = <total>

~~~terminal
$ input
50
20

$ output
Tip = 10
Total = 60
~~~
`.trim(),
            language: "python",
            starterCode: String.raw`bill = int(input())
pct = int(input())
# TODO
`,
            hint: "Use integer math: // 100",
        };

        const expected = makeCodeExpected({
            language: "python",
            tests: [
                { stdin: `${bill1}\n${pct1}\n`, stdout: `Tip = ${tip1}\nTotal = ${total1}\n`, match: "exact" },
                { stdin: `${bill2}\n${pct2}\n`, stdout: `Tip = ${tip2}\nTotal = ${total2}\n`, match: "exact" },
            ],
            solutionCode:
                `bill = int(input())\n` +
                `pct = int(input())\n` +
                `tip = bill * pct // 100\n` +
                `total = bill + tip\n` +
                `print(f"Tip = {tip}")\n` +
                `print(f"Total = {total}")\n`,
        });

        return { archetype: "m1_types_tip_total_code", exercise, expected };
    },

    m1_types_c_to_f_code: ({ rng, diff, id, topic }) => {
        const c1 = safeInt(rng, -10, 40);
        const f1 = Math.floor((c1 * 9) / 5 + 32);

        const c2 = safeInt(rng, -10, 40);
        const f2 = Math.floor((c2 * 9) / 5 + 32);

        const exercise: CodeInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "code_input",
            title: "Celsius → Fahrenheit",
            prompt: String.raw`
A weather station gives Celsius as an integer C.

Read ONE integer C.
Compute:
F = C * 9/5 + 32

Print ONLY F.

~~~terminal
$ input
0

$ output
32
~~~
`.trim(),
            language: "python",
            starterCode: String.raw`c = int(input())
# TODO
`,
            hint: "f = int(c * 9 / 5 + 32)",
        };

        const expected = makeCodeExpected({
            language: "python",
            tests: [
                { stdin: `${c1}\n`, stdout: `${f1}\n`, match: "exact" },
                { stdin: `${c2}\n`, stdout: `${f2}\n`, match: "exact" },
            ],
            solutionCode: `c = int(input())\nf = int(c * 9 / 5 + 32)\nprint(f)\n`,
        });

        return { archetype: "m1_types_c_to_f_code", exercise, expected };
    },
};
export const M1_TYPES_TOPIC: TopicBundle = defineTopic(
    "data_types_intro",
    M1_TYPES_POOL as any,
    M1_TYPES_HANDLERS as any,
);