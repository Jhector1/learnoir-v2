// src/components/sketches/subjects/python/modules/module0/topics/comments.ts
import { TopicDefCompat } from "../../../../../../../prisma/seed/data/subjects/_types";
import { PY_MOD0 } from "../../../../../../../prisma/seed/data/subjects/python/constants";
import { PY_SECTION_PART0, PY_TOPIC_MOD0 } from "@/lib/practice/catalog/subjects/python/slugs";

// ✅ import pool from generator topic (source of truth)
import { M0_COMMENTS_POOL } from "@/lib/practice/generator/engines/python/python_part1_mod0/topics/comments";
import {ReviewTopicShape} from "@/lib/subjects/types";

const ID = "comments_intro" as const;
const LABEL = "Comments: Notes to Humans (Python Ignores Them)" as const;
const MINUTES = 4 as const;

export const PY_COMMENTS = {
    topic: {
        id: ID,
        label: LABEL,
        minutes: MINUTES,
        summary:
            "Learn # comments to document your thinking, label steps, and temporarily disable lines while debugging.",
        cards: [
            {
                type: "sketch",
                id: `${ID}_s0`,
                title: "Comments in Python (#)",
                sketchId: "py.syntax.comments",
                height: 520,
            },
            {
                type: "quiz",
                id: `${ID}_q0`,
                title: "Quick check: comments",
                passScore: 0.75,
                spec: {
                    subject: "python",
                    module: PY_MOD0,
                    section: PY_SECTION_PART0,
                    topic: PY_TOPIC_MOD0.comments_intro,
                    difficulty: "easy",
                    n: M0_COMMENTS_POOL.length, // ✅ matches pool length (no repeats if you enforce uniqueness)
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
            // ✅ clone objects to avoid readonly friction in some TS setups
            pool: M0_COMMENTS_POOL.map((p) => ({ ...p })),
        },
   }  satisfies TopicDefCompat,
} satisfies { topic: ReviewTopicShape; def: TopicDefCompat };