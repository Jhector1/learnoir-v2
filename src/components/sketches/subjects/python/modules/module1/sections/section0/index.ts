import {
    PY_STRING_BASICS_SECTION
} from "@/components/sketches/subjects/python/modules/module1/sections/section0/string_basics.section";
import {
    PY_OPERATORS_EXPRESSIONS_SECTION
} from "@/components/sketches/subjects/python/modules/module1/sections/section0/operators_expressions.section";
import {
    PY_INPUT_OUTPUT_PATTERNS_SECTION
} from "@/components/sketches/subjects/python/modules/module1/sections/section0/input_output_patterns.section";
import {SketchEntry} from "@/components/sketches/subjects";
import {
    PY_VARIABLES_TYPES_SECTION
} from "@/components/sketches/subjects/python/modules/module1/sections/section0/variables_types.section";

export const PY_SECTION0: Record<string, SketchEntry> = {
    ...PY_STRING_BASICS_SECTION,
    ...PY_VARIABLES_TYPES_SECTION,
    ...PY_OPERATORS_EXPRESSIONS_SECTION,
    ...PY_INPUT_OUTPUT_PATTERNS_SECTION,


}