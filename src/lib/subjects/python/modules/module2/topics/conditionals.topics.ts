import { TopicDefCompat } from "../../../../../../../prisma/seed/data/subjects/_types";
import { PY_MOD2 } from "../../../../../../../prisma/seed/data/subjects/python/constants";
import { PY_SECTION_PART2, PY_TOPIC_MOD2 } from "@/lib/practice/catalog/subjects/python/slugs";
import type { PracticeKind } from "@prisma/client";

// import { M2_CONDITIONALS_POOL } from "@/lib/practice/generator/engines/python/python_part1_mod1/topics/conditionals_basics";
import { ReviewTopicShape } from "@/lib/subjects/types";
import {M2_CONDITIONALS_POOL} from "@/lib/practice/generator/engines/python/python_part1_mod2/topics/conditionals";

const ID = "conditionals_basics" as const;
const MINUTES = 12 as const;

// ✅ keys match your JSON exactly
const K = {
    label: `@:topics.python.python-2.${ID}.label`,
    summary: `@:topics.python.python-2.${ID}.summary`,

    sketchCardTitle: `@:topics.python.python-2.${ID}.cards.sketch.title`,
    projectCardTitle: `@:topics.python.python-2.${ID}.cards.project.title`,
    quizCardTitle: `@:topics.python.python-2.${ID}.cards.quiz.title`,

    stepAgeGate: `@:topics.python.python-2.${ID}.projectSteps.age_gate.title`,
    stepMemberDiscount: `@:topics.python.python-2.${ID}.projectSteps.member_discount.title`,
    stepPasswordCheck: `@:topics.python.python-2.${ID}.projectSteps.password_check.title`,
} as const;

const PK = {
    code_input: "code_input" as PracticeKind,
    single_choice: "single_choice" as PracticeKind,
    multi_choice: "multi_choice" as PracticeKind,
} as const;

export const PY_CONDITIONALS = {
    topic: {
        id: ID,
        label: K.label as any,
        minutes: MINUTES,
        summary: K.summary as any,

        cards: [
            {
                type: "sketch",
                id: `${ID}_s0`,
                title: K.sketchCardTitle as any,
                sketchId: "py.cond.basics",
                height: 640,
            },

            {
                type: "project",
                id: `${ID}_p0`,
                title: K.projectCardTitle as any,
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
                            title: K.stepAgeGate as any,
                            topic: PY_TOPIC_MOD2.conditionals_basics,
                            difficulty: "easy",
                            preferKind: PK.code_input,
                            exerciseKey: "m2_cond_age_gate_code",
                            seedPolicy: "global",
                            maxAttempts: 10,
                        },
                        {
                            id: "member_discount",
                            title: K.stepMemberDiscount as any,
                            topic: PY_TOPIC_MOD2.conditionals_basics,
                            difficulty: "easy",
                            preferKind: PK.code_input,
                            exerciseKey: "m2_cond_member_discount_code",
                            seedPolicy: "global",
                            maxAttempts: 10,
                        },
                        {
                            id: "password_check",
                            title: K.stepPasswordCheck as any,
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

            // // ✅ now that you have many quiz items, let the quiz pull multiple
            // {
            //     type: "quiz",
            //     id: `${ID}_q0`,
            //     title: K.quizCardTitle as any,
            //     passScore: 0.75,
            //     spec: {
            //         subject: "python",
            //         module: PY_MOD2,
            //         section: PY_SECTION_PART2,
            //         topic: PY_TOPIC_MOD2.conditionals_basics,
            //         difficulty: "easy",
            //         n: 6,
            //         allowReveal: true,
            //         preferKind: null, // allow mixed single + multi
            //         maxAttempts: 10,
            //     },
            // },
        ],
    } satisfies ReviewTopicShape,

    def: {
        id: ID,
        meta: {
            label: K.label as any,
            minutes: MINUTES,
            pool: M2_CONDITIONALS_POOL.map((p) => ({ ...p })),
        },
    } satisfies TopicDefCompat,
} satisfies { topic: ReviewTopicShape; def: TopicDefCompat };