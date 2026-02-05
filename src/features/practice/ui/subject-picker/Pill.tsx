"use client";
import React from "react";

export default function Pill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "good" | "warn";
}) {
  const cls =
    tone === "good"
      ? "border-emerald-400/30 bg-emerald-300/10 text-emerald-100"
      : tone === "warn"
        ? "border-amber-400/30 bg-amber-300/10 text-amber-100"
        : "border-white/10 bg-white/[0.04] text-white/80";

  return (
    <span className={["inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-extrabold", cls].join(" ")}>
      {children}
    </span>
  );
}
