// src/components/sketches/subjects/python/modules/module1/topics/variables_types.ts
import { TopicDefCompat } from "../../../../../../../prisma/seed/data/subjects/_types";
import { PY_MOD1 } from "../../../../../../../prisma/seed/data/subjects/python/constants";
import { PY_SECTION_PART1, PY_TOPIC_MOD1 } from "@/lib/practice/catalog/subjects/python/slugs";
import type { PracticeKind } from "@prisma/client";

import { M1_VARIABLES_POOL } from "@/lib/practice/generator/engines/python/python_part1_mod1/topics/variables_types";
import {ReviewTopicShape} from "@/lib/subjects/types";

const ID = "variables_types_intro" as const;
const LABEL = "Variables + Data Types: Boxes That Hold Real Values" as const;
const MINUTES = 12 as const;

const PK = {
    code_input: "code_input" as PracticeKind,
    single_choice: "single_choice" as PracticeKind,
} as const;

export const PY_VARIABLES_TYPES = {
    topic: {
        id: ID,
        label: LABEL,
        minutes: MINUTES,
        summary:
            "Learn variables as labeled boxes, core Python data types (int/float/str/bool/None), and how to convert types safely.",
        cards: [
            { type: "sketch", id: `${ID}_s0`, title: "Variables: Labeled Boxes for Your Data", sketchId: "py.vars.boxes", height: 540 },
            { type: "sketch", id: `${ID}_s1`, title: "Data Types: What’s Inside the Box?", sketchId: "py.types.basic", height: 560 },
            { type: "sketch", id: `${ID}_s2`, title: "Type Conversion: Turning Strings into Numbers", sketchId: "py.types.convert", height: 560 },
            { type: "sketch", id: `${ID}_s3`, title: "Common Errors: NameError, TypeError, and Debug Tricks", sketchId: "py.types.errors", height: 560 },

            {
                type: "project",
                id: `${ID}_p0`,
                title: "Project: Boxes → Types → Convert",
                passScore: 0.75,
                spec: {
                    subject: "python",
                    module: PY_MOD1,
                    section: PY_SECTION_PART1,
                    topic: PY_TOPIC_MOD1.variables_types_intro,
                    difficulty: "easy",
                    allowReveal: true,
                    preferKind: null,
                    maxAttempts: 10,

                    mode: "project",
                    steps: [
                        {
                            id: "boxes_print",
                            title: "Create variables and print them cleanly",
                            topic: PY_TOPIC_MOD1.variables_types_intro,
                            difficulty: "easy",
                            preferKind: PK.code_input,
                            exerciseKey: "m1_vars_boxes_print_code",
                            seedPolicy: "global",
                            maxAttempts: 10,
                        },
                        {
                            id: "convert_next_year",
                            title: "Convert input to int and compute next year",
                            topic: PY_TOPIC_MOD1.variables_types_intro,
                            difficulty: "easy",
                            preferKind: PK.code_input,
                            exerciseKey: "m1_types_convert_next_year_code",
                            seedPolicy: "global",
                            maxAttempts: 10,
                        },
                        {
                            id: "error_reading",
                            title: "Read errors (NameError vs TypeError vs ValueError)",
                            topic: PY_TOPIC_MOD1.variables_types_intro,
                            difficulty: "easy",
                            preferKind: PK.single_choice,
                            exerciseKey: "m1_types_errors_sc",
                            seedPolicy: "global",
                            maxAttempts: 3,
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
            pool: M1_VARIABLES_POOL.map((p) => ({ ...p })),
        },
   }  satisfies TopicDefCompat,
} satisfies { topic: ReviewTopicShape; def: TopicDefCompat };