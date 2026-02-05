"use client";
import React from "react";

export default function CollapsibleSection({
  title,
  subtitle,
  right,
  children,
  defaultOpen = false,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <section className="mt-6 first:mt-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:p-5 text-left hover:bg-white/[0.06] transition"
        aria-expanded={open}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="text-lg font-black tracking-tight text-white/90">{title}</div>
              <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[11px] font-extrabold text-white/70">
                {open ? "Hide" : "Show"}
              </span>
            </div>
            {!!subtitle && <div className="mt-1 text-sm text-white/70">{subtitle}</div>}
          </div>

          {!!right && (
            <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
              {right}
            </div>
          )}
        </div>
      </button>

      {open && <div className="mt-3">{children}</div>}
    </section>
  );
}
