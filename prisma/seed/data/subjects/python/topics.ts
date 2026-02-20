// src/lib/subjects/python/topics.ts
import { TopicDefCompat } from "../_types";
import { PY_MOD0, PY_MOD1 } from "./constants";

// Mod0
import { PY_COMPUTER_INTRO } from "@/lib/subjects/python/modules/module0/topics/computer_intro.topics";
import { PY_PROGRAMMING_INTRO } from "@/lib/subjects/python/modules/module0/topics/programming_intro.topics";
import { PY_SYNTAX } from "@/lib/subjects/python/modules/module0/topics/syntax_intro.topics";
import { PY_WORKSPACE } from "@/lib/subjects/python/modules/module0/topics/workspace.topics";
import { PY_COMMENTS } from "@/lib/subjects/python/modules/module0/topics/comments.topics";

// Mod1
import { PY_OPERATORS_EXPRESSIONS } from "@/lib/subjects/python/modules/module1/topics/operators_expressions.topics";
import { PY_STRING_BASICS } from "@/lib/subjects/python/modules/module1/topics/string_basics.topics";
import { PY_INPUT_OUTPUT_PATTERNS } from "@/lib/subjects/python/modules/module1/topics/input_output_patterns.topics";
import {PY_VARIABLES_TYPES} from "@/lib/subjects/python/modules/module1/topics/py_variables_types.topics";

export const PY_TOPICS = {
  [PY_MOD0]: [
    PY_COMPUTER_INTRO.def,
    PY_PROGRAMMING_INTRO.def,
    PY_SYNTAX.def,
    PY_WORKSPACE.def,
    PY_COMMENTS.def,
  ],

  [PY_MOD1]: [
    PY_VARIABLES_TYPES.def,
    PY_OPERATORS_EXPRESSIONS.def,
    PY_STRING_BASICS.def,
    PY_INPUT_OUTPUT_PATTERNS.def,
  ],
} satisfies Record<string, TopicDefCompat[]>;
