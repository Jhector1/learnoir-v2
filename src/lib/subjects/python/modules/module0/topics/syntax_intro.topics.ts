// src/components/sketches/subjects/python/modules/module0/topics/syntax.ts
import { TopicDefCompat } from "../../../../../../../prisma/seed/data/subjects/_types";
import { PY_MOD0 } from "../../../../../../../prisma/seed/data/subjects/python/constants";
import { PY_SECTION_PART0, PY_TOPIC_MOD0 } from "@/lib/practice/catalog/subjects/python/slugs";

// ✅ pool source of truth
import { M0_SYNTAX_POOL } from "@/lib/practice/generator/engines/python/python_part1_mod0/topics/syntax";
import {ReviewTopicShape} from "@/lib/subjects/types";

const ID = "syntax_intro" as const;
const LABEL = "Syntax: Rules Computers Require" as const;
const MINUTES = 8 as const;

export const PY_SYNTAX = {
    topic: {
        id: ID,
        label: LABEL,
        minutes: MINUTES,
        summary: "Learn what syntax means and why breaking syntax causes errors like SyntaxError.",
        cards: [
            {
                type: "sketch",
                id: `${ID}_s0`,
                title: LABEL,
                sketchId: "py.syntax.intro",
                height: 520,
            },

            {
                type: "quiz",
                id: `${ID}_q0`,
                title: "Quick check: syntax",
                passScore: 0.75,
                spec: {
                    subject: "python",
                    module: PY_MOD0,
                    section: PY_SECTION_PART0,
                    topic: PY_TOPIC_MOD0.syntax_intro,
                    difficulty: "easy",

                    // ✅ align to pool size (you had 4 but only 3 keys)
                    n: M0_SYNTAX_POOL.length,

                    allowReveal: true,
                    preferKind: null,
                    maxAttempts: 1,
                },
            },
        ],
    } satisfies ReviewTopicShape,

    def: {
        id: ID,
        meta: {
            label: LABEL,
            minutes: MINUTES,
            pool: M0_SYNTAX_POOL.map((p) => ({ ...p })),
        },
   }  satisfies TopicDefCompat,
} satisfies { topic: ReviewTopicShape; def: TopicDefCompat };