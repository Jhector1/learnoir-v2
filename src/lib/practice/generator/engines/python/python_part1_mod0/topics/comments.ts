import { defineTopic, Handler, makeSingleChoiceOut, TopicBundle } from "@/lib/practice/generator/engines/utils";

export const M0_COMMENTS_POOL = [
    { key: "m0_comments_symbol", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "m0_comments_ignored_by_python", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "m0_comments_best_reason", w: 1, kind: "single_choice", purpose: "quiz" },
] as const;

export type M0CommentsKey = (typeof M0_COMMENTS_POOL)[number]["key"];

function Q(key: M0CommentsKey) {
    return `quiz.${key}`;
}

export const M0_COMMENTS_HANDLERS: Record<M0CommentsKey, Handler> = {
    m0_comments_symbol: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "m0_comments_symbol",
            id,
            topic,
            diff,

            // ✅ these keys match your JSON; UI will resolve @:
            title: `@:${Q("m0_comments_symbol")}.title`,
            prompt: `@:${Q("m0_comments_symbol")}.prompt`,
            options: [
                { id: "a", text: `@:${Q("m0_comments_symbol")}.options.a` },
                { id: "b", text: `@:${Q("m0_comments_symbol")}.options.b` },
                { id: "c", text: `@:${Q("m0_comments_symbol")}.options.c` },
            ],
            answerOptionId: "b",
            hint: `@:${Q("m0_comments_symbol")}.hint`,
        }),

    m0_comments_ignored_by_python: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "m0_comments_ignored_by_python",
            id,
            topic,
            diff,
            title: `@:${Q("m0_comments_ignored_by_python")}.title`,
            prompt: `@:${Q("m0_comments_ignored_by_python")}.prompt`,
            options: [
                { id: "a", text: `@:${Q("m0_comments_ignored_by_python")}.options.a` },
                { id: "b", text: `@:${Q("m0_comments_ignored_by_python")}.options.b` },
                { id: "c", text: `@:${Q("m0_comments_ignored_by_python")}.options.c` },
            ],
            answerOptionId: "a",
            hint: `@:${Q("m0_comments_ignored_by_python")}.hint`,
        }),

    m0_comments_best_reason: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "m0_comments_best_reason",
            id,
            topic,
            diff,
            title: `@:${Q("m0_comments_best_reason")}.title`,
            prompt: `@:${Q("m0_comments_best_reason")}.prompt`,
            options: [
                { id: "a", text: `@:${Q("m0_comments_best_reason")}.options.a` },
                { id: "b", text: `@:${Q("m0_comments_best_reason")}.options.b` },
                { id: "c", text: `@:${Q("m0_comments_best_reason")}.options.c` },
            ],
            answerOptionId: "b",
            hint: `@:${Q("m0_comments_best_reason")}.hint`,
        }),
};

export const M0_COMMENTS_TOPIC: TopicBundle = defineTopic(
    "comments_intro",
    M0_COMMENTS_POOL as any,
    M0_COMMENTS_HANDLERS as any,
);