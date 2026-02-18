"use client";

import React, { useMemo, useState } from "react";
import { cn, copyText, useLocalStorageString } from "@/components/sketches/_shared/sketchUi";

const PROMPT = `Explain what you can help me with in 5 bullets.
Then ask me 3 questions about my goals.`;

const KEY_BULLETS = "ai0.lab.bullets.v1";
const KEY_ANSWERS = "ai0.lab.answers.v1";

export default function LabSketch() {
    const [bullets, setBullets] = useLocalStorageString(KEY_BULLETS, "");
    const [answers, setAnswers] = useLocalStorageString(KEY_ANSWERS, "");
    const [copied, setCopied] = useState(false);

    const canSubmit = useMemo(() => bullets.trim().length > 0 && answers.trim().length > 0, [bullets, answers]);

    async function onCopy() {
        const ok = await copyText(PROMPT);
        setCopied(ok);
        setTimeout(() => setCopied(false), 900);
    }

    return (
        <div className="ui-sketch-panel">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <div className="text-sm font-black text-neutral-900 dark:text-white/90">Lab: First interaction</div>
                    <div className="ui-sketch-muted">Copy the prompt → run it → paste results below.</div>
                </div>

                <button onClick={onCopy} className={cn("ui-btn", "ui-btn-secondary")}>
                    {copied ? "Copied" : "Copy lab prompt"}
                </button>
            </div>

            <div className="mt-3 ui-sketch-codeblock">
                <div className="ui-sketch-label">Prompt</div>
                <pre className="ui-sketch-code">{PROMPT}</pre>
            </div>

            <div className="mt-4 ui-sketch-grid md:grid-cols-2 md:grid">
                <div>
                    <div className="ui-sketch-label">Paste the 5 bullets</div>
                    <textarea
                        value={bullets}
                        onChange={(e) => setBullets(e.target.value)}
                        className="ui-sketch-input"
                        style={{ minHeight: 160 }}
                        placeholder="• Bullet 1&#10;• Bullet 2&#10;..."
                    />
                </div>

                <div>
                    <div className="ui-sketch-label">Your answers to the 3 questions</div>
                    <textarea
                        value={answers}
                        onChange={(e) => setAnswers(e.target.value)}
                        className="ui-sketch-input"
                        style={{ minHeight: 160 }}
                        placeholder="1) ...&#10;2) ...&#10;3) ..."
                    />
                </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <div className="ui-sketch-muted">
                    {canSubmit ? "✅ Ready to submit" : "Fill both boxes to complete the lab."}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setBullets("");
                            setAnswers("");
                        }}
                        className={cn("ui-btn", "ui-btn-ghost")}
                    >
                        Clear
                    </button>

                    <div className={cn("ui-cta", canSubmit ? "" : "opacity-70")}>
                        {canSubmit ? "Complete" : "Incomplete"}
                    </div>
                </div>
            </div>
        </div>
    );
}
