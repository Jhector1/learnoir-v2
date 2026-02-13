// src/components/review/sketches/linear_algebra/mod4/OrthogonalMatrixSketch.tsx
"use client";

import React, { useMemo, useState } from "react";
import MatrixEntryInput from "@/components/practice/MatrixEntryInput";
import MathMarkdown from "@/components/math/MathMarkdown";
import { frob, gridToMat, matmul, sub, transpose } from "@/lib/math/matrixLite";
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

function matVec2(A: number[][], x: [number, number]): [number, number] {
    return [A[0][0] * x[0] + A[0][1] * x[1], A[1][0] * x[0] + A[1][1] * x[1]];
}

function norm2(v: [number, number]) {
    return Math.hypot(v[0], v[1]);
}

export default function OrthogonalMatrixSketch({ height = 460 }: { height?: number }) {
    const [Qgrid, setQgrid] = useState<string[][]>(() => seededGrid(2, 2, "mod4.orth.Q"));
    const [xgrid, setXgrid] = useState<string[][]>(() => seededGrid(2, 1, "mod4.orth.x"));

    const Q = useMemo(() => gridToMat(Qgrid), [Qgrid]) as number[][];
    const x = useMemo(() => vecFromGrid(xgrid), [xgrid]);

    const QtQ = useMemo(() => matmul(transpose(Q as any) as any, Q as any) as any, [Q]);
    const I = useMemo(() => [[1, 0], [0, 1]] as any, []);
    const err = useMemo(() => frob(sub(QtQ as any, I as any) as any), [QtQ, I]);

    const Qx = useMemo(() => matVec2(Q, x), [Q, x]);
    const nx = useMemo(() => norm2(x), [x]);
    const nQx = useMemo(() => norm2(Qx), [Qx]);

    const looksOrth = err < 1e-6;

    const hud = useMemo(() => {
        return String.raw`
**Orthogonal matrices**

Definition:
$$
Q^\top Q = I
$$

Here:
$$
Q=${fmtMat2(Q)}
\qquad
Q^\top Q=${fmtMat2(QtQ)}
$$

Error (Frobenius):
$$
\|Q^\top Q - I\|_F \approx ${err.toFixed(6)}
\quad ${looksOrth ? "\\;\\checkmark" : ""}
$$

Length preservation:
$$
\|x\|_2 \approx ${nx.toFixed(4)},\qquad \|Qx\|_2 \approx ${nQx.toFixed(4)}
$$
`.trim();
    }, [Q, QtQ, err, looksOrth, nx, nQx]);

    return (
        <div className="w-full p-4" style={{ height }}>
            <div className="grid gap-3 lg:grid-cols-2">
                <div className={cn(CARD, "p-4")}>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <MatrixEntryInput
                            labelLatex={String.raw`Q=`}
                            rows={2}
                            cols={2}
                            value={Qgrid}
                            onChange={setQgrid}
                            cellWidthClass="w-20"
                        />
                        <MatrixEntryInput
                            labelLatex={String.raw`x=`}
                            rows={2}
                            cols={1}
                            value={xgrid}
                            onChange={setXgrid}
                            cellWidthClass="w-20"
                        />
                    </div>

                    <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/70 dark:text-white/60">
                        Try setting Q to a rotation like [[0,-1],[1,0]] or a reflection like [[1,0],[0,-1]].
                    </div>
                </div>

                <div className={PANEL}>
                    <MathMarkdown
                        className={cn(
                            "text-sm leading-6 text-neutral-700 dark:text-white/80",
                            "[&_.katex]:text-neutral-900 dark:[&_.katex]:text-white/90",
                            "[&_strong]:text-neutral-900 dark:[&_strong]:text-white",
                        )}
                        content={hud}
                    />
                </div>
            </div>
        </div>
    );
}
