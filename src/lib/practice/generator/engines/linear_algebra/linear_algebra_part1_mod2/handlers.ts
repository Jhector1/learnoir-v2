import type { TopicContext } from "@/lib/practice/generator/generatorTypes";

import { makeLinearAlgebraModuleGenerator } from "../linear_algebra_shared/_shared";
import {
    LA_M2_BASIS_DIMENSION_TOPIC,
    LA_M2_DETERMINANT_TOPIC,
    LA_M2_EIGENVALUES_EIGENVECTORS_TOPIC,
    LA_M2_INVERSE_TOPIC,
    LA_M2_LINEAR_COMBINATIONS_TOPIC,
    LA_M2_LINEAR_INDEPENDENCE_TOPIC,
    LA_M2_SUBSPACES_TOPIC,
    LA_M2_TRANSPOSE_TOPIC,
    LA_M2_VECTOR_SPACES_TOPIC,
} from "./topics";

export function makeGenLinearAlgebraPart1Mod2(ctx: TopicContext) {
    return makeLinearAlgebraModuleGenerator({
        engineName: "linear_algebra_part1_mod2",
        ctx,
        topics: [
            LA_M2_VECTOR_SPACES_TOPIC,
            LA_M2_SUBSPACES_TOPIC,
            LA_M2_LINEAR_COMBINATIONS_TOPIC,
            LA_M2_LINEAR_INDEPENDENCE_TOPIC,
            LA_M2_BASIS_DIMENSION_TOPIC,
            LA_M2_TRANSPOSE_TOPIC,
            LA_M2_DETERMINANT_TOPIC,
            LA_M2_INVERSE_TOPIC,
            LA_M2_EIGENVALUES_EIGENVECTORS_TOPIC,
        ],
    });
}