"use client";

import React, { useEffect, useMemo, useRef, useId, useState } from "react";
import dynamic from "next/dynamic";
import { monacoLang } from "../utils/monaco";
import { CodeLanguage } from "@/lib/practice/types";
import { cn } from "@/components/ide/fullide/utils";
import {editor} from "monaco-editor";

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
    const [isNarrowScreen, setIsNarrowScreen] = useState(false);
    const [mobileEditing, setMobileEditing] = useState(false);

    const path = useMemo(() => {
        return buildModelPath({
            modelKey,
            instanceKey: instanceKeyRef.current,
            lang,
        });
    }, [modelKey, lang]);

    useEffect(() => {
        if (typeof window === "undefined" || !window.matchMedia) return;

        const mq = window.matchMedia("(max-width: 767px)");
        const update = () => setIsNarrowScreen(mq.matches);

        update();

        if (typeof mq.addEventListener === "function") {
            mq.addEventListener("change", update);
            return () => mq.removeEventListener("change", update);
        }

        mq.addListener(update);
        return () => mq.removeListener(update);
    }, []);

    useEffect(() => {
        if (disabled) setMobileEditing(false);
    }, [disabled]);

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

    const effectiveReadOnly = disabled || (isNarrowScreen && !mobileEditing);
    const passThroughOnMobile = isNarrowScreen && effectiveReadOnly;

    useEffect(() => {
        const ed = editorRef.current;
        if (!ed) return;
        ed.updateOptions?.({
            readOnly: effectiveReadOnly,
            readOnlyMessage: { value: "" },
            domReadOnly: true,
        });
    }, [effectiveReadOnly]);


    const options = useMemo<editor.IStandaloneEditorConstructionOptions>(() => {
        return {
            minimap: { enabled: false },
            fontSize: isNarrowScreen ? 14 : 13,
            scrollBeyondLastLine: false,
            wordWrap: "on",
            automaticLayout: true,
            readOnly: disabled,
            formatOnPaste: false,
            formatOnType: false,
            glyphMargin: false,
            folding: !isNarrowScreen,
            stickyScroll: { enabled: false },
            renderLineHighlight: isNarrowScreen ? "none" : "line",
            lineNumbers: isNarrowScreen ? "off" : "on",
            lineNumbersMinChars: isNarrowScreen ? 2 : 3,
            lineDecorationsWidth: isNarrowScreen ? 8 : 10,
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
            scrollbar: {
                alwaysConsumeMouseWheel: false,
                verticalScrollbarSize: isNarrowScreen ? 10 : 12,
                horizontalScrollbarSize: isNarrowScreen ? 10 : 12,
            },
            padding: {
                top: 12,
                bottom: 16,
            },
        };
    }, [isNarrowScreen, disabled]);

    return (
        <div className="relative h-full w-full min-w-0">
            <div
                className={cn(
                    "h-full w-full min-w-0",
                    passThroughOnMobile && "pointer-events-none",
                )}
                style={{ touchAction: isNarrowScreen ? "pan-y" : "auto" }}
            >
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

                        ed.onDidBlurEditorWidget?.(() => {
                            if (isNarrowScreen) setMobileEditing(false);
                        });
                    }}
                    onChange={(v) => {
                        if (applyingExternalRef.current) return;
                        onChange(v ?? "");
                    }}
                    options={options}
                />
            </div>

            {isNarrowScreen && !disabled ? (
                <button
                    type="button"
                    onClick={() => {
                        setMobileEditing((v) => {
                            const next = !v;
                            if (next) {
                                requestAnimationFrame(() => editorRef.current?.focus?.());
                            }
                            return next;
                        });
                    }}
                    className="absolute bottom-3 right-3 z-20 rounded-lg border border-neutral-200 bg-white/95 px-3 py-2 text-xs font-extrabold text-neutral-800 shadow-sm backdrop-blur dark:border-white/10 dark:bg-black/70 dark:text-white/85"
                >
                    {mobileEditing ? "Done" : "Edit"}
                </button>
            ) : null}
        </div>
    );
}