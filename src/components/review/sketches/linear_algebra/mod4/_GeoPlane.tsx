"use client";

import React, { useMemo, useRef } from "react";
import { clamp, type Vec2 } from "./_geoMath";

export type PlaneCtx = {
    size: number;
    range: number;
    toSvg: (p: Vec2) => { x: number; y: number };
    toWorldFromEvent: (e: React.PointerEvent) => Vec2;
};

export default function GeoPlane(props: {
    size?: number;
    range?: number;
    gridStep?: number;
    className?: string;
    children: (ctx: PlaneCtx) => React.ReactNode;
}) {
    const size = props.size ?? 440;
    const range = props.range ?? 5;
    const gridStep = props.gridStep ?? 1;

    const svgRef = useRef<SVGSVGElement | null>(null);

    const ctx = useMemo<PlaneCtx>(() => {
        const toSvg = (p: Vec2) => {
            const x = ((p[0] / range) * 0.5 + 0.5) * size;
            const y = (1 - ((p[1] / range) * 0.5 + 0.5)) * size;
            return { x, y };
        };

        const toWorldFromEvent = (e: React.PointerEvent): Vec2 => {
            const svg = svgRef.current;
            if (!svg) return [0, 0];
            const rect = svg.getBoundingClientRect();
            const px = e.clientX - rect.left;
            const py = e.clientY - rect.top;
            const x = ((px / rect.width) * 2 - 1) * range;
            const y = (1 - (py / rect.height) * 2) * range;
            return [clamp(x, -range, range), clamp(y, -range, range)];
        };

        return { size, range, toSvg, toWorldFromEvent };
    }, [range, size]);

    const gridLines = useMemo(() => {
        const lines: Array<{ x1: number; y1: number; x2: number; y2: number; axis?: boolean }> = [];
        const step = gridStep <= 0 ? 1 : gridStep;
        for (let v = -range; v <= range + 1e-9; v += step) {
            const a = ctx.toSvg([v, -range]);
            const b = ctx.toSvg([v, range]);
            lines.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, axis: Math.abs(v) < 1e-12 });
        }
        for (let v = -range; v <= range + 1e-9; v += step) {
            const a = ctx.toSvg([-range, v]);
            const b = ctx.toSvg([range, v]);
            lines.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, axis: Math.abs(v) < 1e-12 });
        }
        return lines;
    }, [ctx, gridStep, range]);

    return (
        <svg
            ref={svgRef}
            className={props.className ?? "w-full rounded-xl border border-neutral-200 bg-white dark:border-white/10 dark:bg-white/[0.03]"}
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            role="img"
        >
            {/* grid */}
            {gridLines.map((L, i) => (
                <line
                    key={i}
                    x1={L.x1}
                    y1={L.y1}
                    x2={L.x2}
                    y2={L.y2}
                    stroke="currentColor"
                    opacity={L.axis ? 0.35 : 0.12}
                    strokeWidth={L.axis ? 2 : 1}
                />
            ))}

            {props.children(ctx)}
        </svg>
    );
}

export function SvgPoint(props: {
    ctx: PlaneCtx;
    p: Vec2;
    r?: number;
    label?: string;
    fill?: string;
    stroke?: string;
    onPointerDown?: (e: React.PointerEvent) => void;
}) {
    const { x, y } = props.ctx.toSvg(props.p);
    const r = props.r ?? 7;
    return (
        <g>
            <circle
                cx={x}
                cy={y}
                r={r}
                fill={props.fill ?? "currentColor"}
                opacity={0.9}
                stroke={props.stroke ?? "none"}
                onPointerDown={props.onPointerDown}
                style={{ cursor: props.onPointerDown ? "grab" : "default" }}
            />
            {props.label ? (
                <text x={x + 10} y={y - 10} fontSize={12} fill="currentColor" opacity={0.85}>
                    {props.label}
                </text>
            ) : null}
        </g>
    );
}

export function SvgSegment(props: { ctx: PlaneCtx; a: Vec2; b: Vec2; opacity?: number; width?: number; dash?: string }) {
    const A = props.ctx.toSvg(props.a);
    const B = props.ctx.toSvg(props.b);
    return (
        <line
            x1={A.x}
            y1={A.y}
            x2={B.x}
            y2={B.y}
            stroke="currentColor"
            opacity={props.opacity ?? 0.8}
            strokeWidth={props.width ?? 2}
            strokeDasharray={props.dash ?? undefined}
        />
    );
}

export function SvgPolyline(props: { ctx: PlaneCtx; pts: Vec2[]; opacity?: number; width?: number; fill?: string; close?: boolean }) {
    const d = props.pts
        .map((p, i) => {
            const s = props.ctx.toSvg(p);
            return `${i === 0 ? "M" : "L"} ${s.x} ${s.y}`;
        })
        .join(" ");
    return (
        <path
            d={props.close ? d + " Z" : d}
            fill={props.fill ?? "none"}
            stroke="currentColor"
            opacity={props.opacity ?? 0.85}
            strokeWidth={props.width ?? 2}
        />
    );
}
