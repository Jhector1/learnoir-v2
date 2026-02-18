"use client";

import React, { useMemo, useState } from "react";
import SketchShell from "./_shared/SketchShell";
import { cn, CHOICE_IDLE, CHOICE_SELECTED, LABEL, MUTED, PILL, PILL_GOOD, PILL_WARN, SOFT } from "./_shared/aiUi";

type StepKey = "ask_source" | "check_date" | "cross_check" | "prefer_official" | "trust_confident";

const STEPS: Array<{ key: StepKey; label: string; good: boolean; why: string }> = [
    { key: "ask_source", label: "Ask where it came from (source / link)", good: true, why: "Grounds the claim." },
    { key: "check_date", label: "Check the date (could it be outdated?)", good: true, why: "Policies and facts change." },
    { key: "cross_check", label: "Cross-check with a trusted source", good: true, why: "Confirm important details." },
    { key: "prefer_official", label: "Prefer official or reputable sources", good: true, why: "Better sources → fewer errors." },
    { key: "trust_confident", label: "Trust it because it sounds confident", good: false, why: "Confidence ≠ correctness." },
];

export default function AiVerifyChecklistSketch({ height = 420 }: { height?: number }) {
    const [picked, setPicked] = useState<Record<StepKey, boolean>>({
        ask_source: true,
        check_date: false,
        cross_check: false,
        prefer_official: false,
        trust_confident: false,
    });

    const score = useMemo(() => {
        let s = 0;
        for (const step of STEPS) {
            const on = !!picked[step.key];
            if (step.good && on) s += 1;
            if (!step.good && on) s -= 1;
        }
        return Math.max(0, Math.min(4, s));
    }, [picked]);

    const verdict = useMemo(() => {
        if (score >= 3) return { pill: PILL_GOOD, tag: `Great (${score}/4)`, desc: "You’re verifying important claims." };
        if (score === 2) return { pill: PILL, tag: `Okay (${score}/4)`, desc: "Add one more verification step for important info." };
        return { pill: PILL_WARN, tag: `Risky (${score}/4)`, desc: "Turn on verification steps before trusting the claim." };
    }, [score]);

    function toggle(k: StepKey) {
        setPicked((s) => ({ ...s, [k]: !s[k] }));
    }

    const left = (
        <div>
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-lg font-extrabold">Verify Checklist</div>
                    <div className={cn(MUTED, "mt-1")}>Pick what you would do before trusting an AI claim.</div>
                </div>
                <span className={verdict.pill}>{verdict.tag}</span>
            </div>

            <div className={cn(SOFT, "mt-3")}>
                <div className={LABEL}>Example claim</div>
                <div className="mt-2 text-sm font-extrabold">“This school deadline is next Friday.”</div>
                <div className={cn(MUTED, "mt-2")}>What steps do you take before using it?</div>
            </div>

            <div className="mt-3 grid gap-2">
                {STEPS.map((s) => (
                    <button key={s.key} className={picked[s.key] ? cn(CHOICE_SELECTED) : cn(CHOICE_IDLE)} onClick={() => toggle(s.key)}>
                        {picked[s.key] ? "✅" : "⬜"} {s.label}
                    </button>
                ))}
            </div>

            <div className={cn(SOFT, "mt-3")}>
                <div className="text-sm font-extrabold">{verdict.desc}</div>
                <div className={cn(MUTED, "mt-2")}>If it matters, verify it.</div>
            </div>
        </div>
    );

    const right = (
        <div>
            <div className="text-sm font-extrabold">Use this most when:</div>
            <div className={cn(MUTED, "mt-2")}>• money / purchases</div>
            <div className={cn(MUTED)}>• medical / legal</div>
            <div className={cn(MUTED)}>• deadlines / schedules</div>
            <div className={cn(MUTED, "mt-3")}>Fast habit: source → date → cross-check.</div>
        </div>
    );

    return <SketchShell height={height} left={left} right={right} />;
}
