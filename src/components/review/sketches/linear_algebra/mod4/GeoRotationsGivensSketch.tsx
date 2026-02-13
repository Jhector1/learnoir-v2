"use client";

import React, { useMemo, useRef, useState } from "react";
import type p5 from "p5";
import MathMarkdown from "@/components/math/MathMarkdown";
import VectorPad from "@/components/vectorpad/VectorPad";
import type { VectorPadState } from "@/components/vectorpad/types";
import type { Mode, Vec3 } from "@/lib/math/vec3";
import { makeVPState } from "./_vpState";
import { fmt, v3 } from "./_vpUtils";

function rot2(theta: number, v: Vec3): Vec3 {
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    return { x: c * v.x - s * v.y, y: s * v.x + c * v.y, z: 0 };
}

type Plane = "12" | "13" | "23";

function givensRotate(w: [number, number, number], plane: Plane, theta: number): [number, number, number] {
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    let [x, y, z] = w;

    if (plane === "12") {
        const nx = c * x - s * y;
        const ny = s * x + c * y;
        return [nx, ny, z];
    }
    if (plane === "13") {
        const nx = c * x - s * z;
        const nz = s * x + c * z;
        return [nx, y, nz];
    }
    // "23"
    const ny = c * y - s * z;
    const nz = s * y + c * z;
    return [x, ny, nz];
}

function Num(props: { value: number; onChange: (v: number) => void }) {
    return (
        <input
            type="number"
            value={props.value}
            onChange={(e) => props.onChange(Number(e.target.value))}
            className="w-20 rounded-lg border border-neutral-200 bg-white px-2 py-1 text-sm dark:border-white/10 dark:bg-white/[0.03]"
        />
    );
}

export default function GeoRotationsGivensSketch() {
    // 2D rotation demo uses VectorPad for draggable v (vector a)
    const stateRef = useRef<VectorPadState>(
        makeVPState({
            a: { x: 2, y: 1, z: 0 },
            b: { x: 0, y: 0, z: 0 },
            showAngle: false,
            showProjection: false,
            showUnitB: false,
            showComponents: false,
            scale: 85,
        }),
    );
    const zHeldRef = useRef(false);

    const [v, setV] = useState<Vec3>(stateRef.current.a);
    const [deg, setDeg] = useState(30);
    const theta = (deg * Math.PI) / 180;
    const Rv = useMemo(() => rot2(theta, v), [theta, v]);

    const overlay2D = useMemo(() => {
        return ({ s, origin, worldToScreen2 }: any) => {
            const O = origin();
            const tip = worldToScreen2(Rv);

            // draw rotated vector (as a bright overlay arrow)
            s.push();
            s.stroke("rgba(255,255,255,0.9)");
            s.strokeWeight(4);
            s.line(O.x, O.y, tip.x, tip.y);

            // arrow head
            const ang = Math.atan2(tip.y - O.y, tip.x - O.x);
            const head = 12;
            s.push();
            s.translate(tip.x, tip.y);
            s.rotate(ang);
            s.line(0, 0, -head, -head * 0.55);
            s.line(0, 0, -head, head * 0.55);
            s.pop();

            s.noStroke();
            s.fill("rgba(255,255,255,0.75)");
            s.textSize(12);
            s.textAlign(s.LEFT, s.CENTER);
            s.text("Rv", tip.x + 10, tip.y);
            s.pop();
        };
    }, [Rv]);

    // Givens (text + numeric)
    const [plane, setPlane] = useState<Plane>("12");
    const [gdeg, setGdeg] = useState(25);
    const gth = (gdeg * Math.PI) / 180;
    const [w, setW] = useState<[number, number, number]>([2, -1, 3]);
    const Gw = useMemo(() => givensRotate(w, plane, gth), [w, plane, gth]);

    return (
        <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-neutral-200 bg-white p-3 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="text-xs font-extrabold text-neutral-700 dark:text-white/80">2D rotation</div>
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
                        Rv = ({fmt(Rv.x)}, {fmt(Rv.y)})
                    </div>
                </div>

                <div className="mt-3 h-[420px] w-full overflow-hidden rounded-xl border border-neutral-200 dark:border-white/10">
                    <VectorPad
                        mode={"2d" as Mode}
                        stateRef={stateRef}
                        zHeldRef={zHeldRef}
                        handles={{ a: true, b: false }}
                        visible={{ a: true, b: false }}
                        previewThrottleMs={80}
                        onPreview={(na) => setV(na)}
                        onCommit={(na) => setV(na)}
                        overlay2D={overlay2D as any}
                        className="h-full w-full"
                    />
                </div>

                <MathMarkdown
                    markdown={String.raw`
Rotation matrix:

$$R(\theta)=\begin{bmatrix}\cos\theta & -\sin\theta\\ \sin\theta & \cos\theta\end{bmatrix}$$

Drag \(v\) and change \(\theta\). The bright arrow is \(Rv\).
`.trim()}
                />
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-3 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="text-xs font-extrabold text-neutral-700 dark:text-white/80">Givens rotation (n-D concept)</div>
                    <label className="text-xs font-semibold text-neutral-600 dark:text-white/70">Plane</label>
                    <select
                        value={plane}
                        onChange={(e) => setPlane(e.target.value as Plane)}
                        className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-sm dark:border-white/10 dark:bg-white/[0.03]"
                    >
                        <option value="12">(1,2)-plane</option>
                        <option value="13">(1,3)-plane</option>
                        <option value="23">(2,3)-plane</option>
                    </select>

                    <label className="text-xs font-semibold text-neutral-600 dark:text-white/70">θ</label>
                    <input
                        type="range"
                        min={-180}
                        max={180}
                        value={gdeg}
                        onChange={(e) => setGdeg(Number(e.target.value))}
                        className="w-48"
                    />
                    <div className="text-xs font-semibold text-neutral-700 dark:text-white/80">{gdeg}°</div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2">
                        <div className="text-xs font-bold text-neutral-700 dark:text-white/80">w</div>
                        <Num value={w[0]} onChange={(x) => setW([x, w[1], w[2]])} />
                        <Num value={w[1]} onChange={(y) => setW([w[0], y, w[2]])} />
                        <Num value={w[2]} onChange={(z) => setW([w[0], w[1], z])} />
                    </div>

                    <div className="ml-auto text-xs font-semibold text-neutral-700 dark:text-white/80">
                        G(w)=({fmt(Gw[0])}, {fmt(Gw[1])}, {fmt(Gw[2])})
                    </div>
                </div>

                <MathMarkdown
                    markdown={String.raw`
A **Givens rotation** rotates only two coordinates \((i,j)\) and leaves the rest unchanged.

In that plane:

$$\begin{bmatrix}w_i'\\ w_j'\end{bmatrix}=
\begin{bmatrix}\cos\theta & -\sin\theta\\ \sin\theta & \cos\theta\end{bmatrix}
\begin{bmatrix}w_i\\ w_j\end{bmatrix}$$
`.trim()}
                />
            </div>
        </div>
    );
}
