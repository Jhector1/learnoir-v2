import { getModuleSlugs } from "@/lib/practice/catalog/slugs";

import {
    AI_MOD0,
    AI_SUBJECT_SLUG,
} from "../../../../../../prisma/seed/data/subjects/ai/constants";

export const AI0 = getModuleSlugs(AI_SUBJECT_SLUG, AI_MOD0);

export const AI_SECTION_MOD0 = AI0.section;
export const AI_GENKEY_MOD0 = AI0.genKey;
export const AI_TOPIC = AI0.topics;

export type AiTopicId = keyof typeof AI_TOPIC;
export type AiTopicSlug = (typeof AI_TOPIC)[AiTopicId];
