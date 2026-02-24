import {SketchEntry} from "@/components/sketches/subjects";

export const HC_SENTENCES_SECTION: Record<string, SketchEntry> = {
    "ht.hc.mod0.sentences.lesson": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Building simple sentences",
            bodyMarkdown: String.raw`
Most beginner sentences follow a familiar pattern:

**Subject + Verb + Object**

---

## Examples

- **Mwen renmen diri.** — I like rice.  
- **Ou gen yon liv.** — You have a book.

---

## The “se” rule (easy version)

Use **se** when linking a subject to a **noun**:

- **Li se doktè.** — He/She is a doctor. *(noun)*

Often you **don’t** need “to be” with adjectives:

- **Li byen.** — He/She is fine. *(adjective)*  
- **Nou pare.** — We are ready.

---

Goal: build short sentences quickly, not perfectly.
We’ll refine nuance later.
`.trim(),
        },
    },

    "hc.sentences": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Sentence builder",
            bodyMarkdown: String.raw`
Practice:
- choose a pronoun
- choose a verb
- choose an object
- produce a clean Creole sentence
`.trim(),
        },
    },
};