// prisma/seed/data/subjects/linear-algebra/subject.ts
import { LA_SUBJECT_SLUG } from "./constants";
import { defineSubject } from "../_builder";
import { LA_MODULES } from "./modules";
import { LA_SECTIONS } from "./sections";
// import { LA_TOPICS } from "./topics";

// const SUBJECT_SLUG = "linear-algebra";
// const MOD0 = "linear-algebra-0";
// const PREFIX0 = "la0";

export const LINEAR_ALGEBRA = defineSubject({
  subject: {
    slug: LA_SUBJECT_SLUG,
    order: 10,
    title: "Linear Algebra",
    description: "Linear algebra practice.",
    imagePublicId: "Screenshot_2026-02-03_at_1.19.33_AM_cbhr1y",
    imageAlt: "Linear algebra subject cover",
  },

  modules: LA_MODULES,

  topicGroups: LA_SECTIONS
});

// Optional export if you like ergonomic references:
// LINEAR_ALGEBRA.TOPIC.io_vars === "la0.io_vars"
export const LINEAR_ALGEBRA_TOPIC = LINEAR_ALGEBRA.TOPIC;
