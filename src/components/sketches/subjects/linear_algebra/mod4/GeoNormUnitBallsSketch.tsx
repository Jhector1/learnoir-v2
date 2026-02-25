"use client";

import React, { useMemo, useRef, useState } from "react";
import type p5 from "p5";
import MathMarkdown from "@/components/markdown/MathMarkdown";
import VectorPad from "@/components/vectorpad/VectorPad";
import type { VectorPadState } from "@/components/vectorpad/types";
import { COLORS, type Mode, type Vec3 } from "@/lib/math/vec3";
import { makeVPState } from "./_vpState";
import { fmt } from "./_vpUtils";

type Show = "both" | "l1" | "l2";

function l1norm2D(a: Vec3) {
    return Math.abs(a.x) + Math.abs(a.y);
}
function l2norm2D(a: Vec3) {
    return Math.sqrt(a.x * a.x + a.y * a.y);
}

export default function GeoNormUnitBallsSketch() {
    const stateRef = useRef<VectorPadState>(
        makeVPState({
            a: { x: 1.2, y: 0.6, z: 0 },
            b: { x: 2, y: 0, z: 0 },
            showAngle: false,
            showProjection: false,
            showUnitB: false,
            showComponents: false,
            scale: 90,
        }),
    );
    const zHeldRef = useRef(false);

    const [show, setShow] = useState<Show>("both");
    const [a, setA] = useState<Vec3>(stateRef.current.a);

    const overlay2D = useMemo(() => {
        return ({ s, worldToScreen2 }: { s: p5; worldToScreen2: (v: Vec3) => { x: number; y: number } }) => {
            const drawPolyline = (pts: Vec3[], alpha = 0.85, weight = 3) => {
                s.push();
                s.noFill();
                s.stroke(`rgba(255,255,255,${alpha})`);
                s.strokeWeight(weight);
                s.beginShape();
                for (const p of pts) {
                    const q = worldToScreen2(p);
                    s.vertex(q.x, q.y);
                }
                s.endShape();
                s.pop();
            };

            // L2 unit circle
            const circlePts: Vec3[] = [];
            if (show !== "l1") {
                const N = 240;
                for (let k = 0; k <= N; k++) {
                    const t = (2 * Math.PI * k) / N;
                    circlePts.push({ x: Math.cos(t), y: Math.sin(t), z: 0 });
                }
                drawPolyline(circlePts, 0.35, 3);
            }

            // L1 unit diamond: |x|+|y|=1
            if (show !== "l2") {
                const diamond: Vec3[] = [
                    { x: 1, y: 0, z: 0 },
                    { x: 0, y: 1, z: 0 },
                    { x: -1, y: 0, z: 0 },
                    { x: 0, y: -1, z: 0 },
                    { x: 1, y: 0, z: 0 },
                ];
                drawPolyline(diamond, 0.85, 3);
            }

            // tiny legend
            s.push();
            s.noStroke();
            s.fill("rgba(255,255,255,0.75)");
            s.textSize(12);
            s.textAlign(s.LEFT, s.TOP);
            s.text("Unit balls:  ‖x‖₂≤1 (circle)   ‖x‖₁≤1 (diamond)", 12, 40);
            s.pop();
        };
    }, [show]);

    const l1 = l1norm2D(a);
    const l2 = l2norm2D(a);

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
                <label className="text-xs font-extrabold text-neutral-700 dark:text-white/80">Show</label>
                <select
                    className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-sm dark:border-white/10 dark:bg-white/[0.03]"
                    value={show}
                    onChange={(e) => setShow(e.target.value as any)}
                >
                    <option value="both">ℓ1 and ℓ2</option>
                    <option value="l1">ℓ1 only</option>
                    <option value="l2">ℓ2 only</option>
                </select>

                <div className="ml-auto text-xs font-semibold text-neutral-700 dark:text-white/80">
                    a = ({fmt(a.x)}, {fmt(a.y)}) • ‖a‖₁ = {fmt(l1)} • ‖a‖₂ = {fmt(l2)}
                </div>
            </div>

            <div className="h-[440px] w-full overflow-hidden rounded-xl border border-neutral-200 dark:border-white/10">
                <VectorPad
                    mode={"2d" as Mode}
                    stateRef={stateRef}
                    zHeldRef={zHeldRef}
                    handles={{ a: true, b: false }}
                    visible={{ a: true, b: false }}
                    previewThrottleMs={80}
                    onPreview={(na) => setA(na)}
                    onCommit={(na) => setA(na)}
                    overlay2D={overlay2D as any}
                    className="h-full w-full"
                />
            </div>

            <MathMarkdown
                content={String.raw`
A **unit ball** is the set \(\{x : \|x\|\le 1\}\).

- **Euclidean**: \(\|x\|_2=\sqrt{x_1^2+x_2^2}\) → circle
- **Manhattan**: \(\|x\|_1=|x_1|+|x_2|\) → diamond

Drag the point (vector) \(a\).
`.trim()}
            />
        </div>
    );
}
