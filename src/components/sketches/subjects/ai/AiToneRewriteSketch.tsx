"use client";

import React, { useMemo, useState } from "react";
import SketchShell from "./_shared/SketchShell";
import { cn, BTN_PRIMARY, CHOICE_IDLE, CHOICE_SELECTED, LABEL, MUTED, PILL, SOFT } from "./_shared/aiUi";

type Tone = "friendly" | "polite" | "formal";
type Scenario = "late_homework" | "support_refund" | "group_project";

const SCENARIOS: Record<Scenario, { title: string; rough: string }> = {
    late_homework: { title: "Homework extension", rough: "I need more time. Give me an extension." },
    support_refund: { title: "Customer support", rough: "This product is bad. I want a refund now." },
    group_project: { title: "Group project", rough: "You never do your part. Fix it." },
};

function rewrite(base: string, tone: Tone) {
    if (tone === "friendly") {
        return `Hi! Quick question — ${base.replace(/\.$/, "").toLowerCase()}. Thanks so much for your help!`;
    }
    if (tone === "formal") {
        return `Hello,\n\nI hope you are doing well. ${base} I would appreciate your guidance.\n\nThank you.`;
    }
    return `Hi,\n\n${base} Please let me know if that’s possible.\n\nThank you.`;
}

export default function AiToneRewriteSketch({ height = 420 }: { height?: number }) {
    const [scenario, setScenario] = useState<Scenario>("late_homework");
    const [tone, setTone] = useState<Tone>("polite");
    const [addDetails, setAddDetails] = useState(true);

    const rough = useMemo(() => SCENARIOS[scenario].rough, [scenario]);

    const base = useMemo(() => {
        if (!addDetails) return rough;
        if (scenario === "late_homework") return "I missed a day due to illness and I’m behind. Could I have a 2-day extension?";
        if (scenario === "support_refund") return "The item arrived damaged. Could you help me with a refund or replacement?";
        return "I’m worried we’re falling behind. Can we agree on clear tasks and a deadline for each person?";
    }, [scenario, addDetails, rough]);

    const out = useMemo(() => rewrite(base, tone), [base, tone]);

    const left = (
        <div>
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-lg font-extrabold">Tone Rewriter</div>
                    <div className={cn(MUTED, "mt-1")}>Same message, different tone.</div>
                </div>
                <span className={cn(PILL)}>{tone}</span>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className={SOFT}>
                    <div className={LABEL}>Scenario</div>
                    <select className={cn("mt-2", "ui-sketch-input")} value={scenario} onChange={(e) => setScenario(e.target.value as Scenario)}>
                        {(Object.keys(SCENARIOS) as Scenario[]).map((k) => (
                            <option key={k} value={k}>
                                {SCENARIOS[k].title}
                            </option>
                        ))}
                    </select>

                    <div className={cn(LABEL, "mt-3")}>Tone</div>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                        <button className={tone === "friendly" ? cn(CHOICE_SELECTED) : cn(CHOICE_IDLE)} onClick={() => setTone("friendly")}>
                            Friendly
                        </button>
                        <button className={tone === "polite" ? cn(CHOICE_SELECTED) : cn(CHOICE_IDLE)} onClick={() => setTone("polite")}>
                            Polite
                        </button>
                        <button className={tone === "formal" ? cn(CHOICE_SELECTED) : cn(CHOICE_IDLE)} onClick={() => setTone("formal")}>
                            Formal
                        </button>
                    </div>

                    <button className={addDetails ? cn(CHOICE_SELECTED, "mt-3 w-full") : cn(CHOICE_IDLE, "mt-3 w-full")} onClick={() => setAddDetails((v) => !v)}>
                        {addDetails ? "✅" : "⬜"} Add helpful details
                    </button>

                    <div className={cn(SOFT, "mt-3")}>
                        <div className={LABEL}>Base message</div>
                        <div className="mt-2 text-sm font-extrabold">{base}</div>
                    </div>
                </div>

                <div className={SOFT}>
                    <div className={LABEL}>Rewrite</div>
                    <pre className="mt-2 whitespace-pre-wrap text-sm font-semibold">{out}</pre>
                    <button className={cn(BTN_PRIMARY, "mt-3")} onClick={() => navigator.clipboard?.writeText(out)}>
                        Copy rewrite
                    </button>
                </div>
            </div>
        </div>
    );

    const right = (
        <div>
            <div className="text-sm font-extrabold">Practical tip</div>
            <div className={cn(MUTED, "mt-2")}>Great prompts include:</div>
            <div className={cn(MUTED, "mt-2")}>• situation</div>
            <div className={cn(MUTED)}>• goal</div>
            <div className={cn(MUTED)}>• tone</div>
            <div className={cn(MUTED, "mt-3")}>Details make tone rewrites much better.</div>
        </div>
    );

    return <SketchShell height={height} left={left} right={right} />;
}
