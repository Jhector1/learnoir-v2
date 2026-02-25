"use client";

import React, { useRef, useState } from "react";
import MathMarkdown from "@/components/markdown/MathMarkdown";
import VectorPad from "@/components/vectorpad/VectorPad";
import type { VectorPadState } from "@/components/vectorpad/types";
import type { Mode, Vec3 } from "@/lib/math/vec3";
import { makeVPState } from "./_vpState";
import { dot, fmt, mulS, safeDiv, sub } from "./_vpUtils";

export default function GeoProjectionLineSketch() {
    const stateRef = useRef<VectorPadState>(
        makeVPState({
            a: { x: 1, y: 3, z: 0 }, // x
            b: { x: 2, y: 1, z: 0 }, // b
            showAngle: false,
            showProjection: true,
            showPerp: true,
            showUnitB: true,
            showComponents: false,
            scale: 90,
        }),
    );
    const zHeldRef = useRef(false);

    const [x, setX] = useState<Vec3>(stateRef.current.a);
    const [b, setB] = useState<Vec3>(stateRef.current.b);

    const bb = dot(b, b);
    const t = safeDiv(dot(b, x), bb, 0);
    const proj = mulS(b, t);
    const err = sub(x, proj);

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-white/80">
                <span>t = (bᵀx)/(bᵀb) = {fmt(t)}</span>
                <span className="ml-auto">
          π(x)=({fmt(proj.x)}, {fmt(proj.y)}) • error=({fmt(err.x)}, {fmt(err.y)})
        </span>
            </div>

            <div className="h-[440px] w-full overflow-hidden rounded-xl border border-neutral-200 dark:border-white/10">
                <VectorPad
                    mode={"2d" as Mode}
                    stateRef={stateRef}
                    zHeldRef={zHeldRef}
                    handles={{ a: true, b: true }}
                    visible={{ a: true, b: true }}
                    previewThrottleMs={80}
                    onPreview={(na, nb) => {
                        setX(na);
                        setB(nb);
                    }}
                    onCommit={(na, nb) => {
                        setX(na);
                        setB(nb);
                    }}
                    className="h-full w-full"
                />
            </div>

            <MathMarkdown
                content={String.raw`
Projection onto the line \(U=\mathrm{span}(b)\):

$$\pi_U(x)=\frac{b^\top x}{b^\top b}\,b$$

The residual is perpendicular:

$$x-\pi_U(x)\ \perp\ b$$
`.trim()}
            />
        </div>
    );
}
