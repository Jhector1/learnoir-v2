import { defineSubject } from "../_builder";
import { HC_SUBJECT_SLUG } from "./constants";
import { HC_MODULES } from "./modules";
import { HC_SECTIONS } from "./sections";

export const HAITIAN_CREOLE = defineSubject({
  subject: {
    slug: HC_SUBJECT_SLUG,
    order: 20,
    title: "Haitian Creole",
    description: "Haitian Creole language practice.",
    imagePublicId: "IMG_0299_c9rkdr",
    imageAlt: "Haitian Creole subject cover",
    status: "disabled",
  },
  modules: HC_MODULES,
  topicGroups: HC_SECTIONS,
});

export const HC_TOPIC = HAITIAN_CREOLE.TOPIC;
