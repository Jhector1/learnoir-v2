"use client";

import React, { useMemo, useState } from "react";
import MathMarkdown from "@/components/math/MathMarkdown";

function simulateIO(prompt: string, userInput: string) {
  // show the prompt, then the "typed" value, then program output
  // (not perfect terminal emulation, but super clear for students)
  return `${prompt}\n> ${userInput}\n\nYou entered: ${userInput}\n`;
}

export default function InputOutputSketch() {
  const [prompt, setPrompt] = useState("Please enter your name:");
  const [userInput, setUserInput] = useState("Sophia");

  const transcript = useMemo(() => simulateIO(prompt, userInput), [prompt, userInput]);

  const hud = useMemo(() => {
    return String.raw`
**input() + variables**

Typical pattern:

\[
\texttt{name = input("...")}
\]
\[
\texttt{print("You entered:", name)}
\]

- \(\texttt{input()}\) reads **one line** of text
- the value is stored in a **variable**
- later, \(\texttt{print()}\) can use that variable
`.trim();
  }, []);

  return (
    <div className="w-full">
      <div className="grid gap-3 md:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="grid gap-3">
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <div className="text-xs font-extrabold text-white/70">Prompt</div>
                <input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/90 outline-none"
                />
              </div>

              <div>
                <div className="text-xs font-extrabold text-white/70">User input</div>
                <input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/90 outline-none"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
              <div className="text-xs font-extrabold text-white/70">Simulated run</div>
              <pre className="mt-2 whitespace-pre-wrap text-xs text-white/85">{transcript}</pre>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <div className="text-xs font-extrabold text-white/70">Python code</div>
              <pre className="mt-2 whitespace-pre-wrap text-xs text-white/80">
                {`name = input("${prompt.replaceAll('"', '\\"')}")
print("You entered:", name)`}
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
