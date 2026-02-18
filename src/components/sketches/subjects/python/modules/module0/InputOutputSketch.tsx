// InputOutputSketch.tsx
"use client";

import React, { useMemo, useState } from "react";
import MathMarkdown from "@/components/markdown/MathMarkdown";

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
        <div className="ui-sketch-panel">
          <div className="grid gap-3">
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <div className="ui-sketch-label">Prompt</div>
                <input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="ui-sketch-input"
                />
              </div>

              <div>
                <div className="ui-sketch-label">User input</div>
                <input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="ui-sketch-input"
                />
              </div>
            </div>

            <div className="ui-sketch-codeblock">
              <div className="ui-sketch-label">Simulated run</div>
              <pre className="ui-sketch-code">{transcript}</pre>
            </div>

            <div className="ui-sketch-codeblock">
              <div className="ui-sketch-label">Python code</div>
              <pre className="ui-sketch-code">
                {`name = input("${prompt.replaceAll('"', '\\"')}")
print("You entered:", name)`}
              </pre>
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
