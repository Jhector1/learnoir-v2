// src/components/review/sketches/linear_algebra/mod4/WeightedInnerProductSketch.tsx
"use client";

import React, { useMemo, useState } from "react";
import MatrixEntryInput from "@/components/practice/MatrixEntryInput";
import MathMarkdown from "@/components/math/MathMarkdown";
import { det2, gridToMat, type Mat } from "@/lib/math/matrixLite";
import { seededGrid } from "@/lib/math/seededRng";
import { CARD, PANEL, cn } from "./_mod4Ui";

function fmtMat2(M: number[][], digits = 2) {
    const f = (x: number) => (Number.isFinite(x) ? x.toFixed(digits).replace(/\.00$/, "") : "0");
    return String.raw`\begin{bmatrix}${f(M[0][0])} & ${f(M[0][1])}\\ ${f(M[1][0])} & ${f(M[1][1])}\end{bmatrix}`;
}

function vecFromGrid(g: string[][]): [number, number] {
    const a = Number(g?.[0]?.[0] ?? 0);
    const b = Number(g?.[1]?.[0] ?? 0);
    return [Number.isFinite(a) ? a : 0, Number.isFinite(b) ? b : 0];
}

function dot2(x: [number, number], y: [number, number]) {
    return x[0] * y[0] + x[1] * y[1];
}

function matVec2(A: number[][], x: [number, number]): [number, number] {
    return [A[0][0] * x[0] + A[0][1] * x[1], A[1][0] * x[0] + A[1][1] * x[1]];
}

function xTAy(x: [number, number], A: number[][], y: [number, number]) {
    const Ay = matVec2(A, y);
    return dot2(x, Ay);
}

function isSym2(A: number[][]) {
    return Math.abs(A[0][1] - A[1][0]) < 1e-10;
}

// Sylvester criterion for 2×2 SPD: symmetric + a11>0 + det>0
function isSPD2(A: number[][]) {
    if (!isSym2(A)) return false;
    if (!(A[0][0] > 0)) return false;
    const d = A[0][0] * A[1][1] - A[0][1] * A[1][0];
    return d > 0;
}

export default function WeightedInnerProductSketch({ height = 460 }: { height?: number }) {
    const [Agrid, setAgrid] = useState<string[][]>(() => seededGrid(2, 2, "mod4.weighted.A"));
    const [xgrid, setXgrid] = useState<string[][]>(() => seededGrid(2, 1, "mod4.weighted.x"));
    const [ygrid, setYgrid] = useState<string[][]>(() => seededGrid(2, 1, "mod4.weighted.y"));

    const A = useMemo(() => gridToMat(Agrid) as Mat, [Agrid]) as number[][];
    const x = useMemo(() => vecFromGrid(xgrid), [xgrid]);
    const y = useMemo(() => vecFromGrid(ygrid), [ygrid]);

    const v = useMemo(() => xTAy(x, A, y), [x, y, A]);
    const xx = useMemo(() => xTAy(x, A, x), [x, A]);
    const yy = useMemo(() => xTAy(y, A, y), [y, A]);

    const detA = useMemo(() => det2(A as any), [A]);
    const sym = useMemo(() => isSym2(A), [A]);
    const spd = useMemo(() => isSPD2(A), [A]);

    const hud = useMemo(() => {
        const note = spd
            ? "✅ A is SPD, so ⟨x,y⟩ₐ = xᵀAy is a valid inner product."
            : sym
                ? "⚠️ A is symmetric but not SPD (it may fail positivity)."
                : "⚠️ A is not symmetric (so ⟨x,y⟩ₐ won’t be symmetric in x,y).";

        return String.raw`
**Weighted inner product**

Define:
$$
\langle x,y\rangle_A = x^\top A y
$$

Here:
$$
A=${fmtMat2(A)},\quad
x=\begin{bmatrix}${x[0]}\\${x[1]}\end{bmatrix},\quad
y=\begin{bmatrix}${y[0]}\\${y[1]}\end{bmatrix}
$$

Compute:
$$
x^\top A y = ${v.toFixed(4)}
$$

“Self-inner-products”:
$$
\langle x,x\rangle_A = x^\top A x = ${xx.toFixed(4)},\qquad
\langle y,y\rangle_A = y^\top A y = ${yy.toFixed(4)}
$$

Checks:
- symmetric? ${sym ? "✅ yes" : "❌ no"}
- det(A) = ${detA.toFixed(4)}
- SPD? ${spd ? "✅ yes" : "❌ no"}

${note}
`.trim();
    }, [A, x, y, v, xx, yy, detA, sym, spd]);

    return (
        <div className="w-full p-4" style={{ height }}>
            <div className="grid gap-3 lg:grid-cols-2">
                <div className={cn(CARD, "p-4")}>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <MatrixEntryInput
                            labelLatex={String.raw`\mathbf{A}=`}
                            rows={2}
                            cols={2}
                            value={Agrid}
                            onChange={setAgrid}
                            cellWidthClass="w-20"
                        />
                        <div className="space-y-3">
                            <MatrixEntryInput
                                labelLatex={String.raw`x=`}
                                rows={2}
                                cols={1}
                                value={xgrid}
                                onChange={setXgrid}
                                cellWidthClass="w-20"
                            />
                            <MatrixEntryInput
                                labelLatex={String.raw`y=`}
                                rows={2}
                                cols={1}
                                value={ygrid}
                                onChange={setYgrid}
                                cellWidthClass="w-20"
                            />
                        </div>
                    </div>

                    <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/70 dark:text-white/60">
                        Tip: If you want a guaranteed inner product, make A **SPD** (symmetric + positive definite).
                    </div>
                </div>

                <div className={PANEL}>
                    <MathMarkdown
                        className={cn(
                            "text-sm leading-6 text-neutral-700 dark:text-white/80",
                            "[&_.katex]:text-neutral-900 dark:[&_.katex]:text-white/90",
                            "[&_strong]:text-neutral-900 dark:[&_strong]:text-white",
                            "[&_li]:my-1",
                        )}
                        content={hud}
                    />
                </div>
            </div>
        </div>
    );
}
