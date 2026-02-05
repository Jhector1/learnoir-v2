// src/components/review/quiz/components/QuizLocalCard.tsx
"use client";

import React from "react";
import type { ReviewQuestion } from "@/lib/review/types";
import MathMarkdown from "@/components/math/MathMarkdown";
import { normalizeMath } from "@/lib/markdown/normalizeMath";

export default function QuizLocalCard(props: {
  q: Exclude<ReviewQuestion, { kind: "practice" }>;
  unlocked: boolean;
  isCompleted: boolean;
  locked: boolean;

  value: any;
  checked: boolean;
  ok: boolean | null;

  onPick: (val: any) => void;
  onCheck: () => void;
}) {
  const { q, unlocked, isCompleted, locked } = props;

  return (
    <div
      className={[
        "rounded-xl border border-white/10 bg-white/[0.03] p-3",
        !unlocked ? "opacity-70" : "",
      ].join(" ")}
    >
      <MathMarkdown
        className="
          text-sm text-white/80
          [&_.katex]:text-white/90
          [&_.katex-display]:overflow-x-auto
          [&_.katex-display]:py-2
        "
        content={normalizeMath(String((q as any).prompt ?? ""))}
      />

      {!unlocked ? (
        <div className="mt-2 text-xs font-extrabold text-white/50">
          Answer the previous question correctly to unlock this one.
        </div>
      ) : null}

      {q.kind === "mcq" ? (
        <div className="mt-2 grid gap-2">
          {q.choices.map((c) => (
            <button
              key={c.id}
              type="button"
              disabled={!unlocked || isCompleted || locked}
              onClick={() => unlocked && !isCompleted && !locked && props.onPick(c.id)}
              className={[
                "text-left rounded-lg border px-3 py-2 text-xs font-extrabold transition",
                props.value === c.id
                  ? "border-sky-300/30 bg-sky-300/10"
                  : "border-white/10 bg-white/5 hover:bg-white/10",
                !unlocked || isCompleted || locked
                  ? "cursor-not-allowed opacity-60 hover:bg-white/5"
                  : "",
              ].join(" ")}
            >
              <MathMarkdown
                inline
                className="text-xs font-extrabold text-white/90 [&_.katex]:text-white/90"
                content={normalizeMath(c.label)}
              />
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            disabled={!unlocked || isCompleted || locked}
            className={[
              "w-40 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/90 outline-none",
              !unlocked || isCompleted || locked
                ? "cursor-not-allowed opacity-60"
                : "",
            ].join(" ")}
            placeholder="Enter a number"
            value={props.value ?? ""}
            onChange={(e) =>
              unlocked && !isCompleted && !locked && props.onPick(e.target.value)
            }
          />
          {(q as any).tolerance ? (
            <div className="text-xs text-white/50">± {(q as any).tolerance}</div>
          ) : null}
        </div>
      )}

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <button
          type="button"
          disabled={!unlocked || isCompleted || locked}
          onClick={() => unlocked && !isCompleted && !locked && props.onCheck()}
          className={[
            "shrink-0 rounded-xl border px-3 py-2 text-xs font-extrabold transition",
            !unlocked || isCompleted || locked
              ? "cursor-not-allowed border-white/10 bg-white/5 text-white/40"
              : "border-white/10 bg-white/10 text-white/80 hover:bg-white/15",
          ].join(" ")}
        >
          Check this question
        </button>

        <div className="text-xs font-extrabold text-white/60 sm:text-right">
          {props.checked ? (
            props.ok === true ? (
              <span className="text-emerald-300/80">✓ Correct</span>
            ) : (
              <span className="text-rose-300/80">✕ Not correct</span>
            )
          ) : (
            <span className="text-white/50">Not checked yet</span>
          )}
        </div>
      </div>

      {props.checked && (q as any).explain ? (
        <div className="mt-2 rounded-lg border border-white/10 bg-black/30 p-2">
          <MathMarkdown
            className="text-xs text-white/70 [&_.katex]:text-white/90"
            content={normalizeMath(String((q as any).explain))}
          />
        </div>
      ) : null}
    </div>
  );
}
