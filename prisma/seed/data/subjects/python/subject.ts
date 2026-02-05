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
  },
  modules: PY_MODULES,
  topicGroups: PY_SECTIONS,
});

export const PYTHON_TOPIC = PYTHON.TOPIC;
