// src/lib/practice/generator/engines/python/python_part1_mod1/topics/errors.ts
import type { CodeInputExercise } from "../../../../../types";
import { defineTopic, Handler, makeSingleChoiceOut, TopicBundle } from "@/lib/practice/generator/engines/utils";
import { makeCodeExpected, safeInt, terminalFence } from "../../_shared";

export const M1_ERRORS_POOL = [
    { key: "m1_types_errors_sc", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "m1_err_nameerror_sc", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "m1_err_typeerror_sc", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "m1_err_valueerror_sc", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "m1_err_debug_combo_sc", w: 1, kind: "single_choice", purpose: "quiz" },

    { key: "m1_err_fix_type_mismatch_code", w: 1, kind: "code_input", purpose: "quiz" },
    { key: "m1_err_parse_age_safely_code", w: 1, kind: "code_input", purpose: "quiz" },
] as const;

export type M1ErrorsKey = (typeof M1_ERRORS_POOL)[number]["key"];

export const M1_ERRORS_HANDLERS: Record<M1ErrorsKey, Handler> = {
    /* ------------------------------ single choice ------------------------------ */

    m1_types_errors_sc: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "m1_types_errors_sc",
            id,
            topic,
            diff,
            title: "Match the error to the problem",
            prompt: String.raw`
A student runs this code:

~~~python
age = input("Age: ")
print(age + 1)
~~~

What error will Python raise?
`.trim(),
            options: [
                { id: "a", text: "NameError" },
                { id: "b", text: "TypeError" },
                { id: "c", text: "ValueError" },
            ],
            answerOptionId: "b",
            hint: "input() returns a string, and you can’t add a string and an int.",
        }),

    m1_err_nameerror_sc: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "m1_err_nameerror_sc",
            id,
            topic,
            diff,
            title: "NameError: label doesn’t exist",
            prompt: String.raw`
What error do you get if you run this?

~~~python
print(score)
~~~

(Assume \`score\` was never created.)
`.trim(),
            options: [
                { id: "a", text: "NameError" },
                { id: "b", text: "TypeError" },
                { id: "c", text: "ValueError" },
            ],
            answerOptionId: "a",
            hint: "NameError happens when you use a variable name that doesn’t exist yet.",
        }),

    m1_err_typeerror_sc: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "m1_err_typeerror_sc",
            id,
            topic,
            diff,
            title: "TypeError: types don’t mix",
            prompt: String.raw`
A shopping app stores the item count as a number:

~~~python
count = 3
print("Items: " + count)
~~~

What error will this cause?
`.trim(),
            options: [
                { id: "a", text: "NameError" },
                { id: "b", text: "TypeError" },
                { id: "c", text: "ValueError" },
            ],
            answerOptionId: "b",
            hint: "You can’t concatenate a string and an int. Convert with str(count).",
        }),

    m1_err_valueerror_sc: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "m1_err_valueerror_sc",
            id,
            topic,
            diff,
            title: "ValueError: invalid conversion",
            prompt: String.raw`
A user typed \`twelve\` for their age.

What happens here?

~~~python
age = int("twelve")
~~~
`.trim(),
            options: [
                { id: "a", text: "NameError" },
                { id: "b", text: "TypeError" },
                { id: "c", text: "ValueError" },
            ],
            answerOptionId: "c",
            hint: "ValueError happens when conversion fails because the text isn’t a valid number.",
        }),

    m1_err_debug_combo_sc: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "m1_err_debug_combo_sc",
            id,
            topic,
            diff,
            title: "Best quick debug combo",
            prompt: "When something behaves weirdly, what’s the best quick debug combo for beginners?",
            options: [
                { id: "a", text: "Print the value and print the type" },
                { id: "b", text: "Restart the computer" },
                { id: "c", text: "Delete the file and rewrite everything" },
            ],
            answerOptionId: "a",
            hint: "Value + type solves most beginner confusion fast.",
        }),

    /* -------------------------------- code input -------------------------------- */

    m1_err_fix_type_mismatch_code: ({ rng, diff, id, topic }) => {
        const a1 = safeInt(rng, 1, 50);
        const b1 = safeInt(rng, 1, 50);
        const a2 = safeInt(rng, 1, 50);
        const b2 = safeInt(rng, 1, 50);

        const exStdin = `${a1}\n${b1}\n`;
        const exStdout = `${a1 + b1}\n`;

        const exercise: CodeInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "code_input",
            title: "Fix the type mismatch (add two numbers)",
            prompt: String.raw`
A calculator app reads two numbers from the user.

Read TWO inputs.
Convert them to integers.
Print ONLY their sum.

${terminalFence(exStdin, exStdout)}
`.trim(),
            language: "python",
            starterCode: String.raw`a = input()
b = input()
# TODO: convert and print sum
`,
            hint: "int(a) and int(b)",
        };

        const expected = makeCodeExpected({
            language: "python",
            tests: [
                { stdin: `${a1}\n${b1}\n`, stdout: `${a1 + b1}\n`, match: "exact" },
                { stdin: `${a2}\n${b2}\n`, stdout: `${a2 + b2}\n`, match: "exact" },
            ],
            solutionCode: `a = int(input())\nb = int(input())\nprint(a + b)\n`,
        });

        return { archetype: "m1_err_fix_type_mismatch_code", exercise, expected };
    },

    m1_err_parse_age_safely_code: ({ diff, id, topic }) => {
        const ex1In = `16\n`;
        const ex1Out = `Next year = 17\n`;
        const ex2In = `twelve\n`;
        const ex2Out = `Invalid age\n`;

        const exercise: CodeInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "code_input",
            title: "Avoid ValueError (basic validation)",
            prompt: String.raw`
A website asks for age as text.

Read ONE input (a string).

Rules:
- If it looks like a whole number (digits only), convert it to int and print:
  Next year = <age+1>
- Otherwise print:
  Invalid age

Examples:

${terminalFence(ex1In, ex1Out)}

${terminalFence(ex2In, ex2Out)}
`.trim(),
            language: "python",
            starterCode: String.raw`text = input().strip()
# TODO
`,
            hint: "Use text.isdigit() to check. Then int(text).",
        };

        const expected = makeCodeExpected({
            language: "python",
            tests: [
                { stdin: `16\n`, stdout: `Next year = 17\n`, match: "exact" },
                { stdin: `twelve\n`, stdout: `Invalid age\n`, match: "exact" },
            ],
            solutionCode:
                `text = input().strip()\n` +
                `if text.isdigit():\n` +
                `    age = int(text)\n` +
                `    print(f"Next year = {age + 1}")\n` +
                `else:\n` +
                `    print("Invalid age")\n`,
        });

        return { archetype: "m1_err_parse_age_safely_code", exercise, expected };
    },
};

export const M1_ERRORS_TOPIC: TopicBundle = defineTopic(
    "errors_intro",
    M1_ERRORS_POOL as any,
    M1_ERRORS_HANDLERS as any,
);