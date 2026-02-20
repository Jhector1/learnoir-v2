// src/lib/practice/generator/engines/python/python_part1_mod1/topics/operators_expressions.ts

import type { CodeInputExercise } from "../../../../../types";
import type { Handler } from "../../python_shared/_shared";
import { makeCodeExpected, safeInt } from "../../python_shared/_shared";

export const M1_OPERATORS_VALID_KEYS = [
    "m1_ops_precedence_sc",
    "m1_ops_mod_evenodd_sc",
    "m1_ops_checkout_code",
] as const;

export const M1_OPERATORS_HANDLERS: Record<(typeof M1_OPERATORS_VALID_KEYS)[number], Handler> = {
    m1_ops_precedence_sc: ({ rng, diff, id, topic }) => {
        const a = safeInt(rng, 1, 9);
        const b = safeInt(rng, 1, 9);
        const c = safeInt(rng, 1, 9);

        const result = a + b * c;

        const exercise: CodeInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "code_input",
            title: "Mini-project: Operator precedence",
            prompt:
                `Read **three integers** (a, b, c).\n\n` +
                `Compute and print the value of:\n` +
                `a + b * c\n\n` +
                `Example input:\n- ${a}\n- ${b}\n- ${c}\n`,
            language: "python",
            starterCode:
                `a = int(input())\n` +
                `b = int(input())\n` +
                `c = int(input())\n` +
                `# TODO: compute a + b * c\n` +
                `# TODO: print the result\n`,
            hint: "Multiplication happens before addition: a + (b * c).",
        };

        const expected = makeCodeExpected({
            language: "python",
            tests: [
                {
                    stdin: `${a}\n${b}\n${c}\n`,
                    stdout: `${result}\n`,
                    match: "exact",
                },
            ],
            solutionCode:
                `a = int(input())\n` +
                `b = int(input())\n` +
                `c = int(input())\n` +
                `print(a + b * c)\n`,
        });

        return { archetype: "m1_ops_precedence_sc", exercise, expected };
    },

    m1_ops_mod_evenodd_sc: ({ rng, diff, id, topic }) => {
        const n = safeInt(rng, 1, 99);
        const out = n % 2 === 0 ? "even" : "odd";

        const exercise: CodeInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "code_input",
            title: "Mini-project: Modulo even/odd detector",
            prompt:
                `Read **one integer** n.\n\n` +
                `If n is even, print:\n` +
                `even\n` +
                `Otherwise print:\n` +
                `odd\n\n` +
                `Example input: ${n}\n`,
            language: "python",
            starterCode:
                `n = int(input())\n` +
                `# TODO: use % to decide\n` +
                `# TODO: print "even" or "odd"\n`,
            hint: "If n % 2 == 0, it's even.",
        };

        const expected = makeCodeExpected({
            language: "python",
            tests: [{ stdin: `${n}\n`, stdout: `${out}\n`, match: "exact" }],
            solutionCode:
                `n = int(input())\n` +
                `print("even" if n % 2 == 0 else "odd")\n`,
        });

        return { archetype: "m1_ops_mod_evenodd_sc", exercise, expected };
    },

    m1_ops_checkout_code: ({ rng, diff, id, topic }) => {
        // ints only => no float formatting surprises
        const subtotal = safeInt(rng, 10, 120);
        const taxPct = safeInt(rng, 3, 11);

        const tax = Math.floor((subtotal * taxPct) / 100);
        const total = subtotal + tax;

        const exercise: CodeInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "code_input",
            title: "Mini-project: Checkout line (subtotal + tax + total)",
            prompt:
                `Read **two integers**:\n` +
                `1) subtotal (whole dollars)\n` +
                `2) tax percent\n\n` +
                `Compute:\n` +
                `tax = subtotal * taxPct // 100\n` +
                `total = subtotal + tax\n\n` +
                `Print TWO lines exactly:\n` +
                `Tax = <tax>\n` +
                `Total = <total>\n\n` +
                `Example: subtotal=${subtotal}, tax%=${taxPct}\n`,
            language: "python",
            starterCode:
                `subtotal = int(input())\n` +
                `taxPct = int(input())\n` +
                `# TODO: compute tax and total\n`,
            hint: "Use integer math: tax = subtotal * taxPct // 100",
        };

        const expected = makeCodeExpected({
            language: "python",
            tests: [
                {
                    stdin: `${subtotal}\n${taxPct}\n`,
                    stdout: `Tax = ${tax}\nTotal = ${total}\n`,
                    match: "exact",
                },
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
