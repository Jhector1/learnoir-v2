"use client";

import React, { useEffect, useMemo } from "react";
import MathMarkdown from "@/components/markdown/MathMarkdown";
import CodeRunner from "@/components/code/CodeRunner";
import type { SavedSketchState } from "../../../../types";

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

function patch(onChange: (s: SavedSketchState) => void, prev: SavedSketchState | null, nextData: any) {
    onChange({
        version: (prev?.version ?? 1),
        updatedAt: new Date().toISOString(),
        data: nextData,
    });
}

export default function ArithmeticPrecedenceCustom(props: {
    value: SavedSketchState | null;
    onChange: (s: SavedSketchState) => void;
    readOnly?: boolean;
    height?: number;
    title?: string;
}) {
    const { value, onChange, readOnly } = props;

    const data = (value?.data ?? {}) as any;

    const x = Number.isFinite(data.x) ? data.x : 4;
    const y = Number.isFinite(data.y) ? data.y : 3;
    const z = Number.isFinite(data.z) ? data.z : 4;
    const expr: ExprKey = (data.expr as ExprKey) ?? "expr1";

    const text = useMemo(() => exprText(expr, x, y, z), [expr, x, y, z]);
    const expected = useMemo(() => compute(expr, x, y, z), [expr, x, y, z]);

    const starter = useMemo(() => {
        return `x = ${x}
y = ${y}
z = ${z}

result = ${text}
print(result)
`;
    }, [x, y, z, text]);

    // keep code synced unless user already edited
    const code = (typeof data.code === "string" && data.code.length > 0) ? data.code : starter;

    // if expr/x/y/z changes AND code was still equal to old starter, reset to new starter
    useEffect(() => {
        if (!value) return;
        if (data.code === "" || data.code === starter) {
            patch(onChange, value, { ...data, code: starter });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [starter]);

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
                                onClick={() => !readOnly && patch(onChange, value, { ...data, expr: b.k, code: "" })}
                                className={[
                                    "ui-sketch-chip",
                                    expr === b.k ? "ui-sketch-chip--active-sky" : "ui-sketch-chip--idle",
                                ].join(" ")}
                                disabled={readOnly}
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
                                onChange={(e) => !readOnly && patch(onChange, value, { ...data, x: Number(e.target.value), code: "" })}
                                className="ui-sketch-input"
                                disabled={readOnly}
                            />
                        </div>

                        <div>
                            <div className="ui-sketch-label">y</div>
                            <input
                                type="number"
                                value={y}
                                onChange={(e) => !readOnly && patch(onChange, value, { ...data, y: Number(e.target.value), code: "" })}
                                className="ui-sketch-input"
                                disabled={readOnly}
                            />
                        </div>

                        <div>
                            <div className="ui-sketch-label">z</div>
                            <input
                                type="number"
                                value={z}
                                onChange={(e) => !readOnly && patch(onChange, value, { ...data, z: Number(e.target.value), code: "" })}
                                className="ui-sketch-input"
                                disabled={readOnly}
                            />
                        </div>
                    </div>

                    <div className="mt-4 ui-sketch-codeblock">
                        <div className="ui-sketch-label">Expected (with current x,y,z)</div>
                        <div className="mt-1 text-sm font-black tabular-nums text-neutral-900 dark:text-white/90">
                            {String(expected)}
                        </div>
                    </div>

                    <div className="mt-4">
                        <CodeRunner
                            title="Run the Python"
                            code={code}
                            onChangeCode={(next) => !readOnly && patch(onChange, value, { ...data, code: next })}
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
