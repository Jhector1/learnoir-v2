import type { ReviewModule } from "@/lib/review/types";
import {
  HT_SECTION_PART1,
  HT_TOPIC,
} from "@/lib/practice/catalog/subjects/haitian-creole/slugs";
import { HC_MOD0 } from "../../../../../prisma/seed/data/subjects/haitian-creole/constants";

export const haitianCreolePart1Module: ReviewModule = {
  id: HC_MOD0,
  title: "Haitian Creole — Part 1",
  subtitle:
    "Basics: greetings, pronouns, simple sentences, questions, and numbers (interactive drills + quick quizzes).",

  startPracticeHref: (topicSlug) =>
    `/practice?section=${HT_SECTION_PART1}&difficulty=easy&topic=${encodeURIComponent(
      topicSlug,
    )}`,

  topics: [
    {
      id: "hc_greetings",
      label: "Greetings + polite phrases",
      minutes: 12,
      summary: "Say hello, goodbye, thank you, and choose the right greeting for the time of day.",
      cards: [
        {
          type: "text",
          id: "hc1_t1",
          title: "Core greetings (very common)",
          markdown: String.raw`
Common greetings:

- **Bonjou** — hello (daytime)
- **Bonswa** — good evening
- **Kijan ou ye?** — how are you?
- **Mèsi** — thank you
- **Tanpri** — please

Tip: Haitian Creole is very **consistent**—learn the core phrases and reuse them everywhere.
`.trim(),
        },
        {
          type: "sketch",
          id: "hc1_v1",
          title: "Video: Greetings basics",
          sketchId: "video.embed",
          height: 520,
          props: {
            title: "Greetings basics (Bonjou / Bonswa / Mèsi / Tanpri)",
            url: "https://youtu.be/qrO4XUMpbNo?si=jeFawGpu5PA1CLRR",
            provider: "auto",
            captionMarkdown: String.raw`Watch, then use the interactive greeting builder below.`.trim(),
            hudMarkdown: String.raw`
**Goal**

Pick the right greeting for:
- time of day
- formality
- situation (meeting / leaving / thanks)
`.trim(),
          },
        },
        {
          type: "sketch",
          id: "hc1_s1",
          title: "Greeting builder (time of day + situation)",
          sketchId: "hc.greetings",
          height: 440,
        },
        {
          type: "quiz",
          id: "hc1_q1",
          title: "Quick check",
          spec: {
            subject: "haitian-creole",
            module: HC_MOD0,
            section: HT_SECTION_PART1,
            topic: HT_TOPIC.greetings,
            difficulty: "easy",
            n: 4,
            allowReveal: true,
          },
        },
      ],
    },

    {
      id: "hc_pronouns",
      label: "Pronouns (mwen, ou, li, nou, yo)",
      minutes: 14,
      summary: "Learn the core pronouns and build short sentences with them.",
      cards: [
        {
          type: "text",
          id: "hc2_t1",
          title: "Pronoun map (core set)",
          markdown: String.raw`
Haitian Creole pronouns:

- **mwen** — I / me
- **ou** — you
- **li** — he / she / it / him / her
- **nou** — we / us
- **yo** — they / them

Notice: **li** can mean he/she/it (context decides).
`.trim(),
        },
        {
          type: "sketch",
          id: "hc2_s1",
          title: "Pronoun picker → sentence builder",
          sketchId: "hc.pronouns",
          height: 460,
        },
        {
          type: "quiz",
          id: "hc2_q1",
          title: "Quick check",
          spec: {
            subject: "haitian-creole",
            module: HC_MOD0,
            section: HT_SECTION_PART1,
            topic: HT_TOPIC.pronouns,
            difficulty: "easy",
            n: 4,
            allowReveal: true,
          },
        },
      ],
    },

    {
      id: "hc_sentences",
      label: "Building simple sentences",
      minutes: 14,
      summary: "Use SVO order and learn when to use “se” (and when NOT to).",
      cards: [
        {
          type: "text",
          id: "hc3_t1",
          title: "Simple order: Subject + Verb + Object",
          markdown: String.raw`
Most basic sentences follow:

**Subject + Verb + Object**

Example:
- **Mwen renmen diri.** (I like rice.)
- **Ou gen yon liv.** (You have a book.)

Adjectives often work **without** “to be”:
- **Li byen.** (He/She is fine.)
`.trim(),
        },
        {
          type: "sketch",
          id: "hc3_s1",
          title: "Sentence builder (SVO + adjective vs noun)",
          sketchId: "hc.sentences",
          height: 480,
        },
        {
          type: "quiz",
          id: "hc3_q1",
          title: "Quick check",
          spec: {
            subject: "haitian-creole",
            module: HC_MOD0,
            section: HT_SECTION_PART1,
            topic: HT_TOPIC.sentence_building,
            difficulty: "easy",
            n: 4,
            allowReveal: true,
          },
        },
      ],
    },

    {
      id: "hc_questions",
      label: "Question words",
      minutes: 14,
      summary: "Ask who/what/where/when/why/how with the most common question words.",
      cards: [
        {
          type: "text",
          id: "hc4_t1",
          title: "Common question words",
          markdown: String.raw`
- **Kisa** — what
- **Kiyès** — who
- **Ki kote** — where
- **Kilè** — when
- **Kijan** — how
- **Poukisa** — why

Try building your own questions and matching the English meaning.
`.trim(),
        },
        {
          type: "sketch",
          id: "hc4_v1",
          title: "Video: Asking questions in Haitian Creole",
          sketchId: "video.embed",
          height: 520,
          props: {
            title: "Question words (kisa/kiyès/ki kote/kilè/kijan/poukisa)",
            url: "https://youtu.be/SOzd0n-y1Xc?si=sT6oD3rSAD1NAhNR",
            provider: "auto",
            captionMarkdown: String.raw`Watch, then use the question builder below.`.trim(),
            hudMarkdown: String.raw`
**Practice**

Pick a question word → fill the rest of the sentence → check meaning.
`.trim(),
          },
        },
        {
          type: "sketch",
          id: "hc4_s1",
          title: "Question builder + translation check",
          sketchId: "hc.questions",
          height: 480,
        },
        {
          type: "quiz",
          id: "hc4_q1",
          title: "Quick check",
          spec: {
            subject: "haitian-creole",
            module: HC_MOD0,
            section: HT_SECTION_PART1,
            topic: HT_TOPIC.questions,
            difficulty: "easy",
            n: 4,
            allowReveal: true,
          },
        },
      ],
    },

    {
      id: "hc_numbers",
      label: "Numbers (0–100) basics",
      minutes: 12,
      summary: "Recognize and produce numbers in Haitian Creole.",
      cards: [
        {
          type: "text",
          id: "hc5_t1",
          title: "Numbers start with a small core",
          markdown: String.raw`
Learn 1–10 first, then build upward.

Examples:
- 1 **youn**
- 2 **de**
- 3 **twa**
- 4 **kat**
- 5 **senk**
- 10 **dis**
`.trim(),
        },
        {
          type: "sketch",
          id: "hc5_s1",
          title: "Numbers trainer (0–100)",
          sketchId: "hc.numbers",
          height: 460,
        },
        {
          type: "quiz",
          id: "hc5_q1",
          title: "Quick check",
          spec: {
            subject: "haitian-creole",
            module: HC_MOD0,
            section: HT_SECTION_PART1,
            topic: HT_TOPIC.numbers,
            difficulty: "easy",
            n: 4,
            allowReveal: true,
          },
        },
      ],
    },
  ],
};
