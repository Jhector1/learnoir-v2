"use client";

import React, { useMemo, useRef, useState } from "react";
import type p5 from "p5";
import MathMarkdown from "@/components/markdown/MathMarkdown";
import VectorPad from "@/components/vectorpad/VectorPad";
import type { VectorPadState } from "@/components/vectorpad/types";
import type { Mode, Vec3 } from "@/lib/math/vec3";
import { makeVPState } from "./_vpState";
import { add, dot, fmt, mulS, safeDiv, sub, v3 } from "./_vpUtils";

export default function GeoProjectionAffineSketch() {
    // We use VectorPad vectors as *position vectors*:
    // b = x0 (base point), a = x (point to project)
    const stateRef = useRef<VectorPadState>(
        makeVPState({
            a: { x: 2, y: 3, z: 0 },
            b: { x: -1, y: 1, z: 0 },
            showAngle: false,
            showProjection: false,
            showUnitB: false,
            showComponents: false,
            scale: 85,
        }),
    );
    const zHeldRef = useRef(false);

    const [x, setX] = useState<Vec3>(stateRef.current.a);
    const [x0, setX0] = useState<Vec3>(stateRef.current.b);

    const [deg, setDeg] = useState(20);
    const theta = (deg * Math.PI) / 180;
    const dir = useMemo(() => v3(Math.cos(theta), Math.sin(theta), 0), [theta]);

    const t = safeDiv(dot(dir, sub(x, x0)), dot(dir, dir), 0);
    const proj = add(x0, mulS(dir, t));

    const overlay2D = useMemo(() => {
        return ({ s, worldToScreen2 }: { s: p5; worldToScreen2: (v: Vec3) => { x: number; y: number } }) => {
            // draw affine line L = x0 + span(dir)
            const R = 6;
            const pA = add(x0, mulS(dir, -R));
            const pB = add(x0, mulS(dir, R));
            const A = worldToScreen2(pA);
            const B = worldToScreen2(pB);

            s.push();
            s.stroke("rgba(255,255,255,0.5)");
            s.strokeWeight(4);
            s.line(A.x, A.y, B.x, B.y);
            s.pop();

            // drop segment from x to proj
            const xs = worldToScreen2(x);
            const ps = worldToScreen2(proj);

            s.push();
            s.stroke("rgba(255,255,255,0.3)");
            s.strokeWeight(2);
            s.drawingContext.setLineDash([6, 6]);
            s.line(xs.x, xs.y, ps.x, ps.y);
            (s.drawingContext as any).setLineDash([]);
            s.pop();

            // mark projection point
            s.push();
            s.noStroke();
            s.fill("rgba(255,255,255,0.75)");
            s.circle(ps.x, ps.y, 10);
            s.fill("rgba(0,0,0,0.35)");
            s.circle(ps.x, ps.y, 4);
            s.pop();

            s.push();
            s.noStroke();
            s.fill("rgba(255,255,255,0.7)");
            s.textSize(12);
            s.textAlign(s.LEFT, s.TOP);
            s.text("Affine line: L = x0 + span(dir). Drag x and x0. Use slider for dir.", 12, 40);
            s.pop();
        };
    }, [x, x0, dir, proj]);

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
                <label className="text-xs font-extrabold text-neutral-700 dark:text-white/80">dir angle</label>
                <input
                    type="range"
                    min={-180}
                    max={180}
                    value={deg}
                    onChange={(e) => setDeg(Number(e.target.value))}
                    className="w-64"
                />
                <div className="text-xs font-semibold text-neutral-700 dark:text-white/80">{deg}°</div>

                <div className="ml-auto text-xs font-semibold text-neutral-700 dark:text-white/80">
                    πL(x)=({fmt(proj.x)}, {fmt(proj.y)})
                </div>
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
                        setX0(nb);
                    }}
                    onCommit={(na, nb) => {
                        setX(na);
                        setX0(nb);
                    }}
                    overlay2D={overlay2D as any}
                    className="h-full w-full"
                />
            </div>

            <MathMarkdown
                markdown={String.raw`
Affine subspace:

$$L = x_0 + U,\quad U=\mathrm{span}(\mathrm{dir})$$

Projection onto \(L\):

$$\pi_L(x)=x_0+\pi_U(x-x_0)$$

where

$$\pi_U(z)=\frac{\mathrm{dir}^\top z}{\mathrm{dir}^\top \mathrm{dir}}\ \mathrm{dir}$$
`.trim()}
            />
        </div>
    );
}
