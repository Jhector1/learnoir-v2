// src/components/review/sketches/python/part1/configs.ts
import type { SketchEntry } from "@/components/sketches/subjects/registryTypes";

import {LA_VECTORS_PART1_SECTION} from "@/components/sketches/subjects/linear_algebra/modules/module0/sections/section0/vectors.section";
import {
    LA_MODULE2_SECTION
} from "@/components/sketches/subjects/linear_algebra/modules/module2/sections/section0/core.section";


export const LA_PART1_SKETCHES: Record<string, SketchEntry> = {
    // ---------- SECTION I - Topic { print() complete } ----------
    ...LA_VECTORS_PART1_SECTION,
    ...LA_MODULE2_SECTION

};
