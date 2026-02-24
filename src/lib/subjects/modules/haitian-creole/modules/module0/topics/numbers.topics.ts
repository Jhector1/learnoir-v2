// import { TopicDefCompat } from "../../../../../../../prisma/seed/data/subjects/_types";
// import { HC_MOD0 } from "../../../../../../../prisma/seed/data/subjects/haitian-creole/constants";
import { HT_SECTION_PART1, HT_TOPIC } from "@/lib/practice/catalog/subjects/haitian-creole/slugs";

// import { M0_HC_NUMBERS_POOL } from "@/lib/practice/generator/engines/haitian_creole/haitian_creole_part1_mod0/topics/numbers";
import { SketchEntry } from "@/components/sketches/subjects";
import {HC_NUMBERS_POOL} from "@/lib/practice/generator/engines/haitian_creole/haitian_creole_mod0/topics/numbers";
import {TopicDefCompat} from "@/seed/data/subjects/_types";
import { HC_MOD0 } from "@/seed/data/subjects/haitian-creole/constants";
const ID = "hc_numbers" as const;
const LABEL = "Numbers (0–100) basics" as const;
const MINUTES = 12 as const;

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
                    topic: HT_TOPIC.numbers,
                    difficulty: "easy",
                    n: HC_NUMBERS_POOL.length,
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
            pool: HC_NUMBERS_POOL.map((p) => ({ ...p })),
        },
    } as const satisfies TopicDefCompat,
} as const;

