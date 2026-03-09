import { defineTopic } from "@/lib/practice/generator/engines/utils";
import { LA_TOPIC_MOD2 } from "@/lib/practice/catalog/subjects/linear_algebra/slugs";

import {
    makeLAStaticSingleChoiceHandler,
    type Handler,
    type TopicBundle,
} from "@/lib/practice/generator/engines/linear_algebra/_shared";

export const M2_VECTOR_SPACES_POOL = [
    { key: "la_m2_vector_space_axioms", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_m2_vector_space_zero_vector", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_m2_vector_space_not_every_set", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_m2_vector_space_rn_example", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_m2_vector_space_function_example", w: 1, kind: "single_choice", purpose: "quiz" },
] as const;

export type M2VectorSpacesKey = (typeof M2_VECTOR_SPACES_POOL)[number]["key"];

export const M2_VECTOR_SPACES_HANDLERS: Record<M2VectorSpacesKey, Handler> = {
    la_m2_vector_space_axioms: makeLAStaticSingleChoiceHandler(
        "la_m2_vector_space_axioms",
        "c",
    ),
    la_m2_vector_space_zero_vector: makeLAStaticSingleChoiceHandler(
        "la_m2_vector_space_zero_vector",
        "a",
    ),
    la_m2_vector_space_not_every_set: makeLAStaticSingleChoiceHandler(
        "la_m2_vector_space_not_every_set",
        "b",
    ),
    la_m2_vector_space_rn_example: makeLAStaticSingleChoiceHandler(
        "la_m2_vector_space_rn_example",
        "d",
    ),
    la_m2_vector_space_function_example: makeLAStaticSingleChoiceHandler(
        "la_m2_vector_space_function_example",
        "b",
    ),
};

export const LA_M2_VECTOR_SPACES_TOPIC: TopicBundle = defineTopic(
    LA_TOPIC_MOD2.vector_spaces,
    M2_VECTOR_SPACES_POOL as any,
    M2_VECTOR_SPACES_HANDLERS as any,
);