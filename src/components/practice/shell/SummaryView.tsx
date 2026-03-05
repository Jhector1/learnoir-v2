// src/components/practice/shell/SummaryView.tsx
"use client";

import React, { useMemo } from "react";
import type { PracticeShellProps } from "../PracticeShell";
import PracticeReviewList from "@/components/practice/MissedPracticeCard";
import SummaryViewSkeleton from "@/components/practice/shell/SummaryViewSkeleton";

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
  } = props as any;

  // ✅ Loading heuristic: if either list is "not an array yet", show skeleton.
  // (Once arrays exist, even if empty, render normal UI.)
  const loading =
      !Array.isArray(stack) ||
      (reviewStack != null && !Array.isArray(reviewStack));

  if (loading) {
    return <SummaryViewSkeleton />;
  }

  // ✅ ALWAYS prefer the full session list for summary:
  // - reviewStack (server history) usually has everything
  // - stack (client) might only have a partial in-memory slice
  const list = useMemo(() => {
    const rs = Array.isArray(reviewStack) ? reviewStack : [];
    const st = Array.isArray(stack) ? stack : [];
    return rs.length ? rs : st;
  }, [reviewStack, stack]);

  return (
      <div className="min-h-screen ui-bg ui-text">
        <div className="ui-container py-4 md:py-6">
          <div className="grid gap-4">
            {/* Summary card */}
            <div className="ui-card overflow-hidden">
              <div className="border-b ui-border ui-surface-2 p-5">
                <div className="text-lg font-black tracking-tight">
                  {t("summary.title")} 🎉
                </div>
                <div className="mt-1 text-sm ui-text-muted">
                  {t("summary.subtitle", { answered: answeredCount, sessionSize })}
                </div>
              </div>

              <div className="p-5">
                <div className="rounded-2xl border ui-border-accent ui-bg-accent-soft p-4">
                  <div className="text-xs font-extrabold ui-text-muted">
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

                <div className="mt-3 text-xs ui-text-muted">
                  {t("summaryCards.niceWork")}
                </div>
              </div>
            </div>

            {/* Return button */}
            {returnUrl ? (
                <button
                    className="ui-btn ui-btn-secondary px-3 py-2 text-xs font-extrabold"
                    onClick={() => onReturn?.()}
                    type="button"
                >
                  {t("summary.return")}
                </button>
            ) : null}

            {/* Review card */}
            <div className="ui-card overflow-hidden">
              <div className="border-b ui-border ui-surface-2 p-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-black tracking-tight">
                    {t("summary.reviewTitle")}
                  </div>
                  <div className="mt-1 text-xs ui-text-muted">
                    {t("summary.reviewSubtitle")}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                      className="ui-btn ui-btn-secondary px-3 py-2 text-xs font-extrabold"
                      onClick={() => setShowMissed(!showMissed)}
                      type="button"
                  >
                    {!showMissed
                        ? t("summary.toggleMissedHide")
                        : t("summary.toggleMissedShow")}
                  </button>

                  <button
                      className="ui-btn ui-btn-secondary px-3 py-2 text-xs font-extrabold"
                      onClick={() => setPhase("practice")}
                      type="button"
                  >
                    {t("summary.backToQuestions")}
                  </button>
                </div>
              </div>

              <PracticeReviewList
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