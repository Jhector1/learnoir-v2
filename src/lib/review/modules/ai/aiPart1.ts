import type { ReviewModule } from "@/lib/review/types";
import { AI_SECTION_MOD0, AI_TOPIC } from "@/lib/practice/catalog/subjects/ai/slugs";
import { AI_MOD0 } from "../../../../../prisma/seed/data/subjects/ai/constants";

export const aiBasicsPart1Module: ReviewModule = {
    id: AI_MOD0,
    title: "AI Basics — Part 1",
    subtitle:
        "Absolute beginner friendly: what AI is (and isn’t), how to ask better questions, how to check answers, and how to stay safe (interactive drills + quick quizzes).",

    startPracticeHref: (topicSlug) =>
        `/practice?section=${AI_SECTION_MOD0}&difficulty=easy&topic=${encodeURIComponent(topicSlug)}`,

    topics: [
        // ------------------------------------------------------------
        // AI basics
        // (seed topic id: ai_basics)
        // sketches: ai0.what
        // ------------------------------------------------------------
        {
            id: "ai_basics",
            label: "AI basics: what it is (and isn’t)",
            minutes: 12,
            summary:
                "Understand AI in plain English, avoid common myths, and learn the #1 rule: AI is helpful—but not automatically correct.",
            cards: [
                {
                    type: "text",
                    id: "ai0_t1",
                    title: "AI in one sentence",
                    markdown: String.raw`
**AI (chat tools) = a pattern-maker.**  
It generates *likely* answers based on patterns in text — not guaranteed truth.

### Quick myths (and the truth)
- **Myth:** “AI knows things like a person.”  
  **Truth:** It predicts a good-looking response.
- **Myth:** “If it sounds confident, it’s correct.”  
  **Truth:** Confidence can be fake.
- **Myth:** “AI replaces thinking.”  
  **Truth:** You still decide + verify.

**Golden rule:** Use AI to get a *draft* or *options*, then **check** what matters.
`.trim(),
                },

                {
                    type: "sketch",
                    id: "ai0_s1",
                    title: "AI or Not? (spot the difference)",
                    sketchId: "ai0.what",
                    height: 460,
                },

                {
                    type: "quiz",
                    id: "ai0_q1",
                    title: "Quick check",
                    spec: {
                        subject: "ai",
                        module: AI_MOD0,
                        section: AI_SECTION_MOD0,
                        topic: AI_TOPIC.ai_basics,
                        difficulty: "easy",
                        n: 4,
                        allowReveal: true,
                    },
                },
            ],
        },

        // ------------------------------------------------------------
        // Clear prompts
        // (seed topic id: clear_prompts)
        // sketches: ai0.prompt_builder, ai0.prompt_refine, ai0.tone
        // ------------------------------------------------------------
        {
            id: "clear_prompts",
            label: "Clear prompts: goal, context, constraints",
            minutes: 14,
            summary:
                "Learn a simple recipe for good prompts: say what you want, add context, add constraints, and ask for a format.",
            cards: [
                {
                    type: "text",
                    id: "ai1_t1",
                    title: "The prompt recipe (super simple)",
                    markdown: String.raw`
A strong prompt usually has:

1) **Goal** — what you want  
2) **Context** — who/why/what’s going on  
3) **Constraints** — length, tone, rules  
4) **Format** — bullets, steps, table, etc.

**Example**
“Write a *polite* email to my teacher asking for a 2-day extension. Under 80 words. One paragraph.”
`.trim(),
                },

                {
                    type: "sketch",
                    id: "ai1_s1",
                    title: "Prompt Builder (make a good prompt fast)",
                    sketchId: "ai0.prompt_builder",
                    height: 520,
                },

                {
                    type: "sketch",
                    id: "ai1_s2",
                    title: "Refine a prompt (small tweaks → better results)",
                    sketchId: "ai0.prompt_refine",
                    height: 460,
                },

                {
                    type: "sketch",
                    id: "ai1_s3",
                    title: "Tone rewriter (friendly vs polite vs formal)",
                    sketchId: "ai0.tone",
                    height: 520,
                },

                {
                    type: "quiz",
                    id: "ai1_q1",
                    title: "Quick check",
                    spec: {
                        subject: "ai",
                        module: AI_MOD0,
                        section: AI_SECTION_MOD0,
                        topic: AI_TOPIC.clear_prompts,
                        difficulty: "easy",
                        n: 4,
                        allowReveal: true,
                    },
                },
            ],
        },

        // ------------------------------------------------------------
        // Accuracy checking
        // (seed topic id: accuracy_checking)
        // sketches: ai0.verify
        // ------------------------------------------------------------
        {
            id: "accuracy_checking",
            label: "Checking answers: verify important info",
            minutes: 12,
            summary:
                "Learn the habit that saves you: verify important claims before you use them in real life or school.",
            cards: [
                {
                    type: "text",
                    id: "ai2_t1",
                    title: "When to double-check",
                    markdown: String.raw`
AI can be wrong. **Double-check** when the answer includes:

- dates, prices, deadlines, rules
- medical / legal / money advice
- anything you plan to submit or cite

A simple approach:
1) Ask for sources / assumptions  
2) Check key claims  
3) Use the verified version
`.trim(),
                },

                {
                    type: "sketch",
                    id: "ai2_s1",
                    title: "Verify Checklist (practice the habit)",
                    sketchId: "ai0.verify",
                    height: 520,
                },

                {
                    type: "quiz",
                    id: "ai2_q1",
                    title: "Quick check",
                    spec: {
                        subject: "ai",
                        module: AI_MOD0,
                        section: AI_SECTION_MOD0,
                        topic: AI_TOPIC.accuracy_checking,
                        difficulty: "easy",
                        n: 4,
                        allowReveal: true,
                    },
                },
            ],
        },

        // ------------------------------------------------------------
        // Privacy & safety
        // (seed topic id: privacy_safety)
        // sketches: ai0.privacy
        // ------------------------------------------------------------
        {
            id: "privacy_safety",
            label: "Privacy & safety: what not to share",
            minutes: 12,
            summary:
                "Learn what to avoid sharing and how to replace sensitive details with placeholders so you can still get help safely.",
            cards: [
                {
                    type: "text",
                    id: "ai3_t1",
                    title: "Keep private info private",
                    markdown: String.raw`
Avoid sharing:
- **passwords**, bank logins
- SSN / credit card numbers
- home address + phone (in one message)
- private documents you shouldn’t publish

You can still ask for help by using placeholders like:
\`[NAME]\`, \`[EMAIL]\`, \`[PHONE]\`, \`[ADDRESS]\`
`.trim(),
                },

                {
                    type: "sketch",
                    id: "ai3_s1",
                    title: "Privacy Redaction (turn unsafe → safe)",
                    sketchId: "ai0.privacy",
                    height: 560,
                },

                {
                    type: "quiz",
                    id: "ai3_q1",
                    title: "Quick check",
                    spec: {
                        subject: "ai",
                        module: AI_MOD0,
                        section: AI_SECTION_MOD0,
                        topic: AI_TOPIC.privacy_safety,
                        difficulty: "easy",
                        n: 4,
                        allowReveal: true,
                    },
                },
            ],
        },

        // ------------------------------------------------------------
        // Simple workflow
        // (seed topic id: simple_workflow)
        // sketches: ai0.prompt_refine, ai0.verify (reused on purpose)
        // ------------------------------------------------------------
        {
            id: "simple_workflow",
            label: "Simple workflow: Ask → Check → Improve",
            minutes: 12,
            summary:
                "Use AI safely with a tiny workflow you can remember: Ask clearly, check what matters, then improve the prompt.",
            cards: [
                {
                    type: "text",
                    id: "ai4_t1",
                    title: "The beginner workflow",
                    markdown: String.raw`
### 1) Ask clearly
Say your goal + context + constraints.

### 2) Check what matters
Verify dates, rules, numbers, and any “official-sounding” claims.

### 3) Improve the prompt
If it’s vague, ask for:
- shorter / simpler
- a checklist
- examples
- a better structure
`.trim(),
                },

                {
                    type: "sketch",
                    id: "ai4_s1",
                    title: "Refine a prompt (practice the improvement step)",
                    sketchId: "ai0.prompt_refine",
                    height: 460,
                },

                {
                    type: "sketch",
                    id: "ai4_s2",
                    title: "Verify Checklist (practice the checking step)",
                    sketchId: "ai0.verify",
                    height: 520,
                },

                {
                    type: "quiz",
                    id: "ai4_q1",
                    title: "Quick check",
                    spec: {
                        subject: "ai",
                        module: AI_MOD0,
                        section: AI_SECTION_MOD0,
                        topic: AI_TOPIC.simple_workflow,
                        difficulty: "easy",
                        n: 4,
                        allowReveal: true,
                    },
                },
            ],
        },

        // ------------------------------------------------------------
        // Mixed review (optional)
        // (seed topic id: foundations)
        // ------------------------------------------------------------
        {
            id: "foundations",
            label: "AI foundations (mixed review)",
            minutes: 0,
            summary: "A mixed set to quickly review all the basics.",
            cards: [
                {
                    type: "quiz",
                    id: "ai5_q1",
                    title: "Mixed quick quiz",
                    spec: {
                        subject: "ai",
                        module: AI_MOD0,
                        section: AI_SECTION_MOD0,
                        topic: AI_TOPIC.foundations,
                        difficulty: "easy",
                        n: 8,
                        allowReveal: true,
                    },
                },
            ],
        },
    ],
};
