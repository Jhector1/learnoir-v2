// src/components/review/quiz/quiz/components/QuizPracticeCard.tsx
"use client";

import React, { useCallback, useEffect, useMemo } from "react";
import type { ReviewQuestion } from "@/lib/subjects/types";
import type { PracticeState } from "@/components/review/quiz/hooks/useQuizPracticeBank";
import { isEmptyPracticeAnswer } from "@/components/review/quiz/hooks/useQuizPracticeBank";
import type { VectorPadState } from "@/components/vectorpad/types";

import ExerciseRenderer from "@/components/practice/ExerciseRenderer";
import RevealAnswerCard from "@/components/practice/RevealAnswerCard";
import { useReviewTools } from "@/components/review/module/context/ReviewToolsContext";

export default function QuizPracticeCard(props: {
  q: Extract<ReviewQuestion, { kind: "practice" }>;
  ps?: PracticeState;

  unlocked: boolean;
  isCompleted: boolean;
  locked: boolean;
  unlimitedAttempts: boolean;
  strictSequential: boolean;

  /** Global deterministic order across topic page */
  seqOrder: number;

  padRef: React.MutableRefObject<VectorPadState>;
  onUpdateItem: (patch: any) => void;
  onSubmit: () => void;
  onReveal: () => void;

  excused?: boolean;
  onExcused?: () => void;
}) {
  const {
    q,
    ps,
    unlocked,
    isCompleted,
    locked,
    unlimitedAttempts,
    strictSequential,
    seqOrder,
    padRef,
    onUpdateItem,
    onSubmit,
    onReveal,
  } = props;

  const tools = useReviewTools();
  const excused = Boolean(props.excused);
  const revealed = Boolean(ps?.item?.revealed);

  // ✅ stable patch function (prevents register thrash downstream)
  const updateItemSafe = useCallback(
      (patch: any) => {
        if (!unlocked || isCompleted || locked || excused) return;
        onUpdateItem(patch);
      },
      [unlocked, isCompleted, locked, excused, onUpdateItem],
  );

  // ✅ attempts cap that respects null(unlimited)
  const attemptsCapped = useMemo(() => {
    if (!ps) return false;
    if (unlimitedAttempts) return false;

    const max = ps.maxAttempts; // number | null
    if (max == null) return false;

    return ps.attempts >= max;
  }, [ps, unlimitedAttempts]);

  const hasInput = useMemo(() => {
    if (!ps?.exercise || !ps?.item) return false;
    return !isEmptyPracticeAnswer(ps.exercise, ps.item, padRef?.current);
  }, [ps?.exercise, ps?.item, padRef]);

  // ✅ Deterministic binding: report status to provider
  useEffect(() => {
    if (!tools) return;
    if (!ps?.exercise) return;
    if (ps.exercise.kind !== "code_input") return;

    const doneForFlow =
        ps.ok === true || excused || (!strictSequential && attemptsCapped);

    const eligible = unlocked && !locked && !isCompleted && !excused;

    tools.setCodeInputMeta(q.id, {
      order: seqOrder,
      eligible,
      done: doneForFlow,
    });
  }, [
    tools,
    q.id,
    ps?.exercise,
    ps?.ok,
    unlocked,
    locked,
    isCompleted,
    excused,
    strictSequential,
    attemptsCapped,
    seqOrder,
  ]);

  const disableCheck =
      !unlocked ||
      isCompleted ||
      locked ||
      excused ||
      (ps?.busy ?? false) ||
      attemptsCapped ||
      ps?.ok === true ||
      !hasInput;

  const disableReveal =
      !unlocked ||
      isCompleted ||
      locked ||
      excused ||
      (ps?.busy ?? false) ||
      ps?.ok === true;

  const disableSkip =
      !unlocked || isCompleted || locked || excused || ps?.ok === true;

  const btnLabel = ps?.busy ? (
      <span className="inline-flex items-center gap-2">
      <span className="h-3 w-3 animate-spin rounded-full border-2 border-neutral-400/60 border-t-transparent dark:border-white/40 dark:border-t-transparent" />
      Checking…
    </span>
  ) : (
      "Check this answer"
  );

  const maxForRenderer = ps?.maxAttempts ?? Number.POSITIVE_INFINITY;

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
                  onClick={props.onExcused}
                  disabled={disableSkip}
                  className={[
                    "ui-quiz-action",
                    disableSkip ? "ui-quiz-action--disabled" : "ui-quiz-action--ghost",
                  ].join(" ")}
              >
                {props.excused ? "Excused" : "Continue"}
              </button>
            </div>
        ) : ps?.exercise && ps?.item ? (
            <div className="mt-1">
              <div className="mt-2">
                <ExerciseRenderer
                    exercise={ps.exercise}
                    current={ps.item}
                    busy={ps.busy || !unlocked || isCompleted || locked}
                    isAssignmentRun={false}
                    maxAttempts={maxForRenderer} // ✅ keep renderer happy even if it expects number
                    padRef={padRef as any}
                    updateCurrent={updateItemSafe}
                    readOnly={!unlocked || isCompleted || locked}
                    codeRunnerMode="tools"
                    codeTools={tools ?? null}
                    codeInputId={q.id}
                />
              </div>

              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <div className="flex items-center gap-2">
                  <button
                      type="button"
                      onClick={onSubmit}
                      disabled={disableCheck}
                      data-flow-focus="1"
                      className={[
                        "ui-quiz-action",
                        disableCheck ? "ui-quiz-action--disabled" : "ui-quiz-action--primary",
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
                        disableReveal ? "ui-quiz-action--disabled" : "ui-quiz-action--ghost",
                      ].join(" ")}
                  >
                    Reveal
                  </button>
                </div>

                <div className="min-w-0 text-xs font-extrabold text-neutral-600 dark:text-white/60 sm:text-right">
              <span className="whitespace-normal">
                Attempts: {ps.attempts}/
                {ps.maxAttempts == null ? "∞" : ps.maxAttempts}
              </span>

                  {ps.ok === true ? (
                      <span className="ml-2 whitespace-nowrap text-emerald-700 dark:text-emerald-300/80">
                  ✓ Correct
                </span>
                  ) : ps.ok === false && ps.item?.result && !revealed ? (
                      <span className="ml-2 whitespace-nowrap text-rose-700 dark:text-rose-300/80">
                  ✕ Not correct
                </span>
                  ) : null}
                </div>
              </div>

              {revealed && ps.item?.result ? (
                  <div className="mt-3">
                    <RevealAnswerCard
                        exercise={ps.exercise}
                        current={ps.item}
                        result={ps.item.result}
                        updateCurrent={updateItemSafe}
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