// src/lib/practice/generator/engines/python/python_part1_mod1/topics/input_output_patterns.ts
import type { CodeInputExercise } from "../../../../../types";
import type { Handler } from "../../python_shared/_shared";
import { makeCodeExpected, safeInt, pickName } from "../../python_shared/_shared";

export const M1_IO_POOL = [
    { key: "m1_io_age_next_year", w: 1, kind: "code_input" },
    { key: "m1_io_tip_total", w: 1, kind: "code_input" },
    { key: "m1_io_c_to_f", w: 1, kind: "code_input" },
] as const;

export type M1IoKey = (typeof M1_IO_POOL)[number]["key"];
export const M1_IO_VALID_KEYS = M1_IO_POOL.map((p) => p.key) as M1IoKey[];

function pickDifferentName(rng: any, avoid: string) {
    let x = pickName(rng);
    for (let i = 0; i < 6 && x === avoid; i++) x = pickName(rng);
    return x;
}
function pickDifferentInt(rng: any, lo: number, hi: number, avoid: number) {
    let x = safeInt(rng, lo, hi);
    for (let i = 0; i < 6 && x === avoid; i++) x = safeInt(rng, lo, hi);
    return x;
}

export const M1_IO_HANDLERS: Record<M1IoKey, Handler> = {
    m1_io_age_next_year: ({ rng, diff, id, topic }) => {
        const name1 = pickName(rng);
        const age1 = safeInt(rng, 10, 40);
        const name2 = pickDifferentName(rng, name1);
        const age2 = pickDifferentInt(rng, 10, 40, age1);

        const exercise: CodeInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "code_input",
            title: "Mini-project: Age next year",
            prompt: String.raw`
Read **TWO inputs**:
1) name (string)
2) age (integer)

Print **exactly ONE line**:
Hi <name>! Next year you'll be <age+1>.

~~~terminal
@meta Idle • Accepted • 0.026s • 3MB
$ input
Maya
16

$ output
Hi Maya! Next year you'll be 17.
~~~
`.trim(),
            language: "python",
            starterCode: String.raw`# TODO: read name
# TODO: read age
# TODO: compute next year
# TODO: print the message
`,
            hint: `Remember: input() returns str. Convert age using int(...).`,
        };

        const expected = makeCodeExpected({
            language: "python",
            tests: [
                { stdin: `${name1}\n${age1}\n`, stdout: `Hi ${name1}! Next year you'll be ${age1 + 1}.\n`, match: "exact" },
                { stdin: `${name2}\n${age2}\n`, stdout: `Hi ${name2}! Next year you'll be ${age2 + 1}.\n`, match: "exact" },
            ],
            solutionCode: `name = input()\nage = int(input())\nprint(f"Hi {name}! Next year you'll be {age + 1}.")\n`,
        });

        return { archetype: "m1_io_age_next_year", exercise, expected };
    },

    m1_io_tip_total: ({ rng, diff, id, topic }) => {
        const bill1 = safeInt(rng, 10, 80);
        const pct1 = safeInt(rng, 10, 25);
        const tip1 = Math.floor((bill1 * pct1) / 100);
        const total1 = bill1 + tip1;

        const bill2 = pickDifferentInt(rng, 10, 80, bill1);
        const pct2 = pickDifferentInt(rng, 10, 25, pct1);
        const tip2 = Math.floor((bill2 * pct2) / 100);
        const total2 = bill2 + tip2;

        const exercise: CodeInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "code_input",
            title: "Mini-project: Tip + total (integers)",
            prompt: String.raw`
Read **TWO integers**:
1) bill amount (whole dollars)
2) tip percent

Compute:
- tip = bill * pct // 100
- total = bill + tip

Print **EXACTLY two lines**:
Tip = <tip>
Total = <total>

~~~terminal
@meta Idle • Accepted • 0.026s • 3MB
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
# TODO: compute tip and total
`,
            hint: `Use integer math: tip = bill * pct // 100`,
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

        return { archetype: "m1_io_tip_total", exercise, expected };
    },

    m1_io_c_to_f: ({ rng, diff, id, topic }) => {
        const c1 = safeInt(rng, -10, 40);
        const f1 = Math.floor((c1 * 9) / 5 + 32);

        const c2 = pickDifferentInt(rng, -10, 40, c1);
        const f2 = Math.floor((c2 * 9) / 5 + 32);

        const exercise: CodeInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "code_input",
            title: "Mini-project: Celsius → Fahrenheit",
            prompt: String.raw`
Read **ONE integer** Celsius value.

Convert using:
F = C * 9/5 + 32

Print **ONLY the Fahrenheit number** (one line).

~~~terminal
@meta Idle • Accepted • 0.026s • 3MB
$ input
0

$ output
32
~~~
`.trim(),
            language: "python",
            starterCode: String.raw`c = int(input())
# TODO: compute fahrenheit
# TODO: print it
`,
            hint: `You can use: f = int(c * 9 / 5 + 32)`,
        };

        const expected = makeCodeExpected({
            language: "python",
            tests: [
                { stdin: `${c1}\n`, stdout: `${f1}\n`, match: "exact" },
                { stdin: `${c2}\n`, stdout: `${f2}\n`, match: "exact" },
            ],
            solutionCode: `c = int(input())\nf = int(c * 9 / 5 + 32)\nprint(f)\n`,
        });

        return { archetype: "m1_io_c_to_f", exercise, expected };
    },
};