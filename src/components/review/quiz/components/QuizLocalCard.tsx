// src/components/review/quiz/components/QuizLocalCard.tsx
"use client";

import React from "react";
import type { ReviewQuestion } from "@/lib/review/types";
import MathMarkdown from "@/components/math/MathMarkdown";
import { normalizeMath } from "@/lib/markdown/normalizeMath";
import { cn } from "@/lib/cn";

export default function QuizLocalCard(props: {
  q: Exclude<ReviewQuestion, { kind: "practice" }>;
  unlocked: boolean;
  isCompleted: boolean;
  locked: boolean;
  skipped?: boolean;
  onSkip?: () => void;
  value: any;
  checked: boolean;
  ok: boolean | null;
  prereqsMet?:boolean;

  onPick: (val: any) => void;
  onCheck: () => void;
}) {
  const { q, unlocked, isCompleted, locked, skipped, onSkip, prereqsMet } = props;
  const disabled = !unlocked || isCompleted || locked || Boolean(skipped) || !prereqsMet;

  return (
    <div
      className={cn(
        "ui-quiz-card",
        locked && "ui-quiz-card--locked",
        !unlocked && "opacity-70",
      )}
    >
      <MathMarkdown
        className="
          text-sm text-neutral-800 dark:text-white/80
          [&_.katex]:text-neutral-900 dark:[&_.katex]:text-white/90
          [&_.katex-display]:overflow-x-auto
          [&_.katex-display]:py-2
        "
        content={normalizeMath(String((q as any).prompt ?? ""))}
      />

      {!unlocked ? (
        <div className="ui-quiz-hint">
          Answer the previous question correctly to unlock this one.
        </div>
      ) : null}

      {q.kind === "mcq" ? (
        <div className="mt-2 grid gap-2">
          {q.choices.map((c) => (
            <button
              key={c.id}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && props.onPick(c.id)}
              className={cn(
                "ui-quiz-choice",
                props.value === c.id
                  ? "ui-quiz-choice--selected"
                  : "ui-quiz-choice--idle",
                disabled && "cursor-not-allowed opacity-60",
              )}
            >
              <MathMarkdown
                inline
                className="text-xs font-extrabold text-inherit [&_.katex]:text-inherit"
                content={normalizeMath(c.label)}
              />
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            disabled={disabled}
            className={cn(
              "ui-quiz-input",
              disabled && "cursor-not-allowed opacity-60",
            )}
            placeholder="Enter a number"
            value={props.value ?? ""}
            onChange={(e) => !disabled && props.onPick(e.target.value)}
          />
          {(q as any).tolerance ? (
            <div className="text-xs text-neutral-500 dark:text-white/50">
              ± {(q as any).tolerance}
            </div>
          ) : null}
        </div>
      )}

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && props.onCheck()}
          className={cn(
            "ui-quiz-action",
            disabled ? "ui-quiz-action--disabled" : "ui-quiz-action--primary",
          )}
        >
          Check this question
        </button>
        {onSkip ? (
          <button
            type="button"
            disabled={
              !unlocked || isCompleted || locked || Boolean(props.skipped)
            }
            onClick={() => props.onSkip?.()}
            className={cn(
              "ui-quiz-action",
              !unlocked || isCompleted || locked || Boolean(props.skipped)
                ? "ui-quiz-action--disabled"
                : "ui-quiz-action--ghost",
            )}
          >
            {props.skipped ? "Skipped" : "Skip"}
          </button>
        ) : null}
        <div className="text-xs font-extrabold text-neutral-600 dark:text-white/60 sm:text-right">
          {props.skipped ? (
            <span className="text-amber-700 dark:text-amber-300/80">
              ↷ Skipped
            </span>
          ) : props.checked ? (
            props.ok === true ? (
              <span className="text-emerald-700 dark:text-emerald-300/80">
                ✓ Correct
              </span>
            ) : (
              <span className="text-rose-700 dark:text-rose-300/80">
                ✕ Not correct
              </span>
            )
          ) : (
            <span className="text-neutral-500 dark:text-white/50">
              Not checked yet
            </span>
          )}
        </div>
      </div>

      {props.checked && (q as any).explain ? (
        <div className="ui-quiz-explain">
          <MathMarkdown
            className="text-xs text-neutral-600 dark:text-white/70 [&_.katex]:text-neutral-900 dark:[&_.katex]:text-white/90"
            content={normalizeMath(String((q as any).explain))}
          />
        </div>
      ) : null}
    </div>
  );
}
