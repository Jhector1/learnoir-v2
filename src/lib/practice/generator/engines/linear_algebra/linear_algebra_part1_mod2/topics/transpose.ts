import { defineTopic, makeSingleChoiceOut } from "@/lib/practice/generator/engines/utils";
import { LA_TOPIC_MOD2 } from "@/lib/practice/catalog/subjects/linear_algebra/slugs";

import {
    fmtMat,
    makeLAMatrixInputOut,
    makeLAStaticSingleChoiceHandler,
    type Handler,
    type HandlerArgs,
    type TopicBundle,
} from "@/lib/practice/generator/engines/linear_algebra/_shared";

export const M2_TRANSPOSE_POOL = [
    { key: "la_m2_transpose_shape", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_m2_transpose_column_to_row", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_m2_transpose_sum", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_m2_transpose_product_order", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_m2_transpose_compute_input", w: 1, kind: "matrix_input", purpose: "quiz" },
] as const;

export type M2TransposeKey = (typeof M2_TRANSPOSE_POOL)[number]["key"];

export const M2_TRANSPOSE_HANDLERS: Record<M2TransposeKey, Handler> = {
    la_m2_transpose_shape: ({ rng, diff, id, topic }: HandlerArgs) => {
        const m = rng.pick([2, 3] as const);
        const n = rng.pick([2, 4] as const);

        return makeSingleChoiceOut({
            archetype: "la_m2_transpose_shape",
            id,
            topic,
            diff,
            title: "@:quiz.la_m2_transpose_shape.title",
            prompt: String.raw`
If a matrix $A$ has shape ${m}×${n}, what shape does $A^T$ have?
`.trim(),
            options: [
                { id: "a", text: `${m}×${n}` },
                { id: "b", text: `${n}×${m}` },
                { id: "c", text: `${m}×${m}` },
                { id: "d", text: `${n}×${n}` },
            ],
            answerOptionId: "b",
            hint: "@:quiz.la_m2_transpose_shape.hint",
        });
    },

    la_m2_transpose_column_to_row: makeLAStaticSingleChoiceHandler(
        "la_m2_transpose_column_to_row",
        "a",
    ),
    la_m2_transpose_sum: makeLAStaticSingleChoiceHandler(
        "la_m2_transpose_sum",
        "c",
    ),
    la_m2_transpose_product_order: makeLAStaticSingleChoiceHandler(
        "la_m2_transpose_product_order",
        "d",
    ),

    la_m2_transpose_compute_input: ({ rng, diff, id, topic }: HandlerArgs) => {
        const A = [
            [rng.int(-3, 3), rng.int(-3, 3), rng.int(-3, 3)],
            [rng.int(-3, 3), rng.int(-3, 3), rng.int(-3, 3)],
        ];
        const AT = [
            [A[0][0], A[1][0]],
            [A[0][1], A[1][1]],
            [A[0][2], A[1][2]],
        ];

        return makeLAMatrixInputOut({
            archetype: "la_m2_transpose_compute_input",
            id,
            topic,
            diff,
            title: "@:quiz.la_m2_transpose_compute_input.title",
            prompt: String.raw`
Let

$$
A=${fmtMat(A)}.
$$

Compute $A^T$ and enter the transposed matrix.
`.trim(),
            hint: "@:quiz.la_m2_transpose_compute_input.hint",
            values: AT,
        });
    },
};

export const LA_M2_TRANSPOSE_TOPIC: TopicBundle = defineTopic(
    LA_TOPIC_MOD2.transpose,
    M2_TRANSPOSE_POOL as any,
    M2_TRANSPOSE_HANDLERS as any,
);