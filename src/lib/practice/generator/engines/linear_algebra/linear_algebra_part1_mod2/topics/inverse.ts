import { defineTopic } from "@/lib/practice/generator/engines/utils";
import { LA_TOPIC_MOD2 } from "@/lib/practice/catalog/subjects/linear_algebra/slugs";

import {
    fmtMat,
    makeLAMatrixInputOut,
    makeLAStaticSingleChoiceHandler,
    type Handler,
    type HandlerArgs,
    type TopicBundle,
} from "@/lib/practice/generator/engines/linear_algebra/_shared";

export const M2_INVERSE_POOL = [
    { key: "la_m2_inverse_definition", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_m2_inverse_identity", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_m2_inverse_exists_det", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_m2_inverse_2x2_input", w: 1, kind: "matrix_input", purpose: "quiz" },
    { key: "la_m2_inverse_solve_system", w: 1, kind: "single_choice", purpose: "quiz" },
] as const;

export type M2InverseKey = (typeof M2_INVERSE_POOL)[number]["key"];

export const M2_INVERSE_HANDLERS: Record<M2InverseKey, Handler> = {
    la_m2_inverse_definition: makeLAStaticSingleChoiceHandler(
        "la_m2_inverse_definition",
        "d",
    ),
    la_m2_inverse_identity: makeLAStaticSingleChoiceHandler(
        "la_m2_inverse_identity",
        "a",
    ),
    la_m2_inverse_exists_det: makeLAStaticSingleChoiceHandler(
        "la_m2_inverse_exists_det",
        "c",
    ),

    la_m2_inverse_2x2_input: ({ rng, diff, id, topic }: HandlerArgs) => {
        const choices = [
            {
                A: [
                    [1, 1],
                    [1, 0],
                ],
                inv: [
                    [0, 1],
                    [1, -1],
                ],
            },
            {
                A: [
                    [1, 2],
                    [0, 1],
                ],
                inv: [
                    [1, -2],
                    [0, 1],
                ],
            },
            {
                A: [
                    [2, 1],
                    [1, 1],
                ],
                inv: [
                    [1, -1],
                    [-1, 2],
                ],
            },
        ] as const;

        const picked = rng.pick(choices);

        return makeLAMatrixInputOut({
            archetype: "la_m2_inverse_2x2_input",
            id,
            topic,
            diff,
            title: "@:quiz.la_m2_inverse_2x2_input.title",
            prompt: String.raw`
Let

$$
A=${fmtMat(picked.A as unknown as number[][])}.
$$

Compute $A^{-1}$ and enter the inverse matrix.
`.trim(),
            hint: "@:quiz.la_m2_inverse_2x2_input.hint",
            values: picked.inv as unknown as number[][],
        });
    },

    la_m2_inverse_solve_system: makeLAStaticSingleChoiceHandler(
        "la_m2_inverse_solve_system",
        "b",
    ),
};

export const LA_M2_INVERSE_TOPIC: TopicBundle = defineTopic(
    LA_TOPIC_MOD2.inverse,
    M2_INVERSE_POOL as any,
    M2_INVERSE_HANDLERS as any,
);