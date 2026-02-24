// src/components/practice/shell/QuestionPanel.tsx
"use client";

import React from "react";
import MathMarkdown from "@/components/markdown/MathMarkdown";
import ExerciseRenderer from "../ExerciseRenderer";
import type { PracticeShellProps } from "../PracticeShell";

export default function QuestionPanel(props: PracticeShellProps) {
    const {
        t,
        exercise,
        busy,
        loadErr,
        current,
        retryLoad,
        padRef,
        updateCurrent,
        isAssignmentRun,
        maxAttempts,
    } = props;

    return (
        <div className="ui-card overflow-hidden">
            <div className="border-b border-neutral-200/70 bg-white/70 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-black/20">
                <div className="text-sm font-black">
                    {exercise?.title ?? (busy ? t("status.loadingDots") : t("status.dash"))}
                </div>

                <div className="mt-1 text-sm break-words text-neutral-700 dark:text-white/80">
                    <MathMarkdown
                        content={exercise?.prompt ?? ""}
                        className="prose prose-neutral dark:prose-invert max-w-none prose-p:my-2 prose-strong:font-extrabold"
                    />
                </div>
            </div>

            <div className="p-4">
                {loadErr ? (
                    <div className="rounded-xl border border-rose-400/35 bg-rose-500/10 p-3 text-sm text-neutral-900 dark:border-rose-300/30 dark:bg-rose-300/10 dark:text-white/85">
                        <div className="font-black">{t("loadError.title")}</div>
                        <div className="mt-1 text-xs text-neutral-700 dark:text-white/70">{loadErr}</div>
                        <div className="mt-3 flex gap-2">
                            <button
                                className="ui-btn ui-btn-secondary px-3 py-2 text-xs font-extrabold"
                                onClick={retryLoad}
                                disabled={busy}
                            >
                                {t("buttons.retry")}
                            </button>
                        </div>
                    </div>
                ) : !current || !exercise ? (
                    <div className="text-neutral-600 dark:text-white/70">
                        {busy ? t("status.loading") : t("status.clickNextToStart")}
                    </div>
                ) : (
                    <ExerciseRenderer
                        exercise={exercise}
                        current={current}
                        busy={busy}
                        isAssignmentRun={isAssignmentRun}
                        maxAttempts={maxAttempts}
                        padRef={padRef}
                        updateCurrent={updateCurrent}
                        showPrompt={false}
                    />
                )}
            </div>

            <div className="border-t border-neutral-200/70 bg-white/40 p-3 text-xs text-neutral-500 dark:border-white/10 dark:bg-black/10 dark:text-white/55">
                {t("questionPanel.footerTip")}
            </div>
        </div>
    );
}