"use client";

import React, { useMemo, useState } from "react";
import SketchShell from "./_shared/SketchShell";
import { cn, BTN_PRIMARY, CHOICE_IDLE, CHOICE_SELECTED, LABEL, MUTED, PILL, SOFT } from "./_shared/aiUi";

type Improve = "goal" | "context" | "constraints" | "format";

const IMPROVE_LABEL: Record<Improve, string> = {
    goal: "Add a clear goal",
    context: "Add context",
    constraints: "Add constraints",
    format: "Ask for output format",
};

export default function AiPromptRefineSketch({ height = 420 }: { height?: number }) {
    const [improvements, setImprovements] = useState<Record<Improve, boolean>>({
        goal: true,
        context: false,
        constraints: false,
        format: true,
    });

    const vague = "Help me write something.";

    const refined = useMemo(() => {
        const lines: string[] = [];
        lines.push("Write a short, polite email to my teacher.");
        if (improvements.context) lines.push("Context: I missed class because I was sick.");
        if (improvements.goal) lines.push("Goal: Ask for a 2-day extension on the homework.");
        if (improvements.constraints) lines.push("Constraints: Under 90 words. No emojis.");
        if (improvements.format) lines.push("Format: 1 short paragraph.");
        return lines.join("\n");
    }, [improvements]);

    const clarity = useMemo(() => {
        let s = 20;
        if (improvements.goal) s += 25;
        if (improvements.context) s += 25;
        if (improvements.constraints) s += 20;
        if (improvements.format) s += 10;
        return Math.min(100, s);
    }, [improvements]);

    function toggle(k: Improve) {
        setImprovements((s) => ({ ...s, [k]: !s[k] }));
    }

    const left = (
        <div>
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-lg font-extrabold">Refine a Prompt</div>
                    <div className={cn(MUTED, "mt-1")}>Small improvements → better results.</div>
                </div>
                <div className={cn(PILL, "gap-2")}>
                    <span className={MUTED}>Clarity</span>
                    <span className="font-extrabold">{clarity}%</span>
                </div>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className={SOFT}>
                    <div className={LABEL}>Before (vague)</div>
                    <pre className="mt-2 whitespace-pre-wrap text-sm font-semibold">{vague}</pre>
                </div>
                <div className={SOFT}>
                    <div className={LABEL}>After (refined)</div>
                    <pre className="mt-2 whitespace-pre-wrap text-sm font-semibold">{refined}</pre>
                </div>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {(Object.keys(IMPROVE_LABEL) as Improve[]).map((k) => (
                    <button
                        key={k}
                        className={improvements[k] ? cn(CHOICE_SELECTED) : cn(CHOICE_IDLE)}
                        onClick={() => toggle(k)}
                    >
                        {improvements[k] ? "✅" : "⬜"} {IMPROVE_LABEL[k]}
                    </button>
                ))}
            </div>

            <button className={cn(BTN_PRIMARY, "mt-3")} onClick={() => navigator.clipboard?.writeText(refined)}>
                Copy refined prompt
            </button>
        </div>
    );

    const right = (
        <div>
            <div className="text-sm font-extrabold">Why this works</div>
            <div className={cn(MUTED, "mt-2")}>AI outputs get better when you add:</div>
            <div className={cn(MUTED, "mt-2")}>• Goal</div>
            <div className={cn(MUTED)}>• Context</div>
            <div className={cn(MUTED)}>• Constraints</div>
            <div className={cn(MUTED)}>• Format</div>
        </div>
    );

    return <SketchShell height={height} left={left} right={right} />;
}
