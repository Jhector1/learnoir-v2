export const HC_PRONOUNS_SECTION: Record<string, SketchEntry> = {
    "ht.hc.mod0.pronouns.lesson": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Pronouns (core set)",
            bodyMarkdown: String.raw`
These pronouns are the backbone of Haitian Creole.

---

## The core pronouns

- **mwen** — I / me  
- **ou** — you  
- **li** — he / she / it / him / her  
- **nou** — we / us *(also “you all” in some contexts)*  
- **yo** — they / them  

---

## Big note: **li** is neutral

**li** can mean “he”, “she”, or “it”.  
Context decides — that’s normal.

---

## Fast examples (copy-paste patterns)

- **Mwen byen.** — I’m good.  
- **Ou byen?** — Are you good? / You good?  
- **Li la.** — He/She is here.  
- **Nou pare.** — We are ready.  
- **Yo vini.** — They are coming.

---

Next: we’ll build simple sentences with **Subject + Verb + Object**.
`.trim(),
        },
    },

    "hc.pronouns": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Pronoun practice",
            bodyMarkdown: String.raw`
Practice goal:
- pick a pronoun
- pick a simple verb
- build a correct short sentence

(If you later ship an interactive archetype, keep this same sketchId.)
`.trim(),
        },
    },
};