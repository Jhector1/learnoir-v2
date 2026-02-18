// src/components/review/sketches/linear_algebra/mod4/ProjectionLineSketch.tsx
"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import VectorPad from "@/components/vectorpad/VectorPad";
import type { VectorPadState } from "@/components/vectorpad/types";
import type { Mode, Vec3 } from "@/lib/math/vec3";
import MathMarkdown from "@/components/markdown/MathMarkdown";
import { fmtNum, fmtVec2Latex } from "@/lib/subjects/latex";
import { CARD, PANEL, cn, useSideBySide } from "./_mod4Ui";

type Overlay2DArgs = {
    s: any;
    origin: () => { x: number; y: number };
    worldToScreen2: (v: Vec3) => { x: number; y: number };
};

function dot(a: Vec3, b: Vec3) {
    return a.x * b.x + a.y * b.y;
}
function scale(v: Vec3, t: number): Vec3 {
    return { x: v.x * t, y: v.y * t, z: 0 };
}
function sub(a: Vec3, b: Vec3): Vec3 {
    return { x: a.x - b.x, y: a.y - b.y, z: 0 };
}

export default function ProjectionLineSketch({ height = 420 }: { height?: number }) {
    const mode: Mode = "2d";
    const zHeldRef = useRef(false);

    // a = x (the vector to project), b = direction vector
    const stateRef = useRef<VectorPadState>({
        a: { x: 4, y: 2, z: 0 },
        b: { x: 2, y: 1, z: 0 },
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
    const [x, setX] = useState<Vec3>(stateRef.current.a);
    const [b, setB] = useState<Vec3>(stateRef.current.b);

    const handles = useMemo(() => ({ a: active === "a", b: active === "b" }), [active]);

    const onPreview = useCallback(
        (v: Vec3) => {
            if (active === "a") {
                stateRef.current.a = v;
                setX(v);
            } else {
                stateRef.current.b = v;
                setB(v);
            }
        },
        [active],
    );

    const proj = useMemo(() => {
        const bb = dot(b, b);
        if (bb < 1e-12) return { x: 0, y: 0, z: 0 };
        const t = dot(x, b) / bb;
        return scale(b, t);
    }, [x.x, x.y, b.x, b.y]);

    const r = useMemo(() => sub(x, proj), [x.x, x.y, proj.x, proj.y]);

    const overlay2D = useCallback(
        ({ s, origin, worldToScreen2 }: Overlay2DArgs) => {
            const o = origin();
            const px = worldToScreen2(proj);
            const xx = worldToScreen2(x);

            // proj vector
            s.push();
            s.stroke("rgba(59,130,246,0.85)");
            s.strokeWeight(4);
            s.line(o.x, o.y, px.x, px.y);
            s.pop();

            // residual (from proj to x)
            s.push();
            s.stroke("rgba(34,197,94,0.85)");
            s.strokeWeight(4);
            s.drawingContext.setLineDash([6, 6]);
            s.line(px.x, px.y, xx.x, xx.y);
            s.drawingContext.setLineDash([]);
            s.pop();

            s.push();
            s.noStroke();
            s.fill("rgba(255,255,255,0.75)");
            s.textSize(12);
            s.textAlign(s.LEFT, s.TOP);
            s.text("blue = projection", 12, 46);
            s.text("green dashed = residual", 12, 62);
            s.pop();
        },
        [proj.x, proj.y, x.x, x.y],
    );

    const { rootRef, sideBySide } = useSideBySide(760);

    const hud = useMemo(() => {
        const xL = fmtVec2Latex(Number(fmtNum(x.x, 2)), Number(fmtNum(x.y, 2)));
        const bL = fmtVec2Latex(Number(fmtNum(b.x, 2)), Number(fmtNum(b.y, 2)));
        const pL = fmtVec2Latex(Number(fmtNum(proj.x, 3)), Number(fmtNum(proj.y, 3)));
        const rL = fmtVec2Latex(Number(fmtNum(r.x, 3)), Number(fmtNum(r.y, 3)));

        const bb = dot(b, b);
        const xb = dot(x, b);
        const t = bb < 1e-12 ? 0 : xb / bb;

        return String.raw`
**Projection onto a line**

Project $x$ onto $U=\text{span}(b)$:

$$
\pi_U(x)=\frac{b^\top x}{b^\top b}\,b
$$

$$
x=${xL},\quad b=${bL}
$$

Scalar coefficient:
$$
t=\frac{b^\top x}{b^\top b}
=\frac{${fmtNum(xb, 4)}}{${fmtNum(bb, 4)}}\approx ${fmtNum(t, 4)}
$$

Projection and residual:
$$
\pi_U(x)=${pL}
\qquad
r=x-\pi_U(x)=${rL}
$$
`.trim();
    }, [x.x, x.y, b.x, b.y, proj.x, proj.y, r.x, r.y]);

    return (
        <div ref={rootRef} className="w-full" style={{ touchAction: "none" }}>
            <div className={cn("grid gap-3", sideBySide ? "grid-cols-[minmax(0,1fr)_380px]" : "grid-cols-1")}>
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
                            Drag b
                        </button>
                    </div>

                    <VectorPad
                        mode={mode}
                        stateRef={stateRef}
                        zHeldRef={zHeldRef}
                        handles={handles}
                        previewThrottleMs={33}
                        onPreview={onPreview}
                        onCommit={onPreview}
                        overlay2D={overlay2D as any}
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
