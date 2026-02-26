// src/components/sketches/subjects/python/modules/module1/topics/errors.ts
import { TopicDefCompat } from "../../../../../../../prisma/seed/data/subjects/_types";
import { PY_MOD1 } from "../../../../../../../prisma/seed/data/subjects/python/constants";
import { PY_SECTION_PART1, PY_TOPIC_MOD1 } from "@/lib/practice/catalog/subjects/python/slugs";
import type { PracticeKind } from "@prisma/client";

import { M1_ERRORS_POOL } from "@/lib/practice/generator/engines/python/python_part1_mod1/topics/errors";
import { ReviewTopicShape } from "@/lib/subjects/types";

const ID = "errors_intro" as const;
const LABEL = "Common Errors + Debugging: Read the Message, Fix the Code" as const;
const MINUTES = 10 as const;

const PK = {
    code_input: "code_input" as PracticeKind,
    single_choice: "single_choice" as PracticeKind,
} as const;

/**
 * NOTE:
 * Ensure you have a matching slug key in PY_TOPIC_MOD1, e.g.
 *   PY_TOPIC_MOD1.errors_intro
 */
export const PY_ERRORS = {
    topic: {
        id: ID,
        label: LABEL,
        minutes: MINUTES,
        summary:
            "Learn to recognize NameError, TypeError, and ValueError, then practice quick debugging patterns and safe conversions.",
        cards: [
            {
                type: "sketch",
                id: `${ID}_s0`,
                title: "Common Errors: NameError, TypeError, and Debug Tricks",
                sketchId: "py.types.errors",
                height: 560,
            },

            {
                type: "project",
                id: `${ID}_p0`,
                title: "Project: Identify → Fix → Validate",
                passScore: 0.75,
                spec: {
                    subject: "python",
                    module: PY_MOD1,
                    section: PY_SECTION_PART1,
                    topic: PY_TOPIC_MOD1.errors_intro,
                    difficulty: "easy",
                    allowReveal: true,
                    preferKind: null,
                    maxAttempts: 10,

                    mode: "project",
                    steps: [
                        {
                            id: "identify_error",
                            title: "Identify the error type (NameError vs TypeError vs ValueError)",
                            topic: PY_TOPIC_MOD1.errors_intro,
                            difficulty: "easy",
                            preferKind: PK.single_choice,
                            exerciseKey: "m1_types_errors_sc",
                            seedPolicy: "global",
                            maxAttempts: 3,
                        },
                        {
                            id: "fix_type_mismatch",
                            title: "Fix a type mismatch (convert and add numbers)",
                            topic: PY_TOPIC_MOD1.errors_intro,
                            difficulty: "easy",
                            preferKind: PK.code_input,
                            exerciseKey: "m1_err_fix_type_mismatch_code",
                            seedPolicy: "global",
                            maxAttempts: 10,
                        },
                        {
                            id: "avoid_valueerror",
                            title: "Avoid ValueError with basic validation",
                            topic: PY_TOPIC_MOD1.errors_intro,
                            difficulty: "easy",
                            preferKind: PK.code_input,
                            exerciseKey: "m1_err_parse_age_safely_code",
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
            pool: M1_ERRORS_POOL.map((p) => ({ ...p })),
        },
    } satisfies TopicDefCompat,
} satisfies { topic: ReviewTopicShape; def: TopicDefCompat };