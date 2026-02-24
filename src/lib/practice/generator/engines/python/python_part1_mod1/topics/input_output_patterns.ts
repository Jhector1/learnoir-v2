// src/lib/practice/generator/engines/python/python_part1_mod1/topics/input_output_patterns.ts
import type { CodeInputExercise } from "../../../../../types";
// import {defineTopic, Handler, TopicBundle} from "@/lib/practice/generator/engines/utils";
import {  makeCodeExpected, safeInt, pickName } from "../../_shared";
import {defineTopic, Handler, TopicBundle} from "@/lib/practice/generator/engines/utils";

export const M1_IO_POOL = [
    { key: "m1_io_age_next_year", w: 1, kind: "code_input", purpose: "project" },
    { key: "m1_io_tip_total", w: 1, kind: "code_input", purpose: "project" },
    { key: "m1_io_c_to_f", w: 1, kind: "code_input", purpose: "project" },
] as const;

export type M1IoKey = (typeof M1_IO_POOL)[number]["key"];

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
            title: "Age next year",
            prompt: String.raw`
Read TWO inputs:
1) name
2) age

Print exactly:
Hi <name>! Next year you'll be <age+1>.
`.trim(),
            language: "python",
            starterCode: String.raw`# TODO
`,
            hint: "Convert age with int(...).",
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
            title: "Tip + total",
            prompt: String.raw`
Read TWO integers:
1) bill
2) tip percent

Compute:
tip = bill * pct // 100
total = bill + tip

Print exactly:
Tip = <tip>
Total = <total>
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
            title: "Celsius → Fahrenheit",
            prompt: String.raw`
Read ONE integer C.

Compute:
F = C * 9/5 + 32

Print ONLY F.
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

        return { archetype: "m1_io_c_to_f", exercise, expected };
    },
};

export const M1_IO_TOPIC: TopicBundle = defineTopic(
    "input_output_patterns",
    M1_IO_POOL as any,
    M1_IO_HANDLERS as any,
);