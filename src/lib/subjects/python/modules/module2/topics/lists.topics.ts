import { TopicDefCompat } from "../../../../../../../prisma/seed/data/subjects/_types";
import { PY_MOD2 } from "../../../../../../../prisma/seed/data/subjects/python/constants";
import { PY_SECTION_PART2, PY_TOPIC_MOD2 } from "@/lib/practice/catalog/subjects/python/slugs";
import type { PracticeKind } from "@prisma/client";

import { M2_LISTS_POOL } from "@/lib/practice/generator/engines/python/python_part1_mod2/topics/lists";
import {ReviewTopicShape} from "@/lib/subjects/types";

const ID = "lists_basics" as const;
const LABEL = "Lists: Store Many Values" as const;
const MINUTES = 12 as const;

const PK = {
    code_input: "code_input" as PracticeKind,
} as const;

export const PY_LISTS = {
    topic: {
        id: ID,
        label: LABEL,
        minutes: MINUTES,
        summary:
            "Create lists, index items, append/remove values, and loop through lists to compute totals and averages.",
        cards: [
            {
                type: "sketch",
                id: `${ID}_s0`,
                title: "Lists (create, index, append/remove, loop)",
                sketchId: "py.lists.basics",
                height: 640,
            },

            {
                type: "project",
                id: `${ID}_p0`,
                title: "Project: Cart lists (sum/avg → max → names list)",
                passScore: 0.75,
                spec: {
                    subject: "python",
                    module: PY_MOD2,
                    section: PY_SECTION_PART2,
                    topic: PY_TOPIC_MOD2.lists_basics,
                    difficulty: "easy",
                    allowReveal: true,
                    preferKind: null,
                    maxAttempts: 10,

                    mode: "project",
                    steps: [
                        {
                            id: "sum_avg_3",
                            title: "3 prices → sum + average",
                            topic: PY_TOPIC_MOD2.lists_basics,
                            difficulty: "easy",
                            preferKind: PK.code_input,
                            exerciseKey: "m2_list_three_prices_sum_avg_code",
                            seedPolicy: "global",
                            maxAttempts: 10,
                        },
                        {
                            id: "max_of_4",
                            title: "4 numbers → max",
                            topic: PY_TOPIC_MOD2.lists_basics,
                            difficulty: "easy",
                            preferKind: PK.code_input,
                            exerciseKey: "m2_list_max_of_four_code",
                            seedPolicy: "global",
                            maxAttempts: 10,
                        },
                        {
                            id: "names_2",
                            title: "2 names → list + index print",
                            topic: PY_TOPIC_MOD2.lists_basics,
                            difficulty: "easy",
                            preferKind: PK.code_input,
                            exerciseKey: "m2_list_build_names_print_code",
                            seedPolicy: "global",
                            maxAttempts: 10,
                        },
                    ],
                },
            },
        ],
    } satisfies ReviewTopicShape,

    def: {
        id: ID,
        meta: {
            label: LABEL,
            minutes: MINUTES,
            pool: M2_LISTS_POOL.map((p) => ({ ...p })),
        },
   }  satisfies TopicDefCompat,
} satisfies { topic: ReviewTopicShape; def: TopicDefCompat };