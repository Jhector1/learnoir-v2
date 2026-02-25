// import { TopicDefCompat } from "../../../../../../../prisma/seed/data/subjects/_types";
// import { HC_MOD0 } from "../../../../../../../prisma/seed/data/subjects/haitian-creole/constants";

import { HC_MOD0 } from "@/seed/data/subjects/haitian-creole/constants";
import { HT_SECTION_PART1, HT_TOPIC } from "@/lib/practice/catalog/subjects/haitian-creole/slugs";

// import { M0_HC_PRONOUNS_POOLNS_POOL } from "@/lib/practice/generator/engines/haitian_creole/haitian_creole_part1_mod0/topics/pronouns";
import { SketchEntry } from "@/components/sketches/subjects";
import {HC_PRONOUNS_POOL} from "@/lib/practice/generator/engines/haitian_creole/haitian_creole_mod0/topics/pronouns";
import {TopicDefCompat} from "@/seed/data/subjects/_types";
import {ReviewTopicShape} from "@/lib/subjects/types";

const ID = "hc_pronouns" as const;
const LABEL = "Pronouns (mwen, ou, li, nou, yo)" as const;
const MINUTES = 14 as const;

export const HC_PRONOUNS = {
    topic: {
        id: ID,
        label: LABEL,
        minutes: MINUTES,
        summary: "Learn the core pronouns and build short sentences with them.",
        cards: [
            {
                type: "sketch",
                id: `${ID}_s0`,
                title: "Pronoun map (core set)",
                sketchId: "ht.hc.mod0.pronouns.lesson",
                height: 560,
            },
            {
                type: "sketch",
                id: `${ID}_s1`,
                title: "Pronoun picker → sentence builder",
                sketchId: "hc.pronouns",
                height: 480,
            },
            {
                type: "quiz",
                id: `${ID}_q0`,
                title: "Quick check: pronouns",
                passScore: 0.75,
                spec: {
                    subject: "haitian-creole",
                    module: HC_MOD0,
                    section: HT_SECTION_PART1,
                    topic: HT_TOPIC.pronouns,
                    difficulty: "easy",
                    n: HC_PRONOUNS_POOL.length,
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
            pool: HC_PRONOUNS_POOL.map((p) => ({ ...p })),
        },
    }  satisfies TopicDefCompat,
} satisfies { topic: ReviewTopicShape; def: TopicDefCompat };
