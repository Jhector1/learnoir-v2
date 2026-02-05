import type { ReviewModule } from "@/lib/review/types";
import {

  LA_SECTION_MOD1,
  LA_TOPIC_MOD1,
} from "@/lib/practice/catalog/subjects/linear_algebra/slugs";
import {
  LA_SUBJECT_SLUG,
  LA_MOD1,

} from "../../../../../prisma/seed/data/subjects/linear-algebra/constants";

export const vectorsPart2Module: ReviewModule = {
  id: LA_MOD1,
  title: "Vectors, Part 2",
  subtitle: "Sets → combos → independence → span/subspace → basis",

  startPracticeHref: (topicSlug) =>
    `/practice?section=${LA_SECTION_MOD1}&difficulty=easy&topic=${encodeURIComponent(
      topicSlug,
    )}`,

  topics: [
    {
      id: "vector-sets",
      label: "Vector sets",
      minutes: 6,
      summary: "A set is just a collection of vectors (finite, infinite, or empty).",
      cards: [
        {
          type: "text",
          id: "t1",
          title: "What is a vector set?",
          markdown: String.raw`
A **vector set** is just a **collection** of vectors.

$$
V=\{\vec v_1,\vec v_2,\dots,\vec v_n\}
$$
`.trim(),
        },
        {
          type: "quiz",
          id: "q1",
          title: "Quick check",
          spec: {
            subject: LA_SUBJECT_SLUG,
            module: LA_MOD1,
            section: LA_SECTION_MOD1,
            topic: LA_TOPIC_MOD1.vector_sets,
            difficulty: "easy",
            n: 4,
            allowReveal: true,
          },
        },
      ],
    },

    {
      id: "linear-combos",
      label: "Linear weighted combinations",
      minutes: 10,
      summary: "Multiply vectors by scalars and add them to make a new vector.",
      cards: [
        {
          type: "text",
          id: "t2",
          title: "Definition",
          markdown: String.raw`
A **linear weighted combination** means: multiply vectors by scalars, then add.

$$
\vec w=\lambda_1\vec v_1+\lambda_2\vec v_2+\cdots+\lambda_n\vec v_n
$$
`.trim(),
        },
        {
          type: "quiz",
          id: "q2",
          title: "Quick check",
          spec: {
            subject: LA_SUBJECT_SLUG,
            module: LA_MOD1,
            section: LA_SECTION_MOD1,
            topic: LA_TOPIC_MOD1.linear_combos,
            difficulty: "easy",
            n: 4,
            allowReveal: true,
          },
        },
      ],
    },

    {
      id: "independence",
      label: "Linear independence",
      minutes: 12,
      summary: "Independent means no vector is redundant.",
      cards: [
        {
          type: "text",
          id: "t3",
          title: "Concept + the zero-vector test",
          markdown: String.raw`
A set is:

- **dependent** if at least one vector can be written as a linear combination of the others.
- **independent** if no vector can be written that way.
`.trim(),
        },
        {
          type: "sketch",
          id: "s1",
          title: "Drag: dependent vs independent",
          sketchId: "vec.independence",
          height: 420,
        },
        {
          type: "quiz",
          id: "q3",
          title: "Quick check",
          spec: {
            subject: LA_SUBJECT_SLUG,
            module: LA_MOD1,
            section: LA_SECTION_MOD1,
            topic: LA_TOPIC_MOD1.independence,
            difficulty: "easy",
            n: 4,
            allowReveal: true,
          },
        },
      ],
    },

    {
      id: "span-subspace",
      label: "Span and subspace",
      minutes: 12,
      summary: "All possible linear combinations form a subspace.",
      cards: [
        {
          type: "text",
          id: "t4",
          title: "Span creates a subspace",
          markdown: String.raw`
The **span** of vectors is the set of **all** linear combinations you can make.
`.trim(),
        },
        {
          type: "sketch",
          id: "s2",
          title: "Drag vectors: see the span",
          sketchId: "vec.span",
          height: 420,
        },
        {
          type: "quiz",
          id: "q4",
          title: "Quick check",
          spec: {
            subject: LA_SUBJECT_SLUG,
            module: LA_MOD1,
            section: LA_SECTION_MOD1,
            topic: LA_TOPIC_MOD1.span_subspace,
            difficulty: "easy",
            n: 4,
            allowReveal: true,
          },
        },
      ],
    },

    {
      id: "basis",
      label: "Basis",
      minutes: 12,
      summary: "A basis is an independent set that spans a subspace (unique coordinates!).",
      cards: [
        {
          type: "text",
          id: "t5",
          title: "Basis = span + independence",
          markdown: String.raw`
A set of vectors is a **basis** for a subspace if it:

1) **spans** the subspace  
2) is **linearly independent**
`.trim(),
        },
        {
          type: "sketch",
          id: "s3",
          title: "Same point, different bases",
          sketchId: "vec.basis",
          height: 440,
        },
        {
          type: "quiz",
          id: "q5",
          title: "Quick check",
          spec: {
            subject: LA_SUBJECT_SLUG,
            module: LA_MOD1,
            section: LA_SECTION_MOD1,
            topic: LA_TOPIC_MOD1.basis,
            difficulty: "easy",
            n: 4,
            allowReveal: true,
          },
        },
      ],
    },
  ],
};
