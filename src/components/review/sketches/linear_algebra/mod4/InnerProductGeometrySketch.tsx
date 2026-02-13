"use client";

import React, { useMemo, useRef, useState } from "react";
import MathMarkdown from "@/components/math/MathMarkdown";
import { cn } from "@/lib/cn";

type Vec2 = { x: number; y: number };
type Mat2 = [[number, number], [number, number]];

function dot(a: Vec2, b: Vec2) {
    return a.x * b.x + a.y * b.y;
}

function matVec(A: Mat2, v: Vec2): Vec2 {
    return {
        x: A[0][0] * v.x + A[0][1] * v.y,
        y: A[1][0] * v.x + A[1][1] * v.y,
    };
}

function innerA(A: Mat2, x: Vec2, y: Vec2) {
    // x^T A y
    const Ay = matVec(A, y);
    return x.x * Ay.x + x.y * Ay.y;
}

function quadA(A: Mat2, x: Vec2) {
    return innerA(A, x, x);
}

function fmt(n: number) {
    if (!Number.isFinite(n)) return "—";
    const s = n.toFixed(4);
    return s.replace(/\.?0+$/, "");
}

function clamp(n: number, lo: number, hi: number) {
    return Math.max(lo, Math.min(hi, n));
}

function vecFromClientPoint(svg: SVGSVGElement, clientX: number, clientY: number, scale: number) {
    const rect = svg.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;

    const cx = rect.width / 2;
    const cy = rect.height / 2;

    // screen -> math coords (y flips)
    return {
        x: (px - cx) / scale,
        y: (cy - py) / scale,
    };
}

function pathForUnitBall(A: Mat2) {
    // Draw boundary of {v : v^T A v = 1} by sampling directions u on unit circle
    const pts: Vec2[] = [];
    const N = 240;

    for (let i = 0; i <= N; i++) {
        const t = (i / N) * 2 * Math.PI;
        const u: Vec2 = { x: Math.cos(t), y: Math.sin(t) };
        const denom = quadA(A, u); // u^T A u
        if (!(denom > 1e-9)) continue; // skip directions with no real radius (indefinite A)
        const r = 1 / Math.sqrt(denom);
        pts.push({ x: r * u.x, y: r * u.y });
    }

    return pts;
}

const PRESETS: { id: string; label: string; A: Mat2; note?: string }[] = [
    { id: "I", label: "Euclidean (A = I)", A: [[1, 0], [0, 1]] },
    { id: "spd1", label: "SPD: [[2,1],[1,2]]", A: [[2, 1], [1, 2]] },
    { id: "spd2", label: "SPD: [[3,0],[0,1]]", A: [[3, 0], [0, 1]] },
    {
        id: "indef",
        label: "Not SPD: [[1,2],[2,1]]",
        A: [[1, 2], [2, 1]],
        note: "Indefinite: some directions have vᵀAv < 0 (not a valid inner product).",
    },
];

