import {SketchEntry} from "../../../../.";
import {
    PY_COMPUTER_INTRO_SECTION
} from "@/components/sketches/subjects/python/modules/module0/sections/section0/computer_intro.section";
import {
    PY_PROGRAMMING_INTRO_SECTION
} from "@/components/sketches/subjects/python/modules/module0/sections/section0/programming_intro.section";
import {
    PY_SYNTAX_SECTION
} from "@/components/sketches/subjects/python/modules/module0/sections/section0/syntax_intro.section";
import {
    PY_FUNCTION_INTRO_SECTION
} from "@/components/sketches/subjects/python/modules/module0/sections/section0/function_intro.section";
import {
    PY_WORKSPACE_SECTION
} from "@/components/sketches/subjects/python/modules/module0/sections/section0/workspace.section";
import {
    PY_VARIABLES_TYPES_SECTION
} from "@/components/sketches/subjects/python/modules/module0/sections/section0/variables_types.section";
import {
    PY_OPERATORS_EXPRESSIONS_SECTION
} from "@/components/sketches/subjects/python/modules/module0/sections/section0/operators_expressions.section";
import {
    PY_STRING_BASICS_SECTION
} from "@/components/sketches/subjects/python/modules/module0/sections/section0/string_basics.section";
import {
    PY_INPUT_OUTPUT_PATTERNS_SECTION
} from "@/components/sketches/subjects/python/modules/module0/sections/section0/input_output_patterns.section";

import {
    PY_CONDITIONALS_SECTION
} from "@/components/sketches/subjects/python/modules/module0/sections/section0/conditionals.section";
import {PY_LOOPS_SECTION} from "@/components/sketches/subjects/python/modules/module0/sections/section0/loops.section";
import {PY_LISTS_SECTION} from "@/components/sketches/subjects/python/modules/module0/sections/section0/lists.section";
import {
    PY_FUNCTIONS_SECTION
} from "@/components/sketches/subjects/python/modules/module0/sections/section0/functions.section";
import {
    PY_SYNTAX_COMMENTS_SECTION
} from "@/components/sketches/subjects/python/modules/module0/sections/section0/comments.section";

export const PY_SECTION0: Record<string, SketchEntry> = {
    ...PY_COMPUTER_INTRO_SECTION,
    ...PY_PROGRAMMING_INTRO_SECTION,
    ...PY_SYNTAX_SECTION,
    ...PY_SYNTAX_COMMENTS_SECTION,
    ...PY_WORKSPACE_SECTION,
    ...PY_VARIABLES_TYPES_SECTION,
    ...PY_FUNCTION_INTRO_SECTION,
    ...PY_OPERATORS_EXPRESSIONS_SECTION,
    ...PY_STRING_BASICS_SECTION,
    ...PY_INPUT_OUTPUT_PATTERNS_SECTION,
    ...PY_CONDITIONALS_SECTION,
    ...PY_LOOPS_SECTION,
    ...PY_LISTS_SECTION,


    ...PY_FUNCTIONS_SECTION,

}