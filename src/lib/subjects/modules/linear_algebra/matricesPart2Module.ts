import type { ReviewModule } from "@/lib/subjects/types";
import {

  LA_SECTION_MOD3,
  LA_TOPIC_MOD3,
} from "@/lib/practice/catalog/subjects/linear_algebra/slugs";
import {
  LA_SUBJECT_SLUG,
  LA_MOD3,
 
} from "../../../../../prisma/seed/data/subjects/linear-algebra/constants";

const T3 = LA_TOPIC_MOD3 as Record<string, string>;

export const matricesPart2Module: ReviewModule = {
  id: LA_MOD3,
  title: "Matrices — Part 2",
  subtitle:
    "Norms, trace, matrix spaces, rank, determinant, characteristic polynomial",

  startPracticeHref: (topicSlug) =>
    `/practice?section=${LA_SECTION_MOD3}&difficulty=easy&topic=${encodeURIComponent(
      topicSlug,
    )}`,

  topics: [
    {
      id: "mat2_norms",
      label: "Matrix norms: Frobenius + trace trick + distance",
      minutes: 14,
      summary:
        "Frobenius norm summarizes matrix “energy.” Compute directly or via tr(AᵀA), and use it as a distance between matrices.",
      cards: [
        {
          type: "text",
          id: "mat2_norms_t1",
          title: "Frobenius norm",
          markdown: String.raw`
$$
\|\mathbf{A}\|_F=\sqrt{\sum_{i=1}^{m}\sum_{j=1}^{n} a_{i,j}^2}
$$
`.trim(),
        },
        {
          type: "text",
          id: "mat2_norms_t2",
          title: "Trace trick + matrix distance",
          markdown: String.raw`
$$
\|\mathbf{A}\|_F^2 = \mathrm{tr}(\mathbf{A}^T\mathbf{A})
\qquad
d(\mathbf{A},\mathbf{B})=\|\mathbf{A}-\mathbf{B}\|_F
$$
`.trim(),
        },
        {
          type: "sketch",
          id: "mat2_norms_s1",
          title: "Edit A and B, watch norms + distance update",
          sketchId: "mat2.norms",
          height: 420,
        },
        {
          type: "quiz",
          id: "mat2_norms_q1",
          title: "Quick check",
          spec: {
            subject: LA_SUBJECT_SLUG,
            module: LA_MOD3,
            section: LA_SECTION_MOD3,
            topic: T3["mat2_norms"],
            difficulty: "easy",
            n: 4,
            allowReveal: true,
          },
        },
      ],
    },

    {
      id: "mat2_colspace",
      label: "Column space: is b in Col(A)? + augmented rank intuition",
      minutes: 18,
      summary:
        "b is in Col(A) iff Ax=b is consistent. Augmenting with b and comparing ranks gives a fast test; residual shows how far b is from the span.",
      cards: [
        {
          type: "text",
          id: "mat2_colspace_t1",
          title: "Column space meaning",
          markdown: String.raw`
$$
\mathrm{Col}(\mathbf{A})=\{\,\mathbf{A}\mathbf{x}\;:\;\mathbf{x}\in\mathbb{R}^n\,\}
$$
`.trim(),
        },
        {
          type: "text",
          id: "mat2_colspace_t2",
          title: "Rank test (fast consistency check)",
          markdown: String.raw`
$$
\mathbf{b}\in\mathrm{Col}(\mathbf{A})
\iff
\mathrm{rank}(\mathbf{A})=\mathrm{rank}([\mathbf{A}\mid \mathbf{b}]).
$$
`.trim(),
        },
        {
          type: "sketch",
          id: "mat2_colspace_s1",
          title: "Drag b and watch rank(A) vs rank([A|b])",
          sketchId: "mat2.colspace",
          height: 460,
        },
        {
          type: "sketch",
          id: "mat2_colspace_s2",
          title: "Augmented-matrix intuition: show best-fit Ax and residual",
          sketchId: "mat2.augment",
          height: 520,
        },
        {
          type: "quiz",
          id: "mat2_colspace_q1",
          title: "Quick check",
          spec: {
            subject: LA_SUBJECT_SLUG,
            module: LA_MOD3,
            section: LA_SECTION_MOD3,
            topic: T3["mat2_colspace"],
            difficulty: "easy",
            n: 4,
            allowReveal: true,
          },
        },
      ],
    },

    {
      id: "mat2_rowspace",
      label: "Row space: span of rows (Row(A) = Col(Aᵀ))",
      minutes: 14,
      summary:
        "Row space is the span of the rows. Because transpose swaps rows/cols, Row(A) = Col(Aᵀ).",
      cards: [
        {
          type: "text",
          id: "mat2_rowspace_t1",
          title: "Definition",
          markdown: String.raw`
$$
\mathrm{Row}(\mathbf{A})=\mathrm{Col}(\mathbf{A}^T).
$$
`.trim(),
        },
        {
          type: "sketch",
          id: "mat2_rowspace_s1",
          title: "Drag r and test r ∈ Row(A) using rank on Aᵀ",
          sketchId: "mat2.rowspace",
          height: 460,
        },
        {
          type: "quiz",
          id: "mat2_rowspace_q1",
          title: "Quick check",
          spec: {
            subject: LA_SUBJECT_SLUG,
            module: LA_MOD3,
            section: LA_SECTION_MOD3,
            topic: T3["mat2_rowspace"],
            difficulty: "easy",
            n: 4,
            allowReveal: true,
          },
        },
      ],
    },

    {
      id: "mat2_nullspaces",
      label: "Null space + left-null space: inputs that map to zero",
      minutes: 18,
      summary:
        "Null(A) solves Ay=0. LeftNull(A)=Null(Aᵀ) solves Aᵀw=0 (vectors orthogonal to Col(A)).",
      cards: [
        {
          type: "text",
          id: "mat2_nullspaces_t1",
          title: "Null space",
          markdown: String.raw`
$$
\mathcal{N}(\mathbf{A})=\{\mathbf{y}:\mathbf{A}\mathbf{y}=\mathbf{0}\}.
$$
`.trim(),
        },
        {
          type: "text",
          id: "mat2_nullspaces_t2",
          title: "Left null space",
          markdown: String.raw`
$$
\mathcal{N}(\mathbf{A}^T)=\{\mathbf{w}:\mathbf{A}^T\mathbf{w}=\mathbf{0}\}.
$$
`.trim(),
        },
        {
          type: "sketch",
          id: "mat2_nullspaces_s1",
          title: "Null space: drag y and make Ay ≈ 0",
          sketchId: "mat2.nullspace",
          height: 460,
        },
        {
          type: "sketch",
          id: "mat2_nullspaces_s2",
          title: "Left null space: drag w and make Aᵀw ≈ 0",
          sketchId: "mat2.leftnull",
          height: 460,
        },
        {
          type: "quiz",
          id: "mat2_nullspaces_q1",
          title: "Quick check",
          spec: {
            subject: LA_SUBJECT_SLUG,
            module: LA_MOD3,
            section: LA_SECTION_MOD3,
            topic: T3["mat2_nullspaces"],
            difficulty: "easy",
            n: 4,
            allowReveal: true,
          },
        },
      ],
    },

    {
      id: "mat2_rank_independence",
      label: "Rank + linear independence (rank = dim Col(A))",
      minutes: 18,
      summary:
        "Rank counts independent directions. A set of vectors is independent iff the matrix with those vectors as columns has full column rank.",
      cards: [
        {
          type: "text",
          id: "mat2_rank_independence_t1",
          title: "Rank connects the spaces",
          markdown: String.raw`
$$
\mathrm{rank}(\mathbf{A})=\dim(\mathrm{Col}(\mathbf{A}))=\dim(\mathrm{Row}(\mathbf{A})).
$$
`.trim(),
        },
        {
          type: "text",
          id: "mat2_rank_independence_t2",
          title: "Independence test via rank",
          markdown: String.raw`
Independent $\iff \mathrm{rank}(\mathbf{V})=(\#\text{columns}).
`.trim(),
        },
        {
          type: "sketch",
          id: "mat2_rank_independence_s1",
          title: "Drag vectors; watch rank and (for 2D) det/area",
          sketchId: "mat2.independence",
          height: 520,
        },
        {
          type: "quiz",
          id: "mat2_rank_independence_q1",
          title: "Quick check",
          spec: {
            subject: LA_SUBJECT_SLUG,
            module: LA_MOD3,
            section: LA_SECTION_MOD3,
            topic: T3["mat2_rank_independence"],
            difficulty: "easy",
            n: 4,
            allowReveal: true,
          },
        },
      ],
    },

    {
      id: "mat2_rank_practice",
      label: "Rank in practice: tolerance + shifting A+αI",
      minutes: 18,
      summary:
        "Tiny noise can flip computed rank. Shifting by αI often restores full rank (critical for invertibility).",
      cards: [
        { type: "sketch", id: "mat2_rank_practice_s1", title: "Add noise + change tolerance, watch effective rank flip", sketchId: "mat2.rank", height: 420 },
        { type: "sketch", id: "mat2_rank_practice_s2", title: "Shift by αI: watch det and rank change instantly", sketchId: "mat2.shift", height: 460 },
        {
          type: "quiz",
          id: "mat2_rank_practice_q1",
          title: "Quick check",
          spec: {
            subject: LA_SUBJECT_SLUG,
            module: LA_MOD3,
            section: LA_SECTION_MOD3,
            topic: T3["mat2_rank_practice"],
            difficulty: "easy",
            n: 4,
            allowReveal: true,
          },
        },
      ],
    },

    {
      id: "mat2_rank_ops",
      label: "Rank tools: outer product (rank-1) + bounds for A+B and AB",
      minutes: 18,
      summary:
        "Outer product builds rank-1 matrices. Rank(A+B) and Rank(AB) have useful upper bounds (but aren’t determined exactly).",
      cards: [
        { type: "sketch", id: "mat2_rank_ops_s1", title: "Outer product u vᵀ always produces rank 1 (unless zero)", sketchId: "mat2.outer", height: 520 },
        { type: "sketch", id: "mat2_rank_ops_s2", title: "Play with A and B; see rank(A+B), rank(AB) and bounds", sketchId: "mat2.rankops", height: 520 },
        {
          type: "quiz",
          id: "mat2_rank_ops_q1",
          title: "Quick check",
          spec: {
            subject: LA_SUBJECT_SLUG,
            module: LA_MOD3,
            section: LA_SECTION_MOD3,
            topic: T3["mat2_rank_ops"],
            difficulty: "easy",
            n: 4,
            allowReveal: true,
          },
        },
      ],
    },

    {
      id: "mat2_det",
      label: "Determinant: area scaling + singular collapse",
      minutes: 14,
      summary:
        "In 2D, det(A) is the signed area scale factor. det(A)=0 means collapse to a line/point.",
      cards: [
        { type: "text", id: "mat2_det_t1", title: "Area + orientation", markdown: String.raw`$|\det(\mathbf{A})|$ is area scale; sign indicates flip.`.trim() },
        { type: "sketch", id: "mat2_det_s1", title: "Unit square image: det controls area + flip", sketchId: "mat2.det", height: 460 },
        {
          type: "quiz",
          id: "mat2_det_q1",
          title: "Quick check",
          spec: {
            subject: LA_SUBJECT_SLUG,
            module: LA_MOD3,
            section: LA_SECTION_MOD3,
            topic: T3["mat2_det"],
            difficulty: "easy",
            n: 4,
            allowReveal: true,
          },
        },
      ],
    },

    {
      id: "mat2_charpoly",
      label: "Characteristic polynomial: det(A−λI)=0 → eigenvalues",
      minutes: 16,
      summary:
        "Eigenvalues are λ where A−λI becomes singular, i.e., det(A−λI)=0.",
      cards: [
        { type: "text", id: "mat2_charpoly_t1", title: "Eigenvalue condition", markdown: String.raw`Eigenvalues satisfy $\det(\mathbf{A}-\lambda\mathbf{I})=0$.`.trim() },
        { type: "sketch", id: "mat2_charpoly_s1", title: "Slide λ, watch det(A−λI), and compare Av vs λv", sketchId: "mat2.charpoly", height: 520 },
        {
          type: "quiz",
          id: "mat2_charpoly_q1",
          title: "Quick check",
          spec: {
            subject: LA_SUBJECT_SLUG,
            module: LA_MOD3,
            section: LA_SECTION_MOD3,
            topic: T3["mat2_charpoly"],
            difficulty: "easy",
            n: 4,
            allowReveal: true,
          },
        },
      ],
    },
  ],
};
