// src/components/sketches/subjects/python/modules/module0/topics/programming_intro.ts
import { TopicDefCompat } from "../../../../../../../prisma/seed/data/subjects/_types";
import {PY_SECTION_PART0, PY_TOPIC_MOD0} from "@/lib/practice/catalog/subjects/python/slugs";
import {PY_MOD0} from "../../../../../../../prisma/seed/data/subjects/python/constants";

const ID = "programming_intro" as const;
const LABEL = "Programming Languages: Talking to Computers" as const;
const MINUTES = 8 as const;

export const PY_PROGRAMMING_INTRO = {
    topic: {
        id: ID,
        label: LABEL,
        minutes: MINUTES,
        summary: "Learn what a programming language is and why Python is a great first language.",
        cards: [
            {
                type: "sketch",
                id: `${ID}_s0`,
                title: LABEL,
                sketchId: "py.programming.intro",
                height: 520,
            },

            // ✅ QUIZ
            {
                type: "quiz",
                id: `${ID}_q0`,
                title: "Quick check: programming languages",
                passScore: 0.75,
                spec: {
                    subject: "python",
                    module: PY_MOD0,
                    section: PY_SECTION_PART0,

                    topic: PY_TOPIC_MOD0.programming_intro,

                    difficulty: "easy",
                    n: 2,
                    allowReveal: true,
                    preferKind: null,
                    maxAttempts: 1,
                },
            },
        ],
    } as const,

    def: {
        id: ID,
        meta: {
            label: LABEL,
            minutes: MINUTES,
            pool: [],
        },
    } as const satisfies TopicDefCompat,
} as const;
