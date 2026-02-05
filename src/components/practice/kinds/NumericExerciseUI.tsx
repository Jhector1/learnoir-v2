"use client";

import React from "react";
import type { Exercise } from "@/lib/practice/types";

export default function NumericExerciseUI({
  exercise,
  value,
  onChange,
  disabled,

  // ✅ new
  checked,
  ok,
}: {
  exercise: Exercise;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;

  checked: boolean;          // current.submitted
  ok: boolean | null;        // current.result?.ok ?? null
}) {
  const placeholder = (exercise as any).placeholder ?? "Enter a number…";
  const hasDraft = String(value ?? "").trim().length > 0;

  const tone = checked
    ? ok === true
      ? "border-emerald-300/40 bg-emerald-300/10"
      : "border-rose-300/40 bg-rose-300/10"
    : hasDraft
      ? "border-sky-300/30 bg-sky-300/10"
      : "border-white/10 bg-black/20";

  const focusTone = checked
    ? ok === true
      ? "focus:border-emerald-400/60"
      : "focus:border-rose-400/60"
    : "focus:border-sky-300/60";

  return (
    <div className="grid gap-2">
      <div className="text-xs font-extrabold text-white/70">Your answer</div>

      <input
        className={[
          "h-11 w-full rounded-xl border px-3",
          "text-sm font-extrabold text-white/90 outline-none transition",
          tone,
          focusTone,
          "disabled:opacity-60 disabled:cursor-not-allowed",
        ].join(" ")}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />

      <div className="text-[11px] text-white/45">
        Tip: decimals are allowed unless the prompt says “integer”.
      </div>
    </div>
  );
}
