// src/components/practice/shell/SummaryView.tsx
"use client";

import React from "react";
import type { PracticeShellProps } from "../PracticeShell";
import PracticeReviewList from "@/components/practice/MissedPracticeCard";
// import PracticeReviewList from "../PracticeReviewList";

export default function SummaryView(props: PracticeShellProps) {
  const {
    t,
    answeredCount,
    correctCount,
    pct,
    sessionSize,

    stack,
    reviewStack,
    maxAttempts,
    isLockedRun,

    showMissed,
    setShowMissed,
    setPhase,
    returnUrl,
    onReturn,
  } = props;

  const list = reviewStack && reviewStack.length ? reviewStack : stack;

  return (
      <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-white">
        <div className="ui-container py-4 md:py-6">
          <div className="grid gap-4">
            <div className="ui-card overflow-hidden">
              <div className="border-b border-neutral-200/70 bg-white/70 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-black/20">
                <div className="text-lg font-black tracking-tight">
                  {t("summary.title")} 🎉
                </div>
                <div className="mt-1 text-sm text-neutral-600 dark:text-white/70">
                  {t("summary.subtitle", { answered: answeredCount, sessionSize })}
                </div>
              </div>

              <div className="p-5">
                <div className="rounded-2xl border border-emerald-600/25 bg-emerald-500/10 p-4 dark:border-emerald-300/30 dark:bg-emerald-300/10">
                  <div className="text-xs font-extrabold text-emerald-900/80 dark:text-white/70">
                    {t("summaryCards.score")}
                  </div>
                  <div className="mt-1 text-base font-black">
                    {t("summary.scoreLine", {
                      correct: correctCount,
                      missed: answeredCount - correctCount,
                      pct,
                    })}
                  </div>
                </div>

                <div className="mt-3 text-xs text-neutral-500 dark:text-white/55">
                  {t("summaryCards.niceWork")}
                </div>
              </div>
            </div>

            {returnUrl ? (
                <button
                    className="ui-btn ui-btn-secondary px-3 py-2 text-xs font-extrabold"
                    onClick={() => onReturn?.()}
                >
                  {t("summary.return")}
                </button>
            ) : null}

            <div className="ui-card overflow-hidden">
              <div className="border-b border-neutral-200/70 bg-white/70 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-black/20 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-black tracking-tight">
                    {t("summary.reviewTitle")}
                  </div>
                  <div className="mt-1 text-xs text-neutral-600 dark:text-white/70">
                    {t("summary.reviewSubtitle")}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                      className="ui-btn ui-btn-secondary px-3 py-2 text-xs font-extrabold"
                      onClick={() => setShowMissed(!showMissed)}
                  >
                    {!showMissed ? t("summary.toggleMissedHide") : t("summary.toggleMissedShow")}
                  </button>

                  <button
                      className="ui-btn ui-btn-secondary px-3 py-2 text-xs font-extrabold"
                      onClick={() => setPhase("practice")}
                  >
                    {t("summary.backToQuestions")}
                  </button>
                </div>
              </div>

              <PracticeReviewList
                  // t={t}
                  stack={list}
                  showOnlyIncorrect={showMissed}
                  maxAttempts={maxAttempts}
                  isLockedRun={isLockedRun}
              />
            </div>
          </div>
        </div>
      </div>
  );
}