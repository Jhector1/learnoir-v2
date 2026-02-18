"use client";

import React, { useMemo, useState } from "react";
import TextMarkdown from "@/components/markdown/TextMarkdown";

export default function DataControlsSketch() {
    const [done, setDone] = useState<{ settings: boolean; datacontrols: boolean; confirmed: boolean }>({
        settings: false,
        datacontrols: false,
        confirmed: false,
    });

    const progress = useMemo(() => Object.values(done).filter(Boolean).length, [done]);

    const hudMd = String.raw`
**Lab UI Task**

1. Open **Settings**  
2. Find **Data Controls**  
3. Confirm you can locate it

This builds the habit of checking settings before sharing sensitive data.
`.trim();

    return (
        <div className="ui-sketch-grid md:grid-cols-[1fr_360px] md:grid">
            <div className="ui-sketch-panel">
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <div className="text-sm font-black text-neutral-900 dark:text-white/90">Data Controls checklist</div>
                        <div className="ui-sketch-muted">Progress: {progress}/3</div>
                    </div>

                    <div className="ui-home-pill">{progress === 3 ? "✅ Complete" : "In progress"}</div>
                </div>

                <div className="mt-4 grid gap-2">
                    {[
                        ["I opened Settings", "settings"] as const,
                        ["I located Data Controls", "datacontrols"] as const,
                        ["I can explain what Data Controls affect (high level)", "confirmed"] as const,
                    ].map(([label, key]) => (
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
                <div className="ui-math">
                    <TextMarkdown content={hudMd} />
                </div>
            </div>
        </div>
    );
}
