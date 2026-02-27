// src/lib/practice/generator/engines/python/python_part1_mod1/topics/string_basics.ts
import type { CodeInputExercise, SingleChoiceExercise } from "../../../../../types";
import { defineTopic, Handler, TopicBundle } from "@/lib/practice/generator/engines/utils";
import { makeCodeExpected, pickName, terminalFence } from "../../_shared";

export const M1_STRINGS_POOL = [
    { key: "m1_str_concat_vs_comma_sc", w: 1, kind: "single_choice", purpose: "project" },
    { key: "m1_str_fstring_greeting_code", w: 1, kind: "code_input", purpose: "project" },
    { key: "m1_str_username_code", w: 1, kind: "code_input", purpose: "project" },
] as const;

export type M1StringsKey = (typeof M1_STRINGS_POOL)[number]["key"];
export const M1_STRINGS_VALID_KEYS = M1_STRINGS_POOL.map((p) => p.key) as M1StringsKey[];

function pickDifferentName(rng: any, avoid: string) {
    let x = pickName(rng);
    for (let i = 0; i < 6 && x === avoid; i++) x = pickName(rng);
    return x;
}

export const M1_STRINGS_HANDLERS: Record<M1StringsKey, Handler> = {
    m1_str_concat_vs_comma_sc: ({ diff, id, topic }) => {
        const exercise: SingleChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "single_choice",
            title: "Concatenation vs commas",
            prompt: "Assume `age = 16`. Which line prints **without** an error?",
            options: [
                { id: "a", text: "`print(\"age: \" + age)`" },
                { id: "b", text: "`print(\"age:\", age)`" },
                { id: "c", text: "`print(\"age: \" + 16)`" },
            ],
            hint: "Commas work with numbers. Using + requires strings on both sides.",
        };

        return {
            archetype: "m1_str_concat_vs_comma_sc",
            exercise,
            expected: { kind: "single_choice", optionId: "b" },
        };
    },

    m1_str_fstring_greeting_code: ({ rng, diff, id, topic }) => {
        const name1 = pickName(rng);
        const name2 = pickDifferentName(rng, name1);

        const exStdin = `${name1}\n`;
        const exStdout = `Hello, ${name1}!\n`;

        const exercise: CodeInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "code_input",
            title: "f-string greeting",
            prompt: String.raw`
Read ONE input (name).

Print EXACTLY:
Hello, <name>!

${terminalFence(exStdin, exStdout)}
`.trim(),
            language: "python",
            starterCode: String.raw`# TODO
`,
            hint: `print(f"Hello, {name}!")`,
        };

        const expected = makeCodeExpected({
            language: "python",
            tests: [
                { stdin: `${name1}\n`, stdout: `Hello, ${name1}!\n`, match: "exact" },
                { stdin: `${name2}\n`, stdout: `Hello, ${name2}!\n`, match: "exact" },
            ],
            solutionCode: `name = input()\nprint(f"Hello, {name}!")\n`,
        });

        return { archetype: "m1_str_fstring_greeting_code", exercise, expected };
    },

    m1_str_username_code: ({ rng, diff, id, topic }) => {
        const first1 = pickName(rng);
        const last1 = pickName(rng);
        const first2 = pickDifferentName(rng, first1);
        const last2 = pickDifferentName(rng, last1);

        const stdinFirst1 = `  ${first1.toUpperCase()}  `;
        const stdinLast1 = ` ${last1.toUpperCase()} `;
        const out1 = ((first1.trim()[0] ?? "") + last1.trim()).toLowerCase();

        const stdinFirst2 = ` ${first2} `;
        const stdinLast2 = `  ${last2}  `;
        const out2 = ((first2.trim()[0] ?? "") + last2.trim()).toLowerCase();

        const exStdin = `${stdinFirst1}\n${stdinLast1}\n`;
        const exStdout = `${out1}\n`;

        const exercise: CodeInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "code_input",
            title: "Username generator",
            prompt: String.raw`
Read TWO inputs (first, last).

Rules:
- strip spaces
- username = first letter of first + last
- lowercase
Print ONLY the username.

${terminalFence(exStdin, exStdout)}
`.trim(),
            language: "python",
            starterCode: String.raw`# TODO
`,
            hint: `username = (first.strip()[0] + last.strip()).lower()`,
        };

        const expected = makeCodeExpected({
            language: "python",
            tests: [
                { stdin: `${stdinFirst1}\n${stdinLast1}\n`, stdout: `${out1}\n`, match: "exact" },
                { stdin: `${stdinFirst2}\n${stdinLast2}\n`, stdout: `${out2}\n`, match: "exact" },
            ],
            solutionCode:
                `first = input().strip()\n` +
                `last = input().strip()\n` +
                `username = (first[0] + last).lower()\n` +
                `print(username)\n`,
        });

        return { archetype: "m1_str_username_code", exercise, expected };
    },
};

export const M1_STRINGS_TOPIC: TopicBundle = defineTopic(
    "string_basics",
    M1_STRINGS_POOL as any,
    M1_STRINGS_HANDLERS as any,
);