// src/components/review/sketches/linear_algebra/mod4/ProjectionMatrixSketch.tsx
"use client";

import React, { useMemo, useState } from "react";
import MatrixEntryInput from "@/components/practice/MatrixEntryInput";
import MathMarkdown from "@/components/math/MathMarkdown";
import { frob, matmul, sub, transpose } from "@/lib/math/matrixLite";
import { seededGrid } from "@/lib/math/seededRng";
import { CARD, PANEL, cn } from "./_mod4Ui";

function vecFromGrid(g: string[][]): [number, number] {
    const a = Number(g?.[0]?.[0] ?? 0);
    const b = Number(g?.[1]?.[0] ?? 0);
    return [Number.isFinite(a) ? a : 0, Number.isFinite(b) ? b : 0];
}

function fmtMat2(M: number[][], digits = 3) {
    const f = (x: number) => (Number.isFinite(x) ? x.toFixed(digits).replace(/\.000$/, "") : "0");
    return String.raw`\begin{bmatrix}${f(M[0][0])} & ${f(M[0][1])}\\ ${f(M[1][0])} & ${f(M[1][1])}\end{bmatrix}`;
}

export default function ProjectionMatrixSketch({ height = 460 }: { height?: number }) {
    const [bgrid, setBgrid] = useState<string[][]>(() => seededGrid(2, 1, "mod4.projMat.b"));

    const b = useMemo(() => vecFromGrid(bgrid), [bgrid]);
    const bb = useMemo(() => b[0] * b[0] + b[1] * b[1], [b]);

    const P = useMemo(() => {
        if (bb < 1e-12) return [[0, 0], [0, 0]];
        const s = 1 / bb;
        return [
            [s * b[0] * b[0], s * b[0] * b[1]],
            [s * b[1] * b[0], s * b[1] * b[1]],
        ];
    }, [b, bb]);

    const P2 = useMemo(() => matmul(P as any, P as any) as any, [P]);
    const idempErr = useMemo(() => frob(sub(P2 as any, P as any) as any), [P2, P]);

    const symErr = useMemo(() => frob(sub(P as any, transpose(P as any) as any) as any), [P]);

    const hud = useMemo(() => {
        return String.raw`
**Projection matrix onto span(b)**

For $U=\text{span}(b)$ (standard dot product),
$$
P=\frac{1}{b^\top b}\,bb^\top
$$

Here:
$$
b=\begin{bmatrix}${b[0]}\\${b[1]}\end{bmatrix},
\quad
P=${fmtMat2(P)}
$$

Key properties:
- Symmetry: $P^\top=P$  
  $$\|P-P^\top\|_F \approx ${symErr.toFixed(8)}$$

- Idempotence: $P^2=P$  
  $$\|P^2-P\|_F \approx ${idempErr.toFixed(8)}$$
`.trim();
    }, [b, P, symErr, idempErr]);

    return (
        <div className="w-full p-4" style={{ height }}>
            <div className="grid gap-3 lg:grid-cols-2">
                <div className={cn(CARD, "p-4")}>
                    <MatrixEntryInput
                        labelLatex={String.raw`b=`}
                        rows={2}
                        cols={1}
                        value={bgrid}
                        onChange={setBgrid}
                        cellWidthClass="w-20"
                    />
                    <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/70 dark:text-white/60">
                        If b=0, projection is undefined; we display P=0 as a safe fallback.
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
