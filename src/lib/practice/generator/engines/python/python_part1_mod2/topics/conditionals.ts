import {
    defineTopic,
    type Handler,
    type TopicBundle,
    type HandlerArgs,
    makeSingleChoiceOut,
    makeMultiChoiceOut,
    makeCodeInputOut,
} from "@/lib/practice/generator/engines/utils";

import { makeCodeExpected, safeInt, pickName } from "../../_shared";
import type { ExerciseKind } from "@/lib/practice/types";
import type { GenOut } from "@/lib/practice/generator/shared/expected";

// -----------------------------
// Pool
// -----------------------------
export const M2_CONDITIONALS_POOL = [
    // project (code_input)
    { key: "m2_cond_age_gate_code", w: 1, kind: "code_input", purpose: "project" },
    { key: "m2_cond_member_discount_code", w: 1, kind: "code_input", purpose: "project" },
    { key: "m2_cond_password_check_code", w: 1, kind: "code_input", purpose: "project" },

    // quiz
    { key: "m2_cond_elif_meaning_sc", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "m2_cond_indent_matters_sc", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "m2_cond_elif_order_sc", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "m2_cond_comparison_vs_assignment_sc", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "m2_cond_and_or_sc", w: 1, kind: "single_choice", purpose: "quiz" },

    { key: "m2_cond_falsey_values_mc", w: 1, kind: "multi_choice", purpose: "quiz" },
    { key: "m2_cond_logical_ops_mc", w: 1, kind: "multi_choice", purpose: "quiz" },
] as const;

export type M2ConditionalsKey = (typeof M2_CONDITIONALS_POOL)[number]["key"];

function pickDifferentInt(rng: any, lo: number, hi: number, avoid: number) {
    let x = safeInt(rng, lo, hi);
    for (let i = 0; i < 6 && x === avoid; i++) x = safeInt(rng, lo, hi);
    return x;
}

function Q(key: M2ConditionalsKey) {
    return `quiz.${key}`;
}

// -----------------------------
// Helpers
// -----------------------------
type OptId = "a" | "b" | "c" | "d";
type AnyOut = GenOut<ExerciseKind>;

function buildOptions(key: M2ConditionalsKey, ids: OptId[]) {
    return ids.map((id) => ({
        id,
        text: `@:${Q(key)}.options.${id}`,
    }));
}

function sc(
    key: M2ConditionalsKey,
    answerOptionId: OptId,
    optionIds: OptId[] = ["a", "b", "c"]
): Handler {
    return ({ diff, id, topic }: HandlerArgs) =>
        makeSingleChoiceOut({
            archetype: key,
            id,
            topic,
            diff,
            title: `@:${Q(key)}.title`,
            prompt: `@:${Q(key)}.prompt`,
            options: buildOptions(key, optionIds),
            answerOptionId,
            hint: `@:${Q(key)}.hint`,
        }) as unknown as AnyOut; // ✅ widen invariant GenOut
}

function mc(
    key: M2ConditionalsKey,
    answerOptionIds: OptId[],
    optionIds: OptId[] = ["a", "b", "c", "d"]
): Handler {
    return ({ diff, id, topic }: HandlerArgs) =>
        makeMultiChoiceOut({
            archetype: key,
            id,
            topic,
            diff,
            title: `@:${Q(key)}.title`,
            prompt: `@:${Q(key)}.prompt`,
            options: buildOptions(key, optionIds),
            answerOptionIds,
            hint: `@:${Q(key)}.hint`,
        }) as unknown as AnyOut; // ✅ widen invariant GenOut
}

