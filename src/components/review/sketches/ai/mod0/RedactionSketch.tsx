"use client";

import React, { useMemo, useState } from "react";
import { cn, copyText } from "@/components/review/sketches/_shared/sketchUi";

const SAMPLE = `Hi Sarah Johnson,

Can you confirm your order #A-19384 is shipping to 44 Oak St, Chicago, IL?
If anything changes call me at (312) 555-0199 or email sarah.j@example.com.

Thanks,
Alex`;

export default function RedactionSketch() {
    const [redactName, setRedactName] = useState(true);
    const [redactAddress, setRedactAddress] = useState(true);
    const [redactPhone, setRedactPhone] = useState(true);
    const [redactEmail, setRedactEmail] = useState(true);
    const [redactOrder, setRedactOrder] = useState(true);
    const [copied, setCopied] = useState(false);

    const out = useMemo(() => {
        let t = SAMPLE;

        if (redactName) t = t.replaceAll("Sarah Johnson", "[CUSTOMER]");
        if (redactOrder) t = t.replaceAll("#A-19384", "[ORDER_ID]");
        if (redactAddress) t = t.replaceAll("44 Oak St, Chicago, IL", "[ADDRESS]");
        if (redactPhone) t = t.replaceAll("(312) 555-0199", "[PHONE]");
        if (redactEmail) t = t.replaceAll("sarah.j@example.com", "[EMAIL]");

        return t;
    }, [redactName, redactAddress, redactPhone, redactEmail, redactOrder]);

    async function onCopy() {
        const ok = await copyText(out);
        setCopied(ok);
        setTimeout(() => setCopied(false), 900);
    }

    return (
        <div className="ui-sketch-grid md:grid-cols-2 md:grid">
            <div className="ui-sketch-panel">
                <div className="text-sm font-black text-neutral-900 dark:text-white/90">Original</div>
                <div className="mt-3 ui-sketch-codeblock">
                    <pre className="ui-sketch-code">{SAMPLE}</pre>
                </div>
            </div>

            <div className="ui-sketch-panel">
                <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-black text-neutral-900 dark:text-white/90">Redacted</div>
                    <button onClick={onCopy} className={cn("ui-btn", "ui-btn-secondary")}>
                        {copied ? "Copied" : "Copy"}
                    </button>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                    {[
                        ["Name", redactName, setRedactName] as const,
                        ["Order ID", redactOrder, setRedactOrder] as const,
                        ["Address", redactAddress, setRedactAddress] as const,
                        ["Phone", redactPhone, setRedactPhone] as const,
                        ["Email", redactEmail, setRedactEmail] as const,
                    ].map(([label, v, setV]) => (
                        <label key={label} className="ui-soft flex items-center gap-2 px-3 py-2 text-xs font-extrabold">
                            <input type="checkbox" checked={v} onChange={(e) => setV(e.target.checked)} />
                            <span className="text-neutral-800 dark:text-white/85">{label}</span>
                        </label>
                    ))}
                </div>

                <div className="mt-3 ui-sketch-codeblock">
                    <pre className="ui-sketch-code">{out}</pre>
                </div>
            </div>
        </div>
    );
}
