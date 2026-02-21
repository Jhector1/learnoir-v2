// src/components/sketches/subjects/python/modules/module0/topics/computer_intro.ts
import { TopicDefCompat } from "../../../../../../../prisma/seed/data/subjects/_types";
import { PY_MOD0 } from "../../../../../../../prisma/seed/data/subjects/python/constants";
import { PY_SECTION_PART0, PY_TOPIC_MOD0 } from "@/lib/practice/catalog/subjects/python/slugs";

// ✅ import pool as source of truth
import { M0_COMPUTER_POOL } from "@/lib/practice/generator/engines/python/python_part1_mod0/topics/computer";

const ID = "computer_intro" as const;
const LABEL = "The Input → Processing → Output Model" as const;
const MINUTES = 8 as const;

export const PY_COMPUTER_INTRO = {
    topic: {
        id: ID,
        label: LABEL,
        minutes: MINUTES,
        summary:
            "Understand how computers take input, process it, and produce output in everyday examples.",
        cards: [
            {
                type: "sketch",
                id: `${ID}_s0`,
                title: "Input → Processing → Output",
                sketchId: "py.computer.ipo",
                height: 520,
            },
            {
                type: "sketch",
                id: `${ID}_s1`,
                title: "How Computers Follow Instructions",
                sketchId: "py.computer.instructions",
                height: 520,
            },

            // ✅ QUIZ
            {
                type: "quiz",
                id: `${ID}_q0`,
                title: "Quick check: IPO model",
                passScore: 0.75,
                spec: {
                    subject: "python",
                    module: PY_MOD0,
                    section: PY_SECTION_PART0,
                    topic: PY_TOPIC_MOD0.computer_intro,
                    difficulty: "easy",

                    // ✅ align to pool length to avoid forced repeats
                    n: M0_COMPUTER_POOL.length,

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
            // ✅ populated; clone to avoid readonly friction
            pool: M0_COMPUTER_POOL.map((p) => ({ ...p })),
        },
    } as const satisfies TopicDefCompat,
} as const;