export default function InnerProductGeometrySketch({
                                                       className,
                                                   }: {
    className?: string;
}) {
    const [presetId, setPresetId] = useState<string>("spd1");
    const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0];
    const A = preset.A;

    const [x, setX] = useState<Vec2>({ x: 1.2, y: 0.4 });
    const [y, setY] = useState<Vec2>({ x: 0.5, y: 1.1 });

    const svgRef = useRef<SVGSVGElement | null>(null);
    const [drag, setDrag] = useState<"x" | "y" | null>(null);

    const scale = 130; // pixels per unit

    const metrics = useMemo(() => {
        const xy = dot(x, y);
        const Ax = matVec(A, x);
        const Ay = matVec(A, y);
        const xAy = innerA(A, x, y);
        const xx = quadA(A, x);
        const yy = quadA(A, y);

        const nx = xx > 0 ? Math.sqrt(xx) : NaN;
        const ny = yy > 0 ? Math.sqrt(yy) : NaN;
        const cosA = Number.isFinite(nx) && Number.isFinite(ny) ? clamp(xAy / (nx * ny), -1, 1) : NaN;
        const angleA = Number.isFinite(cosA) ? (Math.acos(cosA) * 180) / Math.PI : NaN;

        return { xy, xAy, xx, yy, nx, ny, cosA, angleA, Ax, Ay };
    }, [A, x, y]);

    const unitPts = useMemo(() => pathForUnitBall(A), [A]);

    function toScreen(v: Vec2, w: number, h: number) {
        return {
            sx: w / 2 + v.x * scale,
            sy: h / 2 - v.y * scale,
        };
    }

    function onPointerDown(which: "x" | "y") {
        return (e: React.PointerEvent) => {
            (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
            setDrag(which);
        };
    }

    function onPointerMove(e: React.PointerEvent) {
        if (!drag) return;
        const svg = svgRef.current;
        if (!svg) return;

        const v = vecFromClientPoint(svg, e.clientX, e.clientY, scale);
        // keep things in view
        const clamped: Vec2 = { x: clamp(v.x, -2.5, 2.5), y: clamp(v.y, -2.5, 2.5) };
        if (drag === "x") setX(clamped);
        else setY(clamped);
    }

    function onPointerUp() {
        setDrag(null);
    }

    return (
        <div className={cn("ui-card p-3", className)}>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-extrabold text-neutral-800 dark:text-white/90">
                    Inner product geometry: ⟨x,y⟩ = xᵀAy
                </div>

                <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 dark:text-white/70">
                    Metric A:
                    <select
                        className="rounded-lg border border-neutral-300 bg-white px-2 py-1 text-xs font-semibold text-neutral-800 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/90"
                        value={presetId}
                        onChange={(e) => setPresetId(e.target.value)}
                    >
                        {PRESETS.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.label}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            {preset.note ? (
                <div className="mt-2 rounded-xl border border-amber-300/60 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
                    {preset.note}
                </div>
            ) : null}

            <div className="mt-3 grid gap-3 md:grid-cols-[1fr_340px]">
                <div className="rounded-2xl border border-neutral-200 bg-white p-2 dark:border-white/10 dark:bg-white/[0.03]">
                    <svg
                        ref={svgRef}
                        className="h-[380px] w-full touch-none select-none"
                        viewBox="0 0 600 380"
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        onPointerLeave={onPointerUp}
                    >
                        <defs>
                            <marker
                                id="arrow"
                                viewBox="0 0 10 10"
                                refX="8"
                                refY="5"
                                markerWidth="6"
                                markerHeight="6"
                                orient="auto-start-reverse"
                            >
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
                            </marker>
                        </defs>

                        {/* axes */}
                        <line x1="300" y1="0" x2="300" y2="380" stroke="currentColor" opacity="0.15" />
                        <line x1="0" y1="190" x2="600" y2="190" stroke="currentColor" opacity="0.15" />

                        {/* A-unit ball (ellipse-ish when SPD) */}
                        {unitPts.length > 2 ? (
                            <polyline
                                fill="none"
                                stroke="currentColor"
                                opacity="0.25"
                                strokeWidth="2"
                                points={unitPts
                                    .map((v) => {
                                        const { sx, sy } = toScreen(v, 600, 380);
                                        return `${sx},${sy}`;
                                    })
                                    .join(" ")}
                            />
                        ) : (
                            <text x="12" y="24" fontSize="12" fill="currentColor" opacity="0.55">
                                Unit set vᵀAv = 1 not real in many directions (A not SPD).
                            </text>
                        )}

                        {/* vectors */}
                        {(() => {
                            const ox = { x: 0, y: 0 };
                            const p0 = toScreen(ox, 600, 380);

                            const px = toScreen(x, 600, 380);
                            const py = toScreen(y, 600, 380);

                            return (
                                <>
                                    <line
                                        x1={p0.sx}
                                        y1={p0.sy}
                                        x2={px.sx}
                                        y2={px.sy}
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        opacity="0.85"
                                        markerEnd="url(#arrow)"
                                    />
                                    <circle
                                        cx={px.sx}
                                        cy={px.sy}
                                        r="9"
                                        fill="currentColor"
                                        opacity="0.9"
                                        onPointerDown={onPointerDown("x")}
                                        style={{ cursor: "grab" }}
                                    />
                                    <text x={px.sx + 10} y={px.sy - 10} fontSize="12" fill="currentColor" opacity="0.75">
                                        x
                                    </text>

                                    <line
                                        x1={p0.sx}
                                        y1={p0.sy}
                                        x2={py.sx}
                                        y2={py.sy}
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        opacity="0.55"
                                        markerEnd="url(#arrow)"
                                    />
                                    <circle
                                        cx={py.sx}
                                        cy={py.sy}
                                        r="9"
                                        fill="currentColor"
                                        opacity="0.65"
                                        onPointerDown={onPointerDown("y")}
                                        style={{ cursor: "grab" }}
                                    />
                                    <text x={py.sx + 10} y={py.sy - 10} fontSize="12" fill="currentColor" opacity="0.75">
                                        y
                                    </text>
                                </>
                            );
                        })()}
                    </svg>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-3 dark:border-white/10 dark:bg-white/[0.03]">
                    <div className="text-xs font-extrabold text-neutral-700 dark:text-white/70">
                        Live values
                    </div>

                    <div className="mt-2 space-y-2 text-sm text-neutral-900 dark:text-white/90">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-bold opacity-70">x·y</span>
                            <span className="font-mono text-xs">{fmt(metrics.xy)}</span>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-bold opacity-70">xᵀAy</span>
                            <span className="font-mono text-xs">{fmt(metrics.xAy)}</span>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-bold opacity-70">xᵀAx</span>
                            <span className="font-mono text-xs">{fmt(metrics.xx)}</span>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-bold opacity-70">yᵀAy</span>
                            <span className="font-mono text-xs">{fmt(metrics.yy)}</span>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-bold opacity-70">‖x‖ₐ</span>
                            <span className="font-mono text-xs">{fmt(metrics.nx)}</span>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-bold opacity-70">‖y‖ₐ</span>
                            <span className="font-mono text-xs">{fmt(metrics.ny)}</span>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-bold opacity-70">angleₐ (deg)</span>
                            <span className="font-mono text-xs">{fmt(metrics.angleA)}</span>
                        </div>
                    </div>

                    <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-2 text-xs dark:border-white/10 dark:bg-white/[0.03]">
                        <MathMarkdown
                            markdown={String.raw`
We are visualizing the *metric* defined by $A$.

- $\langle x,y\rangle_A = x^\top A y$
- $\|x\|_A = \sqrt{x^\top A x}$
- $\cos\theta_A = \dfrac{x^\top A y}{\|x\|_A\|y\|_A}$

When $A$ is **SPD**, the set $\{v : v^\top A v = 1\}$ is an **ellipse**.
              `.trim()}
                        />
                    </div>

                    <div className="mt-2 text-[11px] font-semibold text-neutral-600 dark:text-white/60">
                        Drag the vector tips in the plot.
                    </div>
                </div>
            </div>
        </div>
    );
}
