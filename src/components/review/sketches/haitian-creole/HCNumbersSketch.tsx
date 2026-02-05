"use client";

import React, { useMemo, useState } from "react";
import MathMarkdown from "@/components/math/MathMarkdown";

const BASE: Record<number, string> = {
  0: "zewo",
  1: "youn",
  2: "de",
  3: "twa",
  4: "kat",
  5: "senk",
  6: "sis",
  7: "sèt",
  8: "uit",
  9: "nèf",
  10: "dis",
  11: "onz",
  12: "douz",
  13: "trèz",
  14: "katòz",
  15: "kenz",
  16: "sèz",
  17: "disèt",
  18: "dizuit",
  19: "diznèf",
  20: "ven",
  30: "trant",
  40: "karant",
  50: "senkant",
  60: "swasant",
  70: "swasanndis",
  80: "katreven",
  90: "katreven dis",
  100: "san",
};

function toCreole(n: number): string {
  if (BASE[n]) return BASE[n];

  if (n < 20) return String(n);
  if (n < 100) {
    const tens = Math.floor(n / 10) * 10;
    const ones = n % 10;

    const t = BASE[tens] ?? String(tens);
    if (ones === 0) return t;
    const o = BASE[ones] ?? String(ones);
    return `${t} ${o}`;
  }
  return String(n);
}

export default function HCNumbersSketch() {
  const [n, setN] = useState(12);
  const creole = useMemo(() => toCreole(n), [n]);

  const hud = useMemo(() => {
    return String.raw`
**Numbers trainer**

Start with:
- 1–10 (core)
- 11–19 (special)
- tens (20, 30, 40, …)

Use the slider and try to say it out loud.
`.trim();
  }, []);

  return (
    <div className="w-full">
      <div className="grid gap-3 md:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-extrabold text-white/70">Number</div>
            <div className="text-sm font-black text-white/90 tabular-nums">{n}</div>
          </div>

          <input
            type="range"
            min={0}
            max={100}
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
            className="mt-3 w-full"
          />

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-3">
            <div className="text-xs font-extrabold text-white/70">Haitian Creole</div>
            <div className="mt-2 text-sm font-black text-white/90">{creole}</div>
          </div>

          <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <div className="text-xs font-extrabold text-white/70">Try these</div>
            <pre className="mt-2 whitespace-pre-wrap text-xs text-white/85">
{`1: youn
5: senk
10: dis
12: douz
20: ven
45: karant senk`}
            </pre>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <MathMarkdown className="text-sm text-white/80 [&_.katex]:text-white/90" content={hud} />
        </div>
      </div>
    </div>
  );
}
