// src/lib/practice/generator/engines/python/python_part1_mod1/topics/operators_expressions.ts
import type { CodeInputExercise } from "../../../../../types";
import { defineTopic, Handler, TopicBundle } from "@/lib/practice/generator/engines/utils";
import { makeCodeExpected, safeInt, terminalFence } from "../../_shared";

export const M1_OPERATORS_POOL = [
    { key: "m1_ops_precedence_sc", w: 1, kind: "code_input", purpose: "project" },
    { key: "m1_ops_mod_evenodd_sc", w: 1, kind: "code_input", purpose: "project" },
    { key: "m1_ops_checkout_code", w: 1, kind: "code_input", purpose: "project" },
] as const;

export type M1OperatorsKey = (typeof M1_OPERATORS_POOL)[number]["key"];

function pickDifferentInt(rng: any, lo: number, hi: number, avoid: number) {
    let x = safeInt(rng, lo, hi);
    for (let i = 0; i < 6 && x === avoid; i++) x = safeInt(rng, lo, hi);
    return x;
}

export const M1_OPERATORS_HANDLERS: Record<M1OperatorsKey, Handler> = {
    m1_ops_precedence_sc: ({ rng, diff, id, topic }) => {
        const a1 = safeInt(rng, 1, 9);
        const b1 = safeInt(rng, 1, 9);
        const c1 = safeInt(rng, 1, 9);
        const r1 = a1 + b1 * c1;

        const a2 = pickDifferentInt(rng, 1, 9, a1);
        const b2 = pickDifferentInt(rng, 1, 9, b1);
        const c2 = pickDifferentInt(rng, 1, 9, c1);
        const r2 = a2 + b2 * c2;

        const exStdin = `${a1}\n${b1}\n${c1}\n`;
        const exStdout = `${r1}\n`;

        const exercise: CodeInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "code_input",
            title: "Operator precedence",
            prompt: String.raw`
Read **THREE integers** (a, b, c).

Compute and print:
a + b * c

Print **ONLY the number** (one line).

${terminalFence(exStdin, exStdout)}
`.trim(),
            language: "python",
            starterCode: String.raw`a = int(input())
b = int(input())
c = int(input())
# TODO: print a + b * c
`,
            hint: "Multiplication happens before addition: a + (b * c).",
        };

        const expected = makeCodeExpected({
            language: "python",
            tests: [
                { stdin: `${a1}\n${b1}\n${c1}\n`, stdout: `${r1}\n`, match: "exact" },
                { stdin: `${a2}\n${b2}\n${c2}\n`, stdout: `${r2}\n`, match: "exact" },
            ],
            solutionCode: `a = int(input())\nb = int(input())\nc = int(input())\nprint(a + b * c)\n`,
        });

        return { archetype: "m1_ops_precedence_sc", exercise, expected };
    },

    m1_ops_mod_evenodd_sc: ({ rng, diff, id, topic }) => {
        const n1 = safeInt(rng, 1, 99);
        const out1 = n1 % 2 === 0 ? "even" : "odd";

        const n2 = pickDifferentInt(rng, 1, 99, n1);
        const out2 = n2 % 2 === 0 ? "even" : "odd";

        const exStdin = `${n1}\n`;
        const exStdout = `${out1}\n`;

        const exercise: CodeInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "code_input",
            title: "Modulo even/odd",
            prompt: String.raw`
Read **ONE integer** n.

If n is even, print:
even

Otherwise print:
odd

${terminalFence(exStdin, exStdout)}
`.trim(),
            language: "python",
            starterCode: String.raw`n = int(input())
# TODO: print "even" or "odd"
`,
            hint: "If n % 2 == 0, it's even.",
        };

        const expected = makeCodeExpected({
            language: "python",
            tests: [
                { stdin: `${n1}\n`, stdout: `${out1}\n`, match: "exact" },
                { stdin: `${n2}\n`, stdout: `${out2}\n`, match: "exact" },
            ],
            solutionCode: `n = int(input())\nprint("even" if n % 2 == 0 else "odd")\n`,
        });

        return { archetype: "m1_ops_mod_evenodd_sc", exercise, expected };
    },

    m1_ops_checkout_code: ({ rng, diff, id, topic }) => {
        const subtotal1 = safeInt(rng, 10, 120);
        const taxPct1 = safeInt(rng, 3, 11);
        const tax1 = Math.floor((subtotal1 * taxPct1) / 100);
        const total1 = subtotal1 + tax1;

        const subtotal2 = pickDifferentInt(rng, 10, 120, subtotal1);
        const taxPct2 = pickDifferentInt(rng, 3, 11, taxPct1);
        const tax2 = Math.floor((subtotal2 * taxPct2) / 100);
        const total2 = subtotal2 + tax2;

        const exStdin = `${subtotal1}\n${taxPct1}\n`;
        const exStdout = `Tax = ${tax1}\nTotal = ${total1}\n`;

        const exercise: CodeInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "code_input",
            title: "Checkout (subtotal + tax)",
            prompt: String.raw`
Read **TWO integers**:
1) subtotal
2) tax percent

Compute:
- tax = subtotal * taxPct // 100
- total = subtotal + tax

Print **EXACTLY two lines**:
Tax = <tax>
Total = <total>

${terminalFence(exStdin, exStdout)}
`.trim(),
            language: "python",
            starterCode: String.raw`subtotal = int(input())
taxPct = int(input())
# TODO
`,
            hint: "tax = subtotal * taxPct // 100",
        };

        const expected = makeCodeExpected({
            language: "python",
            tests: [
                { stdin: `${subtotal1}\n${taxPct1}\n`, stdout: `Tax = ${tax1}\nTotal = ${total1}\n`, match: "exact" },
                { stdin: `${subtotal2}\n${taxPct2}\n`, stdout: `Tax = ${tax2}\nTotal = ${total2}\n`, match: "exact" },
            ],
            solutionCode:
                `subtotal = int(input())\n` +
                `taxPct = int(input())\n` +
                `tax = subtotal * taxPct // 100\n` +
                `total = subtotal + tax\n` +
                `print(f"Tax = {tax}")\n` +
                `print(f"Total = {total}")\n`,
        });

        return { archetype: "m1_ops_checkout_code", exercise, expected };
    },
};

export const M1_OPERATORS_TOPIC: TopicBundle = defineTopic(
    "operators_expressions",
    M1_OPERATORS_POOL as any,
    M1_OPERATORS_HANDLERS as any,
);