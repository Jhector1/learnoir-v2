import type { TopicContext } from "@/lib/practice/generator/generatorTypes";

import { makeLinearAlgebraModuleGenerator } from "../_shared";
import {
    LA_DOT_TOPIC,
    LA_NUMPY_TOPIC,
    LA_PRODUCTS_TOPIC,
    LA_PROJECTION_TOPIC,
    LA_VECTORS_TOPIC,
} from "./topics";

export function makeGenLinearAlgebraPart1Mod0(ctx: TopicContext) {
    return makeLinearAlgebraModuleGenerator({
        engineName: "linear_algebra_part1_mod0",
        ctx,
        topics: [
            LA_VECTORS_TOPIC,
            LA_NUMPY_TOPIC,
            LA_DOT_TOPIC,
            LA_PRODUCTS_TOPIC,
            LA_PROJECTION_TOPIC,
        ],
    });
}