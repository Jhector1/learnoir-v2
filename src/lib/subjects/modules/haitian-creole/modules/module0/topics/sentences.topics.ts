// import { TopicDefCompat } from "../../../../../../../prisma/seed/data/subjects/_types";
// import { HC_MOD0 } from "../../../../../../../prisma/seed/data/subjects/haitian-creole/constants";
import { HT_SECTION_PART1, HT_TOPIC } from "@/lib/practice/catalog/subjects/haitian-creole/slugs";

// import { M0_HC_SENTENCES_POOL } from "@/lib/practice/generator/engines/haitian_creole/haitian_creole_part1_mod0/topics/sentences";
import { SketchEntry } from "@/components/sketches/subjects";
import {TopicDefCompat} from "@/seed/data/subjects/_types";
import { HC_MOD0 } from "@/seed/data/subjects/haitian-creole/constants";import {HC_SENTENCES_POOL} from "@/lib/practice/generator/engines/haitian_creole/haitian_creole_mod0/topics/sentences";

const ID = "hc_sentences" as const;
const LABEL = "Building simple sentences" as const;
const MINUTES = 14 as const;

export const HC_SENTENCES = {
    topic: {
        id: ID,
        label: LABEL,
        minutes: MINUTES,
        summary: "Use SVO order and learn when to use “se” (and when not to).",
        cards: [
            {
                type: "sketch",
                id: `${ID}_s0`,
                title: "Simple order + “se” rule",
                sketchId: "ht.hc.mod0.sentences.lesson",
                height: 580,
            },
            {
                type: "sketch",
                id: `${ID}_s1`,
                title: "Sentence builder (SVO practice)",
                sketchId: "hc.sentences",
                height: 500,
            },
            {
                type: "quiz",
                id: `${ID}_q0`,
                title: "Quick check: sentences",
                passScore: 0.75,
                spec: {
                    subject: "haitian-creole",
                    module: HC_MOD0,
                    section: HT_SECTION_PART1,
                    topic: HT_TOPIC.sentence_building,
                    difficulty: "easy",
                    n: HC_SENTENCES_POOL.length,
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
            pool: HC_SENTENCES_POOL.map((p) => ({ ...p })),
        },
    } as const satisfies TopicDefCompat,
} as const;

