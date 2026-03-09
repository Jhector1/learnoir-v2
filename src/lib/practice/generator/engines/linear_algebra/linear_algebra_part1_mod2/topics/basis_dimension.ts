import { defineTopic } from "@/lib/practice/generator/engines/utils";
import { LA_TOPIC_MOD2 } from "@/lib/practice/catalog/subjects/linear_algebra/slugs";

import {
    makeLAStaticSingleChoiceHandler,
    type Handler,
    type TopicBundle,
} from "@/lib/practice/generator/engines/linear_algebra/_shared";

export const M2_BASIS_DIMENSION_POOL = [
    { key: "la_m2_basis_definition", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_m2_dimension_meaning", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_m2_standard_basis_r3", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_m2_basis_count_plane", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_m2_basis_independent_spanning", w: 1, kind: "single_choice", purpose: "quiz" },
] as const;

export type M2BasisDimensionKey = (typeof M2_BASIS_DIMENSION_POOL)[number]["key"];

export const M2_BASIS_DIMENSION_HANDLERS: Record<M2BasisDimensionKey, Handler> = {
    la_m2_basis_definition: makeLAStaticSingleChoiceHandler(
        "la_m2_basis_definition",
        "b",
    ),
    la_m2_dimension_meaning: makeLAStaticSingleChoiceHandler(
        "la_m2_dimension_meaning",
        "a",
    ),
    la_m2_standard_basis_r3: makeLAStaticSingleChoiceHandler(
        "la_m2_standard_basis_r3",
        "c",
    ),
    la_m2_basis_count_plane: makeLAStaticSingleChoiceHandler(
        "la_m2_basis_count_plane",
        "d",
    ),
    la_m2_basis_independent_spanning: makeLAStaticSingleChoiceHandler(
        "la_m2_basis_independent_spanning",
        "b",
    ),
};

export const LA_M2_BASIS_DIMENSION_TOPIC: TopicBundle = defineTopic(
    LA_TOPIC_MOD2.basis_dimension,
    M2_BASIS_DIMENSION_POOL as any,
    M2_BASIS_DIMENSION_HANDLERS as any,
);