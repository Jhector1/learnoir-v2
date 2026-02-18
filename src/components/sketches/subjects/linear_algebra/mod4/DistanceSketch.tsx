// src/components/review/sketches/linear_algebra/mod4/DistanceSketch.tsx
"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import VectorPad from "@/components/vectorpad/VectorPad";
import type { VectorPadState } from "@/components/vectorpad/types";
import type { Mode, Vec3 } from "@/lib/math/vec3";
import MathMarkdown from "@/components/markdown/MathMarkdown";
import { fmtNum, fmtVec2Latex } from "@/lib/subjects/latex";
import { CARD, PANEL, cn, useSideBySide } from "./_mod4Ui";

function dist(a: Vec3, b: Vec3) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

export default function DistanceSketch({ height = 420 }: { height?: number }) {
    const mode: Mode = "2d";
    const zHeldRef = useRef(false);

    const stateRef = useRef<VectorPadState>({
        a: { x: -2, y: 1, z: 0 },
        b: { x: 3, y: 4, z: 0 },
        scale: 26,
        showGrid: true,
        snapToGrid: true,
        autoGridStep: false,
        gridStep: 1,
        showComponents: false,
        showAngle: false,
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

    const onCommit = onPreview;

    const d = useMemo(() => dist(a, b), [a.x, a.y, b.x, b.y]);

    const { rootRef, sideBySide } = useSideBySide(760);

    const hud = useMemo(() => {
        const ax = fmtVec2Latex(Number(fmtNum(a.x, 2)), Number(fmtNum(a.y, 2)));
        const bx = fmtVec2Latex(Number(fmtNum(b.x, 2)), Number(fmtNum(b.y, 2)));
        return String.raw`
**Distance**

Drag point $x$ or $y$ (toggle which one is active).

$$
x=${ax},\quad y=${bx}
$$

Euclidean distance:
$$
d(x,y)=\|x-y\|_2 = \sqrt{(x_1-y_1)^2+(x_2-y_2)^2}\approx ${fmtNum(d, 4)}
$$
`.trim();
    }, [a.x, a.y, b.x, b.y, d]);

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
                            Drag x
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
                            Drag y
                        </button>
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
                        )}
                        content={hud}
                    />
                </div>
            </div>
        </div>
    );
}
