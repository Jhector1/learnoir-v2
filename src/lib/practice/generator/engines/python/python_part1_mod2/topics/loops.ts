// src/lib/practice/generator/engines/python/python_part1_mod1/topics/loops_basics.ts
import type { CodeInputExercise } from "../../../../../types";
import { defineTopic, Handler, TopicBundle } from "@/lib/practice/generator/engines/utils";
import { makeCodeExpected, safeInt, terminalFence } from "../../_shared";

export const M2_LOOPS_POOL = [
    { key: "m2_loop_guess_until_secret_code", w: 1, kind: "code_input", purpose: "project" },
    { key: "m2_loop_keep_asking_valid_code", w: 1, kind: "code_input", purpose: "project" },
    { key: "m2_loop_echo_until_quit_code", w: 1, kind: "code_input", purpose: "project" },
] as const;

export type M2LoopsKey = (typeof M2_LOOPS_POOL)[number]["key"];

function pickDifferentInt(rng: any, lo: number, hi: number, avoid: number) {
    let x = safeInt(rng, lo, hi);
    for (let i = 0; i < 6 && x === avoid; i++) x = safeInt(rng, lo, hi);
    return x;
}

export const M2_LOOPS_HANDLERS: Record<M2LoopsKey, Handler> = {
    m2_loop_guess_until_secret_code: ({ rng, diff, id, topic }) => {
        const wrong1 = safeInt(rng, 1, 9);
        const wrong2 = pickDifferentInt(rng, 1, 9, wrong1);
        const secret = 7;

        const exStdin = `${wrong1}\n${secret}\n`;
        const exStdout = `You got it!\n`;

        const exercise: CodeInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "code_input",
            title: "Kiosk game: guess until correct",
            prompt: String.raw`
Story: the snack shop kiosk has a tiny game. The secret number is **7**.

Read guesses (integers) in a loop until the guess equals 7.

Rules:
- while guess != 7: keep reading
- when correct, print exactly:
You got it!

${terminalFence(exStdin, exStdout)}
`.trim(),
            language: "python",
            starterCode: String.raw`# secret is 7
guess = int(input())
# TODO: loop until guess == 7
# TODO: print "You got it!"
`,
            hint: `Use: while guess != 7: guess = int(input())`,
        };

        const expected = makeCodeExpected({
            language: "python",
            tests: [
                { stdin: `${wrong1}\n${secret}\n`, stdout: `You got it!\n`, match: "exact" },
                { stdin: `${wrong1}\n${wrong2}\n${secret}\n`, stdout: `You got it!\n`, match: "exact" },
            ],
            solutionCode:
                `guess = int(input())\n` +
                `while guess != 7:\n` +
                `    guess = int(input())\n` +
                `print("You got it!")\n`,
        });

        return { archetype: "m2_loop_guess_until_secret_code", exercise, expected };
    },

    m2_loop_keep_asking_valid_code: ({ rng, diff, id, topic }) => {
        const bad1 = safeInt(rng, -10, 0);
        const bad2 = safeInt(rng, 11, 25);
        const good = safeInt(rng, 1, 10);
        const good2 = pickDifferentInt(rng, 1, 10, good);

        const exStdin = `${bad1}\n${bad2}\n${good}\n`;
        const exStdout = `OK: ${good}\n`;

        const exercise: CodeInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "code_input",
            title: "Input validator: keep asking until 1..10",
            prompt: String.raw`
Story: the kiosk needs a rating from 1 to 10.

Read integers until you get a value in the range 1..10 (inclusive).

When you finally get a valid value, print:
OK: <value>

(No other output.)

${terminalFence(exStdin, exStdout)}
`.trim(),
            language: "python",
            starterCode: String.raw`n = int(input())
# TODO: keep reading while n is not 1..10
# TODO: when valid, print OK: <n>
`,
            hint: `Condition: while n < 1 or n > 10: ...`,
        };

        const expected = makeCodeExpected({
            language: "python",
            tests: [
                { stdin: `${bad1}\n${bad2}\n${good}\n`, stdout: `OK: ${good}\n`, match: "exact" },
                { stdin: `${bad2}\n${good2}\n`, stdout: `OK: ${good2}\n`, match: "exact" },
            ],
            solutionCode:
                `n = int(input())\n` +
                `while n < 1 or n > 10:\n` +
                `    n = int(input())\n` +
                `print(f"OK: {n}")\n`,
        });

        return { archetype: "m2_loop_keep_asking_valid_code", exercise, expected };
    },

    m2_loop_echo_until_quit_code: ({ rng, diff, id, topic }) => {
        const w1 = "hello";
        const w2 = "menu";
        const q = "quit";
        const w3 = rng.pick(["status", "help", "snack"] as const);

        const exStdin = `${w1}\n${w2}\n${q}\n`;
        const exStdout = `You typed: ${w1}\nYou typed: ${w2}\nBye!\n`;

        const exercise: CodeInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "code_input",
            title: "Command loop: echo until quit",
            prompt: String.raw`
Story: the kiosk reads commands.

Read lines (strings) until you read the word:
quit

Rules:
- For each command that is NOT quit, print:
You typed: <command>
- When you read quit, print:
Bye!

${terminalFence(exStdin, exStdout)}
`.trim(),
            language: "python",
            starterCode: String.raw`cmd = input().strip()
# TODO: loop until cmd == "quit"
# TODO: echo each non-quit command
`,
            hint: `Use while cmd != "quit": ... then read again.`,
        };

        const expected = makeCodeExpected({
            language: "python",
            tests: [
                { stdin: `${w1}\n${w2}\n${q}\n`, stdout: `You typed: ${w1}\nYou typed: ${w2}\nBye!\n`, match: "exact" },
                { stdin: `${w3}\n${q}\n`, stdout: `You typed: ${w3}\nBye!\n`, match: "exact" },
            ],
            solutionCode:
                `cmd = input().strip()\n` +
                `while cmd != "quit":\n` +
                `    print(f"You typed: {cmd}")\n` +
                `    cmd = input().strip()\n` +
                `print("Bye!")\n`,
        });

        return { archetype: "m2_loop_echo_until_quit_code", exercise, expected };
    },
};

export const M2_LOOPS_TOPIC: TopicBundle = defineTopic(
    "loops_basics",
    M2_LOOPS_POOL as any,
    M2_LOOPS_HANDLERS as any,
);