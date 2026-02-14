// src/components/review/sketches/linear_algebra/mod4/RotationGivensSketch.tsx
"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import VectorPad from "@/components/vectorpad/VectorPad";
import type { VectorPadState } from "@/components/vectorpad/types";
import type { Mode, Vec3 } from "@/lib/math/vec3";
import MathMarkdown from "@/components/markdown/MathMarkdown";
import { fmtNum, fmtVec2Latex } from "@/lib/review/latex";
import { CARD, PANEL, cn, useSideBySide } from "./_mod4Ui";

type Overlay2DArgs = {
    s: any;
    origin: () => { x: number; y: number };
    worldToScreen2: (v: Vec3) => { x: number; y: number };
};

function rot(thetaRad: number) {
    const c = Math.cos(thetaRad);
    const s = Math.sin(thetaRad);
    return [
        [c, -s],
        [s, c],
    ];
}
function applyR(R: number[][], v: Vec3): Vec3 {
    return { x: R[0][0] * v.x + R[0][1] * v.y, y: R[1][0] * v.x + R[1][1] * v.y, z: 0 };
}
function norm(v: Vec3) {
    return Math.hypot(v.x, v.y);
}

export default function RotationGivensSketch({ height = 420 }: { height?: number }) {
    const mode: Mode = "2d";
    const zHeldRef = useRef(false);

    const stateRef = useRef<VectorPadState>({
        a: { x: 3, y: 1, z: 0 }, // x
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

    const [x, setX] = useState<Vec3>(stateRef.current.a);
    const [theta, setTheta] = useState(45);

    const R = useMemo(() => rot((theta * Math.PI) / 180), [theta]);
    const Rx = useMemo(() => applyR(R, x), [R, x.x, x.y]);

    const overlay2D = useCallback(
        ({ s, origin, worldToScreen2 }: Overlay2DArgs) => {
            const o = origin();
            const X = worldToScreen2(x);
            const Y = worldToScreen2(Rx);

            // original x (gray-ish)
            s.push();
            s.stroke("rgba(255,255,255,0.35)");
            s.strokeWeight(4);
            s.line(o.x, o.y, X.x, X.y);
            s.pop();

            // rotated Rx (purple)
            s.push();
            s.stroke("rgba(168,85,247,0.9)");
            s.strokeWeight(4);
            s.line(o.x, o.y, Y.x, Y.y);
            s.pop();

            s.push();
            s.noStroke();
            s.fill("rgba(255,255,255,0.75)");
            s.textSize(12);
            s.textAlign(s.LEFT, s.TOP);
            s.text("gray = x", 12, 46);
            s.text("purple = R(θ)x", 12, 62);
            s.pop();
        },
        [x.x, x.y, Rx.x, Rx.y],
    );

    const { rootRef, sideBySide } = useSideBySide(820);

    const hud = useMemo(() => {
        const xL = fmtVec2Latex(Number(fmtNum(x.x, 2)), Number(fmtNum(x.y, 2)));
        const yL = fmtVec2Latex(Number(fmtNum(Rx.x, 2)), Number(fmtNum(Rx.y, 2)));

        const c = R[0][0];
        const s = R[1][0];

        return String.raw`
**Rotations (and the “Givens idea”)**

2D rotation:
$$
R(\theta)=
\begin{bmatrix}
\cos\theta & -\sin\theta\\
\sin\theta & \cos\theta
\end{bmatrix}
$$

Here $\theta=${theta}^\circ$ so:
$$
\cos\theta\approx ${fmtNum(c, 4)},\quad \sin\theta\approx ${fmtNum(s, 4)}
$$

Apply to $x$:
$$
x=${xL}
\qquad
R(\theta)x=${yL}
$$

Length preserved:
$$
\|x\|\approx ${fmtNum(norm(x), 4)}
\qquad
\|R(\theta)x\|\approx ${fmtNum(norm(Rx), 4)}
$$

**Givens rotation intuition:** in higher dimensions, you rotate only within a chosen 2D coordinate plane.
`.trim();
    }, [R, x, Rx, theta]);

    const onPreview = useCallback((na: Vec3) => {
        stateRef.current.a = na;
        setX(na);
    }, []);

    return (
        <div ref={rootRef} className="w-full" style={{ touchAction: "none" }}>
            <div className={cn("grid gap-3", sideBySide ? "grid-cols-[minmax(0,1fr)_420px]" : "grid-cols-1")}>
                <div className={CARD}>
                    <div className="px-3 py-2">
                        <div className="flex items-center gap-3">
                            <div className="text-xs text-neutral-600 dark:text-white/60">θ</div>
                            <input
                                className="w-full"
                                type="range"
                                min={-180}
                                max={180}
                                step={1}
                                value={theta}
                                onChange={(e) => setTheta(Number(e.target.value))}
                            />
                            <div className="w-14 text-right text-xs font-mono text-neutral-700 dark:text-white/70">
                                {theta}°
                            </div>
                        </div>
                    </div>

                    <VectorPad
                        mode={mode}
                        stateRef={stateRef}
                        zHeldRef={zHeldRef}
                        handles={{ a: true, b: false }}
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
