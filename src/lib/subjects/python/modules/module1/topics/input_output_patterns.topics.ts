// src/components/sketches/subjects/python/modules/module1/topics/input_output_patterns.ts
import { TopicDefCompat } from "../../../../../../../prisma/seed/data/subjects/_types";
import { PY_MOD1 } from "../../../../../../../prisma/seed/data/subjects/python/constants";
import { PY_SECTION_PART1, PY_TOPIC_MOD1 } from "@/lib/practice/catalog/subjects/python/slugs";
import type { PracticeKind } from "@prisma/client";

// ✅ pool source of truth
import { M1_IO_POOL } from "@/lib/practice/generator/engines/python/python_part1_mod1/topics/input_output_patterns";
import {ReviewTopicShape} from "@/lib/subjects/types";
import {TopicSlug} from "@/lib/practice/types";

const ID = "input_output_patterns" as const;
const LABEL = "Input + Output Patterns: Real Mini-Programs" as const;
const MINUTES = 14 as const;
const TOPIC_OUTPUT_PATTERNS = PY_TOPIC_MOD1.input_output_patterns as unknown as TopicSlug;
// ✅ avoid runtime Prisma import: use string literals typed as PracticeKind
const PK = {
    code_input: "code_input" as PracticeKind,
} as const;

export const PY_INPUT_OUTPUT_PATTERNS = {
    topic: {
        id: ID,
        label: LABEL,
        minutes: MINUTES,
        summary:
            "Combine input(), casting, operators, and f-strings into real mini-programs like age-next-year, a tip calculator, and a temperature converter.",
        cards: [
            {
                type: "sketch",
                id: `${ID}_s0`,
                title: "Input + Output Patterns (Ask → Convert → Compute → Show)",
                sketchId: "py.io.patterns",
                height: 640,
            },

            {
                type: "project",
                id: `${ID}_p0`,
                title: "Project: 3 mini-programs (Ask → Convert → Compute → Show)",
                passScore: 0.75,
                spec: {
                    subject: "python",
                    module: PY_MOD1,
                    section: PY_SECTION_PART1,
                    topic:TOPIC_OUTPUT_PATTERNS,
                    difficulty: "easy",
                    allowReveal: true,
                    preferKind: null,
                    maxAttempts: 10,

                    mode: "project",
                    steps: [
                        {
                            id: "age_next_year",
                            title: "Age next year",
                            topic: TOPIC_OUTPUT_PATTERNS,
                            difficulty: "easy",
                            preferKind: PK.code_input,
                            exerciseKey: "m1_io_age_next_year",
                            seedPolicy: "global",
                            maxAttempts: 10,
                        },
                        {
                            id: "tip_calc",
                            title: "Tip calculator",
                            topic:TOPIC_OUTPUT_PATTERNS,
                            difficulty: "easy",
                            preferKind: PK.code_input,
                            exerciseKey: "m1_io_tip_total",
                            seedPolicy: "global",
                            maxAttempts: 10,
                        },
                        {
                            id: "temp_convert",
                            title: "Temperature converter (C → F)",
                            topic:TOPIC_OUTPUT_PATTERNS,
                            difficulty: "easy",
                            preferKind: PK.code_input,
                            exerciseKey: "m1_io_c_to_f",
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
            pool: M1_IO_POOL.map((p) => ({ ...p })),
        },
   }  satisfies TopicDefCompat,
} satisfies { topic: ReviewTopicShape; def: TopicDefCompat };