// src/components/sketches/subjects/python/modules/module1/topics/operators_expressions.ts

import { TopicDefCompat } from "../../../../../../../prisma/seed/data/subjects/_types";
import { PY_MOD1 } from "../../../../../../../prisma/seed/data/subjects/python/constants";
import { PY_SECTION_PART1, PY_TOPIC_MOD1 } from "@/lib/practice/catalog/subjects/python/slugs";
import { PracticeKind } from "@prisma/client";

const ID = "operators_expressions" as const;
const LABEL = "Operators + Expressions: The Calculator Inside Your Code" as const;
const MINUTES = 10 as const;

export const PY_OPERATORS_EXPRESSIONS = {
    topic: {
        id: ID,
        label: LABEL,
        minutes: MINUTES,
        summary:
            "Use math and comparison operators to compute results and produce True/False decisions using expressions.",
        cards: [
            {
                type: "sketch",
                id: `${ID}_s0`,
                title: "Operators + Expressions (Math + Comparisons)",
                sketchId: "py.ops.expressions",
                height: 560,
            },

            {
                type: "project",
                id: `${ID}_p0`,
                title: "Project: Calculator brain (compute + decide)",
                passScore: 0.75,
                spec: {
                    subject: "python",
                    module: PY_MOD1,
                    section: PY_SECTION_PART1,
                    topic: PY_TOPIC_MOD1.operators_expressions,
                    difficulty: "easy",
                    allowReveal: true,
                    preferKind: null,
                    maxAttempts: 10,

                    mode: "project",
                    steps: [
                        {
                            id: "precedence",
                            title: "Operator precedence (compute the result)",
                            topic: PY_TOPIC_MOD1.operators_expressions,
                            difficulty: "easy",
                            preferKind: PracticeKind.code_input, // ✅ now code
                            exerciseKey: "m1_ops_precedence_sc", // keep key to match DB/pool
                            seedPolicy: "global",
                            maxAttempts: 10,
                        },
                        {
                            id: "mod_even_odd",
                            title: "Modulo (even/odd detector)",
                            topic: PY_TOPIC_MOD1.operators_expressions,
                            difficulty: "easy",
                            preferKind: PracticeKind.code_input, // ✅ now code
                            exerciseKey: "m1_ops_mod_evenodd_sc", // keep key
                            seedPolicy: "global",
                            maxAttempts: 10,
                        },
                        {
                            id: "checkout",
                            title: "Build a mini checkout line (subtotal, tax, total)",
                            topic: PY_TOPIC_MOD1.operators_expressions,
                            difficulty: "easy",
                            preferKind: PracticeKind.code_input,
                            exerciseKey: "m1_ops_checkout_code",
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
                { key: "m1_ops_precedence_sc", w: 1, kind: PracticeKind.code_input },     // ✅ now code
                { key: "m1_ops_mod_evenodd_sc", w: 1, kind: PracticeKind.code_input },   // ✅ now code
                { key: "m1_ops_checkout_code", w: 1, kind: PracticeKind.code_input },
            ],
        },
    } as const satisfies TopicDefCompat,
} as const;
