"use client";

import React, { useMemo, useState } from "react";
import TextMarkdown from "@/components/markdown/TextMarkdown";
import { cn } from "@/components/review/sketches/_shared/sketchUi";

type StepId = "open" | "signin" | "newchat" | "type" | "send";

const STEPS: Array<{ id: StepId; label: string; desc: string }> = [
    { id: "open", label: "Open ChatGPT", desc: "Open ChatGPT in a new tab." },
    { id: "signin", label: "Sign in / create account (optional)", desc: "Account helps save history and settings." },
    { id: "newchat", label: "Start a new chat", desc: "Click New chat (or +) if needed." },
    { id: "type", label: "Type your first prompt", desc: "One sentence is enough to start." },
    { id: "send", label: "Send + read", desc: "Then refine if needed (that’s the course!)." },
];

export default function AIGetStartedSketch() {
    const [done, setDone] = useState<Record<StepId, boolean>>({
        open: false,
        signin: false,
        newchat: false,
        type: false,
        send: false,
    });

    const progress = useMemo(() => Object.values(done).filter(Boolean).length, [done]);
    const allDone = progress === STEPS.length;

    return (
        <div className="ui-sketch-grid md:grid-cols-[1fr_360px] md:grid">
            <div className="ui-sketch-panel">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <div className="text-sm font-black text-neutral-900 dark:text-white/90">Get into ChatGPT</div>
                        <div className="ui-sketch-muted">Buttons + checklist for your first time.</div>
                    </div>
                    <div className="ui-home-pill">{allDone ? "✅ Ready" : `Progress: ${progress}/${STEPS.length}`}</div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                    <a className={cn("ui-btn", "ui-btn-primary")} href="https://chatgpt.com/" target="_blank" rel="noreferrer">
                        Open ChatGPT
                    </a>
                    <a className={cn("ui-btn", "ui-btn-secondary")} href="https://chatgpt.com/auth/login" target="_blank" rel="noreferrer">
                        Log in / Sign up
                    </a>
                    <button
                        className={cn("ui-btn", "ui-btn-ghost")}
                        onClick={() => setDone({ open: false, signin: false, newchat: false, type: false, send: false })}
                    >
                        Reset
                    </button>
                </div>

                <div className="mt-4 grid gap-2">
                    {STEPS.map((s) => (
                        <label key={s.id} className="ui-soft flex items-start gap-3 px-3 py-3">
                            <input
                                className="mt-1"
                                type="checkbox"
                                checked={done[s.id]}
                                onChange={(e) => setDone((p) => ({ ...p, [s.id]: e.target.checked }))}
                            />
                            <div>
                                <div className="text-sm font-extrabold text-neutral-900 dark:text-white/90">{s.label}</div>
                                <div className="ui-sketch-muted">{s.desc}</div>
                            </div>
                        </label>
                    ))}
                </div>

                {allDone ? (
                    <div className="mt-3 rounded-2xl border border-emerald-600/25 bg-emerald-500/10 p-3 text-sm font-extrabold text-emerald-950 dark:border-emerald-300/30 dark:bg-emerald-300/10 dark:text-white/90">
                        ✅ Next: learn how to write a good prompt (and then refine it).
                    </div>
                ) : (
                    <div className="mt-3 ui-sketch-muted">
                        Tip: If you’re stuck, just complete Step 1 first (open ChatGPT). We’ll guide the rest.
                    </div>
                )}
            </div>

            <div className="ui-sketch-panel">
                <TextMarkdown
                    content={String.raw`
**What success looks like:**
- You can open ChatGPT
- You can start a chat
- You understand the words **AI / model / prompt**
- You’re ready to use **Ask → Refine → Finalize**

Then we move into safety + your first lab.
`.trim()}
                />
            </div>
        </div>
    );
}
