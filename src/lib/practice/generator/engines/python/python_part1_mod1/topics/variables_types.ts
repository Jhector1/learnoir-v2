// src/lib/practice/generator/engines/python/python_part1_mod1/topics/variables_types.ts
import type { CodeInputExercise } from "../../../../../types";
import type { Handler } from "../../python_shared/_shared";
import { makeCodeExpected, safeInt, pickName } from "../../python_shared/_shared";
import { makeSingleChoiceOut } from "../../python_shared/_shared";

export const M1_VARIABLES_TYPES_POOL = [
    { key: "m1_vars_boxes_print_code", w: 1, kind: "code_input" },
    { key: "m1_types_convert_next_year_code", w: 1, kind: "code_input" },
    { key: "m1_types_errors_sc", w: 1, kind: "single_choice" },
] as const;

export type M1VarsTypesKey = (typeof M1_VARIABLES_TYPES_POOL)[number]["key"];
export const M1_VARIABLES_TYPES_VALID_KEYS = M1_VARIABLES_TYPES_POOL.map((p) => p.key) as M1VarsTypesKey[];

function pickDifferentInt(rng: any, lo: number, hi: number, avoid: number) {
    let x = safeInt(rng, lo, hi);
    for (let i = 0; i < 6 && x === avoid; i++) x = safeInt(rng, lo, hi);
    return x;
}

export const M1_VARIABLES_TYPES_HANDLERS: Record<M1VarsTypesKey, Handler> = {
    m1_vars_boxes_print_code: ({ rng, diff, id, topic }) => {
        const name = pickName(rng);
        const score = safeInt(rng, 5, 100);

        const exercise: CodeInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "code_input",
            title: "Mini-project: Boxes (variables) + clean print",
            prompt: String.raw`
Create TWO variables:
- name (a string)
- score (an integer)

Set them to:
- name = ${JSON.stringify(name)}
- score = ${score}

Print **EXACTLY two lines**:
name = <name>
score = <score>

~~~terminal
@meta Idle • Accepted • 0.026s • 3MB
$ output
name = ${name}
score = ${score}
~~~
`.trim(),
            language: "python",
            starterCode: String.raw`# TODO: set name
# TODO: set score
# TODO: print two lines exactly
`,
            hint: "Use print with commas or f-strings. Match the output exactly.",
        };

        // ✅ single test is correct here (no input; values are part of the task)
        const expected = makeCodeExpected({
            language: "python",
            tests: [{ stdin: ``, stdout: `name = ${name}\nscore = ${score}\n`, match: "exact" }],
            solutionCode:
                `name = ${JSON.stringify(name)}\n` +
                `score = ${score}\n` +
                `print(f"name = {name}")\n` +
                `print(f"score = {score}")\n`,
        });

        return { archetype: "m1_vars_boxes_print_code", exercise, expected };
    },

    m1_types_convert_next_year_code: ({ rng, diff, id, topic }) => {
        const age1 = safeInt(rng, 10, 70);
        const age2 = pickDifferentInt(rng, 10, 70, age1);

        const exercise: CodeInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "code_input",
            title: "Mini-project: Convert to int + next year",
            prompt: String.raw`
Read **ONE input** (age).

Convert it to an integer.

Print exactly:
Next year: <age + 1>

~~~terminal
@meta Idle • Accepted • 0.026s • 3MB
$ input
16

$ output
Next year: 17
~~~
`.trim(),
            language: "python",
            starterCode: String.raw`# TODO: read age
# TODO: convert to int
# TODO: print Next year: <age+1>
`,
            hint: "age = int(input())",
        };

        const expected = makeCodeExpected({
            language: "python",
            tests: [
                { stdin: `${age1}\n`, stdout: `Next year: ${age1 + 1}\n`, match: "exact" },
                { stdin: `${age2}\n`, stdout: `Next year: ${age2 + 1}\n`, match: "exact" },
            ],
            solutionCode: `age = int(input())\nprint(f"Next year: {age + 1}")\n`,
        });

        return { archetype: "m1_types_convert_next_year_code", exercise, expected };
    },

    m1_types_errors_sc: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "m1_types_errors_sc",
            id,
            topic,
            diff,
            title: "Reading errors",
            prompt:
                "What error is most likely from this code?\n\n" +
                "~~~python\n" +
                "age = input(\"Age: \")\n" +
                "print(age + 1)\n" +
                "~~~",
            options: [
                { id: "a", text: "NameError" },
                { id: "b", text: "TypeError" },
                { id: "c", text: "SyntaxError" },
            ],
            answerOptionId: "b",
            hint: "input() returns a string, so age + 1 tries to add str and int.",
        }),
};