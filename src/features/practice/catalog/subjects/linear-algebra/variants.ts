import type { TopicSlug } from "@/lib/practice/types";

export const LA_MATRIX_PART1_VARIANTS: readonly TopicSlug[] = [
  "m2.matrices_intro",
  "m2.index_slice",
  "m2.special",
  "m2.elementwise_shift",
  "m2.matmul",
  "m2.matvec",
  "m2.transpose_liveevil",
  "m2.symmetric",
] as const;

export const LA_MATRIX_PART2_VARIANTS: readonly TopicSlug[] = [
  "m3.norms",
  "m3.colspace",
  "m3.nullspace",
  "m3.rank",
  "m3.det",
  "m3.charpoly",
] as const;
