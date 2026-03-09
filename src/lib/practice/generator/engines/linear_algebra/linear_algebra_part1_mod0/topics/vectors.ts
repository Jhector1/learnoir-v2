import { defineTopic, makeSingleChoiceOut } from "@/lib/practice/generator/engines/utils";
import { LA_TOPIC_MOD0 } from "@/lib/practice/catalog/subjects/linear_algebra/slugs";

import {
    addVec,
    buildLAOptions,
    fmtCol,
    makeLAMatrixInputOut,
    mulScalar,
    pickLen,
    type Handler,
    type HandlerArgs,
    type TopicBundle,
    vecInts,
    vecToCol,
} from "@/lib/practice/generator/engines/linear_algebra/_shared";

export const M0_VECTORS_POOL = [
    { key: "la_vectors_dimension", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_vectors_orientation", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_vectors_membership", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_vectors_add_defined", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_vectors_scalar_mult_input", w: 1, kind: "matrix_input", purpose: "quiz" },
    { key: "la_vectors_add_input", w: 1, kind: "matrix_input", purpose: "quiz" },
] as const;

export type M0VectorsKey = (typeof M0_VECTORS_POOL)[number]["key"];

export const M0_VECTORS_HANDLERS: Record<M0VectorsKey, Handler> = {
    la_vectors_dimension: ({ rng, diff, id, topic }: HandlerArgs) => {
        const n = pickLen(rng, diff);
        const v = vecInts(rng, n, 6, false);

        return makeSingleChoiceOut({
            archetype: "la_vectors_dimension",
            id,
            topic,
            diff,
            title: "@:quiz.la_vectors_dimension.title",
            prompt: String.raw`
Consider

$$
v=${fmtCol(v)}.
$$

Which space does this vector belong to?
`.trim(),
            options: buildLAOptions("la_vectors_dimension", ["a", "b", "c", "d"]),
            answerOptionId: "a",
            hint: "@:quiz.la_vectors_dimension.hint",
        });
    },

    la_vectors_orientation: ({ rng, diff, id, topic }: HandlerArgs) => {
        const n = pickLen(rng, diff);
        const v = vecInts(rng, n, 5, false);
        const asRow = rng.int(0, 1) === 1;
        const display = asRow
            ? String.raw`\begin{bmatrix}${v.join(" & ")}\end{bmatrix}`
            : fmtCol(v);

        return makeSingleChoiceOut({
            archetype: "la_vectors_orientation",
            id,
            topic,
            diff,
            title: "@:quiz.la_vectors_orientation.title",
            prompt: String.raw`
Look at

$$
v=${display}.
$$

How is it written?
`.trim(),
            options: buildLAOptions("la_vectors_orientation", ["a", "b", "c"]),
            answerOptionId: asRow ? "a" : "b",
            hint: "@:quiz.la_vectors_orientation.hint",
        });
    },

    la_vectors_membership: ({ rng, diff, id, topic }: HandlerArgs) => {
        const n = pickLen(rng, diff);
        const v = vecInts(rng, n, 5, false);
        const wrong1 = Math.max(2, n - 1);
        const wrong2 = n + 1;

        return makeSingleChoiceOut({
            archetype: "la_vectors_membership",
            id,
            topic,
            diff,
            title: "@:quiz.la_vectors_membership.title",
            prompt: String.raw`
Let

$$
v=${fmtCol(v)}.
$$

Which statement is correct?
`.trim(),
            options: [
                { id: "a", text: String.raw`$$v\in\mathbb{R}^{${n}}$$` },
                { id: "b", text: String.raw`$$v\in\mathbb{R}^{${wrong1}}$$` },
                { id: "c", text: String.raw`$$v\in\mathbb{R}^{${wrong2}}$$` },
                { id: "d", text: "@:quiz.la_vectors_membership.options.d" },
            ],
            answerOptionId: "a",
            hint: "@:quiz.la_vectors_membership.hint",
        });
    },

    la_vectors_add_defined: ({ rng, diff, id, topic }: HandlerArgs) => {
        const n1 = pickLen(rng, diff);
        const same = rng.int(0, 1) === 1;
        const n2 = same ? n1 : n1 + 1;

        const a = vecInts(rng, n1, 5, false);
        const b = vecInts(rng, n2, 5, false);

        return makeSingleChoiceOut({
            archetype: "la_vectors_add_defined",
            id,
            topic,
            diff,
            title: "@:quiz.la_vectors_add_defined.title",
            prompt: String.raw`
Let

$$
a=${fmtCol(a)},
\qquad
b=${fmtCol(b)}.
$$

Is the sum $$a+b$$ defined?
`.trim(),
            options: buildLAOptions("la_vectors_add_defined", ["a", "b"]),
            answerOptionId: same ? "a" : "b",
            hint: "@:quiz.la_vectors_add_defined.hint",
        });
    },

    la_vectors_scalar_mult_input: ({ rng, diff, id, topic }: HandlerArgs) => {
        const n = pickLen(rng, diff);
        const v = vecInts(rng, n, 4, false);
        const s = rng.pick([-3, -2, 2, 3] as const);

        return makeLAMatrixInputOut({
            archetype: "la_vectors_scalar_mult_input",
            id,
            topic,
            diff,
            title: "@:quiz.la_vectors_scalar_mult_input.title",
            prompt: String.raw`
Let

$$
v=${fmtCol(v)}.
$$

Compute

$$
${s}v
$$

and enter the answer as a column vector.
`.trim(),
            hint: "@:quiz.la_vectors_scalar_mult_input.hint",
            values: vecToCol(mulScalar(s, v)),
        });
    },

    la_vectors_add_input: ({ rng, diff, id, topic }: HandlerArgs) => {
        const n = pickLen(rng, diff);
        const a = vecInts(rng, n, 5, false);
        const b = vecInts(rng, n, 5, false);

        return makeLAMatrixInputOut({
            archetype: "la_vectors_add_input",
            id,
            topic,
            diff,
            title: "@:quiz.la_vectors_add_input.title",
            prompt: String.raw`
Let

$$
a=${fmtCol(a)},
\qquad
b=${fmtCol(b)}.
$$

Compute

$$
a+b
$$

and enter the result as a column vector.
`.trim(),
            hint: "@:quiz.la_vectors_add_input.hint",
            values: vecToCol(addVec(a, b)),
        });
    },
};

export const LA_VECTORS_TOPIC: TopicBundle = defineTopic(
    LA_TOPIC_MOD0.vectors,
    M0_VECTORS_POOL as any,
    M0_VECTORS_HANDLERS as any,
);