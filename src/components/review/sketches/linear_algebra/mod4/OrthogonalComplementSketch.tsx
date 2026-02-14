// src/components/review/sketches/linear_algebra/mod4/OrthogonalComplementSketch.tsx
"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import VectorPad from "@/components/vectorpad/VectorPad";
import type { VectorPadState } from "@/components/vectorpad/types";
import type { Mode, Vec3 } from "@/lib/math/vec3";
import MathMarkdown from "@/components/markdown/MathMarkdown";
import { fmtNum, fmtVec2Latex } from "@/lib/review/latex";
import { CARD, PANEL, cn, useSideBySide } from "./_mod4Ui";

function dot(a: Vec3, b: Vec3) {
    return a.x * b.x + a.y * b.y;
}

export default function OrthogonalComplementSketch({ height = 420 }: { height?: number }) {
    const mode: Mode = "2d";
    const zHeldRef = useRef(false);

    // Use VectorPad "a" as b (the direction that defines span(b))
    const stateRef = useRef<VectorPadState>({
        a: { x: 3, y: 1, z: 0 },
        b: { x: 0, y: 0, z: 0 },
        scale: 26,
        showGrid: true,
        snapToGrid: true,
        autoGridStep: false,
        gridStep: 1,
        showComponents: true,
        showAngle: false,
        showProjection: false,
        showPerp: false,
        showUnitB: false,
        depthMode: false,
    });

    const [b, setB] = useState<Vec3>(stateRef.current.a);

    const onPreview = useCallback((na: Vec3) => {
        stateRef.current.a = na;
        setB(na);
    }, []);

    const p = useMemo<Vec3>(() => ({ x: -b.y, y: b.x, z: 0 }), [b.x, b.y]);
    const dp = useMemo(() => dot(b, p), [b.x, b.y, p.x, p.y]);

    const { rootRef, sideBySide } = useSideBySide(760);

    const hud = useMemo(() => {
        const bL = fmtVec2Latex(Number(fmtNum(b.x, 2)), Number(fmtNum(b.y, 2)));
        const pL = fmtVec2Latex(Number(fmtNum(p.x, 2)), Number(fmtNum(p.y, 2)));

        return String.raw`
**Orthogonal complement in 2D**

Let $U=\text{span}(b)$.  
Then $U^\perp$ is the line of vectors perpendicular to $b$.

A guaranteed perpendicular direction is:
$$
p=\begin{bmatrix}-b_y\\ b_x\end{bmatrix}
$$

$$
b=${bL},\quad p=${pL}
\qquad
b^\top p = ${fmtNum(dp, 4)}
$$

If $b^\top p=0$, then $p\in U^\perp$ and:
$$
U^\perp = \text{span}(p)
$$
`.trim();
    }, [b.x, b.y, p.x, p.y, dp]);

    return (
        <div ref={rootRef} className="w-full" style={{ touchAction: "none" }}>
            <div className={cn("grid gap-3", sideBySide ? "grid-cols-[minmax(0,1fr)_360px]" : "grid-cols-1")}>
                <div className={CARD}>
                    <VectorPad
                        mode={mode}
                        stateRef={stateRef}
                        zHeldRef={zHeldRef}
                        handles={{ a: true, b: false }}
                        previewThrottleMs={33}
                        onPreview={onPreview}
                        onCommit={onPreview}
                        className={cn("w-full bg-white dark:bg-neutral-950", sideBySide ? "h-[420px]" : "h-[280px]")}
                    />
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
