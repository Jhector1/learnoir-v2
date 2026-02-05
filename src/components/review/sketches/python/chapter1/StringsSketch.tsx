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
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-xs font-extrabold text-white/70">Mode</div>
            {(["len", "concat"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={[
                  "rounded-xl border px-3 py-1 text-xs font-extrabold transition",
                  mode === m
                    ? "border-emerald-300/30 bg-emerald-300/10 text-white/90"
                    : "border-white/10 bg-white/5 text-white/75 hover:bg-white/10",
                ].join(" ")}
              >
                {m === "len" ? "len()" : "concatenation"}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <div className="text-xs font-extrabold text-white/70">First string</div>
              <input
                value={first}
                onChange={(e) => setFirst(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/90 outline-none"
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <div className="text-xs font-extrabold text-white/70">Second string</div>
              <input
                value={last}
                onChange={(e) => setLast(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/90 outline-none"
              />
            </div>

            <div className="md:col-span-2 rounded-2xl border border-white/10 bg-black/30 p-3">
              <div className="text-xs font-extrabold text-white/70">Result</div>
              {mode === "len" ? (
                <pre className="mt-2 whitespace-pre-wrap text-xs text-white/85">{`Your first string is ${firstLen} characters long
Your second string is ${lastLen} characters long`}</pre>
              ) : (
                <pre className="mt-2 whitespace-pre-wrap text-xs text-white/85">{`${concat}
${bang}`}</pre>
              )}
            </div>

            <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <div className="text-xs font-extrabold text-white/70">Python code</div>
              <pre className="mt-2 whitespace-pre-wrap text-xs text-white/80">
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

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <MathMarkdown className="text-sm text-white/80 [&_.katex]:text-white/90" content={hud} />
        </div>
      </div>
    </div>
  );
}
