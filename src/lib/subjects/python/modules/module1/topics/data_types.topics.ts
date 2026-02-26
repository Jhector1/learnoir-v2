// src/components/sketches/subjects/python/modules/module1/topics/types.ts
import { TopicDefCompat } from "../../../../../../../prisma/seed/data/subjects/_types";
import { PY_MOD1 } from "../../../../../../../prisma/seed/data/subjects/python/constants";
import { PY_SECTION_PART1, PY_TOPIC_MOD1 } from "@/lib/practice/catalog/subjects/python/slugs";
import type { PracticeKind } from "@prisma/client";

import { M1_TYPES_POOL } from "@/lib/practice/generator/engines/python/python_part1_mod1/topics/types";
import { ReviewTopicShape } from "@/lib/subjects/types";

const ID = "data_types_intro" as const;
const LABEL = "Data Types + Conversion: What’s in the Box?" as const;
const MINUTES = 12 as const;

const PK = {
    code_input: "code_input" as PracticeKind,
    single_choice: "single_choice" as PracticeKind,
} as const;

/**
 * NOTE:
 * Ensure you have a matching slug key in PY_TOPIC_MOD1, e.g.
 *   PY_TOPIC_MOD1.types_intro
 */
export const PY_TYPES = {
    topic: {
        id: ID,
        label: LABEL,
        minutes: MINUTES,
        summary:
            "Learn core Python types (int/float/str/bool/None), how input() returns strings, and how to convert types safely.",
        cards: [
            {
                type: "sketch",
                id: `${ID}_s0`,
                title: "Data Types: What’s Inside the Box?",
                sketchId: "py.types.basic",
                height: 560,
            },
            {
                type: "sketch",
                id: `${ID}_s1`,
                title: "Type Conversion: Turning Strings into Numbers",
                sketchId: "py.types.convert",
                height: 560,
            },

            {
                type: "project",
                id: `${ID}_p0`,
                title: "Project: Convert → Compute → Format",
                passScore: 0.75,
                spec: {
                    subject: "python",
                    module: PY_MOD1,
                    section: PY_SECTION_PART1,
                    topic: PY_TOPIC_MOD1.data_types_intro,
                    difficulty: "easy",
                    allowReveal: true,
                    preferKind: null,
                    maxAttempts: 10,

                    mode: "project",
                    steps: [
                        {
                            id: "convert_next_year",
                            title: "Convert age to int and compute next year",
                            topic: PY_TOPIC_MOD1.data_types_intro,
                            difficulty: "easy",
                            preferKind: PK.code_input,
                            exerciseKey: "m1_types_convert_next_year_code",
                            seedPolicy: "global",
                            maxAttempts: 10,
                        },
                        {
                            id: "tip_total",
                            title: "Compute tip + total using integer math",
                            topic: PY_TOPIC_MOD1.data_types_intro,
                            difficulty: "easy",
                            preferKind: PK.code_input,
                            exerciseKey: "m1_types_tip_total_code",
                            seedPolicy: "global",
                            maxAttempts: 10,
                        },
                        {
                            id: "c_to_f",
                            title: "Convert Celsius to Fahrenheit",
                            topic: PY_TOPIC_MOD1.data_types_intro,
                            difficulty: "easy",
                            preferKind: PK.code_input,
                            exerciseKey: "m1_types_c_to_f_code",
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
            pool: M1_TYPES_POOL.map((p) => ({ ...p })),
        },
    } satisfies TopicDefCompat,
} satisfies { topic: ReviewTopicShape; def: TopicDefCompat };