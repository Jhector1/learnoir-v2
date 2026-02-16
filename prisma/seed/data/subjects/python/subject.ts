import { defineSubject } from "../_builder";
import { PY_SUBJECT_SLUG } from "./constants";
import { PY_MODULES } from "./modules";
import { PY_SECTIONS } from "./sections";

export const PYTHON = defineSubject({
  subject: {
    slug: PY_SUBJECT_SLUG,
    order: 10,
    title: "Python",
    description: "Python programming practice.",
    imagePublicId: "Screenshot_2026-02-03_at_1.19.20_AM_kdnlpk",
    imageAlt: "Python subject cover",
  },
  modules: PY_MODULES,
  topicGroups: PY_SECTIONS,
});

export const PYTHON_TOPIC = PYTHON.TOPIC;
