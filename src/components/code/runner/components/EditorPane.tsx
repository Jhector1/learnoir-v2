"use client";

import React, { useEffect, useMemo, useRef, useId } from "react";
import dynamic from "next/dynamic";
import { monacoLang } from "../utils/monaco";
import { CodeLanguage } from "@/lib/practice/types";

const Monaco = dynamic(() => import("@monaco-editor/react"), { ssr: false });

function extForLang(lang: CodeLanguage) {
    switch (lang) {
        case "python":
            return "py";
        case "java":
            return "java";
        case "javascript":
            return "js";
        case "c":
            return "c";
        case "cpp":
            return "cpp";
        case "sql":
            return "sql";
        default:
            return "txt";
    }
}

function sanitizePathPart(x: string) {
    return String(x ?? "")
        .trim()
        .replace(/\\/g, "/")
        .replace(/^\//, "")
        .replace(/\.\./g, "")
        .replace(/[^a-zA-Z0-9._/-]/g, "-")
        .replace(/\/+/g, "/") || "scratch";
}

function buildModelPath(args: {
    modelKey?: string;
    instanceKey: string;
    lang: CodeLanguage;
}) {
    const base = sanitizePathPart(args.modelKey || args.instanceKey);
    return `inmemory://zoeskoul-runner/${base}.${extForLang(args.lang)}`;
}

export default function EditorPane(props: {
    lang: CodeLanguage;
    code: string;
    onChange: (v: string) => void;
    theme: "vs" | "vs-dark";
    height: number;
    disabled?: boolean;
    onMount?: (ed: any) => void;
    modelKey?: string;
}) {
    const {
        lang,
        code,
        onChange,
        theme,
        height,
        disabled = false,
        onMount,
        modelKey,
    } = props;

    const reactId = useId();
    const instanceKeyRef = useRef(`editor-${reactId.replace(/[:]/g, "")}`);
    const editorRef = useRef<any>(null);
    const applyingExternalRef = useRef(false);

    const path = useMemo(() => {
        return buildModelPath({
            modelKey,
            instanceKey: instanceKeyRef.current,
            lang,
        });
    }, [modelKey, lang]);

    useEffect(() => {
        const ed = editorRef.current;
        if (!ed) return;

        const model = ed.getModel?.();
        if (!model) return;

        const current = model.getValue?.() ?? "";
        const next = String(code ?? "");

        if (current === next) return;

        applyingExternalRef.current = true;

        const viewState = ed.saveViewState?.();
        const selection = ed.getSelection?.();

        try {
            ed.pushUndoStop?.();
            ed.executeEdits?.("external-sync", [
                {
                    range: model.getFullModelRange(),
                    text: next,
                    forceMoveMarkers: true,
                },
            ]);
            ed.pushUndoStop?.();
        } catch {
            model.setValue?.(next);
        }

        if (viewState) ed.restoreViewState?.(viewState);
        if (selection) ed.setSelection?.(selection);

        applyingExternalRef.current = false;
    }, [code, path]);

    useEffect(() => {
        const ed = editorRef.current;
        if (!ed) return;
        ed.updateOptions?.({ readOnly: disabled });
    }, [disabled]);

    return (
        <Monaco
            height={height}
            path={path}
            language={monacoLang(lang)}
            defaultValue={String(code ?? "")}
            theme={theme}
            saveViewState
            onMount={(ed: any) => {
                editorRef.current = ed;
                onMount?.(ed);
            }}
            onChange={(v) => {
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
                scrollbar: { alwaysConsumeMouseWheel: false },
                formatOnPaste: false,
                formatOnType: false,
            }}
        />
    );
}