"use client";

import React, { useMemo, useState } from "react";
import TextMarkdown from "@/components/markdown/TextMarkdown";
import { cn } from "@/components/review/sketches/_shared/sketchUi";

type Key = "ai" | "model" | "prompt" | "chatgpt";

const CARDS: Record<Key, { label: string; tone: "emerald" | "sky" | "rose"; md: string }> = {
    ai: {
        label: "AI",
        tone: "emerald",
        md: String.raw`
**AI (plain English)**  
Software that can recognize patterns and generate useful outputs (text, images, plans, etc.).

**How to think about it:**  
It helps you draft, explain, and organize — but it can still be wrong sometimes.
`.trim(),
    },
    model: {
        label: "Model",
        tone: "sky",
        md: String.raw`
**Model**  
The engine trained on lots of examples. It predicts what text should come next.

**Important:**  
A model does **not** “know” things the way a human does — it generates the most likely answer.
`.trim(),
    },
    prompt: {
        label: "Prompt",
        tone: "rose",
        md: String.raw`
**Prompt**  
Your instructions to the model.

A good prompt includes:
- **Task** (what you want)
- **Context** (who/what/why)
- **Constraints** (tone, format, length)
- **Verification** (ask it to double-check when needed)
`.trim(),
    },
    chatgpt: {
        label: "ChatGPT",
        tone: "emerald",
        md: String.raw`
**ChatGPT**  
A chat app where you talk to a language model.

**You’ll learn a repeatable loop:**  
**Ask → Refine → Finalize**  
So you can get consistent results, even as a beginner.
`.trim(),
    },
};

function chipActive(tone: "emerald" | "sky" | "rose") {
    return tone === "emerald"
        ? "ui-sketch-chip--active-emerald"
        : tone === "sky"
            ? "ui-sketch-chip--active-sky"
            : "ui-sketch-chip--active-rose";
}

export default function AIIntroSketch() {
    const [pick, setPick] = useState<Key>("ai");

    const check = useMemo(
        () =>
            String.raw`
**Mini check (1 sentence):**
In your own words: what is a **prompt**?

(You don’t need perfect wording — just the idea.)
`.trim(),
        [],
    );

    return (
        <div className="ui-sketch-grid md:grid-cols-[1fr_360px] md:grid">
            <div className="ui-sketch-panel">
                <div className="text-sm font-black text-neutral-900 dark:text-white/90">
                    Start here: AI basics (no jargon)
                </div>
                <div className="ui-sketch-muted">Tap a concept → get the simplest definition.</div>

                <div className="mt-3 flex flex-wrap gap-2">
                    {(Object.keys(CARDS) as Key[]).map((k) => {
                        const is = k === pick;
                        const t = CARDS[k].tone;
                        return (
                            <button
                                key={k}
                                onClick={() => setPick(k)}
                                className={cn(
                                    "ui-sketch-chip",
                                    is ? chipActive(t) : "ui-sketch-chip--idle",
                                )}
                            >
                                {CARDS[k].label}
                            </button>
                        );
                    })}
                </div>

                <div className="mt-4 ui-sketch-codeblock">
                    <TextMarkdown content={CARDS[pick].md} />
                </div>
            </div>

            <div className="ui-sketch-panel">
                <div className="ui-sketch-label">Why this matters</div>
                <TextMarkdown
                    content={String.raw`
If you understand these four words, you’ll feel confident:

- **AI**: what it is
- **Model**: what generates answers
- **Prompt**: how you control the model
- **ChatGPT**: where you interact with it

Then we move into: **Ask → Refine → Finalize**, safety, and your first lab.
`.trim()}
                />
                <div className="ui-bottomline my-3" />
                <TextMarkdown content={check} />
            </div>
        </div>
    );
}
