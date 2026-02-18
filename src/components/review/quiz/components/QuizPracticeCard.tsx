"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";
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
    padRef,
    onUpdateItem,
    onSubmit,
    onReveal,
  } = props;

  const tools = useReviewTools();

  // ✅ stable patch function (prevents register thrash downstream)
  const updateItemSafe = useCallback(
      (patch: any) => {
        if (!unlocked || isCompleted || locked) return;
        onUpdateItem(patch);
      },
      [unlocked, isCompleted, locked, onUpdateItem],
  );

  const outOfAttempts = useMemo(() => {
    if (!ps) return false;
    return !unlimitedAttempts && ps.attempts >= ps.maxAttempts;
  }, [ps, unlimitedAttempts]);

  const hasInput = useMemo(() => {
    if (!ps?.exercise || !ps?.item) return false;
    return !isEmptyPracticeAnswer(ps.exercise, ps.item, padRef?.current);
  }, [ps?.exercise, ps?.item, padRef]);

  const revealed = Boolean(ps?.item?.revealed);

  /**
   * ✅ Auto-bind NEXT code_input only when ok transitions -> true
   * - avoids auto-next on mount when ps.ok already true (saved progress)
   * - works after reset because ok will transition again
   * - only advances when tools are currently bound to THIS question
   */
  const prevOkRef = useRef<boolean | null>(null);
  const initOkRef = useRef(false);

  useEffect(() => {
    prevOkRef.current = null;
    initOkRef.current = false;
  }, [q.id]);

  useEffect(() => {
    if (!tools) return;
    if (!ps?.exercise) return;
    if (ps.exercise.kind !== "code_input") return;

    const curOk = ps.ok === true ? true : ps.ok === false ? false : null;

    // baseline first observation (prevents mount auto-next)
    if (!initOkRef.current) {
      prevOkRef.current = curOk;
      initOkRef.current = true;
      return;
    }

    const prevOk = prevOkRef.current;
    prevOkRef.current = curOk;

    // transition into correct
    if (prevOk !== true && curOk === true) {
      if (tools.boundId !== q.id) return; // only if bound to THIS
      tools.requestBindNext(q.id);
    }
  }, [tools, ps?.exercise, ps?.ok, q.id]);

  const disableCheck =
      !unlocked ||
      isCompleted ||
      locked ||
      (ps?.busy ?? false) ||
      outOfAttempts ||
      ps?.ok === true ||
      !hasInput ||
      Boolean(props.excused);

  const disableReveal =
      !unlocked ||
      isCompleted ||
      locked ||
      ps?.ok === true ||
      (ps?.busy ?? false) ||
      Boolean(props.excused);

  const disableSkip =
      !unlocked || isCompleted || locked || Boolean(props.excused) || ps?.ok === true;

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
                    maxAttempts={ps.maxAttempts}
                    padRef={padRef as any}
                    updateCurrent={updateItemSafe}
                    readOnly={!unlocked || isCompleted || locked}
                    // ✅ review quiz uses ToolsPanel for code_input
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
                Attempts: {ps.attempts}/{Number.isFinite(ps.maxAttempts) ? ps.maxAttempts : "∞"}
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
