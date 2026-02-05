"use client";

import React, { useMemo, useState } from "react";
import MathMarkdown from "@/components/math/MathMarkdown";

type Pron = "mwen" | "ou" | "li" | "nou" | "yo";
type Verb = "renmen" | "gen" | "wè" | "tande";
type Obj = "diri" | "liv" | "mizik" | "pwofesè a";

const EN: Record<Pron, string> = {
  mwen: "I / me",
  ou: "you",
  li: "he / she / it",
  nou: "we / us",
  yo: "they / them",
};

const V_EN: Record<Verb, string> = {
  renmen: "like/love",
  gen: "have",
  wè: "see",
  tande: "hear",
};

export default function HCPronounsSketch() {
  const [p, setP] = useState<Pron>("mwen");
  const [v, setV] = useState<Verb>("renmen");
  const [o, setO] = useState<Obj>("diri");

  const sentence = useMemo(() => `${p} ${v} ${o}.`, [p, v, o]);
  const english = useMemo(() => {
    const subj =
      p === "mwen" ? "I" : p === "ou" ? "You" : p === "li" ? "He/She" : p === "nou" ? "We" : "They";
    return `${subj} ${V_EN[v]} ${o}.`;
  }, [p, v, o]);

  const hud = useMemo(() => {
    return String.raw`
**Pronouns**

- **mwen**: I / me  
- **ou**: you  
- **li**: he/she/it  
- **nou**: we/us  
- **yo**: they/them  

Try swapping **li** and notice English depends on context.
`.trim();
  }, []);

  return (
    <div className="w-full">
      <div className="grid gap-3 md:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <div className="text-xs font-extrabold text-white/70">Pronoun</div>
              <select
                value={p}
                onChange={(e) => setP(e.target.value as any)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/90 outline-none"
              >
                {(["mwen", "ou", "li", "nou", "yo"] as Pron[]).map((x) => (
                  <option key={x} value={x}>
                    {x} — {EN[x]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-xs font-extrabold text-white/70">Verb</div>
              <select
                value={v}
                onChange={(e) => setV(e.target.value as any)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/90 outline-none"
              >
                {(["renmen", "gen", "wè", "tande"] as Verb[]).map((x) => (
                  <option key={x} value={x}>
                    {x} — {V_EN[x]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-xs font-extrabold text-white/70">Object</div>
              <select
                value={o}
                onChange={(e) => setO(e.target.value as any)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/90 outline-none"
              >
                {(["diri", "liv", "mizik", "pwofesè a"] as Obj[]).map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
              <div className="text-xs font-extrabold text-white/70">Haitian Creole</div>
              <div className="mt-2 text-sm font-black text-white/90">{sentence}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <div className="text-xs font-extrabold text-white/70">English meaning</div>
              <div className="mt-2 text-sm font-black text-white/90">{english}</div>
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
