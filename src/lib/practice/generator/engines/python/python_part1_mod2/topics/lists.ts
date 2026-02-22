// src/lib/practice/generator/engines/python python_part1_mod2/topics/lists.ts
import type { CodeInputExercise } from "../../../../../types";
import type { Handler } from "../../python_shared/_shared";
import { makeCodeExpected, safeInt } from "../../python_shared/_shared";

export const M2_LISTS_POOL = [
    { key: "m2_list_three_prices_sum_avg_code", w: 1, kind: "code_input" ,purpose: "project"},
    { key: "m2_list_max_of_four_code", w: 1, kind: "code_input" ,purpose: "project"},
    { key: "m2_list_build_names_print_code", w: 1, kind: "code_input",purpose: "project" },
] as const;

export type M2ListsKey = (typeof M2_LISTS_POOL)[number]["key"];
export const M2_LISTS_VALID_KEYS = M2_LISTS_POOL.map((p) => p.key) as M2ListsKey[];

function pickDifferentInt(rng: any, lo: number, hi: number, avoid: number) {
    let x = safeInt(rng, lo, hi);
    for (let i = 0; i < 6 && x === avoid; i++) x = safeInt(rng, lo, hi);
    return x;
}

export const M2_LISTS_HANDLERS: Record<M2ListsKey, Handler> = {
    m2_list_three_prices_sum_avg_code: ({ rng, diff, id, topic }) => {
        const a1 = safeInt(rng, 1, 50);
        const b1 = safeInt(rng, 1, 50);
        const c1 = safeInt(rng, 1, 50);
        const sum1 = a1 + b1 + c1;
        const avg1 = Math.floor(sum1 / 3);

        const a2 = pickDifferentInt(rng, 1, 50, a1);
        const b2 = pickDifferentInt(rng, 1, 50, b1);
        const c2 = pickDifferentInt(rng, 1, 50, c1);
        const sum2 = a2 + b2 + c2;
        const avg2 = Math.floor(sum2 / 3);

        const exercise: CodeInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "code_input",
            title: "Cart list: sum + average (3 prices)",
            prompt: String.raw`
Story: the kiosk collects 3 item prices (whole dollars) into a list.

Read THREE integers (prices).
Store them in a list.
Compute:
- sum of prices
- average as FLOOR integer (sum // 3)

Print EXACTLY two lines:
sum = <sum>
avg = <avg>

~~~terminal
@meta Idle • Accepted • 0.026s • 3MB
$ input
10
20
30

$ output
sum = 60
avg = 20
~~~
`.trim(),
            language: "python",
            starterCode: String.raw`# TODO: read 3 prices
# TODO: store in a list
# TODO: compute sum and avg
`,
            hint: "Use a list, then sum with a loop or sum(...). avg = total // 3",
        };

        const expected = makeCodeExpected({
            language: "python",
            tests: [
                { stdin: `${a1}\n${b1}\n${c1}\n`, stdout: `sum = ${sum1}\navg = ${avg1}\n`, match: "exact" },
                { stdin: `${a2}\n${b2}\n${c2}\n`, stdout: `sum = ${sum2}\navg = ${avg2}\n`, match: "exact" },
            ],
            solutionCode:
                `prices = [int(input()), int(input()), int(input())]\n` +
                `total = sum(prices)\n` +
                `avg = total // 3\n` +
                `print(f"sum = {total}")\n` +
                `print(f"avg = {avg}")\n`,
        });

        return { archetype: "m2_list_three_prices_sum_avg_code", exercise, expected };
    },

    m2_list_max_of_four_code: ({ rng, diff, id, topic }) => {
        const x1 = safeInt(rng, -20, 50);
        const x2 = safeInt(rng, -20, 50);
        const x3 = safeInt(rng, -20, 50);
        const x4 = safeInt(rng, -20, 50);
        const m1 = Math.max(x1, x2, x3, x4);

        const y1 = pickDifferentInt(rng, -20, 50, x1);
        const y2 = pickDifferentInt(rng, -20, 50, x2);
        const y3 = pickDifferentInt(rng, -20, 50, x3);
        const y4 = pickDifferentInt(rng, -20, 50, x4);
        const m2 = Math.max(y1, y2, y3, y4);

        const exercise: CodeInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "code_input",
            title: "List scan: max of 4 numbers",
            prompt: String.raw`
Story: the kiosk is analyzing 4 daily sales numbers.

Read FOUR integers.
Store them in a list.
Print the maximum as:

max = <value>

~~~terminal
@meta Idle • Accepted • 0.026s • 3MB
$ input
3
9
2
7

$ output
max = 9
~~~
`.trim(),
            language: "python",
            starterCode: String.raw`# TODO: read 4 integers
# TODO: store in list
# TODO: compute max
`,
            hint: "You can use max(list) or loop and track the best.",
        };

        const expected = makeCodeExpected({
            language: "python",
            tests: [
                { stdin: `${x1}\n${x2}\n${x3}\n${x4}\n`, stdout: `max = ${m1}\n`, match: "exact" },
                { stdin: `${y1}\n${y2}\n${y3}\n${y4}\n`, stdout: `max = ${m2}\n`, match: "exact" },
            ],
            solutionCode:
                `nums = [int(input()), int(input()), int(input()), int(input())]\n` +
                `print(f"max = {max(nums)}")\n`,
        });

        return { archetype: "m2_list_max_of_four_code", exercise, expected };
    },

    m2_list_build_names_print_code: ({ rng, diff, id, topic }) => {
        const n1 = rng.pick(["Maya", "Ayo", "Sam"] as const);
        const n2 = rng.pick(["Leo", "Taylor", "Jordan"] as const);

        const a1 = rng.pick(["Nina", "Omar", "Kai"] as const);
        const a2 = rng.pick(["Zoe", "Ivy", "Noah"] as const);

        const exercise: CodeInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "code_input",
            title: "Build a list of names (2) and print them",
            prompt: String.raw`
Story: the kiosk stores customer names.

Read TWO names (two lines).
Store them in a list in the same order.
Print EXACTLY:

names[0] = <first>
names[1] = <second>

~~~terminal
@meta Idle • Accepted • 0.026s • 3MB
$ input
Maya
Leo

$ output
names[0] = Maya
names[1] = Leo
~~~
`.trim(),
            language: "python",
            starterCode: String.raw`# TODO: read two names
# TODO: store into list
# TODO: print names[0] and names[1] lines
`,
            hint: "Use a list: names = [first, second]",
        };

        const expected = makeCodeExpected({
            language: "python",
            tests: [
                { stdin: `${n1}\n${n2}\n`, stdout: `names[0] = ${n1}\nnames[1] = ${n2}\n`, match: "exact" },
                { stdin: `${a1}\n${a2}\n`, stdout: `names[0] = ${a1}\nnames[1] = ${a2}\n`, match: "exact" },
            ],
            solutionCode:
                `first = input().strip()\n` +
                `second = input().strip()\n` +
                `names = [first, second]\n` +
                `print(f"names[0] = {names[0]}")\n` +
                `print(f"names[1] = {names[1]}")\n`,
        });

        return { archetype: "m2_list_build_names_print_code", exercise, expected };
    },
};