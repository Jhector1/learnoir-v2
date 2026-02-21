import { TopicDefCompat } from "../../../../../../../prisma/seed/data/subjects/_types";
import { PY_MOD2 } from "../../../../../../../prisma/seed/data/subjects/python/constants";
import { PY_SECTION_PART2, PY_TOPIC_MOD2 } from "@/lib/practice/catalog/subjects/python/slugs";
import type { PracticeKind } from "@prisma/client";

import { M2_LOOPS_POOL } from "@/lib/practice/generator/engines/python/python_part1_mod2/topics/loops";

const ID = "loops_basics" as const;
const LABEL = "Loops: Repeat Until It Works" as const;
const MINUTES = 14 as const;

const PK = {
    code_input: "code_input" as PracticeKind,
} as const;

export const PY_LOOPS = {
    topic: {
        id: ID,
        label: LABEL,
        minutes: MINUTES,
        summary:
            "Learn while loops for validation, for loops with range, and flow control with break and continue through mini-programs.",
        cards: [
            {
                type: "sketch",
                id: `${ID}_s0`,
                title: "Loops (while, for, break, continue)",
                sketchId: "py.loops.basics",
                height: 680,
            },

            {
                type: "project",
                id: `${ID}_p0`,
                title: "Project: Kiosk loop pack (guess → validate → command loop)",
                passScore: 0.75,
                spec: {
                    subject: "python",
                    module: PY_MOD2,
                    section: PY_SECTION_PART2,
                    topic: PY_TOPIC_MOD2.loops_basics,
                    difficulty: "easy",
                    allowReveal: true,
                    preferKind: null,
                    maxAttempts: 10,

                    mode: "project",
                    steps: [
                        {
                            id: "guess_until_7",
                            title: "Guess until the secret is correct",
                            topic: PY_TOPIC_MOD2.loops_basics,
                            difficulty: "easy",
                            preferKind: PK.code_input,
                            exerciseKey: "m2_loop_guess_until_secret_code",
                            seedPolicy: "global",
                            maxAttempts: 10,
                        },
                        {
                            id: "validate_1_10",
                            title: "Keep asking until input is 1..10",
                            topic: PY_TOPIC_MOD2.loops_basics,
                            difficulty: "easy",
                            preferKind: PK.code_input,
                            exerciseKey: "m2_loop_keep_asking_valid_code",
                            seedPolicy: "global",
                            maxAttempts: 10,
                        },
                        {
                            id: "echo_until_quit",
                            title: "Echo commands until quit",
                            topic: PY_TOPIC_MOD2.loops_basics,
                            difficulty: "easy",
                            preferKind: PK.code_input,
                            exerciseKey: "m2_loop_echo_until_quit_code",
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
            pool: M2_LOOPS_POOL.map((p) => ({ ...p })),
        },
    } as const satisfies TopicDefCompat,
} as const;