import { SketchEntry } from "@/components/sketches/subjects";

export const PY_SYNTAX_COMMENTS_SECTION: Record<string, SketchEntry> = {
    "py.syntax.comments": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,

            // ✅ keys match your JSON exactly
            title: "@:sketches.py.syntax.comments.title",
            bodyMarkdown: "@:sketches.py.syntax.comments.bodyMarkdown",
        },
    },
};