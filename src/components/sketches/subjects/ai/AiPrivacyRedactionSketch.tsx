"use client";

import React, { useMemo, useState } from "react";
import SketchShell from "./_shared/SketchShell";
import { cn, BTN_PRIMARY, CHOICE_IDLE, CHOICE_SELECTED, INPUT, LABEL, MUTED, PILL, SOFT } from "./_shared/aiUi";

type RedactKey = "email" | "phone" | "address" | "password" | "full_name";

const DEFAULT_TEXT =
    "Hi, my name is Alex Rivera. My email is alex.rivera@gmail.com and my phone is 312-555-0182.\n" +
    "I live at 123 Maple St, Chicago, IL.\n" +
    "My account password is SuperSecret123.\n\n" +
    "Can you help me write a message to customer support?";

function maskEmail(s: string) {
    return s.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[EMAIL]");
}
function maskPhone(s: string) {
    return s.replace(/\b(\+?1[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}\b/g, "[PHONE]");
}
function maskAddress(s: string) {
    return s.replace(
        /\b\d{1,6}\s+[A-Za-z0-9.\s]{2,30}\b(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Ln|Lane|Dr|Drive)\b/gi,
        "[ADDRESS]"
    );
}
function maskPasswordLine(s: string) {
    return s.replace(/password\s+is\s+[^\n]+/gi, "password is [REDACTED]");
}
function maskName(s: string) {
    return s.replace(/\bmy name is\s+[A-Za-z]+(?:\s+[A-Za-z]+)?\b/gi, "my name is [NAME]");
}

export default function AiPrivacyRedactionSketch({ height = 420 }: { height?: number }) {
    const [text, setText] = useState(DEFAULT_TEXT);
    const [redact, setRedact] = useState<Record<RedactKey, boolean>>({
        full_name: true,
        email: true,
        phone: true,
        address: true,
        password: true,
    });

    const safe = useMemo(() => {
        let out = text;
        if (redact.full_name) out = maskName(out);
        if (redact.email) out = maskEmail(out);
        if (redact.phone) out = maskPhone(out);
        if (redact.address) out = maskAddress(out);
        if (redact.password) out = maskPasswordLine(out);
        return out;
    }, [text, redact]);

    const safety = useMemo(() => {
        let s = 0;
        if (redact.password) s += 30;
        if (redact.email) s += 20;
        if (redact.phone) s += 20;
        if (redact.address) s += 20;
        if (redact.full_name) s += 10;
        return Math.min(100, s);
    }, [redact]);

    function toggle(k: RedactKey) {
        setRedact((s) => ({ ...s, [k]: !s[k] }));
    }

    const left = (
        <div>
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-lg font-extrabold">Privacy Redaction</div>
                    <div className={cn(MUTED, "mt-1")}>Turn a “too personal” message into a safe one.</div>
                </div>
                <div className={cn(PILL, "gap-2")}>
                    <span className={MUTED}>Safety</span>
                    <span className="font-extrabold">{safety}%</span>
                </div>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className={SOFT}>
                    <div className={LABEL}>Original</div>
                    <textarea className={cn(INPUT, "mt-2", "min-h-[220px]")} value={text} onChange={(e) => setText(e.target.value)} />
                </div>

                <div className={SOFT}>
                    <div className={LABEL}>Safer version</div>
                    <pre className="mt-2 whitespace-pre-wrap text-sm font-semibold">{safe}</pre>
                    <button className={cn(BTN_PRIMARY, "mt-3")} onClick={() => navigator.clipboard?.writeText(safe)}>
                        Copy safe text
                    </button>
                </div>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <button className={redact.full_name ? cn(CHOICE_SELECTED) : cn(CHOICE_IDLE)} onClick={() => toggle("full_name")}>
                    {redact.full_name ? "✅" : "⬜"} Hide name
                </button>
                <button className={redact.email ? cn(CHOICE_SELECTED) : cn(CHOICE_IDLE)} onClick={() => toggle("email")}>
                    {redact.email ? "✅" : "⬜"} Hide email
                </button>
                <button className={redact.phone ? cn(CHOICE_SELECTED) : cn(CHOICE_IDLE)} onClick={() => toggle("phone")}>
                    {redact.phone ? "✅" : "⬜"} Hide phone
                </button>
                <button className={redact.address ? cn(CHOICE_SELECTED) : cn(CHOICE_IDLE)} onClick={() => toggle("address")}>
                    {redact.address ? "✅" : "⬜"} Hide address
                </button>
                <button className={redact.password ? cn(CHOICE_SELECTED) : cn(CHOICE_IDLE)} onClick={() => toggle("password")}>
                    {redact.password ? "✅" : "⬜"} Hide password
                </button>
            </div>
        </div>
    );

    const right = (
        <div>
            <div className="text-sm font-extrabold">Don’t share:</div>
            <div className={cn(MUTED, "mt-2")}>• passwords / logins</div>
            <div className={cn(MUTED)}>• credit cards / SSN</div>
            <div className={cn(MUTED)}>• home address + phone</div>
            <div className={cn(MUTED, "mt-3")}>Use placeholders like [EMAIL], [PHONE], [ADDRESS].</div>
        </div>
    );

    return <SketchShell height={height} left={left} right={right} />;
}