// -----------------------------
// Handlers
// -----------------------------
export const M2_CONDITIONALS_HANDLERS: Record<M2ConditionalsKey, Handler> = {
    // project: code_input
    m2_cond_age_gate_code: ({ rng, diff, id, topic }: HandlerArgs) => {
        const a1 = safeInt(rng, 12, 17);
        const a2 = safeInt(rng, 18, 30);

        return makeCodeInputOut({
            archetype: "m2_cond_age_gate_code",
            id,
            topic,
            diff,
            title: `@:${Q("m2_cond_age_gate_code")}.title`,
            prompt: `@:${Q("m2_cond_age_gate_code")}.prompt`,
            hint: `@:${Q("m2_cond_age_gate_code")}.hint`,
            language: "python",
            starterCode: String.raw`age = int(input())
# TODO: if/else
# TODO: print ALLOWED or DENIED
`.trim(),
            expected: makeCodeExpected({
                language: "python",
                tests: [
                    { stdin: `${a1}\n`, stdout: `DENIED\n`, match: "exact" },
                    { stdin: `${a2}\n`, stdout: `ALLOWED\n`, match: "exact" },
                ],
                solutionCode: `age = int(input())\nprint("ALLOWED" if age >= 18 else "DENIED")\n`,
            }),
            editorHeight: 360,
        }) as unknown as AnyOut; // ✅ widen
    },

    m2_cond_member_discount_code: ({ rng, diff, id, topic }: HandlerArgs) => {
        const subtotal1 = safeInt(rng, 10, 200);
        const subtotal2 = pickDifferentInt(rng, 10, 200, subtotal1);
        const totalMember = (s: number) => s - Math.floor((s * 10) / 100);

        return makeCodeInputOut({
            archetype: "m2_cond_member_discount_code",
            id,
            topic,
            diff,
            title: `@:${Q("m2_cond_member_discount_code")}.title`,
            prompt: `@:${Q("m2_cond_member_discount_code")}.prompt`,
            hint: `@:${Q("m2_cond_member_discount_code")}.hint`,
            language: "python",
            starterCode: String.raw`subtotal = int(input())
member = input().strip()
# TODO: apply discount if member is y/Y
# TODO: print Total = <total>
`.trim(),
            expected: makeCodeExpected({
                language: "python",
                tests: [
                    { stdin: `${subtotal1}\ny\n`, stdout: `Total = ${totalMember(subtotal1)}\n`, match: "exact" },
                    { stdin: `${subtotal2}\nn\n`, stdout: `Total = ${subtotal2}\n`, match: "exact" },
                ],
                solutionCode:
                    `subtotal = int(input())\n` +
                    `member = input().strip().lower()\n` +
                    `total = subtotal\n` +
                    `if member == "y":\n` +
                    `    total = subtotal - (subtotal * 10 // 100)\n` +
                    `print(f"Total = {total}")\n`,
            }),
            editorHeight: 420,
        }) as unknown as AnyOut; // ✅ widen
    },

    m2_cond_password_check_code: ({ rng, diff, id, topic }: HandlerArgs) => {
        const correct = "letmein";
        const wrong = pickName(rng);

        return makeCodeInputOut({
            archetype: "m2_cond_password_check_code",
            id,
            topic,
            diff,
            title: `@:${Q("m2_cond_password_check_code")}.title`,
            prompt: `@:${Q("m2_cond_password_check_code")}.prompt`,
            hint: `@:${Q("m2_cond_password_check_code")}.hint`,
            language: "python",
            starterCode: String.raw`pw = input().strip()
# TODO: compare pw
# TODO: print Logged in or Wrong password
`.trim(),
            expected: makeCodeExpected({
                language: "python",
                tests: [
                    { stdin: `${correct}\n`, stdout: `Logged in\n`, match: "exact" },
                    { stdin: `${wrong}\n`, stdout: `Wrong password\n`, match: "exact" },
                ],
                solutionCode: `pw = input().strip()\nprint("Logged in" if pw == "letmein" else "Wrong password")\n`,
            }),
            editorHeight: 360,
        }) as unknown as AnyOut; // ✅ widen
    },

    // quiz: single_choice
    m2_cond_elif_meaning_sc: sc("m2_cond_elif_meaning_sc", "b", ["a", "b", "c"]),
    m2_cond_indent_matters_sc: sc("m2_cond_indent_matters_sc", "c", ["a", "b", "c", "d"]),
    m2_cond_elif_order_sc: sc("m2_cond_elif_order_sc", "b", ["a", "b", "c"]),
    m2_cond_comparison_vs_assignment_sc: sc("m2_cond_comparison_vs_assignment_sc", "a", ["a", "b", "c", "d"]),
    m2_cond_and_or_sc: sc("m2_cond_and_or_sc", "b", ["a", "b", "c"]),

    // quiz: multi_choice
    m2_cond_falsey_values_mc: mc("m2_cond_falsey_values_mc", ["a", "b", "c"], ["a", "b", "c", "d"]),
    m2_cond_logical_ops_mc: mc("m2_cond_logical_ops_mc", ["a", "b", "c"], ["a", "b", "c", "d"]),
};

export const M2_CONDITIONALS_TOPIC: TopicBundle = defineTopic(
    "conditionals_basics",
    M2_CONDITIONALS_POOL as any,
    M2_CONDITIONALS_HANDLERS as any
);