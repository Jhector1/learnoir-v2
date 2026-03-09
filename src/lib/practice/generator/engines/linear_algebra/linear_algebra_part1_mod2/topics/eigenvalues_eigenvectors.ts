import { defineTopic, makeSingleChoiceOut } from "@/lib/practice/generator/engines/utils";
import { LA_TOPIC_MOD2 } from "@/lib/practice/catalog/subjects/linear_algebra/slugs";

import {
    buildLAOptions,
    fmtMat,
    makeLANumericOut,
    makeLAStaticSingleChoiceHandler,
    type Handler,
    type HandlerArgs,
    type TopicBundle,
} from "@/lib/practice/generator/engines/linear_algebra/_shared";

export const M2_EIGENVALUES_EIGENVECTORS_POOL = [
    { key: "la_m2_eigenvalue_definition", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_m2_eigenvector_definition", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_m2_eigen_diagonal_value_numeric", w: 1, kind: "numeric", purpose: "quiz" },
    { key: "la_m2_eigenvector_choice", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_m2_eigen_triangular_values", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_m2_eigenvector_not_zero", w: 1, kind: "single_choice", purpose: "quiz" },
] as const;

export type M2EigenKey = (typeof M2_EIGENVALUES_EIGENVECTORS_POOL)[number]["key"];

export const M2_EIGENVALUES_EIGENVECTORS_HANDLERS: Record<M2EigenKey, Handler> = {
    la_m2_eigenvalue_definition: makeLAStaticSingleChoiceHandler(
        "la_m2_eigenvalue_definition",
        "b",
    ),
    la_m2_eigenvector_definition: makeLAStaticSingleChoiceHandler(
        "la_m2_eigenvector_definition",
        "c",
    ),

    la_m2_eigen_diagonal_value_numeric: ({ rng, diff, id, topic }: HandlerArgs) => {
        const a = rng.pick([2, 3, 4, -1] as const);
        const d = rng.pick([5, 6, -2, 1] as const);

        return makeLANumericOut({
            archetype: "la_m2_eigen_diagonal_value_numeric",
            id,
            topic,
            diff,
            title: "@:quiz.la_m2_eigen_diagonal_value_numeric.title",
            prompt: String.raw`
Let

$$
A=${fmtMat([
                [a, 0],
                [0, d],
            ])}.
$$

What is the eigenvalue associated with the standard basis vector $e_1$?
`.trim(),
            hint: "@:quiz.la_m2_eigen_diagonal_value_numeric.hint",
            value: a,
            tolerance: 0,
        });
    },

    la_m2_eigenvector_choice: ({ diff, id, topic }: HandlerArgs) =>
        makeSingleChoiceOut({
            archetype: "la_m2_eigenvector_choice",
            id,
            topic,
            diff,
            title: "@:quiz.la_m2_eigenvector_choice.title",
            prompt: String.raw`
For

$$
A=\begin{bmatrix}3&0\\0&5\end{bmatrix},
$$

which vector is an eigenvector associated with eigenvalue $3$?
`.trim(),
            options: buildLAOptions("la_m2_eigenvector_choice", ["a", "b", "c", "d"]),
            answerOptionId: "a",
            hint: "@:quiz.la_m2_eigenvector_choice.hint",
        }),

    la_m2_eigen_triangular_values: makeLAStaticSingleChoiceHandler(
        "la_m2_eigen_triangular_values",
        "d",
    ),
    la_m2_eigenvector_not_zero: makeLAStaticSingleChoiceHandler(
        "la_m2_eigenvector_not_zero",
        "a",
    ),
};

export const LA_M2_EIGENVALUES_EIGENVECTORS_TOPIC: TopicBundle = defineTopic(
    LA_TOPIC_MOD2.eigenvalues_eigenvectors,
    M2_EIGENVALUES_EIGENVECTORS_POOL as any,
    M2_EIGENVALUES_EIGENVECTORS_HANDLERS as any,
);