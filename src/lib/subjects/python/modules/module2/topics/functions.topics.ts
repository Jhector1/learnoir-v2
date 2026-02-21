import { TopicDefCompat } from "../../../../../../../prisma/seed/data/subjects/_types";
import { PY_MOD2 } from "../../../../../../../prisma/seed/data/subjects/python/constants";
import { PY_SECTION_PART2, PY_TOPIC_MOD2 } from "@/lib/practice/catalog/subjects/python/slugs";
import type { PracticeKind } from "@prisma/client";

import { M2_FUNCTIONS_POOL } from "@/lib/practice/generator/engines/python/python_part1_mod2/topics/functions";

const ID = "functions_basics" as const;
const LABEL = "Functions: Small Machines You Can Reuse" as const;
const MINUTES = 14 as const;

const PK = {
    code_input: "code_input" as PracticeKind,
    single_choice: "single_choice" as PracticeKind,
} as const;

export const PY_FUNCTIONS = {
    topic: {
        id: ID,
        label: LABEL,
        minutes: MINUTES,
        summary:
            "Create reusable functions with parameters and return values, and learn a simple scope rule to keep code clean.",
        cards: [
            {
                type: "sketch",
                id: `${ID}_s0`,
                title: "Functions (def, parameters, return, scope)",
                sketchId: "py.func.basics",
                height: 680,
            },

            {
                type: "project",
                id: `${ID}_p0`,
                title: "Project: Reusable kiosk helpers (tip → shipping → sum_list)",
                passScore: 0.75,
                spec: {
                    subject: "python",
                    module: PY_MOD2,
                    section: PY_SECTION_PART2,
                    topic: PY_TOPIC_MOD2.functions_basics,
                    difficulty: "easy",
                    allowReveal: true,
                    preferKind: null,
                    maxAttempts: 10,

                    mode: "project",
                    steps: [
                        {
                            id: "total_with_tip",
                            title: "Build total_with_tip(bill, pct)",
                            topic: PY_TOPIC_MOD2.functions_basics,
                            difficulty: "easy",
                            preferKind: PK.code_input,
                            exerciseKey: "m2_func_total_with_tip_code",
                            seedPolicy: "global",
                            maxAttempts: 10,
                        },
                        {
                            id: "shipping_cost",
                            title: "Build shipping_cost(total)",
                            topic: PY_TOPIC_MOD2.functions_basics,
                            difficulty: "easy",
                            preferKind: PK.code_input,
                            exerciseKey: "m2_func_shipping_rule_code",
                            seedPolicy: "global",
                            maxAttempts: 10,
                        },
                        {
                            id: "sum_list",
                            title: "Build sum_list(xs)",
                            topic: PY_TOPIC_MOD2.functions_basics,
                            difficulty: "easy",
                            preferKind: PK.code_input,
                            exerciseKey: "m2_func_sum_list_code",
                            seedPolicy: "global",
                            maxAttempts: 10,
                        },
                    ],
                },
            },

            // ✅ QUICK CHECK (deterministic: only 1 single_choice key in this topic pool)
            {
                type: "quiz",
                id: `${ID}_q0`,
                title: "Quick check: return vs print",
                passScore: 1,
                spec: {
                    subject: "python",
                    module: PY_MOD2,
                    section: PY_SECTION_PART2,
                    topic: PY_TOPIC_MOD2.functions_basics,
                    difficulty: "easy",
                    n: 1,
                    allowReveal: true,
                    preferKind: PK.single_choice,
                    maxAttempts: 1,
                },
            },
        ],
    } as const,

    def: {
        id: ID,
        meta: {
            label: LABEL,
            minutes: MINUTES,
            pool: M2_FUNCTIONS_POOL.map((p) => ({ ...p })),
        },
    } as const satisfies TopicDefCompat,
} as const;