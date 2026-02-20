// src/lib/practice/generator/engines/python/python_part1_mod1/topics/input_output_patterns.ts
import type { CodeInputExercise } from "../../../../../types";
import type { Handler } from "../../python_shared/_shared";
import { makeCodeExpected, safeInt, pickName } from "../../python_shared/_shared";

export const M1_IO_VALID_KEYS = [
    "m1_io_age_next_year",
    "m1_io_tip_total",
    "m1_io_c_to_f",
] as const;

export const M1_IO_HANDLERS: Record<(typeof M1_IO_VALID_KEYS)[number], Handler> = {
    m1_io_age_next_year: ({ rng, diff, id, topic }) => {
        const name = pickName(rng);
        const age = safeInt(rng, 10, 40);

        const exercise: CodeInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "code_input",
            title: "Mini-project: Age next year",
            prompt: `Read **two inputs** (name then age) and print:\n\nHi <name>! Next year you'll be <age+1>.\n\nExample input:\n- ${name}\n- ${age}`,
            language: "python",
            starterCode: `# TODO: read name\n# TODO: read age\n# TODO: compute next year\n# TODO: print the message\n`,
            hint: `Remember: input() returns str. Convert age using int(...).`,
        };

        const expected = makeCodeExpected({
            language: "python",
            tests: [
                {
                    stdin: `${name}\n${age}\n`,
                    stdout: `Hi ${name}! Next year you'll be ${age + 1}.\n`,
                    match: "exact",
                },
            ],
            solutionCode: `name = input()\nage = int(input())\nprint(f"Hi {name}! Next year you'll be {age + 1}.")\n`,
        });

        return { archetype: "m1_io_age_next_year", exercise, expected };
    },

    m1_io_tip_total: ({ rng, diff, id, topic }) => {
        // ints only => no float formatting pain
        const bill = safeInt(rng, 10, 80);
        const pct = safeInt(rng, 10, 25);
        const tip = Math.floor((bill * pct) / 100);
        const total = bill + tip;

        const exercise: CodeInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "code_input",
            title: "Mini-project: Tip + total (integers)",
            prompt:
                `Read **two integers**:\n` +
                `1) bill amount (whole dollars)\n` +
                `2) tip percent\n\n` +
                `Print TWO lines:\n` +
                `Tip = <tip>\n` +
                `Total = <total>\n\n` +
                `Example: bill=${bill}, tip%=${pct}`,
            language: "python",
            starterCode: `bill = int(input())\npct = int(input())\n# TODO: compute tip and total\n`,
            hint: `tip = bill * pct // 100`,
        };

        const expected = makeCodeExpected({
            language: "python",
            tests: [
                {
                    stdin: `${bill}\n${pct}\n`,
                    stdout: `Tip = ${tip}\nTotal = ${total}\n`,
                    match: "exact",
                },
            ],
            solutionCode: `bill = int(input())\npct = int(input())\ntip = bill * pct // 100\ntotal = bill + tip\nprint(f"Tip = {tip}")\nprint(f"Total = {total}")\n`,
        });

        return { archetype: "m1_io_tip_total", exercise, expected };
    },

    m1_io_c_to_f: ({ rng, diff, id, topic }) => {
        const c = safeInt(rng, -10, 40);
        const f = Math.floor((c * 9) / 5 + 32); // for these ints it’s fine

        const exercise: CodeInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "code_input",
            title: "Mini-project: Celsius → Fahrenheit",
            prompt:
                `Read one integer Celsius value, convert to Fahrenheit using:\n` +
                `F = C * 9/5 + 32\n\n` +
                `Print ONLY the Fahrenheit number.\n\n` +
                `Example input: ${c}`,
            language: "python",
            starterCode: `c = int(input())\n# TODO: compute fahrenheit\n# TODO: print it\n`,
            hint: `Use f = c * 9 / 5 + 32. (You can use int(...) if needed).`,
        };

        const expected = makeCodeExpected({
            language: "python",
            tests: [{ stdin: `${c}\n`, stdout: `${f}\n`, match: "exact" }],
            solutionCode: `c = int(input())\nf = int(c * 9 / 5 + 32)\nprint(f)\n`,
        });

        return { archetype: "m1_io_c_to_f", exercise, expected };
    },
};
