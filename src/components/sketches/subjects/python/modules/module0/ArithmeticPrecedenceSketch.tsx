"use client";

import React, { useEffect, useMemo, useState } from "react";
import MathMarkdown from "@/components/markdown/MathMarkdown";
import CodeRunner from "@/components/code/CodeRunner";

type ExprKey = "expr1" | "expr2" | "expr3";

function compute(key: ExprKey, x: number, y: number, z: number) {
  if (key === "expr1") return 1 + 2 * 3;
  if (key === "expr2") return ((x + y) ** 2) / z;
  return -(x ** 2);
}

function exprText(key: ExprKey, x: number, y: number, z: number) {
  if (key === "expr1") return "1 + 2 * 3";
  if (key === "expr2") return `(${x} + ${y}) ** 2 / ${z}`;
  return `-${x} ** 2`;
}

export default function ArithmeticPrecedenceSketch() {
  const [x, setX] = useState(4);
  const [y, setY] = useState(3);
  const [z, setZ] = useState(4);
  const [expr, setExpr] = useState<ExprKey>("expr1");

  const value = useMemo(() => compute(expr, x, y, z), [expr, x, y, z]);
  const text = useMemo(() => exprText(expr, x, y, z), [expr, x, y, z]);

  const starter = useMemo(() => {
    return `x = ${x}
y = ${y}
z = ${z}

result = ${text}
print(result)
`;
  }, [x, y, z, text]);

  const [code, setCode] = useState(starter);
  useEffect(() => setCode(starter), [starter]);

  const hud = useMemo(() => {
    return String.raw`
**Operator precedence (Python)**

Highest → lowest:

1. Parentheses \`(\ )\`  
2. Exponent \`**\`  
3. Multiply / divide \`*\`, \`/\`  
4. Add / subtract \`+\`, \`-\`

**Gotcha**

In Python, \`-4 ** 2\` is interpreted as:

$$
-(4^2) = -16
$$

If you want \(( -4 )^2\), the math is:

$$
(-4)^2 = 16
$$

Python code version:

~~~python
(-4) ** 2
~~~
`.trim();
  }, []);

  return (
    <div className="w-full">
      <div className="grid gap-3 md:grid-cols-[1fr_360px]">
        <div className="ui-sketch-panel">
          <div className="flex flex-wrap items-center gap-2">
            <div className="ui-sketch-label">Expression</div>

            {([
              { k: "expr1", label: "1 + 2 * 3" },
              { k: "expr2", label: "(x + y) ** 2 / z" },
              { k: "expr3", label: "-x ** 2" },
            ] as const).map((b) => (
              <button
                key={b.k}
                onClick={() => setExpr(b.k)}
                className={[
                  "ui-sketch-chip",
                  expr === b.k ? "ui-sketch-chip--active-sky" : "ui-sketch-chip--idle",
                ].join(" ")}
              >
                {b.label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div>
              <div className="ui-sketch-label">x</div>
              <input
                type="number"
                value={x}
                onChange={(e) => setX(Number(e.target.value))}
                className="ui-sketch-input"
              />
            </div>

            <div>
              <div className="ui-sketch-label">y</div>
              <input
                type="number"
                value={y}
                onChange={(e) => setY(Number(e.target.value))}
                className="ui-sketch-input"
              />
            </div>

            <div>
              <div className="ui-sketch-label">z</div>
              <input
                type="number"
                value={z}
                onChange={(e) => setZ(Number(e.target.value))}
                className="ui-sketch-input"
              />
            </div>
          </div>

          <div className="mt-4 ui-sketch-codeblock">
            <div className="ui-sketch-label">Expected (with current x,y,z)</div>
            <div className="mt-1 text-sm font-black tabular-nums text-neutral-900 dark:text-white/90">
              {String(value)}
            </div>
          </div>

          <div className="mt-4">
            <CodeRunner
              title="Run the Python"
              code={code}
              onChangeCode={setCode}
              stdin=""
              onChangeStdin={() => {}}
              hintMarkdown={String.raw`Try changing the expression and re-running:

~~~python
result = ${text}
print(result)
~~~`}
            />
          </div>
        </div>

        <div className="ui-sketch-panel">
          <MathMarkdown className="ui-math" content={hud} />
        </div>
      </div>
    </div>
  );
}
