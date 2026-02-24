// import { TopicDefCompat } from "../../../../../../../prisma/seed/data/subjects/_types";
// import { HC_MOD0 } from "../../../../../../../prisma/seed/data/subjects/haitian-creole/constants";
import { HC_MOD0 } from "@/seed/data/subjects/haitian-creole/constants";

import { HT_SECTION_PART1, HT_TOPIC } from "@/lib/practice/catalog/subjects/haitian-creole/slugs";

// ✅ source of truth (pool) from generator topic
// import { M0_HC_GREETINGS_POOL } from "@/lib/practice/generator/engines/haitian/haitian_creole_part1_mod0/topics/greetings";

import { SketchEntry } from "@/components/sketches/subjects";
import {HC_GREETINGS_POOL} from "@/lib/practice/generator/engines/haitian_creole/haitian_creole_mod0/topics/greetings";
import {TopicDefCompat} from "@/seed/data/subjects/_types";

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
    } as const,

    def: {
        id: ID,
        meta: {
            label: LABEL,
            minutes: MINUTES,
            pool: HC_GREETINGS_POOL.map((p) => ({ ...p })),
        },
    } as const satisfies TopicDefCompat,
} as const;

/* -------------------------------- sketches -------------------------------- */