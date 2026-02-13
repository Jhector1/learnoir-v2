// prisma/seed/data/subjects/linear-algebra/sections.ts
import {
  LA_MOD0,
  LA_MOD1,
  LA_MOD2,
  LA_MOD3,
  LA_MOD4,
  LA_PREFIX0,
  LA_PREFIX1,
  LA_PREFIX2,
  LA_PREFIX3,
  LA_PREFIX4
} from "./constants";
import { LA_TOPICS } from "./topics";
import type { SectionDef, TopicDef } from "../_types";

export const LA_SECTIONS: Array<SectionDef> = [
  {
    moduleSlug: LA_MOD0,
    prefix: LA_PREFIX0,
    genKey: "linear_algebra_mod0",
    topics: LA_TOPICS[LA_MOD0],
    section: {
      slug: "linear-algebra-0-vectors",
      order: 0,
      title: "Linear Algebra 0 — Vectors",
      description: "Dot product, angles, projection, and vector foundations.",
      meta: {
        module: 0,
        weeks: "Week 0",
        bullets: [
          "Dot product meaning + computation",
          "Angle & cosine relationship",
          "Vector projection + decomposition",
          "Vectors Part 1: ℝⁿ, shapes, norms",
          "Vectors Part 2: span, basis, independence",
        ],
        skills: [
          "Compute dot products",
          "Compute/interpret angles between vectors",
          "Project a onto b",
          "Work with norms/unit vectors",
          "Decide independence and span",
        ],
      },
    },
  },

  {
    moduleSlug: LA_MOD1,
    prefix: LA_PREFIX1,
    genKey: "linear_algebra_mod1",
    topics: LA_TOPICS[LA_MOD1],
    section: {
      slug: "linear-algebra-1-linear-systems",
      order: 10,
      title: "Linear Algebra 1 — Linear Systems",
      description: "Solve systems using elimination and RREF.",
      meta: {
        module: 1,
        weeks: "Weeks 1–2",
        bullets: [
          "Linear equations and systems",
          "Augmented matrices",
          "Gaussian elimination + RREF",
          "Existence/uniqueness of solutions",
          "Parametric solutions and free variables",
        ],
        skills: [
          "Solve systems using elimination/RREF",
          "Classify solution types (unique / infinite / none)",
        ],
      },
    },
  },

  {
    moduleSlug: LA_MOD2,
    prefix: LA_PREFIX2,
    genKey: "linear_algebra_mod2",
    topics: LA_TOPICS[LA_MOD2],
    section: {
      slug: "linear-algebra-2-matrices-part-1",
      order: 20,
      title: "Linear Algebra 2 — Matrices (Part 1)",
      description: "Shapes, indexing, special matrices, matmul, transpose, symmetry.",
      meta: {
        module: 2,
        weeks: "Weeks 2–3",
        bullets: [
          "Matrix meaning + shape",
          "Indexing + slicing",
          "Special matrices",
          "Element-wise vs matmul",
          "Transpose + symmetry",
          "Core ops + inverse + properties",
        ],
        skills: [
          "Read shapes",
          "Index/slice",
          "Multiply matrices",
          "Use transpose rules",
          "Understand inverse",
        ],
      },
    },
  },

  {
    moduleSlug: LA_MOD3,
    prefix: LA_PREFIX3,
    genKey: "linear_algebra_mod3",
    topics: LA_TOPICS[LA_MOD3],
    section: {
      slug: "linear-algebra-3-matrices-part-2",
      order: 30,
      title: "Linear Algebra 3 — Matrices (Part 2)",
      description: "Norms, spaces, rank, determinants, and characteristic intuition.",
      meta: {
        module: 3,
        weeks: "Weeks 4–5",
        bullets: [
          "Frobenius norm and trace(AᵀA)",
          "Column space membership via rank test",
          "Null space and nullity",
          "Rank meaning + tolerance intuition",
          "Determinant and invertibility",
          "Characteristic idea: det(A−λI)",
        ],
        skills: [
          "Use rank(A)=rank([A|b]) test",
          "Relate rank and nullity",
          "Compute 2×2 determinants",
          "Form A−λI and compute det",
        ],
      },
    },
  },


  // ✅ NEW (Module 4)
  {
    moduleSlug: LA_MOD4,
    prefix: LA_PREFIX4,
    genKey: "linear_algebra_mod4",
    topics: LA_TOPICS[LA_MOD4],
    section: {
      slug: "linear-algebra-4-orthogonality",
      order: 40,
      title: "Linear Algebra 4 — Inner Products & Orthogonality",
      description:
          "Norms and inner products, orthogonality, projections, orthonormal bases, Gram–Schmidt.",
      meta: {
        module: 4,
        weeks: "Weeks 6–7",
        bullets: [
          "Norm axioms + geometry of length",
          "Inner products and angles",
          "Orthogonality + orthogonal complement",
          "Projection onto a line + projection matrices",
          "Orthonormal bases and coordinates (Bᵀx)",
          "Orthogonal matrices (QᵀQ = I) preserve lengths",
          "Gram–Schmidt (orthonormalizing a basis)",
          "SPD matrices and weighted inner products (xᵀAy)",
        ],
        skills: [
          "Compute norms and dot products",
          "Test orthogonality (aᵀb = 0)",
          "Compute projections (scalar + vector form)",
          "Build/recognize projection matrices (P² = P, Pᵀ = P)",
          "Use orthonormal coordinates (λ = Bᵀx)",
          "Recognize orthogonal matrices and length preservation",
          "Run Gram–Schmidt on 2 vectors",
          "Understand SPD requirement for xᵀAy as an inner product",
        ],
      },
    },
  },


];
