"use client";

import React, { useMemo, useState } from "react";
import MathMarkdown from "@/components/math/MathMarkdown";

export default function VariablesSketch() {
  const [name, setName] = useState("Liverpool");
  const [score, setScore] = useState<number>(4);

  const [name2, setName2] = useState("Chelsea");
  const [score2, setScore2] = useState<number>(3);

  const output = useMemo(() => {
    return `${name} versus ${name2}\nFinal score: ${score} to ${score2}\n`;
  }, [name, name2, score, score2]);

  const hud = useMemo(() => {
    return String.raw`
**Variables + assignment**

Assignment uses **=**:

\[
\texttt{team1 = "Liverpool"}
\]
\[
\texttt{score1 = 4}
\]

Variables are names that point to values in memory.
When you update a variable, future prints use the new value.
`.trim();
  }, []);

  return (
    <div className="w-full">
      <div className="grid gap-3 md:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <div className="text-xs font-extrabold text-white/70">Team 1</div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/90 outline-none"
              />
              <div className="mt-3 text-xs font-extrabold text-white/70">Score 1</div>
              <input
                type="number"
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/90 outline-none"
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <div className="text-xs font-extrabold text-white/70">Team 2</div>
              <input
                value={name2}
                onChange={(e) => setName2(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/90 outline-none"
              />
              <div className="mt-3 text-xs font-extrabold text-white/70">Score 2</div>
              <input
                type="number"
                value={score2}
                onChange={(e) => setScore2(Number(e.target.value))}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/90 outline-none"
              />
            </div>

            <div className="md:col-span-2 rounded-2xl border border-white/10 bg-black/30 p-3">
              <div className="text-xs font-extrabold text-white/70">Output</div>
              <pre className="mt-2 whitespace-pre-wrap text-xs text-white/85">{output}</pre>
            </div>

            <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <div className="text-xs font-extrabold text-white/70">Python code</div>
              <pre className="mt-2 whitespace-pre-wrap text-xs text-white/80">{`team1 = "${name.replaceAll('"', '\\"')}"
team2 = "${name2.replaceAll('"', '\\"')}"
score1 = ${score}
score2 = ${score2}

print(team1, "versus", team2)
print("Final score:", score1, "to", score2)`}</pre>
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
