"use client";

import React, { useMemo, useState } from "react";
import TextMarkdown from "@/components/markdown/TextMarkdown";
import { cn, copyText } from "@/components/review/sketches/_shared/sketchUi";

type UseCase = "draft" | "explain" | "organize" | "brainstorm" | "practice";
type ChipTone = "emerald" | "sky" | "rose";

const CHIP: Record<ChipTone, { active: string }> = {
    emerald: { active: "ui-sketch-chip ui-sketch-chip--active-emerald" },
    sky: { active: "ui-sketch-chip ui-sketch-chip--active-sky" },
    rose: { active: "ui-sketch-chip ui-sketch-chip--active-rose" },
};

const TEMPLATE: Record<
    UseCase,
    { label: string; tone: ChipTone; prompt: (x: string) => string; tipsMd: string }
> = {
    draft: {
        label: "Draft",
        tone: "emerald",
        prompt: (x) => `Draft a friendly, professional message about: ${x}

Constraints:
- 6–10 sentences
- Clear call-to-action
- Keep it warm but direct`,
        tipsMd: `**Best for** emails, blurbs, first drafts. Add **audience + tone + length**.`,
    },
    explain: {
        label: "Explain",
        tone: "sky",
        prompt: (x) => `Explain: ${x}

Format:
- 5 bullets
- then 1 simple example
- then 3 common mistakes`,
        tipsMd: `Ask for **examples** and **common mistakes** to learn faster.`,
    },
    organize: {
        label: "Organize",
        tone: "emerald",
        prompt: (x) => `Organize this into a plan:

${x}

Output:
- A numbered checklist
- Estimated time per step
- A “first tiny step” I can do now`,
        tipsMd: `Great when your notes are messy. Ask for **checklists** and **time estimates**.`,
    },
    brainstorm: {
        label: "Brainstorm",
        tone: "rose",
        prompt: (x) => `Brainstorm 12 ideas for: ${x}

Rules:
- No repeats
- Mix safe + bold ideas
- Label each idea: (easy/medium/hard)`,
        tipsMd: `Ask for **variety** and **labels** so ideas stay actionable.`,
    },
    practice: {
        label: "Practice",
        tone: "sky",
        prompt: (x) => `Quiz me on: ${x}

Rules:
- Start easy, then get harder
- One question at a time
- After I answer: explain briefly and give a tip`,
        tipsMd: `“One question at a time” prevents overload and keeps you moving.`,
    },
};

export default function UseCasesSketch() {
    const [uc, setUc] = useState<UseCase>("draft");
    const [topic, setTopic] = useState("asking a manager for time off");
    const [copied, setCopied] = useState(false);

    const prompt = useMemo(() => TEMPLATE[uc].prompt(topic.trim() || "your topic"), [uc, topic]);

    const hudMd = useMemo(
        () =>
            String.raw`
**Goal**

Pick a use-case → get a reliable prompt template.

**Quick habit**

Add constraints:
- audience (who it’s for)
- tone (formal/friendly)
- format (bullets/steps/table)
- length (e.g., 120 words)
`.trim(),
        [],
    );

    async function onCopy() {
        const ok = await copyText(prompt);
        setCopied(ok);
        setTimeout(() => setCopied(false), 900);
    }

    return (
        <div className="ui-sketch-grid md:grid-cols-[1fr_360px] md:grid">
            <div className="ui-sketch-panel">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <div className="text-sm font-black text-neutral-900 dark:text-white/90">Use-case picker</div>
                        <div className="ui-sketch-muted">Choose a goal, then copy the prompt template.</div>
                    </div>

                    <button onClick={onCopy} className={cn("ui-btn", "ui-btn-secondary")}>
                        {copied ? "Copied" : "Copy prompt"}
                    </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                    {(Object.keys(TEMPLATE) as UseCase[]).map((k) => {
                        const is = k === uc;
                        const tone = TEMPLATE[k].tone;
                        return (
                            <button
                                key={k}
                                onClick={() => setUc(k)}
                                className={cn(
                                    "ui-sketch-chip",
                                    is ? CHIP[tone].active : "ui-sketch-chip ui-sketch-chip--idle",
                                )}
                            >
                                {TEMPLATE[k].label}
                            </button>
                        );
                    })}
                </div>

                <div className="mt-4">
                    <div className="ui-sketch-label">Your topic</div>
                    <input
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="ui-sketch-input"
                        placeholder="e.g., ask for a refund politely"
                    />
                    <div className="mt-2 ui-sketch-muted">
                        <TextMarkdown content={TEMPLATE[uc].tipsMd} />
                    </div>
                </div>

                <div className="mt-4 ui-sketch-codeblock">
                    <div className="ui-sketch-label">Prompt template</div>
                    <pre className="ui-sketch-code">{prompt}</pre>
                </div>
            </div>

            <div className="ui-sketch-panel">
                <div className="ui-math">
                    <TextMarkdown content={hudMd} />
                </div>
            </div>
        </div>
    );
}
