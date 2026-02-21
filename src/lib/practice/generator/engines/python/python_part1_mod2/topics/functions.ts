// src/lib/practice/generator/engines/python/python_part1_mod2/topics/functions.ts
import type { CodeInputExercise } from "../../../../../types";
import type { Handler } from "../../python_shared/_shared";
import { makeCodeExpected, safeInt } from "../../python_shared/_shared";
import { makeSingleChoiceOut } from "../../python_shared/_shared";

export const M2_FUNCTIONS_POOL = [
    { key: "m2_func_total_with_tip_code", w: 1, kind: "code_input" },
    { key: "m2_func_shipping_rule_code", w: 1, kind: "code_input" },
    { key: "m2_func_sum_list_code", w: 1, kind: "code_input" },
    { key: "m2_func_return_vs_print_sc", w: 1, kind: "single_choice" },
] as const;

export type M2FunctionsKey = (typeof M2_FUNCTIONS_POOL)[number]["key"];
export const M2_FUNCTIONS_VALID_KEYS = M2_FUNCTIONS_POOL.map((p) => p.key) as M2FunctionsKey[];

function pickDifferentInt(rng: any, lo: number, hi: number, avoid: number) {
    let x = safeInt(rng, lo, hi);
    for (let i = 0; i < 6 && x === avoid; i++) x = safeInt(rng, lo, hi);
    return x;
}

