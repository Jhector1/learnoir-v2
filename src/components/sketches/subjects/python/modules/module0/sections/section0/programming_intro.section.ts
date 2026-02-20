import {SketchEntry} from "@/components/sketches/subjects";

export const PY_PROGRAMMING_INTRO_SECTION: Record<string, SketchEntry> = {
    // ---------- SECTION I - Topic { print() complete } ----------

// ---------- SECTION I - Topic { print() complete + fun reading } ----------
    "py.programming.intro": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Programming Languages: Talking to Computers",
            bodyMarkdown: String.raw`
Just like humans communicate with each other using language, we also communicate with computers using programming languages. Computer scientists designed these languages so we can give instructions to a computer in a way it can understand.

There are many programming languages—such as Python, Java, and C—and each one has its own strengths. In this lesson, we’ll focus on Python, one of the most widely used programming languages in the world today.
`.trim(),
        },
    },

    }