// src/components/sketches/subjects/python/modules/module1/topics/string_basics.ts
import { TopicDefCompat } from "../../../../../../../prisma/seed/data/subjects/_types";
import { PY_MOD1 } from "../../../../../../../prisma/seed/data/subjects/python/constants";
import { PY_SECTION_PART1, PY_TOPIC_MOD1 } from "@/lib/practice/catalog/subjects/python/slugs";
import type { PracticeKind } from "@prisma/client";

import { M1_STRINGS_POOL } from "@/lib/practice/generator/engines/python/python_part1_mod1/topics/string_basics";
import {ReviewTopicShape} from "@/lib/subjects/types";

const ID = "string_basics" as const;
const LABEL = "String Basics: Working With Text Like a Pro" as const;
const MINUTES = 12 as const;

const PK = {
    code_input: "code_input" as PracticeKind,
    single_choice: "single_choice" as PracticeKind,
} as const;

export const PY_STRING_BASICS = {
    topic: {
        id: ID,
        label: LABEL,
        minutes: MINUTES,
        summary:
            "Learn strings: concatenation vs commas, f-strings, indexing/slicing, and common methods like lower(), strip(), replace().",
        cards: [
            { type: "sketch", id: `${ID}_s0`, title: "Strings (Concatenation, f-strings, Indexing, Methods)", sketchId: "py.strings.basics", height: 600 },

            {
                type: "project",
                id: `${ID}_p0`,
                title: "Project: Clean + human output",
                passScore: 0.75,
                spec: {
                    subject: "python",
                    module: PY_MOD1,
                    section: PY_SECTION_PART1,
                    topic: PY_TOPIC_MOD1.string_basics,
                    difficulty: "easy",
                    allowReveal: true,
                    preferKind: null,
                    maxAttempts: 10,

                    mode: "project",
                    steps: [
                        {
                            id: "concat_vs_comma",
                            title: "Concatenation vs commas (what prints?)",
                            topic: PY_TOPIC_MOD1.string_basics,
                            difficulty: "easy",
                            preferKind: PK.single_choice,
                            exerciseKey: "m1_str_concat_vs_comma_sc",
                            seedPolicy: "global",
                            maxAttempts: 3,
                        },
                        {
                            id: "fstring_greeting",
                            title: "Use an f-string to print a clean sentence",
                            topic: PY_TOPIC_MOD1.string_basics,
                            difficulty: "easy",
                            preferKind: PK.code_input,
                            exerciseKey: "m1_str_fstring_greeting_code",
                            seedPolicy: "global",
                            maxAttempts: 10,
                        },
                        {
                            id: "username_generator",
                            title: "Build a username generator (strip + lower + indexing)",
                            topic: PY_TOPIC_MOD1.string_basics,
                            difficulty: "easy",
                            preferKind: PK.code_input,
                            exerciseKey: "m1_str_username_code",
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
            pool: M1_STRINGS_POOL.map((p) => ({ ...p })),
        },
   }  satisfies TopicDefCompat,
} satisfies { topic: ReviewTopicShape; def: TopicDefCompat };