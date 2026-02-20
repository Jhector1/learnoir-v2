import type {ReviewModule} from "@/lib/subjects/types";
import {PY_SECTION_PART0, PY_TOPIC_MOD0} from "@/lib/practice/catalog/subjects/python/slugs";
import {PY_MOD0} from "../../../../../../prisma/seed/data/subjects/python/constants";
import {PY_FUNCTION_TOPICS} from "@/lib/subjects/python/modules/module0/topics/function_intro.topics";
import {PY_LISTS_TOPICS} from "@/lib/subjects/python/modules/module2/topics/lists.topics";
import {PY_FUNCTIONS_TOPICS} from "@/lib/subjects/python/modules/module2/topics/functions.topics";
import {PY_LOOPS_TOPICS} from "@/lib/subjects/python/modules/module2/topics/loops.topics";
import {PY_CONDITIONALS_TOPICS} from "@/lib/subjects/python/modules/module2/topics/conditionals.topics";

export const pythonPart1Module: ReviewModule = {
    id: PY_MOD0,
    title: "Python — Part 1",
    subtitle:
        "Your first programs: print/input, variables, strings, math, comments, and common errors",

    startPracticeHref: (topicSlug) =>
        `/practice?section=${PY_SECTION_PART0}&difficulty=easy&topic=${encodeURIComponent(topicSlug)}`,

    topics: [
        PY_CONDITIONALS_TOPICS,
        PY_LOOPS_TOPICS,
        PY_LISTS_TOPICS,

        // PY_FUNCTION_TOPICS,//Intro
        PY_FUNCTIONS_TOPICS,

    ],
};
