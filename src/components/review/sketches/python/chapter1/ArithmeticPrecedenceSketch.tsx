"use client";

import React, { useEffect, useMemo, useState } from "react";
import MathMarkdown from "@/components/math/MathMarkdown";
import CodeRunner from "@/components/code/CodeRunner";

type ExprKey = "expr1" | "expr2" | "expr3";

function compute(key: ExprKey, x: number, y: number, z: number) {
  if (key === "expr1") return 1 + 2 * 3;
  if (key === "expr2") return ((x + y) ** 2) / z;
  // Python: -4 ** 2 means -(4**2)
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
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-xs font-extrabold text-white/70">Expression</div>
            {([
              { k: "expr1", label: "1 + 2 * 3" },
              { k: "expr2", label: "(x + y) ** 2 / z" },
              { k: "expr3", label: "-x ** 2" },
            ] as const).map((b) => (
              <button
                key={b.k}
                onClick={() => setExpr(b.k)}
                className={[
                  "rounded-xl border px-3 py-1 text-xs font-extrabold transition",
                  expr === b.k
                    ? "border-sky-300/30 bg-sky-300/10 text-white/90"
                    : "border-white/10 bg-white/5 text-white/75 hover:bg-white/10",
                ].join(" ")}
              >
                {b.label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div>
              <div className="text-xs font-extrabold text-white/70">x</div>
              <input
                type="number"
                value={x}
                onChange={(e) => setX(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/90 outline-none"
              />
            </div>
            <div>
              <div className="text-xs font-extrabold text-white/70">y</div>
              <input
                type="number"
                value={y}
                onChange={(e) => setY(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/90 outline-none"
              />
            </div>
            <div>
              <div className="text-xs font-extrabold text-white/70">z</div>
              <input
                type="number"
                value={z}
                onChange={(e) => setZ(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/90 outline-none"
              />
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-3">
            <div className="text-xs font-extrabold text-white/70">
              Expected (with current x,y,z)
            </div>
            <div className="mt-1 text-sm font-black text-white/90 tabular-nums">
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

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <MathMarkdown
            className="text-sm text-white/80 [&_.katex]:text-white/90"
            content={hud}
          />
        </div>
      </div>
    </div>
  );
}
