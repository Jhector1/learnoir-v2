"use client";

import React, { useMemo, useState } from "react";
import { cn } from "@/components/review/sketches/_shared/sketchUi";

type Item = { id: string; text: string; shouldBlock: boolean; why: string };

const ITEMS: Item[] = [
    { id: "i1", text: "My password is P@ssw0rd123", shouldBlock: true, why: "Password/secret" },
    { id: "i2", text: "Customer: Sarah Johnson, 44 Oak St", shouldBlock: true, why: "PII (name + address)" },
    { id: "i3", text: "API key: sk-live-XXXX", shouldBlock: true, why: "Secret token/API key" },
    { id: "i4", text: "Can you rewrite this email to sound friendlier?", shouldBlock: false, why: "Safe request (no sensitive data)" },
    { id: "i5", text: "Patient MRN 884201 has diagnosis X", shouldBlock: true, why: "PHI (patient identifier)" },
    { id: "i6", text: "Summarize my notes about photosynthesis", shouldBlock: false, why: "Safe learning content" },
];

export default function SafetySketch() {
    const [answers, setAnswers] = useState<Record<string, "ok" | "dont">>({});

    const score = useMemo(() => {
        let total = 0;
        let correct = 0;
        for (const it of ITEMS) {
            const a = answers[it.id];
            if (!a) continue;
            total++;
            const should = it.shouldBlock ? "dont" : "ok";
            if (a === should) correct++;
        }
        return { total, correct };
    }, [answers]);

    return (
        <div className="ui-sketch-panel">
            <div className="flex items-center justify-between gap-2">
                <div>
                    <div className="text-sm font-black text-neutral-900 dark:text-white/90">Safety gate</div>
                    <div className="ui-sketch-muted">Mark each item: OK to paste vs Don’t paste.</div>
                </div>

                <div className="ui-home-pill">
                    Score: <span className="ml-1 font-extrabold">{score.correct}</span>/{score.total || 0}
                </div>
            </div>

            <div className="mt-4 grid gap-2">
                {ITEMS.map((it) => {
                    const a = answers[it.id];
                    const isCorrect = a && ((it.shouldBlock && a === "dont") || (!it.shouldBlock && a === "ok"));

                    return (
                        <div key={it.id} className="ui-soft p-3">
                            <div className="text-sm font-semibold text-neutral-900 dark:text-white/90">{it.text}</div>

                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <button
                                    onClick={() => setAnswers((p) => ({ ...p, [it.id]: "ok" }))}
                                    className={cn("ui-sketch-chip", a === "ok" ? "ui-sketch-chip--active-emerald" : "ui-sketch-chip--idle")}
                                >
                                    OK to paste
                                </button>

                                <button
                                    onClick={() => setAnswers((p) => ({ ...p, [it.id]: "dont" }))}
                                    className={cn("ui-sketch-chip", a === "dont" ? "ui-sketch-chip--active-rose" : "ui-sketch-chip--idle")}
                                >
                                    Don’t paste
                                </button>

                                {a && (
                                    <div className="ml-auto ui-sketch-muted">
                                        {isCorrect ? "✅ Correct" : "❌ Not quite"} — {it.why}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
