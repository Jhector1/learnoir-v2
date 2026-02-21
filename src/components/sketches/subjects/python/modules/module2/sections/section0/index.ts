import {SketchEntry} from "@/components/sketches/subjects";
import {
    PY_CONDITIONALS_SECTION
} from "@/components/sketches/subjects/python/modules/module2/sections/section0/conditionals.section";
import {PY_FUNCTIONS_SECTION} from "@/components/sketches/subjects/python/modules/module2/sections/section0/functions.section";
import {PY_LOOPS_SECTION} from "@/components/sketches/subjects/python/modules/module2/sections/section0/loops.section";
import {PY_LISTS_SECTION} from "@/components/sketches/subjects/python/modules/module2/sections/section0/lists.section";

export const PY_SECTION0: Record<string, SketchEntry> = {
    ...PY_CONDITIONALS_SECTION,
    ...PY_LOOPS_SECTION,
    ...PY_FUNCTIONS_SECTION,
    ...PY_LISTS_SECTION,


}