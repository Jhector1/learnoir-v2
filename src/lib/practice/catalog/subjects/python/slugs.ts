import { getModuleSlugs } from "@/lib/practice/catalog/slugs";

import { PY_MOD0,PY_MOD1,PY_MOD2, PY_SUBJECT_SLUG } from "@/seed/data/subjects/python/constants";
export const PY0 = getModuleSlugs(PY_SUBJECT_SLUG, PY_MOD0);
export const PY1 = getModuleSlugs(PY_SUBJECT_SLUG, PY_MOD1);
export const PY2 = getModuleSlugs(PY_SUBJECT_SLUG, PY_MOD2);

export const PY_SECTION_PART0 = PY0.section;
export const PY_SECTION_PART1 = PY1.section;
export const PY_SECTION_PART2 =PY2.section;
export const PY_GENKEY_MOD0 = PY0.genKey;
export const PY_TOPIC_MOD0 = PY0.topics;
export const PY_TOPIC_MOD1 = PY1.topics;
export const PY_TOPIC_MOD2 = PY2.topics;
export type PyTopicId = keyof typeof PY_TOPIC_MOD0;
export type PyTopicSlug = (typeof PY_TOPIC_MOD0)[PyTopicId];
