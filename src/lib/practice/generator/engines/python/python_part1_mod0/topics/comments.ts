// src/lib/practice/generator/engines/python/python_part1_mod0/topics/comments.ts
import type { Handler } from "../../python_shared/_shared";
import { makeSingleChoiceOut } from "../../python_shared/_shared";

// ✅ Source of truth: includes key + weight + kind
export const M0_COMMENTS_POOL = [
    { key: "m0_comments_symbol", w: 1, kind: "single_choice" },
    { key: "m0_comments_ignored_by_python", w: 1, kind: "single_choice" },
    { key: "m0_comments_best_reason", w: 1, kind: "single_choice" },
] as const;

// ✅ Derive keys from pool (for routing + validation)
export type M0CommentsKey = (typeof M0_COMMENTS_POOL)[number]["key"];
export const M0_COMMENTS_VALID_KEYS = M0_COMMENTS_POOL.map((p) => p.key) as M0CommentsKey[];

// ✅ Handlers keyed by the derived key union
export const M0_COMMENTS_HANDLERS: Record<M0CommentsKey, Handler> = {
    m0_comments_symbol: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "m0_comments_symbol",
            id,
            topic,
            diff,
            title: "Comment symbol (#)",
            prompt: "Which symbol starts a single-line comment in Python?",
            options: [
                { id: "a", text: "`//`" },
                { id: "b", text: "`#`" },
                { id: "c", text: "`/* */`" },
            ],
            answerOptionId: "b",
            hint: "Python uses # for single-line comments.",
        }),

    m0_comments_ignored_by_python: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "m0_comments_ignored_by_python",
            id,
            topic,
            diff,
            title: "Python ignores comments",
            prompt: "Comments are mainly for:",
            options: [
                { id: "a", text: "Humans reading the code" },
                { id: "b", text: "Making Python run faster" },
                { id: "c", text: "Changing the output automatically" },
            ],
            answerOptionId: "a",
            hint: "Python ignores comments; they help humans understand the code.",
        }),

    m0_comments_best_reason: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "m0_comments_best_reason",
            id,
            topic,
            diff,
            title: "Best reason to comment",
            prompt: "Which is the best reason to write a comment?",
            options: [
                { id: "a", text: "To repeat exactly what the code already says" },
                { id: "b", text: "To explain intent or a tricky step" },
                { id: "c", text: "To make the file longer" },
            ],
            answerOptionId: "b",
            hint: "Good comments explain intent (the why), not obvious code (the what).",
        }),
};