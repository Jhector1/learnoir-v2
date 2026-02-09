// src/components/review/quiz/quiz/components/QuizPracticeCard.tsx
"use client";

import React, { useMemo } from "react";
import type { ReviewQuestion } from "@/lib/review/types";
import type { PracticeState } from "@/components/review/quiz/hooks/useQuizPracticeBank";
import { isEmptyPracticeAnswer } from "@/components/review/quiz/hooks/useQuizPracticeBank";
import type { VectorPadState } from "@/components/vectorpad/types";

import MathMarkdown from "@/components/math/MathMarkdown";
import ExerciseRenderer from "@/components/practice/ExerciseRenderer";
import RevealAnswerCard from "@/components/practice/RevealAnswerCard";

function normalizeMath(md: string) {
  const s = String(md ?? "");

  const ttWrapped = s.replace(
    /\\\(\s*\\texttt\{([\s\S]*?)\}\s*\\\)/g,
    (_m, inner) => `\`${String(inner).trim()}\``,
  );

  const tt = ttWrapped.replace(
    /\\texttt\{([\s\S]*?)\}/g,
    (_m, inner) => `\`${String(inner).trim()}\``,
  );

  const inline = tt.replace(
    /\\\(([\s\S]*?)\\\)/g,
    (_m, inner) => `$${String(inner).trim()}$`,
  );

  const display = inline.replace(
    /\\\[([\s\S]*?)\\\]/g,
    (_m, inner) => `$$\n${String(inner).trim()}\n$$`,
  );

  return display;
}

