import { defineTopic, makeSingleChoiceOut } from "@/lib/practice/generator/engines/utils";
import { LA_TOPIC_MOD0 } from "@/lib/practice/catalog/subjects/linear_algebra/slugs";

import {
    buildLAOptions,
    fmtCol,
    makeLANumericOut,
    makeLAStaticSingleChoiceHandler,
    pickLen,
    type Handler,
    type HandlerArgs,
    type TopicBundle,
    vecInts,
} from "@/lib/practice/generator/engines/linear_algebra/_shared";

export const M0_PRODUCTS_POOL = [
    { key: "la_products_hadamard_defined", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_products_outer_shape", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_products_outer_entry", w: 1, kind: "numeric", purpose: "quiz" },
    { key: "la_products_hadamard_vs_dot", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_products_hadamard_meaning", w: 1, kind: "single_choice", purpose: "quiz" },
] as const;

export type M0ProductsKey = (typeof M0_PRODUCTS_POOL)[number]["key"];

export const M0_PRODUCTS_HANDLERS: Record<M0ProductsKey, Handler> = {
    la_products_hadamard_defined: ({ rng, diff, id, topic }: HandlerArgs) => {
        const n = pickLen(rng, diff);
        const same = rng.int(0, 1) === 1;
        const m = same ? n : n + 1;

        const a = vecInts(rng, n, 4, false);
        const b = vecInts(rng, m, 4, false);

        return makeSingleChoiceOut({
            archetype: "la_products_hadamard_defined",
            id,
            topic,
            diff,
            title: "@:quiz.la_products_hadamard_defined.title",
            prompt: String.raw`
Let

$$
a=${fmtCol(a)},
\qquad
b=${fmtCol(b)}.
$$

Is the Hadamard product $$a\odot b$$ defined?
`.trim(),
            options: buildLAOptions("la_products_hadamard_defined", ["a", "b"]),
            answerOptionId: same ? "a" : "b",
            hint: "@:quiz.la_products_hadamard_defined.hint",
        });
    },

    la_products_outer_shape: ({ diff, id, topic }: HandlerArgs) => {
        const m = diff === "easy" ? 2 : 3;
        const n = diff === "easy" ? 3 : 4;

        return makeSingleChoiceOut({
            archetype: "la_products_outer_shape",
            id,
            topic,
            diff,
            title: "@:quiz.la_products_outer_shape.title",
            prompt: String.raw`
If

$$
a\in\mathbb{R}^{${m}}
\qquad\text{and}\qquad
b\in\mathbb{R}^{${n}},
$$

what is the shape of the outer product $$ab^T$$?
`.trim(),
            options: [
                { id: "a", text: `${m} × ${n}` },
                { id: "b", text: `${n} × ${m}` },
                { id: "c", text: `${m} × 1` },
                { id: "d", text: `1 × ${n}` },
            ],
            answerOptionId: "a",
            hint: "@:quiz.la_products_outer_shape.hint",
        });
    },

    la_products_outer_entry: ({ rng, diff, id, topic }: HandlerArgs) => {
        const a = vecInts(rng, 2, 4, false);
        const b = vecInts(rng, 3, 4, false);
        const i = rng.int(1, 2);
        const j = rng.int(1, 3);

        return makeLANumericOut({
            archetype: "la_products_outer_entry",
            id,
            topic,
            diff,
            title: "@:quiz.la_products_outer_entry.title",
            prompt: String.raw`
Let

$$
a=${fmtCol(a)},
\qquad
b^T=\begin{bmatrix}${b.join(" & ")}\end{bmatrix}.
$$

Compute the entry

$$
(ab^T)_{${i}${j}}.
$$
`.trim(),
            hint: "@:quiz.la_products_outer_entry.hint",
            value: a[i - 1] * b[j - 1],
            tolerance: 0,
        });
    },

    la_products_hadamard_vs_dot: makeLAStaticSingleChoiceHandler(
        "la_products_hadamard_vs_dot",
        "b",
        ["a", "b", "c", "d"],
    ),

    la_products_hadamard_meaning: makeLAStaticSingleChoiceHandler(
        "la_products_hadamard_meaning",
        "a",
        ["a", "b", "c", "d"],
    ),
};

export const LA_PRODUCTS_TOPIC: TopicBundle = defineTopic(
    LA_TOPIC_MOD0.products,
    M0_PRODUCTS_POOL as any,
    M0_PRODUCTS_HANDLERS as any,
);