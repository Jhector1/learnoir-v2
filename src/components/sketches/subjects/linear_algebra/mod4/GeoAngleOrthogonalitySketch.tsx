"use client";

import React, { useRef, useState } from "react";
import MathMarkdown from "@/components/markdown/MathMarkdown";
import VectorPad from "@/components/vectorpad/VectorPad";
import type { VectorPadState } from "@/components/vectorpad/types";
import type { Mode, Vec3 } from "@/lib/math/vec3";
import { makeVPState } from "./_vpState";
import { dot, fmt, norm, safeDiv } from "./_vpUtils";

export default function GeoAngleOrthogonalitySketch() {
    const stateRef = useRef<VectorPadState>(
        makeVPState({
            a: { x: 2, y: 1, z: 0 },
            b: { x: 1, y: 2, z: 0 },
            showAngle: true,
            showProjection: false,
            showUnitB: false,
            showComponents: false,
            scale: 90,
        }),
    );
    const zHeldRef = useRef(false);

    const [a, setA] = useState<Vec3>(stateRef.current.a);
    const [b, setB] = useState<Vec3>(stateRef.current.b);

    const d = dot(a, b);
    const cos = safeDiv(d, norm(a) * norm(b), 0);
    const ang = Math.acos(Math.max(-1, Math.min(1, cos))) * (180 / Math.PI);
    const orth = Math.abs(d) < 1e-6;

    const tag =
        orth ? "Orthogonal (aᵀb = 0)" : d > 0 ? "Acute (aᵀb > 0)" : "Obtuse (aᵀb < 0)";

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-white/80">
        <span className={orth ? "text-emerald-700 dark:text-emerald-300" : d > 0 ? "text-sky-700 dark:text-sky-300" : "text-rose-700 dark:text-rose-300"}>
          {tag}
        </span>
                <span className="ml-auto">aᵀb = {fmt(d)} • cos(θ) = {fmt(cos)} • θ ≈ {fmt(ang, 2)}°</span>
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
                        setA(na);
                        setB(nb);
                    }}
                    onCommit={(na, nb) => {
                        setA(na);
                        setB(nb);
                    }}
                    className="h-full w-full"
                />
            </div>

            <MathMarkdown
                content={String.raw`
Angle from dot product:

$$\cos(\theta)=\frac{a^\top b}{\|a\|\,\|b\|}$$

Orthogonality:

$$a\perp b \iff a^\top b=0$$

Drag the vector tips to make \(a^\top b\) positive / negative / zero.
`.trim()}
            />
        </div>
    );
}
