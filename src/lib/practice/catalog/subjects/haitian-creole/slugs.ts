import { getModuleSlugs } from "@/lib/practice/catalog/slugs";

import {
  HC_MOD0 as HT_MOD0,
  HC_SUBJECT_SLUG as HT_SUBJECT_SLUG,
} from "../../../../../../prisma/seed/data/subjects/haitian-creole/constants";

export const HT0 = getModuleSlugs(HT_SUBJECT_SLUG, HT_MOD0);

export const HT_SECTION_PART1 = HT0.section;
export const HT_GENKEY_MOD0 = HT0.genKey;
export const HT_TOPIC = HT0.topics;

export type HtTopicId = keyof typeof HT_TOPIC;
export type HtTopicSlug = (typeof HT_TOPIC)[HtTopicId];
