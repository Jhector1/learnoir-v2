// import {SketchEntry} from "../../../../";
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
    PY_WORKSPACE_SECTION
} from "@/components/sketches/subjects/python/modules/module0/sections/section0/workspace.section";
import {
    PY_SYNTAX_COMMENTS_SECTION
} from "@/components/sketches/subjects/python/modules/module0/sections/section0/comments.section";
import {SketchEntry} from "@/components/sketches/subjects";

export const PY_SECTION0: Record<string, SketchEntry> = {
    ...PY_COMPUTER_INTRO_SECTION,
    ...PY_PROGRAMMING_INTRO_SECTION,
    ...PY_SYNTAX_SECTION,
    ...PY_SYNTAX_COMMENTS_SECTION,
    ...PY_WORKSPACE_SECTION,


}