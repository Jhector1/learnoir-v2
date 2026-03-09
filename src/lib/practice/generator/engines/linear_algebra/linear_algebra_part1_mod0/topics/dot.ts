import { defineTopic, makeSingleChoiceOut } from "@/lib/practice/generator/engines/utils";
import { LA_TOPIC_MOD0 } from "@/lib/practice/catalog/subjects/linear_algebra/slugs";

import {
    buildLAOptions,
    dot,
    fmtCol,
    fmtVec2,
    makeLANumericOut,
    makeLAStaticSingleChoiceHandler,
    pickLen,
    randNonZeroInt,
    type Handler,
    type HandlerArgs,
    type TopicBundle,
    vecInts,
} from "@/lib/practice/generator/engines/linear_algebra/_shared";

export const M0_DOT_POOL = [
    { key: "la_dot_numeric", w: 1, kind: "numeric", purpose: "quiz" },
    { key: "la_dot_sign_angle", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_dot_zero_means", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_dot_commutative", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_dot_self_norm", w: 1, kind: "single_choice", purpose: "quiz" },
] as const;

export type M0DotKey = (typeof M0_DOT_POOL)[number]["key"];

export const M0_DOT_HANDLERS: Record<M0DotKey, Handler> = {
    la_dot_numeric: ({ rng, diff, id, topic }: HandlerArgs) => {
        const n = pickLen(rng, diff);
        const a = vecInts(rng, n, 5, false);
        const b = vecInts(rng, n, 5, false);

        return makeLANumericOut({
            archetype: "la_dot_numeric",
            id,
            topic,
            diff,
            title: "@:quiz.la_dot_numeric.title",
            prompt: String.raw`
Let

$$
a=${fmtCol(a)},
\qquad
b=${fmtCol(b)}.
$$

Compute

$$
a\cdot b.
$$
`.trim(),
            hint: "@:quiz.la_dot_numeric.hint",
            value: dot(a, b),
            tolerance: 0,
        });
    },

    la_dot_sign_angle: ({ rng, diff, id, topic }: HandlerArgs) => {
        const a = [randNonZeroInt(rng, -5, 5), randNonZeroInt(rng, -5, 5)];
        const kind = rng.pick(["positive", "negative", "zero"] as const);

        let b = [0, 0];
        if (kind === "positive") b = [a[0], a[1]];
        else if (kind === "negative") b = [-a[0], -a[1]];
        else b = [-a[1], a[0]];

        return makeSingleChoiceOut({
            archetype: "la_dot_sign_angle",
            id,
            topic,
            diff,
            title: "@:quiz.la_dot_sign_angle.title",
            prompt: String.raw`
Let

$$
a=${fmtVec2(a[0], a[1])},
\qquad
b=${fmtVec2(b[0], b[1])}.
$$

What kind of angle lies between them?
`.trim(),
            options: buildLAOptions("la_dot_sign_angle", ["a", "b", "c"]),
            answerOptionId: kind === "positive" ? "a" : kind === "zero" ? "b" : "c",
            hint: "@:quiz.la_dot_sign_angle.hint",
        });
    },

    la_dot_zero_means: makeLAStaticSingleChoiceHandler(
        "la_dot_zero_means",
        "b",
        ["a", "b", "c", "d"],
    ),

    la_dot_commutative: makeLAStaticSingleChoiceHandler(
        "la_dot_commutative",
        "a",
        ["a", "b", "c", "d"],
    ),

    la_dot_self_norm: makeLAStaticSingleChoiceHandler(
        "la_dot_self_norm",
        "c",
        ["a", "b", "c", "d"],
    ),
};

export const LA_DOT_TOPIC: TopicBundle = defineTopic(
    LA_TOPIC_MOD0.dot,
    M0_DOT_POOL as any,
    M0_DOT_HANDLERS as any,
);