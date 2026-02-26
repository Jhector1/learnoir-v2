// src/lib/subjects/modules/haitian-creole/modules/module0/topics/numbers.topics.ts
import type { ReviewModule } from "@/lib/subjects/types";
import type { TopicSlug } from "@/lib/practice/types";

import { HT_SECTION_PART1, HT_TOPIC } from "@/lib/practice/catalog/subjects/haitian-creole/slugs";
import { HC_NUMBERS_POOL } from "@/lib/practice/generator/engines/haitian_creole/haitian_creole_mod0/topics/numbers";
import type { TopicDefCompat } from "@/seed/data/subjects/_types";
import { HC_MOD0 } from "@/seed/data/subjects/haitian-creole/constants";

const ID = "hc_numbers" as const;
const LABEL = "Numbers (0–100) basics" as const;
const MINUTES = 12 as const;

type ReviewTopicShape = ReviewModule["topics"][number];

// ✅ cast once at the boundary so the rest stays strongly typed
const TOPIC_NUMBERS = HT_TOPIC.numbers as unknown as TopicSlug;

export const HC_NUMBERS = {
    topic: {
        id: ID,
        label: LABEL,
        minutes: MINUTES,
        summary: "Recognize and produce numbers in Haitian Creole (fast drills).",
        cards: [
            {
                type: "sketch",
                id: `${ID}_s0`,
                title: "Numbers starter set",
                sketchId: "ht.hc.mod0.numbers.lesson",
                height: 560,
            },
            {
                type: "sketch",
                id: `${ID}_s1`,
                title: "Numbers trainer (0–100)",
                sketchId: "hc.numbers",
                height: 480,
            },
            {
                type: "quiz",
                id: `${ID}_q0`,
                title: "Quick check: numbers",
                passScore: 0.75,
                spec: {
                    subject: "haitian-creole",
                    module: HC_MOD0,
                    section: HT_SECTION_PART1,
                    topic: TOPIC_NUMBERS, // ✅ fixed typing
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
            pool: HC_NUMBERS_POOL.map((p) => ({ ...p })),
        },
    } satisfies TopicDefCompat,
} satisfies { topic: ReviewTopicShape; def: TopicDefCompat };