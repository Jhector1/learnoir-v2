import {SketchEntry} from "@/components/sketches/subjects";

export const HC_NUMBERS_SECTION: Record<string, SketchEntry> = {
    "ht.hc.mod0.numbers.lesson": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Numbers (0–100) basics",
            bodyMarkdown: String.raw`
Start with **1–10**, then you can scale fast.

---

## Core numbers

- 0 **zewo**
- 1 **youn**
- 2 **de**
- 3 **twa**
- 4 **kat**
- 5 **senk**
- 6 **sis**
- 7 **sèt**
- 8 **uit**
- 9 **nèf**
- 10 **dis**

---

## Quick tip

Don’t try to memorize 0–100 all at once.
Drill:
1) recognize → 2) produce → 3) mix random.

That’s what the trainer below is for.
`.trim(),
        },
    },

    "hc.numbers": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Numbers trainer",
            bodyMarkdown: String.raw`
Practice:
- see a number → type/say the Creole
- see a Creole number → choose the digit
- mix small ranges, then expand
`.trim(),
        },
    },
};