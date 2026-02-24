import {SketchEntry} from "@/components/sketches/subjects";

export const HC_QUESTIONS_SECTION: Record<string, SketchEntry> = {
    "ht.hc.mod0.questions.lesson": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Question words",
            bodyMarkdown: String.raw`
These are the most common question words:

- **Kisa** — what  
- **Kiyès** — who  
- **Ki kote** — where  
- **Kilè** — when  
- **Kijan** — how  
- **Poukisa** — why  

---

## Pattern you can reuse

Start with a question word → finish the sentence.

Examples:
- **Kijan ou ye?** — How are you?
- **Ki kote ou rete?** — Where do you live?
- **Kisa ou renmen?** — What do you like?

Goal: recognize the word → match meaning quickly.
`.trim(),
        },
    },

    "hc.questions": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Question builder",
            bodyMarkdown: String.raw`
Practice:
- pick a question word
- complete a short question
- verify the English meaning
`.trim(),
        },
    },
};