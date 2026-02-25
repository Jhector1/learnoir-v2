"use client";

import React, { useMemo, useRef, useState } from "react";
import type p5 from "p5";
import MathMarkdown from "@/components/markdown/MathMarkdown";
import VectorPad from "@/components/vectorpad/VectorPad";
import type { VectorPadState } from "@/components/vectorpad/types";
import type { Mode, Vec3 } from "@/lib/math/vec3";
import { makeVPState } from "./_vpState";
import { dot, fmt, mulS, norm, safeDiv, v3 } from "./_vpUtils";

function dataset(): Vec3[] {
    return [
        v3(-3.5, 1.2),
        v3(-2.2, -0.8),
        v3(-1.2, 2.6),
        v3(0.4, 1.8),
        v3(1.2, -1.6),
        v3(2.4, 0.6),
        v3(3.1, -2.0),
        v3(0.8, -0.2),
        v3(-0.6, -2.7),
    ];
}

export default function GeoProjectionDatasetSketch() {
    const pts = useMemo(() => dataset(), []);

    const stateRef = useRef<VectorPadState>(
        makeVPState({
            a: { x: 0.5, y: 0.5, z: 0 },
            b: { x: 1.2, y: 0.6, z: 0 }, // line direction
            showAngle: false,
            showProjection: false,
            showUnitB: false,
            showComponents: false,
            scale: 85,
        }),
    );
    const zHeldRef = useRef(false);

    const [b, setB] = useState<Vec3>(stateRef.current.b);

    const overlay2D = useMemo(() => {
        return ({ s, worldToScreen2 }: { s: p5; worldToScreen2: (v: Vec3) => { x: number; y: number } }) => {
            const bb = dot(b, b);
            const bLen = Math.sqrt(bb);

            // draw span(b) as a long line through origin
            if (bLen > 1e-6) {
                const u = { x: b.x / bLen, y: b.y / bLen, z: 0 };
                const R = 6;
                const p0 = worldToScreen2({ x: -R * u.x, y: -R * u.y, z: 0 });
                const p1 = worldToScreen2({ x: R * u.x, y: R * u.y, z: 0 });

                s.push();
                s.stroke("rgba(255,255,255,0.45)");
                s.strokeWeight(4);
                s.line(p0.x, p0.y, p1.x, p1.y);
                s.pop();
            }

            // points + projections
            for (const x of pts) {
                const t = safeDiv(dot(b, x), bb, 0);
                const p = mulS(b, t);

                const xs = worldToScreen2(x);
                const ps = worldToScreen2(p);

                s.push();
                s.stroke("rgba(255,255,255,0.25)");
                s.strokeWeight(2);
              
                s.line(xs.x, xs.y, ps.x, ps.y);
                (s.drawingContext as any).setLineDash([]);

                s.noStroke();
                s.fill("rgba(255,255,255,0.85)");
                s.circle(xs.x, xs.y, 8);

                s.fill("rgba(255,255,255,0.65)");
                s.circle(ps.x, ps.y, 6);
                s.pop();
            }

            s.push();
            s.noStroke();
            s.fill("rgba(255,255,255,0.7)");
            s.textSize(12);
            s.textAlign(s.LEFT, s.TOP);
            s.text("Drag b to rotate the projection subspace (a line through the origin).", 12, 40);
            s.pop();
        };
    }, [b, pts]);

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-white/80">
                <span>Direction b = ({fmt(b.x)}, {fmt(b.y)}) • ‖b‖ = {fmt(norm(b))}</span>
                <span className="ml-auto">Each point drops perpendicularly onto span(b)</span>
            </div>

            <div className="h-[440px] w-full overflow-hidden rounded-xl border border-neutral-200 dark:border-white/10">
                <VectorPad
                    mode={"2d" as Mode}
                    stateRef={stateRef}
                    zHeldRef={zHeldRef}
                    handles={{ a: false, b: true }}
                    visible={{ a: false, b: true }}
                    previewThrottleMs={80}
                    onPreview={(_a, nb) => setB(nb)}
                    onCommit={(_a, nb) => setB(nb)}
                    overlay2D={overlay2D as any}
                    className="h-full w-full"
                />
            </div>

            <MathMarkdown
                content={String.raw`
Projection onto the 1D subspace \(U=\mathrm{span}(b)\):

$$\pi(x)=\frac{b^\top x}{b^\top b}\,b$$

This is the geometric picture behind **least squares**: choose a subspace, and each point “falls” orthogonally onto it.
`.trim()}
            />
        </div>
    );
}
