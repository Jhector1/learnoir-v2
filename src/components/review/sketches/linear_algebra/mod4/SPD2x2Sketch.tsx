// src/components/review/sketches/linear_algebra/mod4/SPD2x2Sketch.tsx
"use client";

import React, { useMemo, useState } from "react";
import MatrixEntryInput from "@/components/practice/MatrixEntryInput";
import MathMarkdown from "@/components/math/MathMarkdown";
import { det2, gridToMat, type Mat } from "@/lib/math/matrixLite";
import { seededGrid } from "@/lib/math/seededRng";
import { cn, CARD } from "./_mod4Ui";

function fmtMat2(M: number[][], digits = 2) {
    const f = (x: number) => (Number.isFinite(x) ? x.toFixed(digits).replace(/\.00$/, "") : "0");
    return String.raw`\begin{bmatrix}${f(M[0][0])} & ${f(M[0][1])}\\ ${f(M[1][0])} & ${f(M[1][1])}\end{bmatrix}`;
}

function isSym2(A: number[][]) {
    return Math.abs(A[0][1] - A[1][0]) < 1e-10;
}

function isSPD2(A: number[][]) {
    if (!isSym2(A)) return false;
    if (!(A[0][0] > 0)) return false;
    const d = A[0][0] * A[1][1] - A[0][1] * A[1][0];
    return d > 0;
}

export default function SPD2x2Sketch({ heightClass = "h-[440px]" }: { heightClass?: string }) {
    const [Agrid, setAgrid] = useState<string[][]>(() => seededGrid(2, 2, "mod4.spd.A"));
    const [alpha, setAlpha] = useState(0);

    const A = useMemo(() => gridToMat(Agrid) as Mat, [Agrid]) as number[][];

    const Ashift = useMemo(() => {
        return [
            [A[0][0] + alpha, A[0][1]],
            [A[1][0], A[1][1] + alpha],
        ];
    }, [A, alpha]);

    const detA = useMemo(() => det2(A as any), [A]);
    const detS = useMemo(() => det2(Ashift as any), [Ashift]);

    const symA = useMemo(() => isSym2(A), [A]);
    const spdA = useMemo(() => isSPD2(A), [A]);
    const symS = useMemo(() => isSym2(Ashift), [Ashift]);
    const spdS = useMemo(() => isSPD2(Ashift), [Ashift]);

    const note = useMemo(() => {
        if (spdA) return "✅ A is SPD, so xᵀAx is always positive for x≠0.";
        if (symA) return "⚠️ A is symmetric but not SPD. Try shifting by αI.";
        return "⚠️ Make A symmetric first (mirror across diagonal), then ensure positivity.";
    }, [spdA, symA]);

    return (
        <div className={cn("w-full overflow-auto p-4", heightClass)}>
            <div className={cn(CARD, "p-4")}>
                <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-3">
                        <MatrixEntryInput
                            labelLatex={String.raw`\mathbf{A}=`}
                            rows={2}
                            cols={2}
                            value={Agrid}
                            onChange={setAgrid}
                            cellWidthClass="w-20"
                        />

                        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                            <div className="text-xs font-extrabold text-white/70 dark:text-white/60">Shift α</div>
                            <input
                                className="mt-2 w-full"
                                type="range"
                                min={-5}
                                max={5}
                                step={0.05}
                                value={alpha}
                                onChange={(e) => setAlpha(Number(e.target.value))}
                            />
                            <div className="mt-2 text-xs text-white/70 dark:text-white/60">α = {alpha.toFixed(2)}</div>
                        </div>

                        <div className="text-xs text-neutral-600 dark:text-white/55">{note}</div>
                    </div>

                    <div className="space-y-3">
                        <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white/80 dark:text-white/75">
                            <div className="text-xs font-extrabold text-white/70 dark:text-white/60">Original</div>
                            <MathMarkdown content={String.raw`$\mathbf{A}=${fmtMat2(A)}$`} />
                            <MathMarkdown content={String.raw`$\det(\mathbf{A})=${detA.toFixed(4)}$`} />
                            <MathMarkdown content={String.raw`$\text{sym? }${symA ? "\checkmark" : "\times"}\quad \text{SPD? }${spdA ? "\checkmark" : "\times"}$`} />
                        </div>

                        <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white/80 dark:text-white/75">
                            <div className="text-xs font-extrabold text-white/70 dark:text-white/60">Shifted</div>
                            <MathMarkdown content={String.raw`$\mathbf{A}+\alpha\mathbf{I}=${fmtMat2(Ashift)}$`} />
                            <MathMarkdown content={String.raw`$\det(\mathbf{A}+\alpha\mathbf{I})=${detS.toFixed(4)}$`} />
                            <MathMarkdown content={String.raw`$\text{sym? }${symS ? "\checkmark" : "\times"}\quad \text{SPD? }${spdS ? "\checkmark" : "\times"}$`} />
                        </div>
                    </div>
                </div>

                <div className="mt-3 text-xs text-neutral-600 dark:text-white/55">
                    For 2×2: SPD ⇔ symmetric + a₁₁ &gt; 0 + det(A) &gt; 0. Shifting by αI often fixes borderline cases.
                </div>
            </div>
        </div>
    );
}
