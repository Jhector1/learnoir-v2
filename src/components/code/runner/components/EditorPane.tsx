"use client";

import React from "react";
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

    return (
        <Monaco
            height={height}
            language={monacoLang(lang)}
            value={code}
            theme={theme}
            onMount={(ed: any) => onMount(ed)}
            onChange={(v) => onChange(v ?? "")}
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
