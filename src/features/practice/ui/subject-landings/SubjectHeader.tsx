"use client";
import React from "react";

export default function SubjectHeader({ subject, onBack }: { subject: string; onBack: () => void }) {
  return (
    <div className="mx-auto max-w-5xl mb-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:p-5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-extrabold text-white/60">Practice</div>
          <div className="mt-1 text-lg font-black tracking-tight text-white/90 truncate">Subject: {subject}</div>
          <div className="mt-1 text-sm text-white/70">You can switch subjects anytime.</div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs font-extrabold text-white/80 hover:bg-black/30 transition"
        >
          ← Change subject
        </button>
      </div>
    </div>
  );
}
