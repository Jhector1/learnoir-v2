import { defineTopic } from "@/lib/practice/generator/engines/utils";
import { LA_TOPIC_MOD0 } from "@/lib/practice/catalog/subjects/linear_algebra/slugs";

import {
    fmtVec2,
    makeLANumericOut,
    makeLAStaticSingleChoiceHandler,
    randNonZeroInt,
    roundTo,
    type Handler,
    type HandlerArgs,
    type TopicBundle,
} from "@/lib/practice/generator/engines/linear_algebra/_shared";

export const M0_PROJECTION_POOL = [
    { key: "la_projection_meaning", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_projection_formula", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_projection_beta_numeric", w: 1, kind: "numeric", purpose: "quiz" },
    { key: "la_projection_perp_zero", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_projection_split", w: 1, kind: "single_choice", purpose: "quiz" },
] as const;

export type M0ProjectionKey = (typeof M0_PROJECTION_POOL)[number]["key"];

export const M0_PROJECTION_HANDLERS: Record<M0ProjectionKey, Handler> = {
    la_projection_meaning: makeLAStaticSingleChoiceHandler(
        "la_projection_meaning",
        "b",
        ["a", "b", "c", "d"],
    ),

    la_projection_formula: makeLAStaticSingleChoiceHandler(
        "la_projection_formula",
        "c",
        ["a", "b", "c", "d"],
    ),

    la_projection_beta_numeric: ({ rng, diff, id, topic }: HandlerArgs) => {
        const a = [randNonZeroInt(rng, -4, 4), randNonZeroInt(rng, -4, 4)];
        const betaExact = randNonZeroInt(rng, -3, 3);
        const p = [-a[1], a[0]];
        const t = rng.int(-2, 2);
        const b = [betaExact * a[0] + t * p[0], betaExact * a[1] + t * p[1]];

        return makeLANumericOut({
            archetype: "la_projection_beta_numeric",
            id,
            topic,
            diff,
            title: "@:quiz.la_projection_beta_numeric.title",
            prompt: String.raw`
Let

$$
a=${fmtVec2(a[0], a[1])},
\qquad
b=${fmtVec2(b[0], b[1])}.
$$

Compute

$$
\beta=\frac{a\cdot b}{a\cdot a}.
$$
`.trim(),
            hint: "@:quiz.la_projection_beta_numeric.hint",
            value: roundTo(betaExact, 2),
            tolerance: 0.01,
        });
    },

    la_projection_perp_zero: makeLAStaticSingleChoiceHandler(
        "la_projection_perp_zero",
        "a",
        ["a", "b", "c", "d"],
    ),

    la_projection_split: makeLAStaticSingleChoiceHandler(
        "la_projection_split",
        "d",
        ["a", "b", "c", "d"],
    ),
};

export const LA_PROJECTION_TOPIC: TopicBundle = defineTopic(
    LA_TOPIC_MOD0.projection,
    M0_PROJECTION_POOL as any,
    M0_PROJECTION_HANDLERS as any,
);