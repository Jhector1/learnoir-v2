// PrintOptionsSketch.tsx
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
        <div className="ui-sketch-panel">
          <div className="grid gap-3">
            <div className="ui-sketch-label">Values to print</div>

            <div className="flex flex-wrap gap-2">
              {parts.map((p, idx) => (
                <input
                  key={idx}
                  value={p}
                  onChange={(e) =>
                    setParts((prev) => prev.map((x, i) => (i === idx ? e.target.value : x)))
                  }
                  className="ui-sketch-input w-[160px]"
                />
              ))}
              <button
                type="button"
                onClick={() => setParts((p) => [...p, "beans"])}
                className="ui-sketch-chip ui-sketch-chip--idle px-3 py-2"
              >
                + add value
              </button>
              {parts.length > 1 ? (
                <button
                  type="button"
                  onClick={() => setParts((p) => p.slice(0, -1))}
                  className="ui-sketch-chip ui-sketch-chip--idle px-3 py-2"
                >
                  remove last
                </button>
              ) : null}
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <div className="ui-sketch-label">sep</div>
                <input
                  value={sep}
                  onChange={(e) => setSep(e.target.value)}
                  placeholder=" "
                  className="ui-sketch-input"
                />
                <div className="mt-1 text-[11px] text-neutral-500 dark:text-white/50">
                  Try: space, "...", "-", " | "
                </div>
              </div>

              <div>
                <div className="ui-sketch-label">end</div>
                <input
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  placeholder="\\n"
                  className="ui-sketch-input"
                />
                <div className="mt-1 text-[11px] text-neutral-500 dark:text-white/50">
                  Use \n, "", "!!", or any text
                </div>
              </div>
            </div>

            <div className="ui-sketch-codeblock">
              <div className="ui-sketch-label">Simulated output</div>
              <pre className="ui-sketch-code">{rendered || "\u00A0"}</pre>
            </div>
          </div>
        </div>

        <div className="ui-sketch-panel">
          <MathMarkdown className="ui-math" content={hud} />
        </div>
      </div>
    </div>
  );
}
