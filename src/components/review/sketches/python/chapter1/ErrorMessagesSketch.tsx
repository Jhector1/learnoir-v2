// ErrorMessagesSketch.tsx
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
        <div className="ui-sketch-panel">
          <div className="flex flex-wrap items-center gap-2">
            <div className="ui-sketch-label">Pick an error</div>
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
                  "ui-sketch-chip",
                  kind === x.k ? "ui-sketch-chip--active-rose" : "ui-sketch-chip--idle",
                ].join(" ")}
              >
                {x.label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="ui-sketch-codeblock">
              <div className="ui-sketch-label">Bad code</div>
              <pre className="ui-sketch-code">{b.code}</pre>
            </div>

            <div className="ui-sketch-codeblock">
              <div className="ui-sketch-label">Fix</div>
              <pre className="ui-sketch-code">{b.fix}</pre>
            </div>

            <div className="md:col-span-2 ui-sketch-codeblock">
              <div className="ui-sketch-label">{b.title}</div>
              <pre className="ui-sketch-code">{b.msg}</pre>
              <div className="mt-2 ui-sketch-muted">{b.why}</div>
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
