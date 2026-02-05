import type { SubjectTopic } from "../types";

export const LA_TOPICS: readonly SubjectTopic[] = [
  { slug: "m0.dot", label: "Dot product", group: "Module 0 — Vectors" },
  { slug: "m0.projection", label: "Projection", group: "Module 0 — Vectors" },
  { slug: "m0.angle", label: "Angle / properties", group: "Module 0 — Vectors" },
  { slug: "m0.vectors", label: "Vectors (drag)", group: "Module 0 — Vectors" },

  { slug: "m1.linear_systems", label: "Linear systems", group: "Module 1 — Systems" },
  { slug: "m1.augmented", label: "Augmented matrices", group: "Module 1 — Systems" },
  { slug: "m1.rref", label: "RREF", group: "Module 1 — Systems" },
  { slug: "m1.solution_types", label: "Solution types", group: "Module 1 — Systems" },
  { slug: "m1.parametric", label: "Parametric solutions", group: "Module 1 — Systems" },

  // Part 1 “variants”
  { slug: "m2.matrices_part1", label: "Matrices — Part 1 (mixed)", group: "Module 2 — Matrices" },
  { slug: "m2.matrices_intro", label: "Matrices: Intro", group: "Module 2 — Matrices" },
  { slug: "m2.index_slice", label: "Matrices: Indexing & slicing", group: "Module 2 — Matrices" },
  { slug: "m2.special", label: "Matrices: Special matrices", group: "Module 2 — Matrices" },
  { slug: "m2.elementwise_shift", label: "Matrices: Elementwise & shifts", group: "Module 2 — Matrices" },
  { slug: "m2.matmul", label: "Matrices: Matrix multiplication", group: "Module 2 — Matrices" },
  { slug: "m2.matvec", label: "Matrices: Matrix-vector product", group: "Module 2 — Matrices" },
  { slug: "m2.transpose_liveevil", label: "Matrices: Transpose", group: "Module 2 — Matrices" },
  { slug: "m2.symmetric", label: "Matrices: Symmetric matrices", group: "Module 2 — Matrices" },

  // Part 2 “variants”
  { slug: "m3.matrices_part2", label: "Matrices — Part 2 (mixed)", group: "Module 3 — Matrices II" },
  { slug: "m3.norms", label: "Norms (Frobenius)", group: "Module 3 — Matrices II" },
  { slug: "m3.colspace", label: "Column space", group: "Module 3 — Matrices II" },
  { slug: "m3.nullspace", label: "Null space / nullity", group: "Module 3 — Matrices II" },
  { slug: "m3.rank", label: "Rank", group: "Module 3 — Matrices II" },
  { slug: "m3.det", label: "Determinant", group: "Module 3 — Matrices II" },
  { slug: "m3.charpoly", label: "det(A−λI) / eigen intuition", group: "Module 3 — Matrices II" },
] as const;
