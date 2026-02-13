import type { ReviewModule } from "@/lib/review/types";

import {LA_MOD0, LA_MOD1, LA_MOD2, LA_MOD3, LA_MOD4} from "../../../prisma/seed/data/subjects/linear-algebra/constants";
import {  PY_MOD0 } from "../../../prisma/seed/data/subjects/python/constants";

import { vectorsModule } from "@/lib/review/modules/linear_algebra/vectors";
import { vectorsPart2Module } from "@/lib/review/modules/linear_algebra/vectorsPart2Module";
import { matricesPart1Module } from "@/lib/review/modules/linear_algebra/matricesPart1Module";
import { matricesPart2Module } from "@/lib/review/modules/linear_algebra/matricesPart2Module";
import { pythonPart1Module } from "@/lib/review/modules/python/pythonPart1Module";
import { PY_SUBJECT_SLUG } from "../../../prisma/seed/data/subjects/python/constants";
import { LA_SUBJECT_SLUG } from "../../../prisma/seed/data/subjects/linear-algebra/constants";
import { HC_MOD0, HC_SUBJECT_SLUG } from "../../../prisma/seed/data/subjects/haitian-creole/constants";
import { haitianCreolePart1Module } from "./modules/haitian-creole/haitianCreolePart1Module";
// import {makeGenAnalyticGeometry} from "@/lib/practice/generator/engines/linear_algebra/matricePart4";
import {analyticGeometryModule} from "@/lib/review/modules/linear_algebra/vectorsMatricesPart3Module";
import {aiBasicsPart1Module} from "@/lib/review/modules/ai/aiPart1";
import {AI_MOD0, AI_SUBJECT_SLUG} from "../../../prisma/seed/data/subjects/ai";


export const REVIEW_REGISTRY: Record<string, Record<string, ReviewModule>> = {
  [LA_SUBJECT_SLUG]: {
    [LA_MOD0]: vectorsModule,
    [LA_MOD1]: vectorsPart2Module,   // ⚠️ mismatch if LA_MOD1 is “Linear Systems” in DB
    [LA_MOD2]: matricesPart1Module,
    [LA_MOD3]: matricesPart2Module,
    [LA_MOD4]: analyticGeometryModule,
  },
  [PY_SUBJECT_SLUG]: {
    [PY_MOD0]: pythonPart1Module,
  },
  [HC_SUBJECT_SLUG]: {
    [HC_MOD0]:haitianCreolePart1Module

  },
  [AI_SUBJECT_SLUG]: {
    [AI_MOD0]:aiBasicsPart1Module

  },
};

export function getReviewModule(subjectSlug: string, moduleId: string) {
  return REVIEW_REGISTRY[subjectSlug]?.[moduleId] ?? null;
}

export function hasReviewModule(subjectSlug: string, moduleId: string) {
  return Boolean(REVIEW_REGISTRY[subjectSlug]?.[moduleId]);
}
