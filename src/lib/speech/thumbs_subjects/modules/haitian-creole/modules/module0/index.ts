import {HC_GREETINGS} from "@/lib/subjects/modules/haitian-creole/modules/module0/topics/greetings.topics";
import {HC_PRONOUNS} from "@/lib/subjects/modules/haitian-creole/modules/module0/topics/pronouns.topics";
import {HC_SENTENCES} from "@/lib/subjects/modules/haitian-creole/modules/module0/topics/sentences.topics";
import {HC_QUESTIONS} from "@/lib/subjects/modules/haitian-creole/modules/module0/topics/questions.topics";
import {HC_NUMBERS} from "@/lib/subjects/modules/haitian-creole/modules/module0/topics/numbers.topics";
import {HT_SECTION_PART1} from "@/lib/practice/catalog/subjects/haitian-creole/slugs";
import {HC_MOD0} from "@/seed/data/subjects/haitian-creole";
import {ReviewModule} from "@/lib/subjects/types";

export const haitianCreolePart1Module: ReviewModule = {
    id: HC_MOD0,
    title: "Haitian Creole — Part 1",
    subtitle:
        "Basics: greetings, pronouns, simple sentences, questions, and numbers (interactive drills + quick quizzes).",

    startPracticeHref: (topicSlug) =>
        `/practice?section=${HT_SECTION_PART1}&difficulty=easy&topic=${encodeURIComponent(topicSlug)}`,

    topics: [
        HC_GREETINGS.topic,
        HC_PRONOUNS.topic,
        HC_SENTENCES.topic,
        HC_QUESTIONS.topic,
        HC_NUMBERS.topic,
    ],
};