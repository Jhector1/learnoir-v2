// src/components/review/sketches/linear_algebra/mod4/ProjectionAffineSketch.tsx
"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import VectorPad from "@/components/vectorpad/VectorPad";
import type { VectorPadState } from "@/components/vectorpad/types";
import type { Mode, Vec3 } from "@/lib/math/vec3";
import MatrixEntryInput from "@/components/practice/MatrixEntryInput";
import MathMarkdown from "@/components/markdown/MathMarkdown";
import { seededGrid } from "@/lib/math/seededRng";
import { CARD, PANEL, cn, useSideBySide } from "./_mod4Ui";

type Overlay2DArgs = {
    s: any;
    origin: () => { x: number; y: number };
    worldToScreen2: (v: Vec3) => { x: number; y: number };
};

function dot(a: Vec3, b: Vec3) {
    return a.x * b.x + a.y * b.y;
}
function add(a: Vec3, b: Vec3): Vec3 {
    return { x: a.x + b.x, y: a.y + b.y, z: 0 };
}
function sub(a: Vec3, b: Vec3): Vec3 {
    return { x: a.x - b.x, y: a.y - b.y, z: 0 };
}
function scale(a: Vec3, t: number): Vec3 {
    return { x: a.x * t, y: a.y * t, z: 0 };
}

function vecFromGrid(g: string[][]): Vec3 {
    const x = Number(g?.[0]?.[0] ?? 0);
    const y = Number(g?.[1]?.[0] ?? 0);
    return { x: Number.isFinite(x) ? x : 0, y: Number.isFinite(y) ? y : 0, z: 0 };
}

function fmtVec(v: Vec3) {
    return String.raw`\begin{bmatrix}${v.x.toFixed(3).replace(/\.000$/, "")}\\${v.y
        .toFixed(3)
        .replace(/\.000$/, "")}\end{bmatrix}`;
}

export default function ProjectionAffineSketch({ height = 460 }: { height?: number }) {
    const mode: Mode = "2d";
    const zHeldRef = useRef(false);

    // a = x (point), b = x0 (anchor point)
    const stateRef = useRef<VectorPadState>({
        a: { x: 3, y: 3, z: 0 },
        b: { x: -2, y: 1, z: 0 },
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
    const [x0, setX0] = useState<Vec3>(stateRef.current.b);

    const [dgrid, setDgrid] = useState<string[][]>(() => seededGrid(2, 1, "mod4.affine.d"));
    const d = useMemo(() => vecFromGrid(dgrid), [dgrid]);

    const handles = useMemo(() => ({ a: active === "a", b: active === "b" }), [active]);

    const onPreview = useCallback(
        (v: Vec3) => {
            if (active === "a") {
                stateRef.current.a = v;
                setX(v);
            } else {
                stateRef.current.b = v;
                setX0(v);
            }
        },
        [active],
    );

    const proj = useMemo(() => {
        // project y=(x-x0) onto span(d), then add x0
        const y = sub(x, x0);
        const dd = dot(d, d);
        if (dd < 1e-12) return x0; // degenerate direction
        const t = dot(y, d) / dd;
        return add(x0, scale(d, t));
    }, [x.x, x.y, x0.x, x0.y, d.x, d.y]);

    const overlay2D = useCallback(
        ({ s, origin, worldToScreen2 }: Overlay2DArgs) => {
            // draw affine line through x0 in direction d
            const t1 = -20;
            const t2 = 20;
            const p1 = add(x0, scale(d, t1));
            const p2 = add(x0, scale(d, t2));

            const P1 = worldToScreen2(p1);
            const P2 = worldToScreen2(p2);
            const X = worldToScreen2(x);
            const P = worldToScreen2(proj);

            s.push();
            s.stroke("rgba(255,255,255,0.25)");
            s.strokeWeight(2);
            s.line(P1.x, P1.y, P2.x, P2.y);
            s.pop();

            // connect x -> proj
            s.push();
            s.stroke("rgba(34,197,94,0.85)");
            s.strokeWeight(3);
          
            s.line(X.x, X.y, P.x, P.y);
            s.drawingContext.setLineDash([]);
            s.pop();

            // mark proj point
            s.push();
            s.noStroke();
            s.fill("rgba(34,197,94,0.9)");
            s.circle(P.x, P.y, 8);
            s.pop();
        },
        [x.x, x.y, x0.x, x0.y, d.x, d.y, proj.x, proj.y],
    );

    const { rootRef, sideBySide } = useSideBySide(820);

    const hud = useMemo(() => {
        const y = sub(x, x0);
        const dd = dot(d, d);
        const t = dd < 1e-12 ? 0 : dot(y, d) / dd;

        return String.raw`
**Projection onto an affine line**

Affine line:
$$
L = x_0 + \text{span}(d)
$$

Algorithm:
1) shift: $y=x-x_0$  
2) project onto $\text{span}(d)$  
3) unshift: $\pi_L(x)=x_0+\pi_{\text{span}(d)}(y)$

Values:
$$
x=${fmtVec(x)},\quad x_0=${fmtVec(x0)},\quad d=${fmtVec(d)}
$$

$$
t=\frac{d^\top(x-x_0)}{d^\top d}\approx ${t.toFixed(4)}
\qquad
\pi_L(x) = ${fmtVec(proj)}
$$
`.trim();
    }, [x, x0, d, proj]);

    return (
        <div ref={rootRef} className="w-full p-4" style={{ height, touchAction: "none" }}>
            <div className={cn("grid gap-3", sideBySide ? "grid-cols-[minmax(0,1fr)_380px]" : "grid-cols-1")}>
                <div className={CARD}>
                    <div className="flex flex-wrap items-center gap-2 px-3 py-2">
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
                            Drag x₀
                        </button>

                        <div className="ml-auto">
                            <MatrixEntryInput
                                labelLatex={String.raw`d=`}
                                rows={2}
                                cols={1}
                                value={dgrid}
                                onChange={setDgrid}
                                cellWidthClass="w-16"
                            />
                        </div>
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
