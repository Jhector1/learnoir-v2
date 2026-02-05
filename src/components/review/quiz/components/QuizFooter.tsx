// src/components/review/quiz/components/QuizFooter.tsx
"use client";

import React from "react";

export default function QuizFooter(props: {
  checkedCount: number;
  correctCount: number;
  total: number;
  scorePct: number;

  isCompleted: boolean;
  passed: boolean;
  sequential: boolean;

  onResetClick: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="text-xs font-extrabold text-white/70">
        Checked: {props.checkedCount}/{props.total} • Correct:{" "}
        {props.correctCount}/{props.total} • Score: {props.scorePct}%
      </div>

      <div className="flex items-center gap-2">
        {!props.isCompleted ? (
          <button
            type="button"
            onClick={props.onResetClick}
            className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-extrabold hover:bg-white/15"
          >
            Reset quiz
          </button>
        ) : null}

        {props.isCompleted ? (
          <span className="text-xs font-extrabold text-emerald-300/80">
            ✓ Completed
          </span>
        ) : props.passed ? (
          <span className="text-xs font-extrabold text-emerald-300/80">
            ✓ Passed
          </span>
        ) : (
          <span className="text-xs font-extrabold text-white/50">
            {props.sequential
              ? "Check each question in order to pass"
              : "Check all questions to pass"}
          </span>
        )}
      </div>
    </div>
  );
}
