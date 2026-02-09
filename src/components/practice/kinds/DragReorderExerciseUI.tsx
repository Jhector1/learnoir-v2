// src/components/practice/kinds/DragReorderExerciseUI.tsx
"use client";

import React, { useMemo, useState } from "react";
import MathMarkdown from "@/components/math/MathMarkdown";

type Token = { id: string; text: string };

function move<T>(arr: T[], from: number, to: number) {
  const copy = arr.slice();
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

export default function DragReorderExerciseUI({
  exercise,
  tokenIds,
  onChange,
  disabled,
  checked,
  ok,
  reviewCorrectTokenIds = null,
}: {
  exercise: { title: string; prompt: string; tokens: Token[]; hint?: string };
  tokenIds: string[];
  onChange: (ids: string[]) => void;
  disabled: boolean;
  checked: boolean;
  ok: boolean | null;
  reviewCorrectTokenIds?: string[] | null;
}) {
  const tokensById = useMemo(() => {
    const m = new Map<string, Token>();
    for (const t of exercise.tokens ?? []) m.set(String(t.id), t);
    return m;
  }, [exercise.tokens]);

  const defaultOrder = useMemo(
    () => (exercise.tokens ?? []).map((t) => String(t.id)),
    [exercise.tokens],
  );

  const order = useMemo(() => {
    const ids = Array.isArray(tokenIds) && tokenIds.length ? tokenIds.map(String) : defaultOrder;
    // keep only known ids (and preserve order)
    const filtered = ids.filter((id) => tokensById.has(id));
    // add any missing ids at end
    for (const id of defaultOrder) if (!filtered.includes(id)) filtered.push(id);
    return filtered;
  }, [tokenIds, defaultOrder, tokensById]);

  const [draggingId, setDraggingId] = useState<string | null>(null);

//   const border =
//     checked && ok === true
//       ? "border-emerald-400/30"
//       : checked && ok === false
//         ? "border-rose-400/30"
//         : "border-white/10";

//   const bg =
//     checked && ok === true
//       ? "bg-emerald-300/10"
//       : checked && ok === false
//         ? "bg-rose-300/10"
//         : "bg-white/[0.04]";

  function apply(next: string[]) {
    if (disabled) return;
    onChange(next);
  }

 // ✅ only className strings changed (logic/structure unchanged)

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
          <div className="text-sm font-black text-neutral-900 dark:text-white/90">
            {exercise.title}
          </div>
          <MathMarkdown
            className="mt-2 text-sm text-neutral-700 dark:text-white/80 [&_.katex]:text-neutral-900 dark:[&_.katex]:text-white/90"
            content={String(exercise.prompt ?? "")}
          />
        </div>

        {checked ? (
          <div
            className={[
              "ui-pill",
              ok === true ? "ui-pill--good" : "border-rose-300/30 bg-rose-300/10 text-rose-900 dark:text-rose-100",
            ].join(" ")}
          >
            {ok === true ? "Correct" : "Try again"}
          </div>
        ) : null}
      </div>

      <div className="mt-4 ui-soft p-3">
        <div className="text-xs font-extrabold text-neutral-600 dark:text-white/70">
          Drag to reorder (or use arrows)
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {order.map((id, idx) => {
            const t = tokensById.get(id);
            if (!t) return null;

            const isDragging = draggingId === id;

            return (
              <div
                key={id}
                draggable={!disabled}
                onDragStart={() => setDraggingId(id)}
                onDragEnd={() => setDraggingId(null)}
                onDragOver={(e) => {
                  if (disabled) return;
                  e.preventDefault();
                }}
                onDrop={() => {
                  if (disabled) return;
                  if (!draggingId || draggingId === id) return;
                  const from = order.indexOf(draggingId);
                  const to = order.indexOf(id);
                  if (from < 0 || to < 0) return;
                  apply(move(order, from, to));
                }}
                className={[
                  "group flex items-center gap-2 rounded-xl border px-3 py-2",
                  "bg-white text-xs font-extrabold text-neutral-900",
                  "border-neutral-200 hover:bg-neutral-50",
                  "dark:bg-white/[0.06] dark:text-white/90 dark:border-white/10 dark:hover:bg-white/[0.10]",
                  disabled ? "opacity-70" : "",
                  isDragging ? "opacity-60" : "",
                ].join(" ")}
                title={disabled ? "" : "Drag me"}
              >
                <span className="text-neutral-500 dark:text-white/60">≡</span>
                <span>{t.text}</span>

                <div className="ml-1 flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                  <button
                    type="button"
                    disabled={disabled || idx === 0}
                    onClick={() => apply(move(order, idx, idx - 1))}
                    className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-[10px] font-black text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/80 dark:hover:bg-white/[0.10]"
                    aria-label="Move left"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    disabled={disabled || idx === order.length - 1}
                    onClick={() => apply(move(order, idx, idx + 1))}
                    className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-[10px] font-black text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/80 dark:hover:bg-white/[0.10]"
                    aria-label="Move right"
                  >
                    →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {checked && ok === false && Array.isArray(reviewCorrectTokenIds) ? (
        <div className="mt-3 ui-soft p-3">
          <div className="text-xs font-extrabold text-neutral-600 dark:text-white/70">
            Correct order
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {reviewCorrectTokenIds
              .map((id) => tokensById.get(String(id)))
              .filter(Boolean)
              .map((t) => (
                <div
                  key={t!.id}
                  className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-extrabold text-neutral-800 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/85"
                >
                  {t!.text}
                </div>
              ))}
          </div>
        </div>
      ) : null}

      {exercise.hint ? (
        <div className="mt-3 text-xs font-extrabold text-neutral-500 dark:text-white/60">
          Hint: <span className="font-bold text-neutral-700 dark:text-white/70">{exercise.hint}</span>
        </div>
      ) : null}
    </div>
  );

}
