import { SketchEntry } from "@/components/sketches/subjects";

export const PY_CONDITIONALS_SECTION: Record<string, SketchEntry> = {
    "py.cond.basics": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,

            // ✅ keys match JSON
            title: "@:sketches.py.cond.basics.title",
            bodyMarkdown: "@:sketches.py.cond.basics.bodyMarkdown",
        },
    },
};