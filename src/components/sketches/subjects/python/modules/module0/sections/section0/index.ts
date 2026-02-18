import {SketchEntry} from "../../../../.";
import {
    PY_COMPUTER_INTRO_SECTION
} from "@/components/sketches/subjects/python/modules/module0/sections/section0/computer_intro.section";
import {
    PY_PROGRAMMING_INTRO_SECTION
} from "@/components/sketches/subjects/python/modules/module0/sections/section0/programming_intro.section";
import {PY_SYNTAX_SECTION} from "@/components/sketches/subjects/python/modules/module0/sections/section0/syntax_intro.section";
import {
    PY_FUNCTION_INTRO_SECTION
} from "@/components/sketches/subjects/python/modules/module0/sections/section0/function_intro.section";
import {PY_WORKSPACE_SECTION} from "@/components/sketches/subjects/python/modules/module0/sections/section0/workspace.section";
import {
    PY_VARIABLES_TYPES_SECTION
} from "@/components/sketches/subjects/python/modules/module0/sections/section0/variables_types.section";
import {
    PY_OPERATORS_EXPRESSIONS_SECTION
} from "@/components/sketches/subjects/python/modules/module0/sections/section0/operators_expressions.section";

export const PY_SECTION0: Record<string, SketchEntry> = {
...PY_COMPUTER_INTRO_SECTION,
    ...PY_PROGRAMMING_INTRO_SECTION,
    ...PY_SYNTAX_SECTION,
    ...PY_WORKSPACE_SECTION,
    ...PY_VARIABLES_TYPES_SECTION,
    ...PY_FUNCTION_INTRO_SECTION,
    ...PY_OPERATORS_EXPRESSIONS_SECTION,

}