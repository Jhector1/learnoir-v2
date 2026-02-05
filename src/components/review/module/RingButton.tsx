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
        "mt-4 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2",
        "text-xs font-extrabold transition text-center hover:bg-white/15",
        "disabled:opacity-50 disabled:cursor-not-allowed",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(rgba(16,185,129,0.9) ${deg}deg, rgba(255,255,255,0.14) 0deg)`,
          }}
        >
          <span className="h-7 w-7 inline-grid place-items-center rounded-full bg-[#0b0d12] border border-white/10">
            <span className="text-[7px] leading-none text-white tabular-nums">
              {Math.round(pct * 100)}%
            </span>
          </span>
        </span>

        <span className="min-w-0 text-left">
          <div className="truncate">{props.label}</div>
          {props.sublabel ? (
            <div className="text-[11px] font-black text-white/60 truncate">
              {props.sublabel}
            </div>
          ) : null}
        </span>
      </div>
    </button>
  );
}
