// src/components/practice/kinds/TextInputExerciseUI.tsx
"use client";

import React from "react";
import MathMarkdown from "@/components/math/MathMarkdown";

export default function TextInputExerciseUI({
  exercise,
  value,
  onChange,
  disabled,
  checked,
  ok,
  reviewCorrectText = null,
}: {
  exercise: any;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  checked: boolean;
  ok: boolean | null;
  reviewCorrectText?: string | null;
}) {
 // ✅ only className strings changed

  const border =
    checked && ok === true
      ? "border-emerald-400/30"
      : checked && ok === false
        ? "border-rose-400/30"
        : "border-neutral-200 dark:border-white/10";

  const bg =
    checked && ok === true
      ? "bg-emerald-300/10"
      : checked && ok === false
        ? "bg-rose-300/10"
        : "bg-white dark:bg-white/[0.03]";

  return (
    <div className={`rounded-2xl border ${border} ${bg} p-4`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-black text-neutral-900 dark:text-white/90">{exercise.title}</div>
          <MathMarkdown
            className="mt-2 text-sm text-neutral-700 dark:text-white/80 [&_.katex]:text-neutral-900 dark:[&_.katex]:text-white/90"
            content={String(exercise.prompt ?? "")}
          />
        </div>

        {checked ? (
          <div className={["ui-pill", ok === true ? "ui-pill--good" : "border-rose-300/30 bg-rose-300/10 text-rose-900 dark:text-rose-100"].join(" ")}>
            {ok === true ? "Correct" : "Try again"}
          </div>
        ) : null}
      </div>

      <div className="mt-4">
        <div className="text-xs font-extrabold text-neutral-600 dark:text-white/70">Your answer</div>
        <input
          value={value ?? ""}
          disabled={disabled}
          placeholder={exercise.placeholder ?? "Type here…"}
          onChange={(e) => onChange(e.target.value)}
          className={[
            "mt-1 w-full rounded-xl border px-3 py-2 text-sm font-extrabold outline-none transition",
            "border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400",
            "dark:border-white/10 dark:bg-white/[0.06] dark:text-white/90 dark:placeholder:text-white/40",
            disabled ? "opacity-70" : "focus:border-neutral-300 dark:focus:border-white/20",
          ].join(" ")}
        />

        {checked && ok === false && reviewCorrectText ? (
          <div className="mt-3 ui-soft p-3">
            <div className="text-xs font-extrabold text-neutral-600 dark:text-white/70">Correct</div>
            <div className="mt-1 text-sm font-black text-neutral-900 dark:text-white/90">
              {reviewCorrectText}
            </div>
          </div>
        ) : null}

        {exercise.hint ? (
          <div className="mt-3 text-xs font-extrabold text-neutral-500 dark:text-white/60">
            Hint: <span className="font-bold text-neutral-700 dark:text-white/70">{exercise.hint}</span>
          </div>
        ) : null}
      </div>
    </div>
  );

}
