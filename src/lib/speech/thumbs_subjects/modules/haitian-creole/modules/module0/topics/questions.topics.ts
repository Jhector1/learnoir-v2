// import { TopicDefCompat } from "../../../../../../../prisma/seed/data/subjects/_types";
// import { HC_MOD0 } from "../../../../../../../prisma/seed/data/subjects/haitian-creole/constants";
import { HT_SECTION_PART1, HT_TOPIC } from "@/lib/practice/catalog/subjects/haitian-creole/slugs";

// import { M0_HC_QUESTIONS_POOL } from "@/lib/practice/generator/engines/haitian_creole/haitian_creole_part1_mod0/topics/questions";
import { SketchEntry } from "@/components/sketches/subjects";
import { HC_MOD0 } from "@/seed/data/subjects/haitian-creole/constants";import {TopicDefCompat} from "@/seed/data/subjects/_types";
import {HC_QUESTIONS_POOL} from "@/lib/practice/generator/engines/haitian_creole/haitian_creole_mod0/topics/questions";
import {ReviewTopicShape} from "@/lib/subjects/types";

const ID = "hc_questions" as const;
const LABEL = "Question words" as const;
const MINUTES = 14 as const;

export const HC_QUESTIONS = {
    topic: {
        id: ID,
        label: LABEL,
        minutes: MINUTES,
        summary: "Ask who/what/where/when/why/how with the most common question words.",
        cards: [
            {
                type: "sketch",
                id: `${ID}_s0`,
                title: "Question words (cheat sheet)",
                sketchId: "ht.hc.mod0.questions.lesson",
                height: 580,
            },
            {
                type: "sketch",
                id: `${ID}_s1`,
                title: "Question builder + meaning check",
                sketchId: "hc.questions",
                height: 500,
            },
            {
                type: "quiz",
                id: `${ID}_q0`,
                title: "Quick check: questions",
                passScore: 0.75,
                spec: {
                    subject: "haitian-creole",
                    module: HC_MOD0,
                    section: HT_SECTION_PART1,
                    topic: HT_TOPIC.questions,
                    difficulty: "easy",
                    n: 4,
                    allowReveal: true,
                    preferKind: null,
                    maxAttempts: 10,
                },
            },
        ],
    } satisfies ReviewTopicShape,


    def: {
        id: ID,
        meta: {
            label: LABEL,
            minutes: MINUTES,
            pool: HC_QUESTIONS_POOL.map((p) => ({ ...p })),
        },
    }  satisfies TopicDefCompat,
} satisfies { topic: ReviewTopicShape; def: TopicDefCompat };

