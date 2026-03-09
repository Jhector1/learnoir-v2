import { defineTopic } from "@/lib/practice/generator/engines/utils";
import { LA_TOPIC_MOD2 } from "@/lib/practice/catalog/subjects/linear_algebra/slugs";

import {
    fmtMat,
    makeLANumericOut,
    makeLAStaticSingleChoiceHandler,
    type Handler,
    type HandlerArgs,
    type TopicBundle,
} from "@/lib/practice/generator/engines/linear_algebra/_shared";

export const M2_DETERMINANT_POOL = [
    { key: "la_m2_determinant_2x2_numeric", w: 1, kind: "numeric", purpose: "quiz" },
    { key: "la_m2_determinant_area_scaling", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_m2_determinant_zero_noninvertible", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_m2_determinant_triangular_numeric", w: 1, kind: "numeric", purpose: "quiz" },
    { key: "la_m2_determinant_swap_rows", w: 1, kind: "single_choice", purpose: "quiz" },
] as const;

export type M2DeterminantKey = (typeof M2_DETERMINANT_POOL)[number]["key"];

export const M2_DETERMINANT_HANDLERS: Record<M2DeterminantKey, Handler> = {
    la_m2_determinant_2x2_numeric: ({ rng, diff, id, topic }: HandlerArgs) => {
        const a = rng.int(-4, 4);
        const b = rng.int(-4, 4);
        const c = rng.int(-4, 4);
        const d = rng.int(-4, 4);

        return makeLANumericOut({
            archetype: "la_m2_determinant_2x2_numeric",
            id,
            topic,
            diff,
            title: "@:quiz.la_m2_determinant_2x2_numeric.title",
            prompt: String.raw`
Compute the determinant of

$$
A=${fmtMat([
                [a, b],
                [c, d],
            ])}.
$$
`.trim(),
            hint: "@:quiz.la_m2_determinant_2x2_numeric.hint",
            value: a * d - b * c,
            tolerance: 0,
        });
    },

    la_m2_determinant_area_scaling: makeLAStaticSingleChoiceHandler(
        "la_m2_determinant_area_scaling",
        "b",
    ),
    la_m2_determinant_zero_noninvertible: makeLAStaticSingleChoiceHandler(
        "la_m2_determinant_zero_noninvertible",
        "c",
    ),

    la_m2_determinant_triangular_numeric: ({ rng, diff, id, topic }: HandlerArgs) => {
        const a = rng.pick([1, 2, -1, -2, 3] as const);
        const d = rng.pick([1, 2, -1, -2, 4] as const);
        const f = rng.pick([1, 2, -1, 3] as const);

        const A = [
            [a, rng.int(-3, 3), rng.int(-3, 3)],
            [0, d, rng.int(-3, 3)],
            [0, 0, f],
        ];

        return makeLANumericOut({
            archetype: "la_m2_determinant_triangular_numeric",
            id,
            topic,
            diff,
            title: "@:quiz.la_m2_determinant_triangular_numeric.title",
            prompt: String.raw`
Let

$$
A=${fmtMat(A)}.
$$

Compute $\det(A)$.
`.trim(),
            hint: "@:quiz.la_m2_determinant_triangular_numeric.hint",
            value: a * d * f,
            tolerance: 0,
        });
    },

    la_m2_determinant_swap_rows: makeLAStaticSingleChoiceHandler(
        "la_m2_determinant_swap_rows",
        "a",
    ),
};

export const LA_M2_DETERMINANT_TOPIC: TopicBundle = defineTopic(
    LA_TOPIC_MOD2.determinant,
    M2_DETERMINANT_POOL as any,
    M2_DETERMINANT_HANDLERS as any,
);