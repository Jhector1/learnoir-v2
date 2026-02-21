"use client";

import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import type { Lang } from "@/lib/code/runCode";
import { monacoLang } from "../utils/monaco";

const Monaco = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function EditorPane(props: {
    lang: Lang;
    code: string;
    onChange: (v: string) => void;
    theme: "vs" | "vs-dark";
    height: number;
    disabled: boolean;
    onMount: (ed: any) => void;
}) {
    const { lang, code, onChange, theme, height, disabled, onMount } = props;

    const editorRef = useRef<any>(null);
    const applyingExternalRef = useRef(false);

    // ✅ Keep Monaco UNcontrolled while typing, but still accept external updates.
    useEffect(() => {
        const ed = editorRef.current;
        if (!ed) return;

        const model = ed.getModel?.();
        if (!model) return;

        const cur = model.getValue?.() ?? "";
        if (cur === code) return; // already in sync (common case while typing)

        applyingExternalRef.current = true;

        // Preserve cursor/scroll
        const view = ed.saveViewState?.();

        // Replace full contents without nuking view like setValue often does
        try {
            const fullRange = model.getFullModelRange();
            model.pushEditOperations?.(
                [],
                [{ range: fullRange, text: String(code ?? "") }],
                () => null,
            );
        } catch {
            // fallback (should rarely be needed)
            model.setValue?.(String(code ?? ""));
        }

        if (view) ed.restoreViewState?.(view);
        ed.focus?.();

        applyingExternalRef.current = false;
    }, [code]);

    return (
        <Monaco
            height={height}
            language={monacoLang(lang)}
            // ✅ KEY CHANGE: uncontrolled while typing
            defaultValue={code}
            theme={theme}
            onMount={(ed: any) => {
                editorRef.current = ed;
                onMount(ed);
            }}
            onChange={(v) => {
                // Ignore change events caused by our own external sync
                if (applyingExternalRef.current) return;
                onChange(v ?? "");
            }}
            options={{
                minimap: { enabled: false },
                fontSize: 13,
                scrollBeyondLastLine: false,
                wordWrap: "on",
                automaticLayout: true,
                readOnly: disabled,
            }}
        />
    );
}