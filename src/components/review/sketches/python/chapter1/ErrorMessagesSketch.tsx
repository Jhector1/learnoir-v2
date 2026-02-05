"use client";

import React, { useMemo, useState } from "react";
import MathMarkdown from "@/components/math/MathMarkdown";

type ErrKind = "syntax_paren" | "syntax_quote" | "name" | "indent";

function errorBundle(kind: ErrKind) {
  if (kind === "syntax_paren") {
    return {
      title: "SyntaxError (missing parenthesis)",
      code: `print("Have a nice day!"`,
      msg: `Traceback (most recent call last):
  File "example.py", line 1
    print("Have a nice day!"
                          ^
SyntaxError: unexpected EOF while parsing`,
      fix: `print("Have a nice day!")`,
      why: "Python reached the end of the line/file before your statement finished.",
    };
  }
  if (kind === "syntax_quote") {
    return {
      title: "SyntaxError (unterminated string)",
      code: `word = input("Type a word: )`,
      msg: `Traceback (most recent call last):
  File "example.py", line 1
    word = input("Type a word: )
                 ^
SyntaxError: EOL while scanning string literal`,
      fix: `word = input("Type a word: ")`,
      why: "Strings must start and end with matching quotes.",
    };
  }
  if (kind === "indent") {
    return {
      title: "IndentationError (unexpected indent)",
      code: ` print("Hello")`,
      msg: `Traceback (most recent call last):
  File "example.py", line 1
    print("Hello")
IndentationError: unexpected indent`,
      fix: `print("Hello")`,
      why: "At the top-level, extra leading spaces can be illegal.",
    };
  }
  return {
    title: "NameError (misspelled name)",
    code: `print("You typed:", wird)`,
    msg: `Traceback (most recent call last):
  File "example.py", line 1, in <module>
    print("You typed:", wird)
NameError: name 'wird' is not defined`,
    fix: `print("You typed:", word)`,
    why: "Python only knows names you defined (or built-ins). Spelling matters.",
  };
}

export default function ErrorMessagesSketch() {
  const [kind, setKind] = useState<ErrKind>("name");
  const b = useMemo(() => errorBundle(kind), [kind]);

  const hud = useMemo(() => {
    return String.raw`
**How to read errors**

Look for:

1. **File + line number**
2. **Error type** (SyntaxError, NameError, IndentationError)
3. The **caret** \(\hat{}\) that points near the problem

Common beginner pattern:
- fix **one** error
- run again
- repeat
`.trim();
  }, []);

  return (
    <div className="w-full">
      <div className="grid gap-3 md:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-xs font-extrabold text-white/70">Pick an error</div>
            {(
              [
                { k: "name", label: "NameError" },
                { k: "syntax_paren", label: "Syntax: missing )" },
                { k: "syntax_quote", label: "Syntax: missing quote" },
                { k: "indent", label: "Indentation" },
              ] as const
            ).map((x) => (
              <button
                key={x.k}
                onClick={() => setKind(x.k)}
                className={[
                  "rounded-xl border px-3 py-1 text-xs font-extrabold transition",
                  kind === x.k
                    ? "border-rose-300/30 bg-rose-300/10 text-white/90"
                    : "border-white/10 bg-white/5 text-white/75 hover:bg-white/10",
                ].join(" ")}
              >
                {x.label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <div className="text-xs font-extrabold text-white/70">Bad code</div>
              <pre className="mt-2 whitespace-pre-wrap text-xs text-white/80">{b.code}</pre>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <div className="text-xs font-extrabold text-white/70">Fix</div>
              <pre className="mt-2 whitespace-pre-wrap text-xs text-white/80">{b.fix}</pre>
            </div>

            <div className="md:col-span-2 rounded-2xl border border-white/10 bg-black/30 p-3">
              <div className="text-xs font-extrabold text-white/70">{b.title}</div>
              <pre className="mt-2 whitespace-pre-wrap text-xs text-white/80">{b.msg}</pre>
              <div className="mt-2 text-xs text-white/60">{b.why}</div>
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
