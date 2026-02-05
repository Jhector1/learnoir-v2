import { getModuleSlugs } from "@/lib/practice/catalog/slugs";
import { LA_MOD0, LA_MOD1, LA_MOD2, LA_MOD3, LA_SUBJECT_SLUG } from "../../../../../../prisma/seed/data/subjects/linear-algebra/constants";

// export const LA_SUBJECT = "linear-algebra" as const;

// export const LA_MOD0 = "linear-algebra-0" as const;
// export const LA_MOD1 = "linear-algebra-1" as const;
// export const LA_MOD2 = "linear-algebra-2" as const;
// export const LA_MOD3 = "linear-algebra-3" as const;

export const LA0 = getModuleSlugs(LA_SUBJECT_SLUG, LA_MOD0);
export const LA1 = getModuleSlugs(LA_SUBJECT_SLUG, LA_MOD1);
export const LA2 = getModuleSlugs(LA_SUBJECT_SLUG, LA_MOD2);
export const LA3 = getModuleSlugs(LA_SUBJECT_SLUG, LA_MOD3);

export const LA_SECTION_MOD0 = LA0.section;
export const LA_SECTION_MOD1 = LA1.section;
export const LA_SECTION_MOD2 = LA2.section;
export const LA_SECTION_MOD3 = LA3.section;

export const LA_GENKEY_MOD0 = LA0.genKey;
export const LA_GENKEY_MOD1 = LA1.genKey;
export const LA_GENKEY_MOD2 = LA2.genKey;
export const LA_GENKEY_MOD3 = LA3.genKey;

export const LA_TOPIC_MOD0 = LA0.topics;
export const LA_TOPIC_MOD1 = LA1.topics;
export const LA_TOPIC_MOD2 = LA2.topics;
export const LA_TOPIC_MOD3 = LA3.topics;

export type LaTopicIdMod0 = keyof typeof LA_TOPIC_MOD0;
export type LaTopicSlugMod0 = (typeof LA_TOPIC_MOD0)[LaTopicIdMod0];