export default function QuizPracticeCard(props: {
  q: Extract<ReviewQuestion, { kind: "practice" }>;
  ps?: PracticeState;
  unlocked: boolean;
  isCompleted: boolean;
  locked: boolean;
  unlimitedAttempts: boolean;
  padRef: React.MutableRefObject<VectorPadState>;
  onUpdateItem: (patch: any) => void;
  onSubmit: () => void;
  onReveal: () => void;
  skipped?: boolean;
  onSkip?: () => void;
}) {
  const {
    q,
    ps,
    unlocked,
    isCompleted,
    locked,
    unlimitedAttempts,
    padRef,
    onUpdateItem,
    onSubmit,
    onReveal,
  } = props;
  // ps = {error: "bad input"}
  const outOfAttempts = useMemo(() => {
    if (!ps) return false;
    return !unlimitedAttempts && ps.attempts >= ps.maxAttempts;
  }, [ps, unlimitedAttempts]);

  const hasInput = useMemo(() => {
    if (!ps?.exercise || !ps?.item) return false;
    return !isEmptyPracticeAnswer(ps.exercise, ps.item, padRef?.current);
  }, [ps?.exercise, ps?.item, padRef]);

  const disableCheck =
    !unlocked ||
    isCompleted ||
    locked ||
    (ps?.busy ?? false) ||
    outOfAttempts ||
    ps?.ok === true ||
    !hasInput ||
    Boolean(props.skipped);

  const disableReveal =
    !unlocked ||
    isCompleted ||
    locked ||
    ps?.ok === true ||
    (ps?.busy ?? false) ||
    Boolean(props.skipped);
  const disableSkip =
    !unlocked ||
    isCompleted ||
    locked ||
    Boolean(props.skipped) ||
    ps?.ok === true;
  const btnLabel = ps?.busy ? (
    <span className="inline-flex items-center gap-2">
      <span className="h-3 w-3 animate-spin rounded-full border-2 border-neutral-400/60 border-t-transparent dark:border-white/40 dark:border-t-transparent" />
      Checking…
    </span>
  ) : (
    "Check this answer"
  );

  return (
    <div className={["ui-quiz-card", !unlocked ? "opacity-70" : ""].join(" ")}>
      {!unlocked ? (
        <div className="ui-quiz-hint">
          Answer the previous question correctly to unlock this one.
        </div>
      ) : null}

      {ps?.loading ? (
        <div className="mt-2 text-xs text-neutral-500 dark:text-white/60">
          Loading exercise…
        </div>
      ) : ps?.error ? (
        <div className="mt-2 rounded-lg border border-rose-300/20 bg-rose-300/10 p-2 text-xs text-rose-700 dark:text-rose-200/90">
          {ps.error}{" "}
          <button
            type="button"
            onClick={props.onSkip}
            disabled={disableSkip}
            className={[
              "ui-quiz-action",
              disableSkip
                ? "ui-quiz-action--disabled"
                : "ui-quiz-action--ghost",
            ].join(" ")}
          >
            {props.skipped ? "Skipped" : "Skip"}
          </button>
        </div>
      ) : // </div>
      ps?.exercise && ps?.item ? (
        <div className="mt-1">
          {ps.exercise.prompt ? (
            <MathMarkdown
              className="
                text-sm text-neutral-800 dark:text-white/80
                [&_.katex]:text-neutral-900 dark:[&_.katex]:text-white/90
                [&_.katex-display]:overflow-x-auto
                [&_.katex-display]:py-2
              "
              content={normalizeMath(String(ps.exercise.prompt))}
            />
          ) : null}

          {ps.exercise.title ? (
            <div className="mt-1 text-xs font-black text-neutral-600 dark:text-white/60">
              {String(ps.exercise.title)}
            </div>
          ) : null}

          <div className="mt-2">
            <ExerciseRenderer
              exercise={ps.exercise}
              current={ps.item}
              busy={ps.busy || !unlocked || isCompleted || locked}
              isAssignmentRun={false}
              maxAttempts={ps.maxAttempts}
              padRef={padRef as any}
              updateCurrent={(patch) => {
                if (!unlocked || isCompleted || locked) return;
                onUpdateItem(patch);
              }}
            />
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onSubmit}
                disabled={disableCheck}
                className={[
                  "ui-quiz-action",
                  disableCheck
                    ? "ui-quiz-action--disabled"
                    : "ui-quiz-action--primary",
                ].join(" ")}
              >
                {btnLabel}
              </button>

              <button
                type="button"
                onClick={onReveal}
                disabled={disableReveal}
                className={[
                  "ui-quiz-action",
                  disableReveal
                    ? "ui-quiz-action--disabled"
                    : "ui-quiz-action--ghost",
                ].join(" ")}
              >
                Reveal
              </button>

              <button
                type="button"
                onClick={props.onSkip}
                disabled={disableSkip}
                className={[
                  "ui-quiz-action",
                  disableSkip
                    ? "ui-quiz-action--disabled"
                    : "ui-quiz-action--ghost",
                ].join(" ")}
              >
                {props.skipped ? "Skipped" : "Skip"}
              </button>
            </div>

            <div className="min-w-0 text-xs font-extrabold text-neutral-600 dark:text-white/60 sm:text-right">
              <span className="whitespace-normal">
                Attempts: {ps.attempts}/
                {Number.isFinite(ps.maxAttempts) ? ps.maxAttempts : "∞"}
              </span>

              {ps.ok === true ? (
                <span className="ml-2 whitespace-nowrap text-emerald-700 dark:text-emerald-300/80">
                  ✓ Correct
                </span>
              ) : ps.ok === false && ps.item?.result ? (
                <span className="ml-2 whitespace-nowrap text-rose-700 dark:text-rose-300/80">
                  ✕ Not correct
                </span>
              ) : null}
            </div>
          </div>

          {ps.item?.revealed && ps.item?.result ? (
            <div className="mt-3">
              <RevealAnswerCard
                exercise={ps.exercise}
                current={ps.item}
                result={ps.item.result}
                updateCurrent={(patch) => {
                  if (!unlocked || isCompleted || locked) return;
                  onUpdateItem(patch);
                }}
              />
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-2 text-xs text-neutral-500 dark:text-white/60">
          No exercise.
        </div>
      )}
    </div>
  );
}
