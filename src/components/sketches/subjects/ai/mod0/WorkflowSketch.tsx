"use client";

import React, { useMemo, useState } from "react";
import TextMarkdown from "@/components/markdown/TextMarkdown";
import { cn, copyText } from "@/components/sketches/_shared/sketchUi";

type Tone = "friendly" | "formal" | "direct";
type Fmt = "bullets" | "steps" | "table";
type StepId = "ask" | "refine" | "finalize";

const STEP_LABEL: Record<StepId, string> = {
    ask: "Ask",
    refine: "Refine",
    finalize: "Finalize",
};

function move<T>(arr: T[], from: number, to: number) {
    const next = arr.slice();
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    return next;
}

export default function WorkflowSketch() {
    const [steps, setSteps] = useState<StepId[]>(["ask", "refine", "finalize"]);

    const [ask, setAsk] = useState("Help me write a message to reschedule a meeting.");
    const [audience, setAudience] = useState("a teammate");
    const [tone, setTone] = useState<Tone>("friendly");
    const [fmt, setFmt] = useState<Fmt>("bullets");
    const [length, setLength] = useState("80–120 words");
    const [copied, setCopied] = useState(false);

    const refined = useMemo(() => {
        return String.raw`You are ChatGPT. I want help with: ${ask}

Audience: ${audience}
Tone: ${tone}
Format: ${fmt}
Length: ${length}

Ask 1–2 clarifying questions if needed, then produce the final output.`;
    }, [ask, audience, tone, fmt, length]);

    const hudMd = useMemo(
        () =>
            String.raw`
**Ask → Refine → Finalize**

- **Ask**: what you want  
- **Refine**: add constraints (audience/tone/format/length)  
- **Finalize**: request the final version

Reorder the steps above — then put them back in the best order.
`.trim(),
        [],
    );

    async function onCopy() {
        const ok = await copyText(refined);
        setCopied(ok);
        setTimeout(() => setCopied(false), 900);
    }

    return (
        <div className="ui-sketch-grid md:grid-cols-[1fr_360px] md:grid">
            <div className="ui-sketch-panel">
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <div className="text-sm font-black text-neutral-900 dark:text-white/90">Ask → Refine → Finalize</div>
                        <div className="ui-sketch-muted">Use constraints to control outputs.</div>
                    </div>

                    <button onClick={onCopy} className={cn("ui-btn", "ui-btn-secondary")}>
                        {copied ? "Copied" : "Copy final prompt"}
                    </button>
                </div>

                {/* drag-token-style reorder row */}
                <div className="mt-4 ui-drag-zone">
                    <div className="ui-sketch-label">Workflow steps (reorder)</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {steps.map((id, idx) => {
                            const leftOk = idx > 0;
                            const rightOk = idx < steps.length - 1;

                            return (
                                <div key={id} className={cn("ui-drag-chip")}>
                                    <span className="ui-drag-handle">⋮⋮</span>
                                    <span>{STEP_LABEL[id]}</span>

                                    <span className="ui-drag-actions">
                    <button
                        className="ui-drag-actionbtn"
                        disabled={!leftOk}
                        onClick={() => leftOk && setSteps((s) => move(s, idx, idx - 1))}
                        title="Move left"
                    >
                      ←
                    </button>
                    <button
                        className="ui-drag-actionbtn"
                        disabled={!rightOk}
                        onClick={() => rightOk && setSteps((s) => move(s, idx, idx + 1))}
                        title="Move right"
                    >
                      →
                    </button>
                  </span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-2 ui-sketch-muted">
                        Best order is usually: <b>Ask</b> → <b>Refine</b> → <b>Finalize</b>.
                    </div>
                </div>

                <div className="mt-4 ui-sketch-grid md:grid-cols-2 md:grid">
                    <div>
                        <div className="ui-sketch-label">ASK (what you want)</div>
                        <textarea
                            value={ask}
                            onChange={(e) => setAsk(e.target.value)}
                            className="ui-sketch-input"
                            style={{ minHeight: 88 }}
                        />
                    </div>

                    <div className="ui-sketch-grid md:grid-cols-2 md:grid">
                        <div>
                            <div className="ui-sketch-label">Audience</div>
                            <input value={audience} onChange={(e) => setAudience(e.target.value)} className="ui-sketch-input" />
                        </div>

                        <div>
                            <div className="ui-sketch-label">Length</div>
                            <input value={length} onChange={(e) => setLength(e.target.value)} className="ui-sketch-input" />
                        </div>

                        <div>
                            <div className="ui-sketch-label">Tone</div>
                            <select value={tone} onChange={(e) => setTone(e.target.value as Tone)} className="ui-sketch-input">
                                <option value="friendly">friendly</option>
                                <option value="formal">formal</option>
                                <option value="direct">direct</option>
                            </select>
                        </div>

                        <div>
                            <div className="ui-sketch-label">Format</div>
                            <select value={fmt} onChange={(e) => setFmt(e.target.value as Fmt)} className="ui-sketch-input">
                                <option value="bullets">bullets</option>
                                <option value="steps">steps</option>
                                <option value="table">table</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="mt-4 ui-sketch-codeblock">
                    <div className="ui-sketch-label">FINAL PROMPT</div>
                    <pre className="ui-sketch-code">{refined}</pre>
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
