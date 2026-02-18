// src/components/review/sketches/linear_algebra/mod4/InnerProductSketch.tsx
"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import VectorPad from "@/components/vectorpad/VectorPad";
import type { VectorPadState } from "@/components/vectorpad/types";
import type { Mode, Vec3 } from "@/lib/math/vec3";
import MathMarkdown from "@/components/markdown/MathMarkdown";
import { fmtNum, fmtVec2Latex } from "@/lib/subjects/latex";
import { CARD, PANEL, cn, useSideBySide } from "./_mod4Ui";

function dot(a: Vec3, b: Vec3) {
    return a.x * b.x + a.y * b.y;
}
function norm(a: Vec3) {
    return Math.hypot(a.x, a.y);
}
function clamp(x: number, lo: number, hi: number) {
    return Math.max(lo, Math.min(hi, x));
}

export default function InnerProductSketch({ height = 420 }: { height?: number }) {
    const mode: Mode = "2d";
    const zHeldRef = useRef(false);

    const stateRef = useRef<VectorPadState>({
        a: { x: 3, y: 1, z: 0 },
        b: { x: 1, y: 3, z: 0 },
        scale: 26,
        showGrid: true,
        snapToGrid: true,
        autoGridStep: false,
        gridStep: 1,
        showComponents: false,
        showAngle: true,
        showProjection: false,
        showPerp: false,
        showUnitB: false,
        depthMode: false,
    });

    const [active, setActive] = useState<"a" | "b">("a");
    const [a, setA] = useState<Vec3>(stateRef.current.a);
    const [b, setB] = useState<Vec3>(stateRef.current.b);

    const handles = useMemo(() => ({ a: active === "a", b: active === "b" }), [active]);

    const onPreview = useCallback(
        (v: Vec3) => {
            if (active === "a") {
                stateRef.current.a = v;
                setA(v);
            } else {
                stateRef.current.b = v;
                setB(v);
            }
        },
        [active],
    );

    const onCommit = useCallback(
        (v: Vec3) => {
            if (active === "a") {
                stateRef.current.a = v;
                setA(v);
            } else {
                stateRef.current.b = v;
                setB(v);
            }
        },
        [active],
    );

    const d = useMemo(() => dot(a, b), [a.x, a.y, b.x, b.y]);
    const na = useMemo(() => norm(a), [a.x, a.y]);
    const nb = useMemo(() => norm(b), [b.x, b.y]);

    const cos = useMemo(() => {
        const den = na * nb;
        if (den < 1e-12) return 0;
        return clamp(d / den, -1, 1);
    }, [d, na, nb]);

    const angleDeg = useMemo(() => (Math.acos(cos) * 180) / Math.PI, [cos]);

    const classification = useMemo(() => {
        if (Math.abs(d) < 1e-10) return "right (orthogonal)";
        return d > 0 ? "acute" : "obtuse";
    }, [d]);

    const { rootRef, sideBySide } = useSideBySide(760);

    const hud = useMemo(() => {
        const aLatex = fmtVec2Latex(Number(fmtNum(a.x, 2)), Number(fmtNum(a.y, 2)));
        const bLatex = fmtVec2Latex(Number(fmtNum(b.x, 2)), Number(fmtNum(b.y, 2)));

        return String.raw`
**Inner product (dot product)**

Drag $\vec a$ or $\vec b$ (toggle which one is active).

$$
\langle a,b\rangle = a^\top b
= a_x b_x + a_y b_y
$$

$$
a=${aLatex},\quad
b=${bLatex}
$$

$$
a^\top b = ${fmtNum(d, 4)}
\qquad
\|a\|=${fmtNum(na, 4)},\;
\|b\|=${fmtNum(nb, 4)}
$$

Angle:
$$
\cos\theta = \frac{a^\top b}{\|a\|\|b\|}
\approx ${fmtNum(cos, 4)}
\qquad
\theta \approx ${fmtNum(angleDeg, 2)}^\circ
$$

Classification: **${classification}**
`.trim();
    }, [a.x, a.y, b.x, b.y, d, na, nb, cos, angleDeg, classification]);

    return (
        <div ref={rootRef} className="w-full" style={{ touchAction: "none" }}>
            <div className={cn("grid gap-3", sideBySide ? "grid-cols-[minmax(0,1fr)_360px]" : "grid-cols-1")}>
                <div className={CARD}>
                    <div className="flex items-center gap-2 px-3 py-2">
                        <button
                            onClick={() => setActive("a")}
                            className={cn(
                                "rounded-xl border px-3 py-1 text-xs",
                                active === "a"
                                    ? "border-neutral-300 bg-neutral-900 text-white dark:border-white/15 dark:bg-white/10"
                                    : "border-neutral-200 bg-white/70 text-neutral-700 hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70 dark:hover:bg-white/[0.07]",
                            )}
                        >
                            Drag a
                        </button>
                        <button
                            onClick={() => setActive("b")}
                            className={cn(
                                "rounded-xl border px-3 py-1 text-xs",
                                active === "b"
                                    ? "border-neutral-300 bg-neutral-900 text-white dark:border-white/15 dark:bg-white/10"
                                    : "border-neutral-200 bg-white/70 text-neutral-700 hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70 dark:hover:bg-white/[0.07]",
                            )}
                        >
                            Drag b
                        </button>
                        <div className="ml-auto text-[11px] text-neutral-500 dark:text-white/50">Angle shown on pad</div>
                    </div>

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
