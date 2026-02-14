"use client";

import React, { useMemo, useState } from "react";
import { cn, copyText } from "@/components/review/sketches/_shared/sketchUi";

type OutFmt = "5 bullets" | "step-by-step" | "table" | "checklist";

export default function FormatSketch() {
    const [topic, setTopic] = useState("how to study for a final");
    const [fmt, setFmt] = useState<OutFmt>("5 bullets");
    const [constraint, setConstraint] = useState("keep it beginner-friendly");
    const [copied, setCopied] = useState(false);

    const prompt = useMemo(() => {
        const base = `Help me with: ${topic}`;
        const formatLine =
            fmt === "table"
                ? "Format as a table with columns: Step | What to do | Time estimate"
                : fmt === "checklist"
                    ? "Format as a checklist with boxes"
                    : `Format as ${fmt}`;
        return `${base}\n\n${formatLine}\nConstraint: ${constraint}`;
    }, [topic, fmt, constraint]);

    async function onCopy() {
        const ok = await copyText(prompt);
        setCopied(ok);
        setTimeout(() => setCopied(false), 900);
    }

    return (
        <div className="ui-sketch-panel">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <div className="text-sm font-black text-neutral-900 dark:text-white/90">Asking for format</div>
                    <div className="ui-sketch-muted">Pick a format → copy a clean prompt.</div>
                </div>
                <button onClick={onCopy} className={cn("ui-btn", "ui-btn-secondary")}>
                    {copied ? "Copied" : "Copy prompt"}
                </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
                {(["5 bullets", "step-by-step", "table", "checklist"] as OutFmt[]).map((x) => {
                    const is = x === fmt;
                    const active =
                        x === "table" ? "ui-sketch-chip--active-sky" : x === "checklist" ? "ui-sketch-chip--active-emerald" : "ui-sketch-chip--active-rose";
                    return (
                        <button
                            key={x}
                            onClick={() => setFmt(x)}
                            className={cn("ui-sketch-chip", is ? `ui-sketch-chip ${active}` : "ui-sketch-chip ui-sketch-chip--idle")}
                        >
                            {x}
                        </button>
                    );
                })}
            </div>

            <div className="mt-4 ui-sketch-grid md:grid-cols-3 md:grid">
                <div>
                    <div className="ui-sketch-label">Topic</div>
                    <input value={topic} onChange={(e) => setTopic(e.target.value)} className="ui-sketch-input" />
                </div>

                <div>
                    <div className="ui-sketch-label">Constraint</div>
                    <input value={constraint} onChange={(e) => setConstraint(e.target.value)} className="ui-sketch-input" />
                </div>

                <div className="flex items-end">
                    <button onClick={onCopy} className={cn("ui-btn", "ui-btn-primary", "w-full")}>
                        {copied ? "Copied" : "Copy"}
                    </button>
                </div>
            </div>

            <div className="mt-4 ui-sketch-codeblock">
                <div className="ui-sketch-label">Prompt</div>
                <pre className="ui-sketch-code">{prompt}</pre>
            </div>
        </div>
    );
}
