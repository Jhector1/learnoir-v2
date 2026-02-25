"use client";

import React, { useMemo, useRef, useState } from "react";
import type p5 from "p5";
import MathMarkdown from "@/components/markdown/MathMarkdown";
import VectorPad from "@/components/vectorpad/VectorPad";
import type { VectorPadState } from "@/components/vectorpad/types";
import type { Mode, Vec3 } from "@/lib/math/vec3";
import { makeVPState } from "./_vpState";
import { fmt, isSPD2, mat2Latex, safeDiv, type Mat2, xTAx, xTAy, dot, norm } from "./_vpUtils";

function Num(props: { value: number; onChange: (v: number) => void; step?: number }) {
    return (
        <input
            type="number"
            step={props.step ?? 1}
            value={props.value}
            onChange={(e) => props.onChange(Number(e.target.value))}
            className="w-20 rounded-lg border border-neutral-200 bg-white px-2 py-1 text-sm dark:border-white/10 dark:bg-white/[0.03]"
        />
    );
}

export default function GeoInnerProductGeometrySketch() {
    const [a11, setA11] = useState(2);
    const [a12, setA12] = useState(1);
    const [a22, setA22] = useState(2);

    const A: Mat2 = useMemo(
        () =>
            [
                [a11, a12],
                [a12, a22],
            ] as Mat2,
        [a11, a12, a22],
    );

    const stateRef = useRef<VectorPadState>(
        makeVPState({
            a: { x: 1.2, y: 0.2, z: 0 },
            b: { x: 0.4, y: 1.1, z: 0 },
            showAngle: true,
            showProjection: false,
            showUnitB: false,
            showComponents: false,
            scale: 90,
        }),
    );
    const zHeldRef = useRef(false);

    const [x, setX] = useState<Vec3>(stateRef.current.a);
    const [y, setY] = useState<Vec3>(stateRef.current.b);

    const okSPD = isSPD2(A);

    const overlay2D = useMemo(() => {
        return ({ s, worldToScreen2 }: { s: p5; worldToScreen2: (v: Vec3) => { x: number; y: number } }) => {
            const drawPath = (pts: Vec3[], alpha = 0.35, weight = 3) => {
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

            // standard unit circle
            const circle: Vec3[] = [];
            const N = 240;
            for (let k = 0; k <= N; k++) {
                const t = (2 * Math.PI * k) / N;
                circle.push({ x: Math.cos(t), y: Math.sin(t), z: 0 });
            }
            drawPath(circle, 0.25, 3);

            // A-unit ball: x^T A x = 1 (polar: r = 1/sqrt(u^T A u))
            const ell: Vec3[] = [];
            const M = 360;
            for (let k = 0; k <= M; k++) {
                const t = (2 * Math.PI * k) / M;
                const u = { x: Math.cos(t), y: Math.sin(t), z: 0 };
                const q = xTAx(u, A);
                const r = q > 1e-12 ? 1 / Math.sqrt(q) : 0;
                ell.push({ x: u.x * r, y: u.y * r, z: 0 });
            }
            drawPath(ell, 0.75, 3);

            s.push();
            s.noStroke();
            s.fill("rgba(255,255,255,0.7)");
            s.textSize(12);
            s.textAlign(s.LEFT, s.TOP);
            s.text("circle: ‖x‖₂=1   ellipse: xᵀAx=1", 12, 40);
            s.pop();
        };
    }, [A]);

    const dotStd = dot(x, y);
    const cosStd = safeDiv(dotStd, norm(x) * norm(y), 0);
    const angStd = Math.acos(Math.max(-1, Math.min(1, cosStd))) * (180 / Math.PI);

    const ipA = xTAy(x, A, y);
    const nxA = Math.sqrt(Math.max(0, xTAx(x, A)));
    const nyA = Math.sqrt(Math.max(0, xTAx(y, A)));
    const cosA = safeDiv(ipA, nxA * nyA, 0);
    const angA = Math.acos(Math.max(-1, Math.min(1, cosA))) * (180 / Math.PI);

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
                <div className="text-xs font-extrabold text-neutral-700 dark:text-white/80">SPD matrix A (symmetric)</div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-600 dark:text-white/70">a11</span>
                    <Num value={a11} onChange={setA11} />
                    <span className="text-xs text-neutral-600 dark:text-white/70">a12</span>
                    <Num value={a12} onChange={setA12} />
                    <span className="text-xs text-neutral-600 dark:text-white/70">a22</span>
                    <Num value={a22} onChange={setA22} />
                </div>

                <div className="ml-auto text-xs font-semibold">
                    {okSPD ? (
                        <span className="text-emerald-700 dark:text-emerald-300">SPD ✓</span>
                    ) : (
                        <span className="text-rose-700 dark:text-rose-300">Not SPD</span>
                    )}
                </div>
            </div>

            <div className="h-[440px] w-full overflow-hidden rounded-xl border border-neutral-200 dark:border-white/10">
                <VectorPad
                    mode={"2d" as Mode}
                    stateRef={stateRef}
                    zHeldRef={useRef(false)}
                    handles={{ a: true, b: true }}
                    visible={{ a: true, b: true }}
                    previewThrottleMs={80}
                    onPreview={(na, nb) => {
                        setX(na);
                        setY(nb);
                    }}
                    onCommit={(na, nb) => {
                        setX(na);
                        setY(nb);
                    }}
                    overlay2D={overlay2D as any}
                    className="h-full w-full"
                />
            </div>

            <div className="grid gap-2 text-xs text-neutral-700 dark:text-white/80 sm:grid-cols-2">
                <div className="rounded-xl border border-neutral-200 bg-white p-3 dark:border-white/10 dark:bg-white/[0.03]">
                    <div className="font-extrabold">Standard dot product</div>
                    <div className="mt-1">xᵀy = {fmt(dotStd)}</div>
                    <div>angle ≈ {fmt(angStd, 2)}°</div>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-white p-3 dark:border-white/10 dark:bg-white/[0.03]">
                    <div className="font-extrabold">A-inner product</div>
                    <div className="mt-1">⟨x,y⟩ₐ = xᵀAy = {fmt(ipA)}</div>
                    <div>angleₐ ≈ {fmt(angA, 2)}°</div>
                </div>
            </div>

            <MathMarkdown
                content={String.raw`
Weighted inner product:

$$\langle x,y\rangle_A = x^\top A y$$

Induced “unit ball”:

$$\{x:\ x^\top A x = 1\}$$

Here:

$$A=${mat2Latex(A)}$$

Drag \(x\) and \(y\). The **ellipse** changes with \(A\), and the **A-angle** is computed from \(x^\top Ay\).
`.trim()}
            />
        </div>
    );
}
