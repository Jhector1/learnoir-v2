// prisma/seed/data/subjects/linear-algebra/modules.ts

import {LA_MOD0, LA_MOD1, LA_MOD2, LA_MOD3, LA_MOD4, LA_SUBJECT_SLUG} from "./constants";
import { ModuleSeed } from "../_types";

export const LA_MODULES: ModuleSeed[] = [
  {
    slug: LA_MOD0,
    subjectSlug: LA_SUBJECT_SLUG,
    order: 0,
    title: "Module 0 — Vector Foundations",
    description: "Dot product, angle, projection, and drag intuition.",
    weekStart: 0,
    weekEnd: 0,
  },
  {
    slug: LA_MOD1,
    subjectSlug: LA_SUBJECT_SLUG,
    order: 10,
    title: "Module 1 — Linear Systems",
    description: "Systems, augmented matrices, elimination, RREF, solution types.",
    weekStart: 1,
    weekEnd: 2,

  },
  {
    slug: LA_MOD2,
    subjectSlug: LA_SUBJECT_SLUG,
    order: 20,
    title: "Module 2 — Matrices",
    description: "Matrix operations, inverse, and core properties.",
    weekStart: 2,
    weekEnd: 3,
  },
  {
    slug: LA_MOD3,
    subjectSlug: LA_SUBJECT_SLUG,
    order: 30,
    title: "Module 3 — Matrices (Part 2)",
    description: "Norms, rank, column/null spaces, determinant, and det(A−λI).",
    weekStart: 3,
    weekEnd: 5,
  },
  // ✅ NEW
  {
    slug: LA_MOD4,
    subjectSlug: LA_SUBJECT_SLUG,
    order: 40,
    title: "Module 4 — Inner Products & Orthogonality",
    description:
        "Norms, inner products, orthogonality, projections, orthonormal bases, Gram–Schmidt.",
    weekStart: 5,
    weekEnd: 7,
  },
];