export const M2_FUNCTIONS_HANDLERS: Record<M2FunctionsKey, Handler> = {
    m2_func_total_with_tip_code: ({ rng, diff, id, topic }) => {
        const bill1 = safeInt(rng, 10, 120);
        const pct1 = safeInt(rng, 5, 25);
        const tip1 = Math.floor((bill1 * pct1) / 100);
        const total1 = bill1 + tip1;

        const bill2 = pickDifferentInt(rng, 10, 120, bill1);
        const pct2 = pickDifferentInt(rng, 5, 25, pct1);
        const tip2 = Math.floor((bill2 * pct2) / 100);
        const total2 = bill2 + tip2;

        const exercise: CodeInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "code_input",
            title: "Function: total_with_tip(bill, pct)",
            prompt: String.raw`
Story: your kiosk keeps needing tip math. Turn it into a reusable machine.

Write a function:
total_with_tip(bill, pct)

Rules:
- bill and pct are integers
- tip = bill * pct // 100
- return bill + tip

Then:
Read TWO integers (bill, pct) and print:
Total = <total>

~~~terminal
@meta Idle • Accepted • 0.026s • 3MB
$ input
50
20

$ output
Total = 60
~~~
`.trim(),
            language: "python",
            starterCode: String.raw`def total_with_tip(bill, pct):
    # TODO: compute tip using integer math
    # TODO: return total
    pass

bill = int(input())
pct = int(input())
# TODO: call the function and print Total = <total>
`,
            hint: "Remember: return sends the value back to the caller.",
        };

        const expected = makeCodeExpected({
            language: "python",
            tests: [
                { stdin: `${bill1}\n${pct1}\n`, stdout: `Total = ${total1}\n`, match: "exact" },
                { stdin: `${bill2}\n${pct2}\n`, stdout: `Total = ${total2}\n`, match: "exact" },
            ],
            solutionCode:
                `def total_with_tip(bill, pct):\n` +
                `    tip = bill * pct // 100\n` +
                `    return bill + tip\n` +
                `\n` +
                `bill = int(input())\n` +
                `pct = int(input())\n` +
                `print(f"Total = {total_with_tip(bill, pct)}")\n`,
        });

        return { archetype: "m2_func_total_with_tip_code", exercise, expected };
    },

    m2_func_shipping_rule_code: ({ rng, diff, id, topic }) => {
        const t1 = safeInt(rng, 10, 49);
        const t2 = safeInt(rng, 50, 150);

        const ship = (total: number) => (total >= 50 ? 0 : 7);

        const exercise: CodeInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "code_input",
            title: "Function: shipping_cost(total)",
            prompt: String.raw`
Story: your kiosk has a simple shipping rule.

Write a function:
shipping_cost(total)

Rule:
- if total >= 50 return 0
- else return 7

Then read ONE integer total and print:
Shipping = <cost>

~~~terminal
@meta Idle • Accepted • 0.026s • 3MB
$ input
40

$ output
Shipping = 7
~~~
`.trim(),
            language: "python",
            starterCode: String.raw`def shipping_cost(total):
    # TODO: return 0 or 7
    pass

total = int(input())
# TODO: print Shipping = <cost>
`,
            hint: "Use if/else inside the function.",
        };

        const expected = makeCodeExpected({
            language: "python",
            tests: [
                { stdin: `${t1}\n`, stdout: `Shipping = ${ship(t1)}\n`, match: "exact" },
                { stdin: `${t2}\n`, stdout: `Shipping = ${ship(t2)}\n`, match: "exact" },
            ],
            solutionCode:
                `def shipping_cost(total):\n` +
                `    return 0 if total >= 50 else 7\n` +
                `\n` +
                `total = int(input())\n` +
                `print(f"Shipping = {shipping_cost(total)}")\n`,
        });

        return { archetype: "m2_func_shipping_rule_code", exercise, expected };
    },

    m2_func_sum_list_code: ({ rng, diff, id, topic }) => {
        const a1 = safeInt(rng, 1, 30);
        const b1 = safeInt(rng, 1, 30);
        const c1 = safeInt(rng, 1, 30);
        const s1 = a1 + b1 + c1;

        const a2 = pickDifferentInt(rng, 1, 30, a1);
        const b2 = pickDifferentInt(rng, 1, 30, b1);
        const c2 = pickDifferentInt(rng, 1, 30, c1);
        const s2 = a2 + b2 + c2;

        const exercise: CodeInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "code_input",
            title: "Function: sum_list(xs)",
            prompt: String.raw`
Story: your kiosk stores prices in a list. Now you want a reusable sum function.

Write a function:
sum_list(xs)

Rules:
- xs is a list of integers
- return the sum (use a loop)

Then:
Read THREE integers, store them in a list, call sum_list, and print:
sum = <value>

~~~terminal
@meta Idle • Accepted • 0.026s • 3MB
$ input
10
20
30

$ output
sum = 60
~~~
`.trim(),
            language: "python",
            starterCode: String.raw`def sum_list(xs):
    # TODO: loop and add
    pass

a = int(input())
b = int(input())
c = int(input())
xs = [a, b, c]
# TODO: print sum = <sum_list(xs)>
`,
            hint: "Start total = 0, then for v in xs: total += v",
        };

        const expected = makeCodeExpected({
            language: "python",
            tests: [
                { stdin: `${a1}\n${b1}\n${c1}\n`, stdout: `sum = ${s1}\n`, match: "exact" },
                { stdin: `${a2}\n${b2}\n${c2}\n`, stdout: `sum = ${s2}\n`, match: "exact" },
            ],
            solutionCode:
                `def sum_list(xs):\n` +
                `    total = 0\n` +
                `    for v in xs:\n` +
                `        total += v\n` +
                `    return total\n` +
                `\n` +
                `a = int(input())\n` +
                `b = int(input())\n` +
                `c = int(input())\n` +
                `xs = [a, b, c]\n` +
                `print(f"sum = {sum_list(xs)}")\n`,
        });

        return { archetype: "m2_func_sum_list_code", exercise, expected };
    },

    m2_func_return_vs_print_sc: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "m2_func_return_vs_print_sc",
            id,
            topic,
            diff,
            title: "return vs print",
            prompt: "What does `return` do inside a function?",
            options: [
                { id: "a", text: "It shows text in the terminal" },
                { id: "b", text: "It sends a value back to the caller and exits the function" },
                { id: "c", text: "It repeats the function automatically" },
            ],
            answerOptionId: "b",
            hint: "`return` gives back a value (and ends the function).",
        }),
};