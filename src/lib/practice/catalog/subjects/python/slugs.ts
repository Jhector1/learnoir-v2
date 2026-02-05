import { getModuleSlugs } from "@/lib/practice/catalog/slugs";

import { PY_MOD0, PY_SUBJECT_SLUG } from "../../../../../../prisma/seed/data/subjects/python/constants";
export const PY0 = getModuleSlugs(PY_SUBJECT_SLUG, PY_MOD0);

export const PY_SECTION_PART1 = PY0.section;
export const PY_GENKEY_MOD0 = PY0.genKey;
export const PY_TOPIC = PY0.topics;

export type PyTopicId = keyof typeof PY_TOPIC;
export type PyTopicSlug = (typeof PY_TOPIC)[PyTopicId];
