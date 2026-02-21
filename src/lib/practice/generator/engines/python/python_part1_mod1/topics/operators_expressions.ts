// src/lib/practice/generator/engines/python/python_part1_mod1/topics/operators_expressions.ts
import type { CodeInputExercise } from "../../../../../types";
import type { Handler } from "../../python_shared/_shared";
import { makeCodeExpected, safeInt } from "../../python_shared/_shared";

export const M1_OPERATORS_POOL = [
    { key: "m1_ops_precedence_sc", w: 1, kind: "code_input" },
    { key: "m1_ops_mod_evenodd_sc", w: 1, kind: "code_input" },
    { key: "m1_ops_checkout_code", w: 1, kind: "code_input" },
] as const;

export type M1OperatorsKey = (typeof M1_OPERATORS_POOL)[number]["key"];
export const M1_OPERATORS_VALID_KEYS = M1_OPERATORS_POOL.map((p) => p.key) as M1OperatorsKey[];

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

        const exercise: CodeInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "code_input",
            title: "Mini-project: Operator precedence",
            prompt: String.raw`
Read **THREE integers** (a, b, c).

Compute and print:
a + b * c

Print **ONLY the number** (one line).

~~~terminal
@meta Idle • Accepted • 0.026s • 3MB
$ input
1
2
3

$ output
7
~~~
`.trim(),
            language: "python",
            starterCode: String.raw`a = int(input())
b = int(input())
c = int(input())
# TODO: compute a + b * c
# TODO: print the result
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

        const exercise: CodeInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "code_input",
            title: "Mini-project: Modulo even/odd detector",
            prompt: String.raw`
Read **ONE integer** n.

If n is even, print:
even

Otherwise print:
odd

~~~terminal
@meta Idle • Accepted • 0.026s • 3MB
$ input
10

$ output
even
~~~
`.trim(),
            language: "python",
            starterCode: String.raw`n = int(input())
# TODO: use % to decide
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

        const exercise: CodeInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "code_input",
            title: "Mini-project: Checkout line (subtotal + tax + total)",
            prompt: String.raw`
Read **TWO integers**:
1) subtotal (whole dollars)
2) tax percent

Compute:
- tax = subtotal * taxPct // 100
- total = subtotal + tax

Print **EXACTLY two lines**:
Tax = <tax>
Total = <total>

~~~terminal
@meta Idle • Accepted • 0.026s • 3MB
$ input
100
10

$ output
Tax = 10
Total = 110
~~~
`.trim(),
            language: "python",
            starterCode: String.raw`subtotal = int(input())
taxPct = int(input())
# TODO: compute tax and total
`,
            hint: "Use integer math: tax = subtotal * taxPct // 100",
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