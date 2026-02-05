import type { GenKey, TopicSlug } from "@/lib/practice/types";

export const LA_GENKEY_TO_DB: Record<GenKey, TopicSlug> = {
  dot: "m0.dot",
  projection: "m0.projection",
  angle: "m0.angle",
  vectors: "m0.vectors",
  vectors_part1: "m0.vectors_part1",
  vectors_part2: "m0.vectors_part2",

  linear_systems: "m1.linear_systems",
  augmented: "m1.augmented",
  rref: "m1.rref",
  solution_types: "m1.solution_types",
  parametric: "m1.parametric",

  matrix_ops: "m2.matrix_ops",
  matrix_inverse: "m2.matrix_inverse",
  matrix_properties: "m2.matrix_properties",

  matrices_part1: "m2.matrices_part1",
  matrices_part2: "m3.matrices_part2",
};
