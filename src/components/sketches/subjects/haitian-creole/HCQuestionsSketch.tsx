"use client";

import React, { useMemo, useState } from "react";
import MathMarkdown from "@/components/markdown/MathMarkdown";

type QW = "Kisa" | "Kiyès" | "Ki kote" | "Kilè" | "Kijan" | "Poukisa";

const MAP: Record<QW, string> = {
  Kisa: "What",
  "Kiyès": "Who",
  "Ki kote": "Where",
  "Kilè": "When",
  "Kijan": "How",
  "Poukisa": "Why",
};

export default function HCQuestionsSketch() {
  const [qw, setQw] = useState<QW>("Kisa");
  const [rest, setRest] = useState("ou ap fè?");
  const [answer, setAnswer] = useState("Mwen ap aprann Kreyòl.");

  const question = useMemo(() => `${qw} ${rest}`.trim(), [qw, rest]);
  const english = useMemo(() => `${MAP[qw]} …`.trim(), [qw]);

  const hud = useMemo(() => {
    return String.raw`
**Question words**

- **Kisa** (what)
- **Kiyès** (who)
- **Ki kote** (where)
- **Kilè** (when)
- **Kijan** (how)
- **Poukisa** (why)

Build a question, then write a short answer.
`.trim();
  }, []);

  return (
    <div className="w-full">
      <div className="grid gap-3 md:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <div className="text-xs font-extrabold text-white/70">Question word</div>
              <select
                value={qw}
                onChange={(e) => setQw(e.target.value as any)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/90 outline-none"
              >
                {(Object.keys(MAP) as QW[]).map((k) => (
                  <option key={k} value={k}>
                    {k} — {MAP[k]}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <div className="text-xs font-extrabold text-white/70">Rest of question</div>
              <input
                value={rest}
                onChange={(e) => setRest(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/90 outline-none"
              />
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
              <div className="text-xs font-extrabold text-white/70">Question</div>
              <div className="mt-2 text-sm font-black text-white/90">{question}</div>
              <div className="mt-2 text-xs text-white/60">English: {english}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <div className="text-xs font-extrabold text-white/70">Answer (practice)</div>
              <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/90 outline-none"
              />
              <div className="mt-2 text-xs text-white/60">
                Try short answers first, then expand.
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <MathMarkdown className="text-sm text-white/80 [&_.katex]:text-white/90" content={hud} />
        </div>
      </div>
    </div>
  );
}
