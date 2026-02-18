import type {SketchEntry} from "../../registryTypes";

export const AI_MOD0_SKETCHES: Record<string, SketchEntry> = {
    "ai.intro": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "AI basics",
            bodyMarkdown: String.raw`
Generative AI is quickly becoming an everyday tool—like spellcheck, search, and calculators did in earlier eras—except it works with language and ideas. It can help you write, plan, summarize, brainstorm, and organize information in seconds.

To get real value (and stay safe), you only need a few core skills:

1) **Ask clearly** for what you want (task + context + format)  
2) **Iterate** to improve results (refine, constrain, try again)  
3) **Verify** important claims (sources, cross-checks, calculations)  
4) **Protect privacy** when working with real information (redaction + data controls)

We’ll focus on ChatGPT because it’s a flexible, general-purpose assistant for everyday tasks: drafting messages, explaining concepts, generating options, and turning messy notes into clean outlines. And we won’t treat it as the only tool—you’ll also learn how to choose between major AI tools based on what you’re trying to do.

**By the end of this module, you’ll be able to prompt confidently, refine outputs quickly, verify what matters, and use AI responsibly.**
`.trim(),
        },
    },

    "ai.getstarted": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Get started",
            bodyMarkdown: String.raw`
Your first win is simple: open ChatGPT, write one clear prompt, and check the format.

If you get stuck, do only **one** step at a time:

- Open ChatGPT and start a new chat
- Type your first prompt (**3 bullets + 2 questions**)
- Press Send
- Read the response and check if the format matches what you asked for

**Example prompt**
“Explain what you can help me with in **3 bullets**, then ask me **2 questions** about my goal.”
`.trim(),
        },
    },

    "ai.verify": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Verification checklist",
            bodyMarkdown: String.raw`
Generative AI can sound confident even when it’s wrong or incomplete. Use this checklist whenever accuracy matters:

- **Fact or opinion?** Decide what kind of claim it is.
- **Ask for sources** when it matters (especially for real-world claims).
- **Cross-check** with 1 trusted source if it’s high-stakes.
- **Recalculate numbers** or validate formulas.

Rule of thumb: AI outputs are **drafts** until confirmed.
`.trim(),
        },
    },

    "ai.usecases": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "What ChatGPT is good at + prompt templates",
            bodyMarkdown: String.raw`
ChatGPT is most useful when you want to:

- **Draft** (emails, outlines, scripts)
- **Explain** (concepts, step-by-step help)
- **Organize** (plans, checklists, summaries)

Rule of thumb: treat outputs like a **first draft** → verify anything important.

---

Templates help you prompt with clarity (goal + audience + constraints + format).

### Template: Draft an email
Fill in: **{to}**, **{goal}**, **{tone}**

\`\`\`
Write an email to {to}. Goal: {goal}.
Tone: {tone}.
Keep it under 120 words. End with 2 suggested subject lines.
\`\`\`

### Template: Explain a concept
Fill in: **{topic}**, **{level}**

\`\`\`
Explain {topic} to a {level}.
Use 5 bullets, then a 1-sentence analogy.
\`\`\`

Tip: When prompts feel vague, add **audience** + **format**.
`.trim(),
        },
    },

    "ai.workflow": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Ask → Refine → Finalize",
            bodyMarkdown: String.raw`
Most good results come from a simple loop, not a perfect first try.

**Ask → Refine → Finalize**

1) **Ask** — say what you want in one sentence  
2) **Refine** — add audience, constraints, tone, format, examples  
3) **Finalize** — request the final version and do a quick check

Use it like a helpful assistant:
- “Make it shorter.”
- “Use a friendlier tone.”
- “Give me three options.”
- “Ask me questions before you answer.”
- “Show your assumptions.”
`.trim(),
        },
    },

    "ai.format": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Asking for format",
            bodyMarkdown: String.raw`
Specific format = less randomness.

Examples you can reuse:
- “Give me **5 bullets**…”
- “Give me a **step-by-step** plan…”
- “Make a **table** with columns X/Y/Z…”
- “Keep it under **120 words**.”

Try starting with:
- “Explain photosynthesis.”

Then refine:
- “Use **5 bullets**.”
- “Make it **step-by-step**.”
- “**Shorten** it.”
- “Put it in a **2-column table**.”
`.trim(),
        },
    },

    "ai.safety": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "What not to paste (and what to do instead)",
            bodyMarkdown: String.raw`
Don’t paste:

- **PII**: full name + address, phone, SSN, student ID, bank info
- **PHI**: patient IDs, diagnoses tied to a person
- **Secrets**: passwords, API keys, private tokens

Use placeholders like **[CUSTOMER]**, **[ORDER_ID]**, **[API_KEY_REMOVED]**.

---

Safety is non-negotiable. Before you paste anything into AI, classify it:

**OK to paste**
- A math problem statement (no personal data)

**Redact first**
- Customer email + order ID (remove identifiers)

**Never paste**
- API keys / passwords (secrets unlock systems)

Learnoir rule: if it identifies a person or unlocks systems, **redact or never paste**.
`.trim(),
        },
    },

    "ai.redaction": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Redaction basics",
            bodyMarkdown: String.raw`
Redaction is *not* deleting the whole message — it’s removing what can identify someone.

Replace:
- “Sarah Johnson” → **[CUSTOMER]**
- “MRN 884201” → **[PATIENT_ID]**
- emails/phones → **[EMAIL]**, **[PHONE]**
- addresses → **[ADDRESS]**
- order IDs → **[ORDER_ID]**

Example:
- “Sarah Johnson (sarah@email.com) lives at 12 Pine St. Order #884201.”
→ “[CUSTOMER] ([EMAIL]) lives at [ADDRESS]. Order [ORDER_ID].”

Practice prompts you can use:
- “Summarize this while removing personal identifiers.”
- “Convert to bullets and replace names/emails/orders with placeholders.”
- “Shorten it and redact sensitive details.”
`.trim(),
        },
    },

    "ai.datacontrols": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Data Controls",
            bodyMarkdown: String.raw`
**Data Controls** let you manage how your chat data is used and reviewed.

This is a UI lab: find **Data Controls** in ChatGPT settings.

Steps:
- Open Settings
- Locate “Data Controls”
- Confirm you can explain what it changes

Goal: build the habit of checking privacy controls before using AI with real info.
`.trim(),
        },
    },

    "ai.lab": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Lab: first interaction",
            bodyMarkdown: String.raw`
You’re practicing the core loop: **prompt → check format → refine once**.

**Prompt to use**
\`\`\`
Explain what you can help me with in 3 bullets, then ask me 2 questions about my goal.
\`\`\`

Checklist:
- Paste the prompt into ChatGPT
- Check it followed **3 bullets + 2 questions**
- Ask it to refine based on your goal

Submission:
- Paste the ChatGPT response into your lab submission box.
`.trim(),
        },
    },
};
