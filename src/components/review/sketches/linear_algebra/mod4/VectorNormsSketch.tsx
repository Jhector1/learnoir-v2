// src/components/review/sketches/linear_algebra/mod4/VectorNormsSketch.tsx
"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import VectorPad from "@/components/vectorpad/VectorPad";
import type { VectorPadState } from "@/components/vectorpad/types";
import type { Mode, Vec3 } from "@/lib/math/vec3";
import MathMarkdown from "@/components/math/MathMarkdown";
import { fmtNum, fmtVec2Latex } from "@/lib/review/latex";
import { CARD, PANEL, cn, useSideBySide } from "./_mod4Ui";

function l1(v: Vec3) {
    return Math.abs(v.x) + Math.abs(v.y);
}
function l2(v: Vec3) {
    return Math.hypot(v.x, v.y);
}

export default function VectorNormsSketch({
                                              height = 420,
                                              initialX = 3,
                                              initialY = 4,
                                          }: {
    height?: number;
    initialX?: number;
    initialY?: number;
}) {
    const mode: Mode = "2d";
    const zHeldRef = useRef(false);

    const stateRef = useRef<VectorPadState>({
        a: { x: initialX, y: initialY, z: 0 },
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

    const [v, setV] = useState<Vec3>(stateRef.current.a);
    const handles = useMemo(() => ({ a: true, b: false }), []);

    const onPreview = useCallback((na: Vec3) => {
        stateRef.current.a = na;
        setV(na);
    }, []);

    const onCommit = useCallback((na: Vec3) => {
        stateRef.current.a = na;
        setV(na);
    }, []);

    const n1 = useMemo(() => l1(v), [v.x, v.y]);
    const n2 = useMemo(() => l2(v), [v.x, v.y]);
    const n2sq = useMemo(() => v.x * v.x + v.y * v.y, [v.x, v.y]);

    const { rootRef, sideBySide } = useSideBySide(760);

    const hud = useMemo(() => {
        const vLatex = fmtVec2Latex(Number(fmtNum(v.x, 2)), Number(fmtNum(v.y, 2)));
        return String.raw`
**Vector norms**

Drag the tip of $\vec v$.

$$
\vec v = ${vLatex}
$$

- $\ell_2$ (Euclidean):
  $$
  \|\vec v\|_2=\sqrt{v_x^2+v_y^2} \approx ${fmtNum(n2, 4)}
  \qquad
  \|\vec v\|_2^2 = v^\top v = ${fmtNum(n2sq, 0)}
  $$

- $\ell_1$ (taxicab):
  $$
  \|\vec v\|_1 = |v_x|+|v_y| = ${fmtNum(n1, 0)}
  $$

**Intuition**
- $\|\cdot\|_2$ = “straight-line length”
- $\|\cdot\|_1$ = “grid-walk length”
`.trim();
    }, [v.x, v.y, n1, n2, n2sq]);

    return (
        <div ref={rootRef} className="w-full" style={{ touchAction: "none" }}>
            <div className={cn("grid gap-3", sideBySide ? "grid-cols-[minmax(0,1fr)_340px]" : "grid-cols-1")}>
                <div className={CARD}>
                    <VectorPad
                        mode={mode}
                        stateRef={stateRef}
                        zHeldRef={zHeldRef}
                        handles={handles}
                        previewThrottleMs={33}
                        onPreview={onPreview}
                        onCommit={onCommit}
                        className={cn("w-full bg-white dark:bg-neutral-950", sideBySide ? "h-[420px]" : "h-[280px]")}
                    />
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
