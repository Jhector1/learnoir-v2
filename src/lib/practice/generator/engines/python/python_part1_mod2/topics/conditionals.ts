// src/lib/practice/generator/engines/python/python_part1_mod2/topics/conditionals.ts
import type { CodeInputExercise } from "../../../../../types";
import type { Handler } from "../../python_shared/_shared";
import { makeCodeExpected, safeInt, pickName, makeSingleChoiceOut } from "../../python_shared/_shared";

export const M2_CONDITIONALS_POOL = [
    { key: "m2_cond_age_gate_code", w: 1, kind: "code_input",purpose: "project" },
    { key: "m2_cond_member_discount_code", w: 1, kind: "code_input",purpose: "project" },
    { key: "m2_cond_password_check_code", w: 1, kind: "code_input" ,purpose: "project"},
    { key: "m2_cond_elif_meaning_sc", w: 1, kind: "single_choice" ,purpose: "project"},
] as const;

export type M2ConditionalsKey = (typeof M2_CONDITIONALS_POOL)[number]["key"];
export const M2_CONDITIONALS_VALID_KEYS = M2_CONDITIONALS_POOL.map((p) => p.key) as M2ConditionalsKey[];

function pickDifferentInt(rng: any, lo: number, hi: number, avoid: number) {
    let x = safeInt(rng, lo, hi);
    for (let i = 0; i < 6 && x === avoid; i++) x = safeInt(rng, lo, hi);
    return x;
}

export const M2_CONDITIONALS_HANDLERS: Record<M2ConditionalsKey, Handler> = {
    m2_cond_age_gate_code: ({ rng, diff, id, topic }) => {
        const a1 = safeInt(rng, 12, 17);
        const a2 = safeInt(rng, 18, 30);

        const exercise: CodeInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "code_input",
            title: "Snack Shop Gate: adult or minor",
            prompt: String.raw`
Story: you’re building a kiosk at a snack shop. Some items are 18+.

Read **ONE integer** age.

If age >= 18 print:
ALLOWED

Else print:
DENIED

~~~terminal
@meta Idle • Accepted • 0.026s • 3MB
$ input
16

$ output
DENIED
~~~
`.trim(),
            language: "python",
            starterCode: String.raw`age = int(input())
# TODO: if/else
# TODO: print ALLOWED or DENIED
`,
            hint: "Use: if age >= 18: ... else: ...",
        };

        const expected = makeCodeExpected({
            language: "python",
            tests: [
                { stdin: `${a1}\n`, stdout: `DENIED\n`, match: "exact" },
                { stdin: `${a2}\n`, stdout: `ALLOWED\n`, match: "exact" },
            ],
            solutionCode: `age = int(input())\nprint("ALLOWED" if age >= 18 else "DENIED")\n`,
        });

        return { archetype: "m2_cond_age_gate_code", exercise, expected };
    },

    m2_cond_member_discount_code: ({ rng, diff, id, topic }) => {
        const subtotal1 = safeInt(rng, 10, 200);
        const subtotal2 = pickDifferentInt(rng, 10, 200, subtotal1);

        // member flag: y/n (case-insensitive)
        const flag1 = "y";
        const flag2 = "n";

        const totalMember = (s: number) => s - Math.floor((s * 10) / 100);

        const exercise: CodeInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "code_input",
            title: "Snack Shop Discount: member saves 10%",
            prompt: String.raw`
Story: the snack shop gives members a 10% discount.

Read TWO inputs:
1) subtotal (integer dollars)
2) member flag (y/n)

Rules:
- if member is "y" (or "Y"), apply 10% discount using integer math
- otherwise no discount

Print exactly:
Total = <total>

~~~terminal
@meta Idle • Accepted • 0.026s • 3MB
$ input
50
y

$ output
Total = 45
~~~
`.trim(),
            language: "python",
            starterCode: String.raw`subtotal = int(input())
member = input().strip()
# TODO: apply discount if member is y/Y
# TODO: print Total = <total>
`,
            hint: `Use: member.lower() == "y" and discount = subtotal * 10 // 100`,
        };

        const expected = makeCodeExpected({
            language: "python",
            tests: [
                { stdin: `${subtotal1}\n${flag1}\n`, stdout: `Total = ${totalMember(subtotal1)}\n`, match: "exact" },
                { stdin: `${subtotal2}\n${flag2}\n`, stdout: `Total = ${subtotal2}\n`, match: "exact" },
            ],
            solutionCode:
                `subtotal = int(input())\n` +
                `member = input().strip().lower()\n` +
                `total = subtotal\n` +
                `if member == "y":\n` +
                `    total = subtotal - (subtotal * 10 // 100)\n` +
                `print(f"Total = {total}")\n`,
        });

        return { archetype: "m2_cond_member_discount_code", exercise, expected };
    },

    m2_cond_password_check_code: ({ rng, diff, id, topic }) => {
        const correct = "letmein";
        const wrong = pickName(rng); // random-ish wrong password

        const exercise: CodeInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "code_input",
            title: "Kiosk Login: password check",
            prompt: String.raw`
Story: the kiosk has an admin mode.

Read ONE input password.

If password == "letmein" print:
Logged in

Else print:
Wrong password

~~~terminal
@meta Idle • Accepted • 0.026s • 3MB
$ input
letmein

$ output
Logged in
~~~
`.trim(),
            language: "python",
            starterCode: String.raw`pw = input().strip()
# TODO: compare pw
# TODO: print Logged in or Wrong password
`,
            hint: `Use == (comparison), not = (assignment).`,
        };

        const expected = makeCodeExpected({
            language: "python",
            tests: [
                { stdin: `${correct}\n`, stdout: `Logged in\n`, match: "exact" },
                { stdin: `${wrong}\n`, stdout: `Wrong password\n`, match: "exact" },
            ],
            solutionCode:
                `pw = input().strip()\n` +
                `print("Logged in" if pw == "letmein" else "Wrong password")\n`,
        });

        return { archetype: "m2_cond_password_check_code", exercise, expected };
    },

    m2_cond_elif_meaning_sc: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "m2_cond_elif_meaning_sc",
            id,
            topic,
            diff,
            title: "`elif` meaning",
            prompt: "In Python, `elif` is best described as:",
            options: [
                { id: "a", text: "A loop that repeats code" },
                { id: "b", text: "An 'else if' branch (another condition to test)" },
                { id: "c", text: "A way to import libraries" },
            ],
            answerOptionId: "b",
            hint: "`elif` = else if (check another condition).",
        }),
};