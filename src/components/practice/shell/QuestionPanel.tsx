"use client";

import React from "react";
import MathMarkdown from "@/components/math/MathMarkdown";
import ExerciseRenderer from "../ExerciseRenderer";
import type { PracticeShellProps } from "../PracticeShell";

export default function QuestionPanel(props: PracticeShellProps) {
  const { t, exercise, busy, loadErr, current, retryLoad, padRef, updateCurrent, isAssignmentRun, maxAttempts } =
    props;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden">
      <div className="border-b border-white/10 bg-black/20 p-4">
        <div className="text-sm font-black">
          {exercise?.title ?? (busy ? t("status.loadingDots") : t("status.dash"))}
        </div>
        <div className="mt-1 text-sm text-white/80 break-words">
          <MathMarkdown
            content={exercise?.prompt ?? ""}
            className="prose prose-invert max-w-none prose-p:my-2 prose-strong:text-white prose-code:text-white"
          />
        </div>
      </div>

      <div className="p-4">
        {loadErr ? (
          <div className="rounded-xl border border-rose-300/30 bg-rose-300/10 p-3 text-sm text-white/85">
            <div className="font-black">{t("loadError.title")}</div>
            <div className="mt-1 text-xs text-white/70">{loadErr}</div>
            <div className="mt-3 flex gap-2">
              <button
                className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-extrabold hover:bg-white/15"
                onClick={retryLoad}
                disabled={busy}
              >
                {t("buttons.retry")}
              </button>
            </div>
          </div>
        ) : !current || !exercise ? (
          <div className="text-white/70">{busy ? t("status.loading") : "Click Next to start."}</div>
        ) : (
          <ExerciseRenderer
            exercise={exercise}
            current={current}
            busy={busy}
            isAssignmentRun={isAssignmentRun}
            maxAttempts={maxAttempts}
            padRef={padRef}
            updateCurrent={updateCurrent}
          />
        )}
      </div>

      <div className="border-t border-white/10 bg-black/10 p-3 text-xs text-white/55">
        {t("questionPanel.footerTip")}
      </div>
    </div>
  );
}
