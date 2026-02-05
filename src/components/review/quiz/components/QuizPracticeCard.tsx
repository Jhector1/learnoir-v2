// src/components/review/quiz/components/QuizPracticeCard.tsx
"use client";

import React from "react";
import type { ReviewQuestion } from "@/lib/review/types";
import MathMarkdown from "@/components/math/MathMarkdown";
import ExerciseRenderer from "@/components/practice/ExerciseRenderer";
import RevealAnswerCard from "@/components/practice/RevealAnswerCard";
import { normalizeMath } from "@/lib/markdown/normalizeMath";
import { cloneVec } from "@/lib/practice/uiHelpers";
import type { PracticeState } from "../hooks/useQuizPracticeBank";
import { isEmptyPracticeAnswer } from "../hooks/useQuizPracticeBank";

export default function QuizPracticeCard(props: {
  q: Extract<ReviewQuestion, { kind: "practice" }>;
  unlocked: boolean;
  isCompleted: boolean;
  locked: boolean;
  unlimitedAttempts: boolean;

  ps?: PracticeState;

  padRef: any; // your VectorPadState ref object
  onUpdateItem: (patch: any) => void;
  onSubmit: () => void;
  onReveal: () => void;
}) {
  const { q, unlocked, isCompleted, locked, unlimitedAttempts, ps } = props;

  const outOfAttempts = ps
    ? !unlimitedAttempts && ps.attempts >= ps.maxAttempts
    : false;

  const hasInput =
    ps?.exercise && ps?.item
      ? !isEmptyPracticeAnswer(ps.exercise, ps.item, props.padRef.current)
      : false;

  const disableCheckAnswer =
    !unlocked ||
    isCompleted ||
    locked ||
    (ps?.busy ?? false) ||
    outOfAttempts ||
    ps?.ok === true ||
    !hasInput;

  return (
    <div
      className={[
        "rounded-xl border border-white/10 bg-white/[0.03] p-3",
        !unlocked ? "opacity-70" : "",
      ].join(" ")}
    >
      {ps?.exercise?.prompt ? (
        <MathMarkdown
          className="
            text-sm text-white/80
            [&_.katex]:text-white/90
            [&_.katex-display]:overflow-x-auto
            [&_.katex-display]:py-2
          "
          content={normalizeMath(String(ps.exercise.prompt))}
        />
      ) : null}

      {ps?.exercise?.title ? (
        <div className="mt-1 text-xs font-black text-white/60">
          {String(ps.exercise.title)}
        </div>
      ) : null}

      {!unlocked ? (
        <div className="mt-2 text-xs font-extrabold text-white/50">
          Answer the previous question correctly to unlock this one.
        </div>
      ) : null}

      {ps?.loading ? (
        <div className="mt-2 text-xs text-white/60">Loading exercise…</div>
      ) : ps?.error ? (
        <div className="mt-2 rounded-lg border border-rose-300/20 bg-rose-300/10 p-2 text-xs text-rose-200/90">
          {ps.error}
        </div>
      ) : ps?.exercise && ps?.item ? (
        <div className="mt-2">
          <ExerciseRenderer
            exercise={ps.exercise}
            current={ps.item}
            busy={ps.busy || !unlocked || isCompleted || locked}
            isAssignmentRun={false}
            maxAttempts={ps.maxAttempts}
            padRef={props.padRef}
            updateCurrent={(patch) => {
              if (!unlocked || isCompleted || locked) return;
                if (ps?.ok === true) return; // ✅ freeze after correct

              props.onUpdateItem(patch);
            }}
          />

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={props.onSubmit}
                disabled={disableCheckAnswer}
                className={[
                  "shrink-0 rounded-xl border px-3 py-2 text-xs font-extrabold transition",
                  disableCheckAnswer
                    ? "cursor-not-allowed border-white/10 bg-white/5 text-white/40"
                    : "border-white/10 bg-white/10 text-white/80 hover:bg-white/15",
                ].join(" ")}
              >
                Check this answer
              </button>

              <button
                type="button"
                onClick={props.onReveal}
                disabled={!unlocked || isCompleted || locked || ps.busy}
                className={[
                  "shrink-0 rounded-xl border px-3 py-2 text-xs font-extrabold transition",
                  !unlocked || isCompleted || locked || ps.busy
                    ? "cursor-not-allowed border-white/10 bg-white/5 text-white/40"
                    : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10",
                ].join(" ")}
              >
                Reveal
              </button>
            </div>

            <div className="min-w-0 text-xs font-extrabold text-white/60 sm:text-right">
              <span className="whitespace-normal">
                Attempts: {ps.attempts}/
                {Number.isFinite(ps.maxAttempts) ? ps.maxAttempts : "∞"}
              </span>
              {ps.ok === true ? (
                <span className="ml-2 whitespace-nowrap text-emerald-300/80">
                  ✓ Correct
                </span>
              ) : ps.ok === false && ps.item?.result ? (
                <span className="ml-2 whitespace-nowrap text-rose-300/80">
                  ✕ Not correct
                </span>
              ) : null}
            </div>
          </div>

          {ps.item?.revealed && ps.item?.result ? (
            <RevealAnswerCard
              exercise={ps.exercise}
              current={ps.item}
              result={ps.item.result}
              updateCurrent={(patch) => {
                if (!unlocked || isCompleted || locked) return;
                props.onUpdateItem(patch);

                // keep pad synced if reveal patches vectors
                const pr = props.padRef;
                if (pr?.current) {
                  if ((patch as any).dragA)
                    pr.current.a = cloneVec((patch as any).dragA) as any;
                  if ((patch as any).dragB)
                    pr.current.b = cloneVec((patch as any).dragB) as any;
                }
              }}
            />
          ) : null}
        </div>
      ) : (
        <div className="mt-2 text-xs text-white/60">No exercise.</div>
      )}
    </div>
  );
}
