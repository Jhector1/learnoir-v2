import {SketchEntry} from "@/components/sketches/subjects";

export const HC_GREETINGS_SECTION: Record<string, SketchEntry> = {
    "ht.hc.mod0.greetings.lesson": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Greetings + Polite Phrases",
            bodyMarkdown: String.raw`
Haitian Creole greetings are **simple, reusable**, and extremely common in daily conversation.

---

## The essentials

- **Bonjou** — “Hello / Good morning” *(daytime)*
- **Bonswa** — “Good evening”
- **Kijan ou ye?** — “How are you?”
- **Mèsi** — “Thank you”
- **Tanpri** — “Please”

---

## Quick rule: Bonjou vs Bonswa

- Use **Bonjou** when it’s daytime.
- Use **Bonswa** in the evening / night.

If you’re unsure, **Bonjou** is usually safe earlier in the day.

---

## Mini-dialogues (copy + reuse)

**A: Bonjou!**  
**B: Bonjou!**

**A: Kijan ou ye?**  
**B: Mwen byen. E ou?** *(I’m good. And you?)*

**A: Mèsi.**  
**B: Pa gen pwoblèm.** *(No problem.)*

---

## Pronunciation tips (fast)

- **Bonjou** ≈ “bohn-zhoo”
- **Bonswa** ≈ “bohn-swah”
- **Mèsi** ≈ “meh-see”

---

Next: we’ll use these greetings inside **short sentences** (with pronouns).
`.trim(),
        },
    },

    // If you already have a real interactive sketch with this id,
    // you can remove this paragraph fallback entry.
    "hc.greetings": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Greeting builder",
            bodyMarkdown: String.raw`
Use this drill to practice choosing the right greeting.

**Goal**
- Pick a time of day (day / evening)
- Pick a situation (meeting / leaving / thanking)
- Build the correct phrase in Haitian Creole

If you implement an interactive archetype later, keep the same sketchId (**hc.greetings**) so content doesn’t break.
`.trim(),
        },
    },
};