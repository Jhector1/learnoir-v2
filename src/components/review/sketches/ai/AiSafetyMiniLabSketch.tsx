"use client";

import React, { useMemo, useState } from "react";
import MathMarkdown from "@/components/markdown/MathMarkdown";
import { CARD, PANEL, TITLE, SUB, LABEL, MUTED, CHOICE_IDLE, CHOICE_SELECTED, PILL_GOOD, PILL_WARN, PILL, TRACK, FILL, cn } from "./_shared/aiUi";

type Risk = "low" | "medium" | "high";

type Scenario = {
    id: string;
    title: string;
    prompt: string;
    risk: Risk;
    reason: string;
};

const SCENARIOS: Scenario[] = [
    {
        id: "s1",
        title: "Study help",
        prompt: "Explain photosynthesis like I’m 12.",
        risk: "low",
        reason: "General info; still good to check a textbook if it’s graded.",
    },
    {
        id: "s2",
        title: "Deadline",
        prompt: "What is the application deadline for this scholarship?",
        risk: "medium",
        reason: "Dates change often; verify on the official site.",
    },
    {
        id: "s3",
        title: "Money",
        prompt: "Which credit card should I open and how much should I spend?",
        risk: "high",
        reason: "Financial decisions can be costly; use reputable sources or a professional.",
    },
    {
        id: "s4",
        title: "Health",
        prompt: "I have chest pain. What should I do?",
        risk: "high",
        reason: "Medical risk; you should seek urgent professional help immediately.",
    },
];

function riskLabel(r: Risk) {
    if (r === "low") return "Low risk";
    if (r === "medium") return "Medium risk";
    return "High risk";
}

export default function AiSafetyMiniLabSketch({ height = 420 }: { height?: number }) {
    const [idx, setIdx] = useState(0);
    const [picked, setPicked] = useState<Risk | null>(null);

    const s = SCENARIOS[idx] ?? SCENARIOS[0];

    const status = useMemo(() => {
        if (!picked) return null;
        const ok = picked === s.risk;
        return { ok, text: ok ? "Correct" : "Not quite", reason: s.reason };
    }, [picked, s.risk, s.reason]);

    const percent = useMemo(() => {
        if (!picked) return 0;
        return picked === "low" ? 33 : picked === "medium" ? 66 : 100;
    }, [picked]);

    const hud = useMemo(() => {
        return String.raw`
**AI safety instinct**

Ask yourself:
- Could this cause harm if wrong?
- Does it change fast (dates, rules, prices)?
- Does it involve health, money, legal, or emergencies?

Higher risk → verify with official or professional sources.
`.trim();
    }, []);

    function choose(r: Risk) {
        if (picked) return;
        setPicked(r);
    }

    function next() {
        setPicked(null);
        setIdx((i) => (i + 1) % SCENARIOS.length);
    }

    const pill = !picked ? PILL : status?.ok ? PILL_GOOD : PILL_WARN;

    return (
        <div className="w-full" style={{ minHeight: height }}>
            <div className={cn("ui-sketch-grid", "md:grid-cols-[1fr_360px] md:items-start")}>
                <div className={cn(CARD)}>
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <div className={TITLE}>Safety Mini-Lab</div>
                            <div className={SUB}>Label each request as low/medium/high risk.</div>
                        </div>
                        <div className={cn(pill)}>{picked ? riskLabel(picked) : "Pick a risk"}</div>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                        <div className={TRACK} aria-label="Risk meter">
                            <div className={FILL} style={{ width: `${percent}%` }} />
                        </div>
                        <div className={MUTED}>Trust level should match risk</div>
                    </div>

                    <div className={cn(PANEL, "mt-3 p-3")}>
                        <div className={LABEL}>{s.title}</div>
                        <div className="mt-2 text-sm font-extrabold text-neutral-900 dark:text-white">{s.prompt}</div>
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        {(["low", "medium", "high"] as const).map((r) => (
                            <button key={r} className={cn(picked === r ? CHOICE_SELECTED : CHOICE_IDLE)} onClick={() => choose(r)}>
                                {riskLabel(r)}
                            </button>
                        ))}
                    </div>

                    {status && (
                        <div className={cn(PANEL, "mt-3 p-3")}>
                            <div className="flex items-center justify-between gap-2">
                                <div className="text-xs font-extrabold text-neutral-900 dark:text-white">
                                    {status.text} — Correct: <span className="underline">{riskLabel(s.risk)}</span>
                                </div>
                                <span className={cn(status.ok ? PILL_GOOD : PILL_WARN)}>{status.ok ? "Nice" : "Review"}</span>
                            </div>
                            <div className={cn(MUTED, "mt-2")}>{status.reason}</div>
                            <button className="ui-btn ui-btn-primary mt-3 w-full" onClick={next}>
                                Next
                            </button>
                        </div>
                    )}
                </div>

                <div className={cn(CARD)}>
                    <MathMarkdown content={hud} className="ui-math" />
                </div>
            </div>
        </div>
    );
}
