// src/components/sketches/subjects/python/modules/module1/topics/variables.ts
import { TopicDefCompat } from "../../../../../../../prisma/seed/data/subjects/_types";
import { PY_MOD1 } from "../../../../../../../prisma/seed/data/subjects/python/constants";
import { PY_SECTION_PART1, PY_TOPIC_MOD1 } from "@/lib/practice/catalog/subjects/python/slugs";
import type { PracticeKind } from "@prisma/client";

import { M1_VARS_POOL } from "@/lib/practice/generator/engines/python/python_part1_mod1/topics/variables";
import { ReviewTopicShape } from "@/lib/subjects/types";

const ID = "variables_intro" as const;
const LABEL = "Variables: Labeled Boxes That Hold Values" as const;
const MINUTES = 10 as const;

const PK = {
    code_input: "code_input" as PracticeKind,
    single_choice: "single_choice" as PracticeKind,
} as const;

/**
 * NOTE:
 * Ensure you have a matching slug key in PY_TOPIC_MOD1, e.g.
 *   PY_TOPIC_MOD1.variables_intro
 */
export const PY_VARIABLES = {
    topic: {
        id: ID,
        label: LABEL,
        minutes: MINUTES,
        summary:
            "Understand variables as labeled boxes, assign values with '=', and practice updating values with real-world mini tasks.",
        cards: [
            {
                type: "sketch",
                id: `${ID}_s0`,
                title: "Variables: Labeled Boxes for Your Data",
                sketchId: "py.vars.boxes",
                height: 560,
            },

            {
                type: "project",
                id: `${ID}_p0`,
                title: "Project: Store → Swap → Total",
                passScore: 0.75,
                spec: {
                    subject: "python",
                    module: PY_MOD1,
                    section: PY_SECTION_PART1,
                    topic: PY_TOPIC_MOD1.variables_intro,
                    difficulty: "easy",
                    allowReveal: true,
                    preferKind: null,
                    maxAttempts: 10,

                    mode: "project",
                    steps: [
                        {
                            id: "boxes_print",
                            title: "Store inputs in variables and print cleanly",
                            topic: PY_TOPIC_MOD1.variables_intro,
                            difficulty: "easy",
                            preferKind: PK.code_input,
                            exerciseKey: "m1_vars_boxes_print_code",
                            seedPolicy: "global",
                            maxAttempts: 10,
                        },
                        {
                            id: "swap_values",
                            title: "Swap two values (real-world correction)",
                            topic: PY_TOPIC_MOD1.variables_intro,
                            difficulty: "easy",
                            preferKind: PK.code_input,
                            exerciseKey: "m1_vars_swap_values_code",
                            seedPolicy: "global",
                            maxAttempts: 10,
                        },
                        {
                            id: "running_total",
                            title: "Compute a running total (3-day steps)",
                            topic: PY_TOPIC_MOD1.variables_intro,
                            difficulty: "easy",
                            preferKind: PK.code_input,
                            exerciseKey: "m1_vars_running_total_code",
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
            pool: M1_VARS_POOL.map((p) => ({ ...p })),
        },
    } satisfies TopicDefCompat,
} satisfies { topic: ReviewTopicShape; def: TopicDefCompat };