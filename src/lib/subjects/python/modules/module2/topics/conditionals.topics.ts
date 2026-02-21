import { TopicDefCompat } from "../../../../../../../prisma/seed/data/subjects/_types";
import { PY_MOD2 } from "../../../../../../../prisma/seed/data/subjects/python/constants";
import { PY_SECTION_PART2, PY_TOPIC_MOD2 } from "@/lib/practice/catalog/subjects/python/slugs";
import type { PracticeKind } from "@prisma/client";

import { M2_CONDITIONALS_POOL } from "@/lib/practice/generator/engines/python/python_part1_mod2/topics/conditionals";

const ID = "conditionals_basics" as const;
const LABEL = "Conditionals: Teaching Your Program to Decide" as const;
const MINUTES = 12 as const;

const PK = {
    code_input: "code_input" as PracticeKind,
    single_choice: "single_choice" as PracticeKind,
} as const;

export const PY_CONDITIONALS = {
    topic: {
        id: ID,
        label: LABEL,
        minutes: MINUTES,
        summary:
            "Use if/elif/else with comparisons and boolean logic (and/or/not) to control program flow, including truthy/falsey checks.",
        cards: [
            {
                type: "sketch",
                id: `${ID}_s0`,
                title: "Conditionals (if / elif / else + boolean logic)",
                sketchId: "py.cond.basics",
                height: 640,
            },

            // ✅ PROJECT: connected “Kiosk decisions” mini-app
            {
                type: "project",
                id: `${ID}_p0`,
                title: "Project: Kiosk decisions (gate → discount → login)",
                passScore: 0.75,
                spec: {
                    subject: "python",
                    module: PY_MOD2,
                    section: PY_SECTION_PART2,
                    topic: PY_TOPIC_MOD2.conditionals_basics,
                    difficulty: "easy",
                    allowReveal: true,
                    preferKind: null,
                    maxAttempts: 10,

                    mode: "project",
                    steps: [
                        {
                            id: "age_gate",
                            title: "Age gate (ALLOWED / DENIED)",
                            topic: PY_TOPIC_MOD2.conditionals_basics,
                            difficulty: "easy",
                            preferKind: PK.code_input,
                            exerciseKey: "m2_cond_age_gate_code",
                            seedPolicy: "global",
                            maxAttempts: 10,
                        },
                        {
                            id: "member_discount",
                            title: "Member discount (10% off)",
                            topic: PY_TOPIC_MOD2.conditionals_basics,
                            difficulty: "easy",
                            preferKind: PK.code_input,
                            exerciseKey: "m2_cond_member_discount_code",
                            seedPolicy: "global",
                            maxAttempts: 10,
                        },
                        {
                            id: "password_check",
                            title: "Admin login (password check)",
                            topic: PY_TOPIC_MOD2.conditionals_basics,
                            difficulty: "easy",
                            preferKind: PK.code_input,
                            exerciseKey: "m2_cond_password_check_code",
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
                title: "Quick check: elif",
                passScore: 1,
                spec: {
                    subject: "python",
                    module: PY_MOD2,
                    section: PY_SECTION_PART2,
                    topic: PY_TOPIC_MOD2.conditionals_basics,
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
            pool: M2_CONDITIONALS_POOL.map((p) => ({ ...p })),
        },
    } as const satisfies TopicDefCompat,
} as const;