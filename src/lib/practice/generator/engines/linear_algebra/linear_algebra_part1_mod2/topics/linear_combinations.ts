import { defineTopic } from "@/lib/practice/generator/engines/utils";
import { LA_TOPIC_MOD2 } from "@/lib/practice/catalog/subjects/linear_algebra/slugs";

import {
    addVec,
    fmtCol,
    makeLAMatrixInputOut,
    makeLAStaticSingleChoiceHandler,
    mulScalar,
    subVec,
    type Handler,
    type HandlerArgs,
    type TopicBundle,
    vecInts,
    vecToCol,
} from "@/lib/practice/generator/engines/linear_algebra/_shared";

export const M2_LINEAR_COMBINATIONS_POOL = [
    { key: "la_m2_linear_combination_definition", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_m2_span_meaning", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_m2_linear_combination_compute_input", w: 1, kind: "matrix_input", purpose: "quiz" },
    { key: "la_m2_span_membership", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_m2_coefficients_role", w: 1, kind: "single_choice", purpose: "quiz" },
] as const;

export type M2LinearCombinationsKey =
    (typeof M2_LINEAR_COMBINATIONS_POOL)[number]["key"];

export const M2_LINEAR_COMBINATIONS_HANDLERS: Record<M2LinearCombinationsKey, Handler> = {
    la_m2_linear_combination_definition: makeLAStaticSingleChoiceHandler(
        "la_m2_linear_combination_definition",
        "a",
    ),
    la_m2_span_meaning: makeLAStaticSingleChoiceHandler(
        "la_m2_span_meaning",
        "c",
    ),

    la_m2_linear_combination_compute_input: ({ rng, diff, id, topic }: HandlerArgs) => {
        const u = vecInts(rng, 2, 4, false);
        const v = vecInts(rng, 2, 4, false);
        const out = addVec(mulScalar(2, u), subVec(v, [0, 0]));

        return makeLAMatrixInputOut({
            archetype: "la_m2_linear_combination_compute_input",
            id,
            topic,
            diff,
            title: "@:quiz.la_m2_linear_combination_compute_input.title",
            prompt: String.raw`
Let

$$
u=${fmtCol(u)},
\qquad
v=${fmtCol(v)}.
$$

Compute the linear combination

$$
2u+v
$$

and enter the result as a column vector.
`.trim(),
            hint: "@:quiz.la_m2_linear_combination_compute_input.hint",
            values: vecToCol(out),
        });
    },

    la_m2_span_membership: makeLAStaticSingleChoiceHandler(
        "la_m2_span_membership",
        "b",
    ),
    la_m2_coefficients_role: makeLAStaticSingleChoiceHandler(
        "la_m2_coefficients_role",
        "d",
    ),
};

export const LA_M2_LINEAR_COMBINATIONS_TOPIC: TopicBundle = defineTopic(
    LA_TOPIC_MOD2.linear_combinations,
    M2_LINEAR_COMBINATIONS_POOL as any,
    M2_LINEAR_COMBINATIONS_HANDLERS as any,
);