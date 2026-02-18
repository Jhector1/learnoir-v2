"use client";

import React, { useMemo, useState } from "react";
import TextMarkdown from "@/components/markdown/TextMarkdown";

type CheckId = "ask_sources" | "ask_assumptions" | "cross_check" | "numbers" | "final_pass";

export default function AIVerifySketch() {
    const [done, setDone] = useState<Record<CheckId, boolean>>({
        ask_sources: false,
        ask_assumptions: false,
        cross_check: false,
        numbers: false,
        final_pass: false,
    });

    const progress = useMemo(() => Object.values(done).filter(Boolean).length, [done]);

    const md = useMemo(
        () =>
            String.raw`
**Quick verification checklist**

Use this when the output matters:

- Ask: “What assumptions did you make?”
- Ask: “Show sources / where this comes from (if applicable).”
- Cross-check: compare with 1 other source (or your notes)
- Numbers: re-calc (even simple math)
- Final pass: “Summarize the answer in 1 sentence — did we miss anything?”

This is how you use AI safely without being paranoid.
`.trim(),
        [],
    );

    const items: Array<[string, CheckId]> = [
        ["I asked for assumptions", "ask_assumptions"],
        ["I asked for sources (when needed)", "ask_sources"],
        ["I cross-checked 1 thing", "cross_check"],
        ["I re-checked numbers (if any)", "numbers"],
        ["I did a final pass summary", "final_pass"],
    ];

    return (
        <div className="ui-sketch-grid md:grid-cols-[1fr_360px] md:grid">
            <div className="ui-sketch-panel">
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <div className="text-sm font-black text-neutral-900 dark:text-white/90">Verification basics</div>
                        <div className="ui-sketch-muted">Progress: {progress}/5</div>
                    </div>
                    <div className="ui-home-pill">{progress === 5 ? "✅ Complete" : "Practice"}</div>
                </div>

                <div className="mt-4 grid gap-2">
                    {items.map(([label, key]) => (
                        <label key={key} className="ui-soft flex items-center gap-3 px-3 py-3 text-sm font-extrabold">
                            <input
                                type="checkbox"
                                checked={done[key]}
                                onChange={(e) => setDone((p) => ({ ...p, [key]: e.target.checked }))}
                            />
                            <span className="text-neutral-900 dark:text-white/90">{label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="ui-sketch-panel">
                <TextMarkdown content={md} />
            </div>
        </div>
    );
}
