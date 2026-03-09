import { defineTopic } from "@/lib/practice/generator/engines/utils";
import { LA_TOPIC_MOD2 } from "@/lib/practice/catalog/subjects/linear_algebra/slugs";

import {
    makeLAStaticSingleChoiceHandler,
    type Handler,
    type TopicBundle,
} from "@/lib/practice/generator/engines/linear_algebra/_shared";

export const M2_SUBSPACES_POOL = [
    { key: "la_m2_subspace_definition", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_m2_subspace_zero_required", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_m2_subspace_line_through_origin", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_m2_subspace_span_is_subspace", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_m2_subspace_polynomial_example", w: 1, kind: "single_choice", purpose: "quiz" },
] as const;

export type M2SubspacesKey = (typeof M2_SUBSPACES_POOL)[number]["key"];

export const M2_SUBSPACES_HANDLERS: Record<M2SubspacesKey, Handler> = {
    la_m2_subspace_definition: makeLAStaticSingleChoiceHandler(
        "la_m2_subspace_definition",
        "c",
    ),
    la_m2_subspace_zero_required: makeLAStaticSingleChoiceHandler(
        "la_m2_subspace_zero_required",
        "a",
    ),
    la_m2_subspace_line_through_origin: makeLAStaticSingleChoiceHandler(
        "la_m2_subspace_line_through_origin",
        "b",
    ),
    la_m2_subspace_span_is_subspace: makeLAStaticSingleChoiceHandler(
        "la_m2_subspace_span_is_subspace",
        "d",
    ),
    la_m2_subspace_polynomial_example: makeLAStaticSingleChoiceHandler(
        "la_m2_subspace_polynomial_example",
        "b",
    ),
};

export const LA_M2_SUBSPACES_TOPIC: TopicBundle = defineTopic(
    LA_TOPIC_MOD2.subspaces,
    M2_SUBSPACES_POOL as any,
    M2_SUBSPACES_HANDLERS as any,
);