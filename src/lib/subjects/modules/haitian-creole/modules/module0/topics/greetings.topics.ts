// src/lib/subjects/modules/haitian-creole/modules/module0/topics/greetings.topics.ts
import type {ReviewModule, ReviewTopicShape} from "@/lib/subjects/types";

import { HC_MOD0 } from "@/seed/data/subjects/haitian-creole/constants";
import { HT_SECTION_PART1, HT_TOPIC } from "@/lib/practice/catalog/subjects/haitian-creole/slugs";

import { HC_GREETINGS_POOL } from "@/lib/practice/generator/engines/haitian_creole/haitian_creole_mod0/topics/greetings";
import type { TopicDefCompat } from "@/seed/data/subjects/_types";

const ID = "hc_greetings" as const;
const LABEL = "Greetings + Polite Phrases" as const;
const MINUTES = 12 as const;



export const HC_GREETINGS = {
    topic: {
        id: ID,
        label: LABEL,
        minutes: MINUTES,
        summary:
            "Say hello, goodbye, thank you, and pick the right greeting for the time of day.",
        // ✅ IMPORTANT: no `as const` here → cards is mutable ReviewCard[]
        cards: [
            {
                type: "sketch",
                id: `${ID}_s0`,
                title: "Core greetings (fast + useful)",
                sketchId: "ht.hc.mod0.greetings.lesson",
                height: 560,
            },
            {
                type: "sketch",
                id: `${ID}_s1`,
                title: "Greeting builder (time + situation)",
                sketchId: "hc.greetings",
                height: 460,
            },
            {
                type: "quiz",
                id: `${ID}_q0`,
                title: "Quick check: greetings",
                passScore: 0.75,
                spec: {
                    subject: "haitian-creole",
                    module: HC_MOD0,
                    section: HT_SECTION_PART1,
                    topic: HT_TOPIC.greetings,
                    difficulty: "easy",
                    n: HC_GREETINGS_POOL.length,
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
            pool: HC_GREETINGS_POOL.map((p) => ({ ...p })),
        },
    } satisfies TopicDefCompat,
} satisfies { topic: ReviewTopicShape; def: TopicDefCompat };