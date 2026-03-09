import { defineTopic, makeSingleChoiceOut } from "@/lib/practice/generator/engines/utils";
import { LA_TOPIC_MOD2 } from "@/lib/practice/catalog/subjects/linear_algebra/slugs";

import {
    buildLAOptions,
    fmtCol,
    makeLAStaticSingleChoiceHandler,
    type Handler,
    type HandlerArgs,
    type TopicBundle,
    vecInts,
} from "@/lib/practice/generator/engines/linear_algebra/_shared";

export const M2_LINEAR_INDEPENDENCE_POOL = [
    { key: "la_m2_linear_independence_definition", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_m2_dependence_nontrivial_relation", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_m2_independence_geometric_r2", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_m2_independence_matrix_example", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_m2_dependence_zero_vector", w: 1, kind: "single_choice", purpose: "quiz" },
] as const;

export type M2LinearIndependenceKey =
    (typeof M2_LINEAR_INDEPENDENCE_POOL)[number]["key"];

export const M2_LINEAR_INDEPENDENCE_HANDLERS: Record<M2LinearIndependenceKey, Handler> = {
    la_m2_linear_independence_definition: makeLAStaticSingleChoiceHandler(
        "la_m2_linear_independence_definition",
        "c",
    ),
    la_m2_dependence_nontrivial_relation: makeLAStaticSingleChoiceHandler(
        "la_m2_dependence_nontrivial_relation",
        "a",
    ),
    la_m2_independence_geometric_r2: makeLAStaticSingleChoiceHandler(
        "la_m2_independence_geometric_r2",
        "b",
    ),

    la_m2_independence_matrix_example: ({ rng, diff, id, topic }: HandlerArgs) => {
        const dependent = rng.int(0, 1) === 1;
        const v1 = vecInts(rng, 2, 4, false);
        const v2 = dependent
            ? [2 * v1[0], 2 * v1[1]]
            : [v1[1] === 0 ? 1 : -v1[1], v1[0]];

        return makeSingleChoiceOut({
            archetype: "la_m2_independence_matrix_example",
            id,
            topic,
            diff,
            title: "@:quiz.la_m2_independence_matrix_example.title",
            prompt: String.raw`
Consider

$$
v_1=${fmtCol(v1)},
\qquad
v_2=${fmtCol(v2)}.
$$

Are these vectors linearly independent?
`.trim(),
            options: buildLAOptions("la_m2_independence_matrix_example", ["a", "b"]),
            answerOptionId: dependent ? "b" : "a",
            hint: "@:quiz.la_m2_independence_matrix_example.hint",
        });
    },

    la_m2_dependence_zero_vector: makeLAStaticSingleChoiceHandler(
        "la_m2_dependence_zero_vector",
        "d",
    ),
};

export const LA_M2_LINEAR_INDEPENDENCE_TOPIC: TopicBundle = defineTopic(
    LA_TOPIC_MOD2.linear_independence,
    M2_LINEAR_INDEPENDENCE_POOL as any,
    M2_LINEAR_INDEPENDENCE_HANDLERS as any,
);