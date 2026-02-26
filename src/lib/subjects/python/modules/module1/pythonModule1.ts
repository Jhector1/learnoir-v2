import type {ReviewModule} from "@/lib/subjects/types";
import { PY_SECTION_PART1, PY_TOPIC_MOD0} from "@/lib/practice/catalog/subjects/python/slugs";
import { PY_MOD1} from "../../../../../../prisma/seed/data/subjects/python/constants";
import {
    PY_OPERATORS_EXPRESSIONS
} from "@/lib/subjects/python/modules/module1/topics/operators_expressions.topics";
import {PY_STRING_BASICS} from "@/lib/subjects/python/modules/module1/topics/string_basics.topics";
import {
    PY_INPUT_OUTPUT_PATTERNS
} from "@/lib/subjects/python/modules/module1/topics/input_output_patterns.topics";
import {PY_VARIABLES} from "@/lib/subjects/python/modules/module1/topics/variables.topics";
import {PY_ERRORS} from "@/lib/subjects/python/modules/module1/topics/errors.topics";
import {PY_TYPES} from "@/lib/subjects/python/modules/module1/topics/data_types.topics";

export const pythonModule1: ReviewModule = {
    id: PY_MOD1,
    title: "Python — Part 1",
    subtitle:
        "Variables + types, operators + expressions, strings, and input/output mini-program patterns.",

    startPracticeHref: (topicSlug) =>
        `/practice?section=${PY_SECTION_PART1}&difficulty=easy&topic=${encodeURIComponent(topicSlug)}`,

    topics: [


        PY_VARIABLES.topic,
        PY_TYPES.topic,
        PY_ERRORS.topic,

        PY_OPERATORS_EXPRESSIONS.topic,

        PY_STRING_BASICS.topic,
        PY_INPUT_OUTPUT_PATTERNS.topic






    ],
};
