"use client";

import React from "react";
import type { PracticeShellProps } from "../PracticeShell";
import PracticeReviewList from "../MissedPracticeCard";

// ✅ Use the actual file that exports the list component
// If your component file is named PracticeReviewList.tsx, use:
// import PracticeReviewList from "../PracticeReviewList";
// If you really named it MissedPracticeCard.tsx and it default-exports PracticeReviewList,
// then keep: import PracticeReviewList from "../MissedPracticeCard";

export default function SummaryView(props: PracticeShellProps) {
  const {
    t,
    answeredCount,
    correctCount,
    pct,
    sessionSize,

    // ✅ needed for PracticeReviewList
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


const list = (reviewStack && reviewStack.length ? reviewStack : stack);



  return (
    <div className="min-h-screen p-4 md:p-6 bg-[radial-gradient(1200px_700px_at_20%_0%,#151a2c_0%,#0b0d12_50%)] text-white/90">
      <div className="mx-auto max-w-5xl grid gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden">
          <div className="border-b border-white/10 bg-black/20 p-5">
            <div className="text-lg font-black tracking-tight">
              {t("summary.title")} 🎉
            </div>
            <div className="mt-1 text-sm text-white/80">
              {t("summary.subtitle", { answered: answeredCount, sessionSize })}
            </div>
          </div>

          <div className="p-5">
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4">
              <div className="text-xs text-white/70 font-extrabold">
                {t("summaryCards.score")}
              </div>
              <div className="mt-1 text-base font-black text-white/90">
                {t("summary.scoreLine", {
                  correct: correctCount,
                  missed: answeredCount - correctCount,
                  pct,
                })}
              </div>
            </div>
            <div className="mt-3 text-xs text-white/60">
              {t("summaryCards.niceWork")}
            </div>
          </div>
        </div>

        {returnUrl ? (
          <button
            className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-extrabold hover:bg-white/15"
            onClick={() => onReturn?.()}
          >
            {t("summary.return") ?? "Return"}
          </button>
        ) : null}

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden">
          <div className="border-b border-white/10 bg-black/20 p-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-black tracking-tight">
                {t("summary.reviewTitle")}
              </div>
              <div className="mt-1 text-xs text-white/70">
                {t("summary.reviewSubtitle")}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-extrabold hover:bg-white/15"
                onClick={() => setShowMissed(!showMissed)}
              >
                {showMissed
                  ? t("summary.toggleMissedHide")
                  : t("summary.toggleMissedShow")}
              </button>

              <button
                className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-extrabold hover:bg-white/15"
                onClick={() => setPhase("practice")}
              >
                {t("summary.backToQuestions")}
              </button>
            </div>
          </div>

          {/* ✅ render ALL, or only incorrect based on showMissed */}
          <PracticeReviewList
            stack={list}
            showOnlyIncorrect={showMissed}
            maxAttempts={maxAttempts}
            isLockedRun={isLockedRun}
          />
        </div>
      </div>
    </div>
  );
}
