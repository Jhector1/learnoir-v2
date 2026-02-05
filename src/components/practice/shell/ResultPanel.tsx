"use client";

import React from "react";
import type { Exercise } from "@/lib/practice/types";
import type { QItem } from "../practiceType";
import RevealAnswerCard from "../RevealAnswerCard";
import MathMarkdown from "@/components/math/MathMarkdown";
import type { UseConceptExplainResult } from "../hooks/useConceptExplain";

export default function ResultPanel({
  t,
  busy,
  allowReveal,
  isLockedRun,
  maxAttempts,
  attempts,
  actionErr,
  current,
  exercise,
  updateCurrent,
  resultBoxClass,
  concept,
}: {
  t: any;
  busy: boolean;
  allowReveal: boolean;
  isLockedRun: boolean;
  maxAttempts: number;
  attempts: number;
  actionErr: string | null;
  current: QItem | null;
  exercise: Exercise | null;
  updateCurrent: (patch: Partial<QItem>) => void;
  resultBoxClass: string;
  concept: UseConceptExplainResult;
}) {
  return (
    <div className="p-4">
      <div className="text-xs font-extrabold text-white/60">{t("result.title")}</div>

      <div className={`mt-2 rounded-2xl border p-3 text-xs leading-relaxed ${resultBoxClass}`}>
        {actionErr ? (
          <div className="text-white/80">
            <div className="font-extrabold">{t("result.errorTitle")}</div>
            <div className="mt-1 text-white/70">{actionErr}</div>
          </div>
        ) : !current?.result ? (
          <div className="text-white/70">{t("result.submitToValidate")}</div>
        ) : (
          <>
            <div className="font-extrabold">
              {current.revealed
                ? t("result.revealed")
                : current.result.ok
                  ? t("result.correct")
                  : current.submitted
                    ? t("result.incorrect")
                    : "Incorrect — try again"}
            </div>

            {current.revealed ? (
              <RevealAnswerCard
                exercise={exercise}
                current={current}
                result={current.result}
                updateCurrent={updateCurrent}
              />
            ) : null}

            {isLockedRun && !current.result.ok && !current.submitted ? (
              <div className="mt-2 text-white/70">
                Attempts left:{" "}
                <span className="font-extrabold text-white/85">
                  {Math.max(0, maxAttempts - attempts)}
                </span>
              </div>
            ) : null}

            {current.result.explanation ? (
              <div className="mt-2 text-white/80">{current.result.explanation}</div>
            ) : null}
          </>
        )}

        {/* AI concept helper */}
        {concept.canExplain ? (
          <div className="mt-3">
            {allowReveal ? (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={concept.explainConcept}
                  disabled={busy || concept.aiBusy}
                  className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-[11px] font-extrabold hover:bg-white/15 disabled:opacity-50"
                >
                  {concept.aiBusy ? "Explaining…" : "Explain concept"}
                </button>
                <div className="text-[11px] text-white/50">
                  Explains the idea + approach — no final answer.
                </div>
              </div>
            ) : null}

            {concept.aiErr ? (
              <div className="mt-2 text-[11px] text-rose-200/80">{concept.aiErr}</div>
            ) : null}

            {concept.aiText ? (
              <div className="mt-2 rounded-2xl border border-white/10 bg-black/20 p-3">
                <MathMarkdown
                  content={concept.aiText}
                  className="prose prose-invert max-w-none prose-p:my-2 prose-strong:text-white prose-code:text-white"
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
