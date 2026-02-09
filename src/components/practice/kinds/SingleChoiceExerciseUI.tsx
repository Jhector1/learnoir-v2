// src/components/practice/kinds/SingleChoiceExerciseUI.tsx
"use client";

import React, { useMemo } from "react";
import type { Exercise } from "@/lib/practice/types";
import MathMarkdown from "@/components/math/MathMarkdown";

type Opt = { id: string; text: string };

function normalizeOptions(ex: any): Opt[] {
  const raw = ex?.options ?? ex?.choices ?? [];
  return (Array.isArray(raw) ? raw : []).map((o: any, i: number) => ({
    id: String(o?.id ?? o?.optionId ?? o?.value ?? o?.key ?? i),
    text: String(
      o?.text ??
        o?.label ??
        o?.content ??
        o?.latex ??
        o?.contentLatex ??
        "",
    ),
  }));
}

export default function SingleChoiceExerciseUI({
  exercise,
  value,
  onChange,
  disabled,

  checked = false,
  ok = null,

  // ✅ NEW: during review, pass the correct option id to highlight in-place
  reviewCorrectId = null,
}: {
  exercise: Exercise;
  value: string;
  onChange: (id: string) => void;
  disabled: boolean;

  checked?: boolean;
  ok?: boolean | null;

  reviewCorrectId?: string | null;
}) {
  const options = useMemo(() => normalizeOptions(exercise as any), [exercise]);

  return (
    <div className="grid gap-2">
      <div className="ui-sketch-label">Choose one</div>

      <div className="grid gap-2">
        {options.map((o) => {
          const selected = value === o.id;

          const hasReviewCorrect =
            typeof reviewCorrectId === "string" && reviewCorrectId.length > 0;
          const isCorrect = hasReviewCorrect ? reviewCorrectId === o.id : false;

          // ✅ Theme-aware tones (light defaults + dark overrides)
          const tone = !checked
            ? selected
              ? "border-sky-300/40 bg-sky-300/10"
              : "border-neutral-200 bg-white hover:bg-neutral-50 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
            : hasReviewCorrect
              ? isCorrect
                ? "border-emerald-300/40 bg-emerald-300/10"
                : selected && !isCorrect
                  ? "border-rose-300/40 bg-rose-300/10"
                  : "border-neutral-200 bg-white dark:border-white/10 dark:bg-white/[0.03]"
              : selected
                ? ok === true
                  ? "border-emerald-300/40 bg-emerald-300/10"
                  : ok === false
                    ? "border-rose-300/40 bg-rose-300/10"
                    : "border-sky-300/40 bg-sky-300/10"
                : "border-neutral-200 bg-white dark:border-white/10 dark:bg-white/[0.03]";

          const dotTone = !checked
            ? selected
              ? "border-sky-300/60 bg-sky-300/40"
              : "border-neutral-300 bg-neutral-200/60 dark:border-white/20 dark:bg-black/20"
            : hasReviewCorrect
              ? isCorrect
                ? "border-emerald-300/60 bg-emerald-300/40"
                : selected && !isCorrect
                  ? "border-rose-300/60 bg-rose-300/40"
                  : "border-neutral-300 bg-neutral-200/60 dark:border-white/20 dark:bg-black/20"
              : selected
                ? ok === true
                  ? "border-emerald-300/60 bg-emerald-300/40"
                  : ok === false
                    ? "border-rose-300/60 bg-rose-300/40"
                    : "border-sky-300/60 bg-sky-300/40"
                : "border-neutral-300 bg-neutral-200/60 dark:border-white/20 dark:bg-black/20";

          return (
            <button
              key={o.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(o.id)}
              className={[
                "rounded-2xl border p-3 text-left transition",
                tone,
                "disabled:opacity-60 disabled:cursor-not-allowed",
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                <div
                  className={["mt-0.5 h-4 w-4 rounded-full border", dotTone].join(
                    " ",
                  )}
                />
                <div className="min-w-0 text-sm text-neutral-900 dark:text-white/90">
                  <MathMarkdown inline content={o.text} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="text-[11px] text-neutral-500 dark:text-white/45">
        Stored as <span className="font-mono">optionId</span> for submit.
      </div>
    </div>
  );
}
