"use client";

import React, { useMemo, useState } from "react";
import MathMarkdown from "@/components/markdown/MathMarkdown";

type Subject = "Mwen" | "Ou" | "Li" | "Nou" | "Yo";
type PredType = "adjective" | "noun" | "location";
type Adj = "byen" | "fatige" | "kontan";
type Noun = "etidyan" | "pwofesè" | "doktè";
type Loc = "lakay" | "lekòl" | "isit";

function build(s: Subject, t: PredType, adj: Adj, noun: Noun, loc: Loc) {
  if (t === "adjective") return `${s} ${adj}.`; // no copula commonly
  if (t === "noun") return `${s} se ${noun}.`; // se + noun
  return `${s} ${loc}.`; // simple location phrase
}

export default function HCSentencesSketch() {
  const [subj, setSubj] = useState<Subject>("Mwen");
  const [predType, setPredType] = useState<PredType>("adjective");
  const [adj, setAdj] = useState<Adj>("byen");
  const [noun, setNoun] = useState<Noun>("etidyan");
  const [loc, setLoc] = useState<Loc>("lakay");

  const sentence = useMemo(() => build(subj, predType, adj, noun, loc), [subj, predType, adj, noun, loc]);

  const note = useMemo(() => {
    if (predType === "adjective")
      return "Adjectives often work without “to be”: “Li byen.”";
    if (predType === "noun")
      return "Use “se” before a noun: “Li se pwofesè.”";
    return "Locations can be short: “Nou lakay.” (context helps)";
  }, [predType]);

  const hud = useMemo(() => {
    return String.raw`
**Sentence building**

- **SVO** is common (Subject Verb Object)
- With many **adjectives**, Creole often **doesn't need** “to be”
- Use **se** before a **noun** identity

Examples:
- **Li byen.**
- **Li se pwofesè.**
`.trim();
  }, []);

  return (
    <div className="w-full">
      <div className="grid gap-3 md:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="grid gap-3 md:grid-cols-4">
            <div>
              <div className="text-xs font-extrabold text-white/70">Subject</div>
              <select
                value={subj}
                onChange={(e) => setSubj(e.target.value as any)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/90 outline-none"
              >
                {(["Mwen", "Ou", "Li", "Nou", "Yo"] as Subject[]).map((x) => (
                  <option key={x} value={x}>{x}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-xs font-extrabold text-white/70">Predicate type</div>
              <select
                value={predType}
                onChange={(e) => setPredType(e.target.value as any)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/90 outline-none"
              >
                <option value="adjective">Adjective</option>
                <option value="noun">Noun (identity)</option>
                <option value="location">Location</option>
              </select>
            </div>

            <div>
              <div className="text-xs font-extrabold text-white/70">Adjective</div>
              <select
                value={adj}
                onChange={(e) => setAdj(e.target.value as any)}
                disabled={predType !== "adjective"}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/90 outline-none disabled:opacity-50"
              >
                {(["byen", "fatige", "kontan"] as Adj[]).map((x) => (
                  <option key={x} value={x}>{x}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-xs font-extrabold text-white/70">Noun / Location</div>
              <select
                value={predType === "noun" ? noun : loc}
                onChange={(e) =>
                  predType === "noun"
                    ? setNoun(e.target.value as any)
                    : setLoc(e.target.value as any)
                }
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/90 outline-none"
              >
                {predType === "noun"
                  ? (["etidyan", "pwofesè", "doktè"] as Noun[]).map((x) => (
                      <option key={x} value={x}>{x}</option>
                    ))
                  : (["lakay", "lekòl", "isit"] as Loc[]).map((x) => (
                      <option key={x} value={x}>{x}</option>
                    ))}
              </select>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
              <div className="text-xs font-extrabold text-white/70">Your sentence</div>
              <div className="mt-2 text-sm font-black text-white/90">{sentence}</div>
              <div className="mt-2 text-xs text-white/60">{note}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <div className="text-xs font-extrabold text-white/70">Try these patterns</div>
              <pre className="mt-2 whitespace-pre-wrap text-xs text-white/85">
{`Li byen.
Li se etidyan.
Nou lakay.`}
              </pre>
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
