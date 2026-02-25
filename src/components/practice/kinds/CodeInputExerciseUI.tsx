// src/components/practice/kinds/CodeInputExerciseUI.tsx
"use client";

import React, { useEffect, useRef } from "react";
import type {CodeLanguage, Exercise} from "@/lib/practice/types";
import type {  RunResult } from "@/lib/code/runCode";
import CodeRunner from "@/components/code/CodeRunner";
import { ExercisePrompt } from "@/components/practice/kinds/KindHelper";

type CodeInputExercise = Extract<Exercise, { kind: "code_input" }>;

export type CodeInputAutoBindMode = "never" | "whenUnbound" | "whenActive";

export default function CodeInputExerciseUI({
                                                exercise,
                                                code,
                                                stdin,
                                                language,
                                                onChangeCode,
                                                onChangeStdin,
                                                onChangeLanguage,
                                                disabled,
                                                onRun,

                                                checked = false,
                                                ok = null,
                                                reviewCorrect = null,

                                                readOnly = false,

                                                variant = "embedded",
                                                toolsBound = false,
                                                toolsUnbound = false,
                                                onUseTools,
                                                onSyncTools,

                                                autoBindMode = "whenUnbound",

                                                // ✅ NEW
                                                showPrompt = true,
                                            }: {
    exercise: CodeInputExercise;
    code: string;
    stdin: string;
    language: CodeLanguage;
    onChangeCode: (code: string) => void;
    onChangeStdin: (stdin: string) => void;
    onChangeLanguage: (l: CodeLanguage) => void;
    disabled: boolean;

    onRun?: (args: { language: CodeLanguage; code: string; stdin: string }) => Promise<RunResult>;

    checked?: boolean;
    ok?: boolean | null;
    reviewCorrect?: { language: CodeLanguage; code: string; stdin: string } | null;

    readOnly?: boolean;

    variant?: "embedded" | "tools";
    toolsBound?: boolean;
    toolsUnbound?: boolean;
    onUseTools?: () => void;
    onSyncTools?: () => void;

    autoBindMode?: CodeInputAutoBindMode;

    // ✅ NEW
    showPrompt?: boolean;
}) {
    const showCorrect =
        checked && ok === false && reviewCorrect && typeof reviewCorrect.code === "string";

    // In this UI, users do NOT change language; it comes from the subject/topic.
    const lockLanguage = true;

    const didAutoBind = useRef(false);
    const didFirstSync = useRef(false);

    useEffect(() => {
        if (variant !== "tools") return;
        if (!onUseTools) return;
        if (readOnly || disabled) return;
        if (toolsBound) return;
        if (didAutoBind.current) return;

        if (autoBindMode === "never") return;
        if (autoBindMode === "whenUnbound" && !toolsUnbound) return;

        didAutoBind.current = true;
        onUseTools();
    }, [variant, onUseTools, readOnly, disabled, toolsBound, toolsUnbound, autoBindMode]);

    useEffect(() => {
        if (variant !== "tools") return;
        if (!toolsBound) return;
        if (!onSyncTools) return;

        if (!didFirstSync.current) {
            didFirstSync.current = true;
            return;
        }

        onSyncTools();
    }, [variant, toolsBound, code, stdin, language, onSyncTools]);

    // -----------------------------
    // Tools variant (NO embedded CodeRunner)
    // -----------------------------
    if (variant === "tools") {
        return (
            <div className="grid gap-3">
                {showPrompt ? <ExercisePrompt exercise={exercise} /> : null}

                <div className="rounded-2xl border border-neutral-200 bg-white/80 p-3 dark:border-white/10 dark:bg-white/[0.04]">
                    {/* ...unchanged... */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                            <div className="text-xs font-black text-neutral-800 dark:text-white/80">
                                Edit & run in <span className="font-black">Tools</span>
                            </div>
                            <div className="mt-1 text-[11px] font-extrabold text-neutral-600 dark:text-white/60">
                                Language: <span className="font-black">{String(language ?? "python")}</span>
                                {String(stdin ?? "").trim() ? (
                                    <>
                                        {" "}
                                        • Stdin: <span className="font-black">yes</span>
                                    </>
                                ) : (
                                    <>
                                        {" "}
                                        • Stdin: <span className="font-black">no</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onUseTools}
                            disabled={disabled || readOnly || !onUseTools}
                            className={[
                                "ui-btn ui-btn-secondary text-xs font-extrabold",
                                disabled || readOnly || !onUseTools ? "opacity-60 cursor-not-allowed" : "",
                            ].join(" ")}
                            title="Bind this question to the Tools panel"
                        >
                            {toolsBound ? "Bound ✓" : "Open in Tools"}
                        </button>
                    </div>

                    <div className="mt-3 grid gap-2">
                        <div className="text-[11px] font-black text-neutral-600 dark:text-white/60">
                            Your code (snapshot)
                        </div>

                        <pre className="max-h-56 overflow-auto rounded-xl bg-black/5 p-3 text-[11px] font-mono text-neutral-900 dark:bg-white/10 dark:text-white/90">
              {String(code ?? "").trim() ? String(code) : "// Open Tools → to write code"}
            </pre>

                        {String(stdin ?? "").trim() ? (
                            <>
                                <div className="text-[11px] font-black text-neutral-600 dark:text-white/60">
                                    Stdin (snapshot)
                                </div>
                                <pre className="max-h-32 overflow-auto rounded-xl bg-black/5 p-3 text-[11px] font-mono text-neutral-900 dark:bg-white/10 dark:text-white/90">
                  {String(stdin)}
                </pre>
                            </>
                        ) : null}
                    </div>
                </div>

                {showCorrect ? (
                    <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/5 p-3">
                        {/* ...unchanged... */}
                    </div>
                ) : null}
            </div>
        );
    }

    // -----------------------------
    // Embedded variant
    // -----------------------------
    const runnerTitle = showPrompt ? exercise.title : undefined;

    return (
        <div className="grid gap-3">
            {showPrompt ? <ExercisePrompt exercise={exercise} /> : null}

            <CodeRunner
                title={runnerTitle as any}
                frame="plain"
                hintMarkdown={exercise.hint}
                height={620}
                disabled={disabled || readOnly}
                allowReset={!readOnly}
                allowRun={!readOnly}
                showHint
                showEditorThemeToggle={!readOnly}
                language={language}
                onChangeLanguage={onChangeLanguage}
                fixedLanguage={lockLanguage ? language : undefined}
                showLanguagePicker={lockLanguage ? false : true}
                code={code}
                onChangeCode={(c) => !readOnly && onChangeCode(c)}
                // stdin={stdin}
                // onChangeStdin={(s) => !readOnly && onChangeStdin(s)}
                onRun={onRun}
                fixedTerminalDock="bottom"
            />

            {showCorrect ? (
                <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/5 p-3">
                    <div className="text-[11px] font-black text-emerald-900 dark:text-emerald-100/90">
                        Correct solution
                    </div>

                    <div className="mt-2">
                        <CodeRunner
                            frame="plain"
                            title={undefined as any}
                            hintMarkdown={undefined as any}
                            height={(exercise as any).editorHeight ?? 260}
                            disabled
                            allowReset={false}
                            allowRun={false}
                            showHint={false}
                            showEditorThemeToggle={false}
                            showLanguagePicker={false}
                            language={reviewCorrect!.language}
                            fixedLanguage={reviewCorrect!.language}
                            onChangeLanguage={() => {}}
                            code={reviewCorrect!.code}
                            onChangeCode={() => {}}
                            // stdin={reviewCorrect!.stdin ?? ""}
                            // onChangeStdin={() => {}}
                            onRun={undefined}
                        />
                    </div>
                </div>
            ) : null}
        </div>
    );
}