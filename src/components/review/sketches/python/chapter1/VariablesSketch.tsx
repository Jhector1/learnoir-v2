// VariablesSketch.tsx
"use client";

import React, { useMemo, useState } from "react";
import MathMarkdown from "@/components/markdown/MathMarkdown";

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
        <div className="ui-sketch-panel">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="ui-sketch-codeblock">
              <div className="ui-sketch-label">Team 1</div>
              <input value={name} onChange={(e) => setName(e.target.value)} className="ui-sketch-input mt-2" />
              <div className="mt-3 ui-sketch-label">Score 1</div>
              <input
                type="number"
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="ui-sketch-input mt-2"
              />
            </div>

            <div className="ui-sketch-codeblock">
              <div className="ui-sketch-label">Team 2</div>
              <input value={name2} onChange={(e) => setName2(e.target.value)} className="ui-sketch-input mt-2" />
              <div className="mt-3 ui-sketch-label">Score 2</div>
              <input
                type="number"
                value={score2}
                onChange={(e) => setScore2(Number(e.target.value))}
                className="ui-sketch-input mt-2"
              />
            </div>

            <div className="md:col-span-2 ui-sketch-codeblock">
              <div className="ui-sketch-label">Output</div>
              <pre className="ui-sketch-code">{output}</pre>
            </div>

            <div className="md:col-span-2 ui-sketch-codeblock">
              <div className="ui-sketch-label">Python code</div>
              <pre className="ui-sketch-code">{`team1 = "${name.replaceAll('"', '\\"')}"
team2 = "${name2.replaceAll('"', '\\"')}"
score1 = ${score}
score2 = ${score2}

print(team1, "versus", team2)
print("Final score:", score1, "to", score2)`}</pre>
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
