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
  const border =
    checked && ok === true
      ? "border-emerald-400/30"
      : checked && ok === false
        ? "border-rose-400/30"
        : "border-white/10";

  const bg =
    checked && ok === true
      ? "bg-emerald-300/10"
      : checked && ok === false
        ? "bg-rose-300/10"
        : "bg-white/[0.04]";

  return (
    <div className={`rounded-2xl border ${border} ${bg} p-4`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-black text-white/90">{exercise.title}</div>
          <MathMarkdown
            className="mt-2 text-sm text-white/80 [&_.katex]:text-white/90"
            content={String(exercise.prompt ?? "")}
          />
        </div>

        {checked ? (
          <div
            className={[
              "rounded-full border px-3 py-1 text-[11px] font-extrabold",
              ok === true
                ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
                : "border-rose-300/30 bg-rose-300/10 text-rose-100",
            ].join(" ")}
          >
            {ok === true ? "Correct" : "Try again"}
          </div>
        ) : null}
      </div>

      <div className="mt-4">
        <div className="text-xs font-extrabold text-white/70">Your answer</div>
        <input
          value={value ?? ""}
          disabled={disabled}
          placeholder={exercise.placeholder ?? "Type here…"}
          onChange={(e) => onChange(e.target.value)}
          className={[
            "mt-1 w-full rounded-xl border px-3 py-2 text-sm font-extrabold outline-none",
            "border-white/10 bg-black/30 text-white/90 placeholder:text-white/40",
            disabled ? "opacity-70" : "focus:border-white/20",
          ].join(" ")}
        />

        {checked && ok === false && reviewCorrectText ? (
          <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3">
            <div className="text-xs font-extrabold text-white/70">Correct</div>
            <div className="mt-1 text-sm font-black text-white/90">
              {reviewCorrectText}
            </div>
          </div>
        ) : null}

        {exercise.hint ? (
          <div className="mt-3 text-xs font-extrabold text-white/60">
            Hint: <span className="font-bold text-white/70">{exercise.hint}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
