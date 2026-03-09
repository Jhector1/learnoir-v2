// import type { TopicContext } from "../../generatorTypes";
//
// import { makeNoGenerator, parseTopicSlug } from "@/lib/practice/generator/engines/utils";
// import {LA_TOPIC_MOD0, LA_TOPIC_MOD2} from "@/lib/practice/catalog/subjects/linear_algebra/slugs";
//
// import { makeGenLinearAlgebraPart1Mod0 } from "./linear_algebra_part1_mod0/handlers";
//
// const MOD0_BASE = new Set<string>([
//     LA_TOPIC_MOD0.vectors,
//     LA_TOPIC_MOD0.numpy,
//     LA_TOPIC_MOD0.dot,
//     LA_TOPIC_MOD0.products,
//     LA_TOPIC_MOD0.projection,
// ]);
// const MOD1_PREFIX = "la1";
// const MOD2_PREFIX = "la2";
//
// const MOD2_BASE = new Set<string>([
//     LA_TOPIC_MOD2.vector_spaces,
//     LA_TOPIC_MOD2.subspaces,
//     LA_TOPIC_MOD2.linear_combinations,
//     LA_TOPIC_MOD2.linear_independence,
//     LA_TOPIC_MOD2.basis_dimension,
//     LA_TOPIC_MOD2.transpose,
//     LA_TOPIC_MOD2.determinant,
//     LA_TOPIC_MOD2.inverse,
//     LA_TOPIC_MOD2.eigenvalues_eigenvectors,
// ]);
// const MOD0_PREFIX = "la0";
//
//
// export function makeGenLinearAlgebraPart1(ctx: TopicContext) {
//     const { raw, base, prefix } = parseTopicSlug(String(ctx.topicSlug));
//
//     if (prefix === MOD0_PREFIX) return makeGenLinearAlgebraPart1Mod0(ctx);
//     // if (prefix === MOD1_PREFIX) return makeGenLinearAlgebraPart1Mod1(ctx);
//     if (prefix === MOD2_PREFIX) return makeGenLinearAlgebraPart1Mod2(ctx);
//
//     if (MOD2_BASE.has(base)) return makeGenLinearAlgebraPart1Mod2(ctx);
//
//     return makeNoGenerator("linear_algebra_part1", raw);
// }