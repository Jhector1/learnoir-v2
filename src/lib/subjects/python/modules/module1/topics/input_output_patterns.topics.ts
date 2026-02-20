// src/components/sketches/subjects/python/modules/module1/topics/input_output_patterns.ts
import { TopicDefCompat } from "../../../../../../../prisma/seed/data/subjects/_types";
import { PY_MOD1 } from "../../../../../../../prisma/seed/data/subjects/python/constants";
import { PY_SECTION_PART1, PY_TOPIC_MOD1 } from "@/lib/practice/catalog/subjects/python/slugs";
import { PracticeKind } from "@prisma/client";

const ID = "input_output_patterns" as const;
const LABEL = "Input + Output Patterns: Real Mini-Programs" as const;
const MINUTES = 14 as const;

export const PY_INPUT_OUTPUT_PATTERNS = {
    topic: {
        id: ID,
        label: LABEL,
        minutes: MINUTES,
        summary:
            "Combine input(), casting, operators, and f-strings into real mini-programs like age-next-year, a tip calculator, and a temperature converter.",
        cards: [
            { type: "sketch", id: `${ID}_s0`, title: "Input + Output Patterns (Ask → Convert → Compute → Show)", sketchId: "py.io.patterns", height: 640 },

            {
                type: "project",
                id: `${ID}_p0`,
                title: "Project: 3 mini-programs (Ask → Convert → Compute → Show)",
                passScore: 0.75,
                spec: {
                    subject: "python",
                    module: PY_MOD1,
                    section: PY_SECTION_PART1,
                    topic: PY_TOPIC_MOD1.input_output_patterns,
                    difficulty: "easy",
                    allowReveal: true,
                    preferKind: null,
                    maxAttempts: 10,

                    mode: "project",
                    steps: [
                        {
                            id: "age_next_year",
                            title: "Age next year",
                            topic: PY_TOPIC_MOD1.input_output_patterns,
                            difficulty: "easy",
                            preferKind: PracticeKind.code_input,
                            exerciseKey: "m1_io_age_next_year",   // ✅ was m1_io_age_next_year_code
                            seedPolicy: "global",
                            maxAttempts: 10,
                        },
                        {
                            id: "tip_calc",
                            title: "Tip calculator",
                            topic: PY_TOPIC_MOD1.input_output_patterns,
                            difficulty: "easy",
                            preferKind: PracticeKind.code_input,
                            exerciseKey: "m1_io_tip_total",       // ✅ was m1_io_tip_calc_code
                            seedPolicy: "global",
                            maxAttempts: 10,
                        },
                        {
                            id: "temp_convert",
                            title: "Temperature converter (C → F)",
                            topic: PY_TOPIC_MOD1.input_output_patterns,
                            difficulty: "easy",
                            preferKind: PracticeKind.code_input,
                            exerciseKey: "m1_io_c_to_f",          // ✅ was m1_io_temp_convert_code
                            seedPolicy: "global",
                            maxAttempts: 10,
                        },
                    ],
                },
            },
        ],
    } as const,

    def: {
        id: ID,
        meta: {
            label: LABEL,
            minutes: MINUTES,
            pool: [
                { key: "m1_io_age_next_year", w: 1, kind: PracticeKind.code_input },
                { key: "m1_io_tip_total", w: 1, kind: PracticeKind.code_input },
                { key: "m1_io_c_to_f", w: 1, kind: PracticeKind.code_input },
            ],
        },
    } as const satisfies TopicDefCompat,
} as const;
