// src/components/sketches/subjects/python/modules/module0/topics/workspace.ts
import { TopicDefCompat } from "../../../../../../../prisma/seed/data/subjects/_types";
import { PY_MOD0 } from "../../../../../../../prisma/seed/data/subjects/python/constants";
import { PY_SECTION_PART0, PY_TOPIC_MOD0 } from "@/lib/practice/catalog/subjects/python/slugs";

// ✅ pool source of truth
import { M0_WORKSPACE_POOL } from "@/lib/practice/generator/engines/python/python_part1_mod0/topics/workspace";

const ID = "editor_workspace_overview" as const;
const LABEL = "Understanding the editor, Run button, and terminal" as const;
const MINUTES = 8 as const;

export const PY_WORKSPACE = {
    topic: {
        id: ID,
        label: LABEL,
        minutes: MINUTES,
        summary:
            "A quick tour of the workspace, then a short hands-on exercise to run code and verify output in the terminal.",
        cards: [
            {
                type: "sketch",
                id: `${ID}_s0`,
                title: "Workspace overview",
                sketchId: "py.workspace.intro",
                height: 520,
            },
            {
                type: "sketch",
                id: `${ID}_s1`,
                title: "Run your first edits",
                sketchId: "py.workspace.instructions.intro",
                height: 520,
            },

            {
                type: "quiz",
                id: `${ID}_q0`,
                title: "Quick check: the workspace",
                passScore: 0.75,
                spec: {
                    subject: "python",
                    module: PY_MOD0,
                    section: PY_SECTION_PART0,
                    topic: PY_TOPIC_MOD0.editor_workspace_overview,
                    difficulty: "easy",

                    // ✅ align to pool size (you had 4 but only 3 keys)
                    n: M0_WORKSPACE_POOL.length,

                    allowReveal: true,
                    preferKind: null,
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
            pool: M0_WORKSPACE_POOL.map((p) => ({ ...p })),
        },
    } as const satisfies TopicDefCompat,
} as const;