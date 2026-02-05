"use client";

import React from "react";
import type { Difficulty, Exercise } from "@/lib/practice/types";
import type { PracticeShellProps } from "../PracticeShell";
import ResultPanel from "./ResultPanel";
import type { UseConceptExplainResult } from "../hooks/useConceptExplain";

function SelectField<T extends string>({
  label,
  value,
  onChange,
  disabled,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: T) => void;
  disabled: boolean;
  options: { id: T; label: string }[];
}) {
  return (
    <div className="grid gap-2">
      <label className="text-xs font-extrabold text-white/70">{label}</label>
      <select
        disabled={disabled}
        className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm font-extrabold text-white/90 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((o) => (
          <option key={String(o.id)} value={String(o.id)}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function PracticeSidebar(
  props: PracticeShellProps & {
    canSubmitNow: boolean;
    finalized: boolean;
    attempts: number;
    outOfAttempts: boolean;
    resultBoxClass: string;
    concept: UseConceptExplainResult;
  },
) {
  const {
    t,
    isAssignmentRun,
    isSessionRun,
    isLockedRun,
    allowReveal,
    maxAttempts,

    busy,

    topicLocked,
    difficultyLocked,
    topic,
    setTopic,
    difficulty,
    setDifficulty,
    topicOptionsFixed,
    difficultyOptions,

    badge,

    current,

    canGoPrev,
    canGoNext,
    goPrev,
    goNext,
    submit,
    reveal,

    answeredCount,
    correctCount,
    sessionSize,

    // derived
    attempts,
    canSubmitNow,
    finalized,
    outOfAttempts,
    resultBoxClass,
    concept,
  } = props;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden">
      <div className="border-b border-white/10 bg-black/20 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            {isAssignmentRun ? (
              <div className="mt-2 inline-flex rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-1 text-[11px] font-extrabold text-amber-200/90">
                {t("filters.assignmentLocked")}
              </div>
            ) : isSessionRun ? (
              <div className="mt-2 inline-flex rounded-full border border-sky-300/20 bg-sky-300/10 px-2 py-1 text-[11px] font-extrabold text-sky-200/90">
                {t("filters.sessionLocked") ?? "Session run (locked)"}
              </div>
            ) : null}

            <div className="text-sm font-black tracking-tight">{t("title")}</div>
            <div className="mt-1 text-xs text-white/70">{t("subtitle")}</div>

            <div className="mt-2 text-xs text-white/60">
              {t("progress.label")}:{" "}
              <span className="font-extrabold text-white/80">
                {answeredCount}/{sessionSize}
              </span>{" "}
              • {t("progress.correct")}:{" "}
              <span className="font-extrabold text-white/80">{correctCount}</span>
            </div>

            {current ? (
              <div className="mt-1 text-xs text-white/60">
                Attempts: <span className="font-extrabold">{attempts}/{maxAttempts}</span>
              </div>
            ) : null}
          </div>

          <div className="rounded-full border border-white/10 bg-white/10 px-2 py-1 text-[11px] font-extrabold text-white/70">
            {badge || t("status.dash")}
          </div>
        </div>

        <div className="mt-3 grid gap-3">
          <SelectField
            label={t("filters.topic")}
            value={String(topic)}
            onChange={(v) => setTopic(v as any)}
            disabled={topicLocked}
            options={topicOptionsFixed as any}
          />

          <SelectField
            label={t("filters.difficulty")}
            value={String(difficulty)}
            onChange={(v) => setDifficulty(v as any)}
            disabled={difficultyLocked}
            options={difficultyOptions as any}
          />

          <div className="mt-2 flex flex-wrap gap-2">
            <button
              className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-extrabold hover:bg-white/15 disabled:opacity-50"
              onClick={goPrev}
              disabled={busy || !canGoPrev}
            >
              {t("buttons.prev")}
            </button>

            <button
              className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-extrabold hover:bg-white/15 disabled:opacity-50"
              onClick={() => goNext()}
              disabled={busy || !canGoNext}
            >
              {t("buttons.next")}
            </button>

            <button
              className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-extrabold hover:bg-white/15 disabled:opacity-50"
              onClick={() => submit()}
              disabled={busy || !props.exercise || finalized || outOfAttempts || !canSubmitNow}
            >
              {t("buttons.submit")}
            </button>

            <button
              className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-extrabold hover:bg-white/15 disabled:opacity-50"
              onClick={() => reveal()}
              disabled={busy || !props.exercise || !allowReveal}
            >
              {t("buttons.reveal")}
            </button>
          </div>

          {isLockedRun && !allowReveal ? (
            <div className="text-[11px] text-white/45">
              Reveal is disabled for this run.
            </div>
          ) : null}
        </div>
      </div>

      <ResultPanel
        t={t}
        busy={busy}
        allowReveal={allowReveal}
        isLockedRun={isLockedRun}
        maxAttempts={maxAttempts}
        attempts={attempts}
        actionErr={props.actionErr}
        current={props.current}
        exercise={props.exercise as Exercise | null}
        updateCurrent={props.updateCurrent}
        resultBoxClass={resultBoxClass}
        concept={concept}
      />
    </div>
  );
}
