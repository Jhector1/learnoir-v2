"use client";

import React, { useMemo, useState } from "react";
import MathMarkdown from "@/components/math/MathMarkdown";

function pyRepr(s: string) {
  // simple representation (not perfect, but good enough for teaching)
  return `"${s.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

function simulatePrint(parts: string[], sep: string, end: string) {
  const line = parts.join(sep) + end; // like Python print
  return line;
}

export default function PrintOptionsSketch() {
  const [parts, setParts] = useState<string[]>(["Today", "is", "Monday"]);
  const [sep, setSep] = useState(" ");
  const [end, setEnd] = useState("\\n");

  const rendered = useMemo(() => {
    const endReal = end === "\\n" ? "\n" : end === "\\t" ? "\t" : end;
    return simulatePrint(parts, sep, endReal);
  }, [parts, sep, end]);

  const code = useMemo(() => {
    const sepArg = sep === " " ? "" : `, sep=${pyRepr(sep)}`;
    const endArg = end === "\\n" ? "" : `, end=${pyRepr(end === "\\t" ? "\t" : end)}`;
    const args = parts.map(pyRepr).join(", ");
    return `print(${args}${sepArg}${endArg})`;
  }, [parts, sep, end]);

  const hud = useMemo(() => {
    const endLabel = end === "\\n" ? "newline" : end === "\\t" ? "tab" : "custom text";
    return String.raw`
**print() options**

Python prints values separated by **sep** and finishes with **end**.

- \(\texttt{sep}\): how values are joined  
- \(\texttt{end}\): what gets appended at the end (**newline** by default)

**Current code**
\[
\texttt{${code.replaceAll("\\", "\\\\")}}
\]

Try:
- set \(\texttt{sep="..."}\) to see glue change
- set \(\texttt{end=""}\) to keep printing on the same line
- set \(\texttt{end="!!"}\) for emphasis
`.trim();
  }, [code]);

  return (
    <div className="w-full">
      <div className="grid gap-3 md:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="grid gap-3">
            <div className="text-xs font-extrabold text-white/70">Values to print</div>

            <div className="flex flex-wrap gap-2">
              {parts.map((p, idx) => (
                <input
                  key={idx}
                  value={p}
                  onChange={(e) =>
                    setParts((prev) => prev.map((x, i) => (i === idx ? e.target.value : x)))
                  }
                  className="w-[160px] rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/90 outline-none"
                />
              ))}
              <button
                type="button"
                onClick={() => setParts((p) => [...p, "beans"])}
                className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-extrabold text-white/80 hover:bg-white/15"
              >
                + add value
              </button>
              {parts.length > 1 ? (
                <button
                  type="button"
                  onClick={() => setParts((p) => p.slice(0, -1))}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/70 hover:bg-white/10"
                >
                  remove last
                </button>
              ) : null}
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <div className="text-xs font-extrabold text-white/70">sep</div>
                <input
                  value={sep}
                  onChange={(e) => setSep(e.target.value)}
                  placeholder=" "
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/90 outline-none"
                />
                <div className="mt-1 text-[11px] text-white/50">Try: space, "...", "-", " | "</div>
              </div>

              <div>
                <div className="text-xs font-extrabold text-white/70">end</div>
                <input
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  placeholder="\\n"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/90 outline-none"
                />
                <div className="mt-1 text-[11px] text-white/50">Use \n, "", "!!", or any text</div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
              <div className="text-xs font-extrabold text-white/70">Simulated output</div>
              <pre className="mt-2 whitespace-pre-wrap text-xs text-white/85">
                {rendered || "\u00A0"}
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
