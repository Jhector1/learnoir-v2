// src/components/review/module/RingButton.tsx
"use client";

import React from "react";

export default function RingButton(props: {
  disabled?: boolean;
  onClick?: () => void;
  pct: number; // 0..1
  label: string;
  sublabel?: string;
}) {
  const pct = Math.max(0, Math.min(1, props.pct));
  const deg = pct * 360;

  return (
    <button
      type="button"
      disabled={props.disabled}
      onClick={props.onClick}
      className={[
        // theme-aware surface
        "mt-4 w-full rounded-xl border px-3 py-2",
        "border-neutral-200 bg-white hover:bg-neutral-50",
        "dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15",
        // text
        "text-xs font-extrabold text-neutral-900 dark:text-white/90",
        // behavior
        "text-center transition disabled:opacity-50 disabled:cursor-not-allowed",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-full"
          style={{
            // theme-aware ring track + fill
            background: `conic-gradient(rgba(16,185,129,0.9) ${deg}deg, rgba(0,0,0,0.10) 0deg)`,
          }}
        >
          <span className="inline-grid h-7 w-7 place-items-center rounded-full border border-neutral-200 bg-white dark:border-white/10 dark:bg-white/[0.06]">
            <span className="tabular-nums text-[7px] leading-none text-neutral-900 dark:text-white">
              {Math.round(pct * 100)}%
            </span>
          </span>
        </span>

        <span className="min-w-0 text-left">
          <div className="truncate">{props.label}</div>
          {props.sublabel ? (
            <div className="truncate text-[11px] font-black text-neutral-600 dark:text-white/60">
              {props.sublabel}
            </div>
          ) : null}
        </span>
      </div>
    </button>
  );
}
