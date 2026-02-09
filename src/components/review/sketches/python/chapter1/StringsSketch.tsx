// StringsSketch.tsx
"use client";

import React, { useMemo, useState } from "react";
import MathMarkdown from "@/components/math/MathMarkdown";

function safeStr(s: string) {
  return s.replaceAll("\n", " ").slice(0, 120);
}

export default function StringsSketch() {
  const [first, setFirst] = useState("Alan");
  const [last, setLast] = useState("Turing");

  const [mode, setMode] = useState<"len" | "concat">("len");

  const firstLen = first.length;
  const lastLen = last.length;

  const concat = `${safeStr(first)} likes ${safeStr(last)}`;
  const bang = `Your favorite color is ${safeStr(first)}!`;

  const hud = useMemo(() => {
    return String.raw`
**String basics**

A **string** is text in quotes:

- \(\texttt{"Hello"}\)
- \(\texttt{'Hello'}\)

**len()**
\[
\texttt{len("Hi Ali")} = 6
\]

**Concatenation** (joining strings)
\[
\texttt{"A" + "wake"} = \text{"Awake"}
\]

Tip: In Python, \(\texttt{print("Hi", name)}\) often feels cleaner than using \(+\).
`.trim();
  }, []);

  return (
    <div className="w-full">
      <div className="grid gap-3 md:grid-cols-[1fr_320px]">
        <div className="ui-sketch-panel">
          <div className="flex flex-wrap items-center gap-2">
            <div className="ui-sketch-label">Mode</div>
            {(["len", "concat"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={[
                  "ui-sketch-chip",
                  mode === m ? "ui-sketch-chip--active-emerald" : "ui-sketch-chip--idle",
                ].join(" ")}
              >
                {m === "len" ? "len()" : "concatenation"}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="ui-sketch-codeblock">
              <div className="ui-sketch-label">First string</div>
              <input value={first} onChange={(e) => setFirst(e.target.value)} className="ui-sketch-input mt-2" />
            </div>

            <div className="ui-sketch-codeblock">
              <div className="ui-sketch-label">Second string</div>
              <input value={last} onChange={(e) => setLast(e.target.value)} className="ui-sketch-input mt-2" />
            </div>

            <div className="md:col-span-2 ui-sketch-codeblock">
              <div className="ui-sketch-label">Result</div>
              {mode === "len" ? (
                <pre className="ui-sketch-code">{`Your first string is ${firstLen} characters long
Your second string is ${lastLen} characters long`}</pre>
              ) : (
                <pre className="ui-sketch-code">{`${concat}
${bang}`}</pre>
              )}
            </div>

            <div className="md:col-span-2 ui-sketch-codeblock">
              <div className="ui-sketch-label">Python code</div>
              <pre className="ui-sketch-code">
                {mode === "len"
                  ? `first = "${first.replaceAll('"', '\\"')}"
last  = "${last.replaceAll('"', '\\"')}"
print("Your first string is", len(first), "characters long")
print("Your second string is", len(last), "characters long")`
                  : `a = "${first.replaceAll('"', '\\"')}"
b = "${last.replaceAll('"', '\\"')}"
print(a + " likes " + b)
print("Your favorite color is " + a + "!")`}
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
