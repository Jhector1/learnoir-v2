import type {ReviewModule} from "@/lib/subjects/types";
import {PY_SECTION_PART0, PY_TOPIC_MOD0} from "@/lib/practice/catalog/subjects/python/slugs";
import {PY_MOD0} from "../../../../../../prisma/seed/data/subjects/python/constants";
import {PY_WORKSPACE} from "@/lib/subjects/python/modules/module0/topics/workspace.topics";
import {PY_COMPUTER_INTRO} from "@/lib/subjects/python/modules/module0/topics/computer_intro.topics";
import {PY_PROGRAMMING_INTRO} from "@/lib/subjects/python/modules/module0/topics/programming_intro.topics";
import {PY_SYNTAX} from "@/lib/subjects/python/modules/module0/topics/syntax_intro.topics";
import {PY_COMMENTS} from "@/lib/subjects/python/modules/module0/topics/comments.topics";
import {
    PY_SYNTAX_COMMENTS_SECTION
} from "@/components/sketches/subjects/python/modules/module0/sections/section0/comments.section";


export const pythonModule0: ReviewModule = {
    id: PY_MOD0,
    title: "Python — Part 0",
    subtitle:
        "Learn: how computers work, what programming is, Python syntax, your workspace, and comments.",

    startPracticeHref: (topicSlug) =>
        `/practice?section=${PY_SECTION_PART0}&difficulty=easy&topic=${encodeURIComponent(topicSlug)}`,

    topics: [
        PY_COMPUTER_INTRO.topic,

        PY_PROGRAMMING_INTRO.topic,
        PY_SYNTAX.topic,
        PY_WORKSPACE.topic,
        PY_COMMENTS.topic,


    ],
};
