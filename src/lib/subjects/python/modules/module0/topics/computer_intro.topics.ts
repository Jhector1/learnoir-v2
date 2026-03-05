// src/components/sketches/subjects/python/modules/module0/topics/computer_intro.ts

import { TopicDefCompat } from "../../../../../../../prisma/seed/data/subjects/_types";
import { PY_MOD0 } from "../../../../../../../prisma/seed/data/subjects/python/constants";
import { PY_SECTION_PART0, PY_TOPIC_MOD0 } from "@/lib/practice/catalog/subjects/python/slugs";

import { M0_COMPUTER_POOL } from "@/lib/practice/generator/engines/python/python_part1_mod0/topics/computer";
import { ReviewTopicShape } from "@/lib/subjects/types";

const ID = "computer_intro" as const;
const MINUTES = 8 as const;

// ✅ keys match your JSON exactly
const K = {
    label: `@:topics.python.python-0.${ID}.label`,
    summary: `@:topics.python.python-0.${ID}.summary`,

    sketch0Title: `@:topics.python.python-0.${ID}.cards.sketch0.title`,
    sketch1Title: `@:topics.python.python-0.${ID}.cards.sketch1.title`,
    quizCardTitle: `@:topics.python.python-0.${ID}.cards.quiz.title`,
} as const;

export const PY_COMPUTER_INTRO = {
    topic: {
        id: ID,
        label: K.label as any,
        minutes: MINUTES,
        summary: K.summary as any,
        cards: [
            {
                type: "sketch",
                id: `${ID}_s0`,
                title: K.sketch0Title as any,
                sketchId: "py.computer.ipo",
                height: 520,
            },
            {
                type: "sketch",
                id: `${ID}_s1`,
                title: K.sketch1Title as any,
                sketchId: "py.computer.instructions",
                height: 520,
            },
            {
                type: "quiz",
                id: `${ID}_q0`,
                title: K.quizCardTitle as any,
                passScore: 0.75,
                spec: {
                    subject: "python",
                    module: PY_MOD0,
                    section: PY_SECTION_PART0,
                    topic: PY_TOPIC_MOD0.computer_intro,
                    difficulty: "easy",
                    n: M0_COMPUTER_POOL.length,
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
            // ✅ keep label as key too (renderer resolves @:)
            label: K.label as any,
            minutes: MINUTES,
            pool: M0_COMPUTER_POOL.map((p) => ({ ...p })),
        },
    } satisfies TopicDefCompat,
} satisfies { topic: ReviewTopicShape; def: TopicDefCompat };