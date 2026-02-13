// src/components/review/sketches/linear_algebra/mod4/OrthonormalBasisCoordsSketch.tsx
"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import VectorPad from "@/components/vectorpad/VectorPad";
import type { VectorPadState } from "@/components/vectorpad/types";
import type { Mode, Vec3 } from "@/lib/math/vec3";
import MathMarkdown from "@/components/math/MathMarkdown";
import { fmtNum, fmtVec2Latex } from "@/lib/review/latex";
import { CARD, PANEL, cn, useSideBySide } from "./_mod4Ui";

function matVec2(B: number[][], x: Vec3): Vec3 {
    return { x: B[0][0] * x.x + B[0][1] * x.y, y: B[1][0] * x.x + B[1][1] * x.y, z: 0 };
}
function BtVec2(B: number[][], x: Vec3): Vec3 {
    // B^T x
    return { x: B[0][0] * x.x + B[1][0] * x.y, y: B[0][1] * x.x + B[1][1] * x.y, z: 0 };
}
function norm2(v: Vec3) {
    return Math.hypot(v.x, v.y);
}

function rot(thetaRad: number) {
    const c = Math.cos(thetaRad);
    const s = Math.sin(thetaRad);
    return [
        [c, -s],
        [s, c],
    ];
}

export default function OrthonormalBasisCoordsSketch({ height = 420 }: { height?: number }) {
    const mode: Mode = "2d";
    const zHeldRef = useRef(false);

    const stateRef = useRef<VectorPadState>({
        a: { x: 3, y: 2, z: 0 }, // x
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
    const [theta, setTheta] = useState(30); // degrees

    const B = useMemo(() => rot((theta * Math.PI) / 180), [theta]);
    const lam = useMemo(() => BtVec2(B, x), [B, x.x, x.y]);
    const recon = useMemo(() => matVec2(B, lam), [B, lam.x, lam.y]);
    const err = useMemo(() => Math.hypot(recon.x - x.x, recon.y - x.y), [recon.x, recon.y, x.x, x.y]);

    const onPreview = useCallback((na: Vec3) => {
        stateRef.current.a = na;
        setX(na);
    }, []);

    const { rootRef, sideBySide } = useSideBySide(760);

    const hud = useMemo(() => {
        const xL = fmtVec2Latex(Number(fmtNum(x.x, 2)), Number(fmtNum(x.y, 2)));
        const lL = fmtVec2Latex(Number(fmtNum(lam.x, 3)), Number(fmtNum(lam.y, 3)));
        const rL = fmtVec2Latex(Number(fmtNum(recon.x, 3)), Number(fmtNum(recon.y, 3)));

        return String.raw`
**Orthonormal basis coordinates**

Let $B$ have orthonormal columns (here: a 2D rotation by ${theta}°).  
Coordinates are:
$$
\lambda = B^\top x
$$
Reconstruction:
$$
x = B\lambda
$$

$$
x=${xL}
\qquad
\lambda=B^\top x=${lL}
\qquad
B\lambda=${rL}
$$

Error:
$$
\|B\lambda - x\|_2 \approx ${fmtNum(err, 6)}
$$

Lengths (rotation preserves length):
$$
\|x\|\approx ${fmtNum(norm2(x), 4)}
\qquad
\|\lambda\|\approx ${fmtNum(norm2(lam), 4)}
$$
`.trim();
    }, [x.x, x.y, lam.x, lam.y, recon.x, recon.y, err, theta]);

    return (
        <div ref={rootRef} className="w-full" style={{ touchAction: "none" }}>
            <div className={cn("grid gap-3", sideBySide ? "grid-cols-[minmax(0,1fr)_380px]" : "grid-cols-1")}>
                <div className={CARD}>
                    <div className="px-3 py-2">
                        <div className="flex items-center gap-3">
                            <div className="text-xs text-neutral-600 dark:text-white/60">Rotate basis θ</div>
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
