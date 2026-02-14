"use client";

import React, { useMemo, useState } from "react";
import MathMarkdown from "@/components/markdown/MathMarkdown";
import GeoPlane, { SvgPoint, SvgSegment } from "./_GeoPlane";
import { dot2, fmt, safeDiv, scale2, sub2, norm2, type Vec2 } from "./_geoMath";

export default function GeoGramSchmidtSketch() {
    const [b1, setB1] = useState<Vec2>([2, 0.5]);
    const [b2, setB2] = useState<Vec2>([1.2, 2.2]);
    const [drag, setDrag] = useState<null | "b1" | "b2">(null);
    const [showNormalized, setShowNormalized] = useState(true);

    const u1 = b1;

    const u1u1 = dot2(u1, u1);
    const alpha = safeDiv(dot2(u1, b2), u1u1, 0);
    const proj = scale2(u1, alpha);
    const u2 = sub2(b2, proj);

    const e1 = useMemo(() => {
        const n = norm2(u1) || 1;
        return scale2(u1, 1 / n);
    }, [u1]);

    const e2 = useMemo(() => {
        const n = norm2(u2) || 1;
        return scale2(u2, 1 / n);
    }, [u2]);

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
                <label className="text-xs font-bold text-neutral-700 dark:text-white/80">
                    Show normalized (orthonormal) vectors
                </label>
                <input type="checkbox" checked={showNormalized} onChange={(e) => setShowNormalized(e.target.checked)} />
                <div className="ml-auto text-xs font-semibold text-neutral-700 dark:text-white/80">
                    α = {fmt(alpha)} • u2 = b2 − proj(u1)(b2)
                </div>
            </div>

            <GeoPlane size={440} range={5} gridStep={1} className="text-neutral-900 dark:text-white">
                {(ctx) => (
                    <g
                        onPointerMove={(e) => {
                            if (!drag) return;
                            const w = ctx.toWorldFromEvent(e);
                            if (drag === "b1") setB1(w);
                            if (drag === "b2") setB2(w);
                        }}
                        onPointerUp={() => setDrag(null)}
                        onPointerCancel={() => setDrag(null)}
                    >
                        {/* original basis */}
                        <SvgSegment ctx={ctx} a={[0, 0]} b={b1} opacity={0.7} width={3} />
                        <SvgSegment ctx={ctx} a={[0, 0]} b={b2} opacity={0.7} width={3} />

                        {/* projection of b2 onto u1 */}
                        <SvgSegment ctx={ctx} a={[0, 0]} b={proj} opacity={0.35} width={3} dash="6 6" />
                        <SvgSegment ctx={ctx} a={b2} b={proj} opacity={0.35} width={2} dash="6 6" />

                        {/* orthogonalized u2 */}
                        <SvgSegment ctx={ctx} a={[0, 0]} b={u2} opacity={0.95} width={4} />

                        {/* normalized */}
                        {showNormalized ? (
                            <>
                                <SvgSegment ctx={ctx} a={[0, 0]} b={e1} opacity={0.95} width={4} dash="10 6" />
                                <SvgSegment ctx={ctx} a={[0, 0]} b={e2} opacity={0.95} width={4} dash="10 6" />
                            </>
                        ) : null}

                        <SvgPoint
                            ctx={ctx}
                            p={b1}
                            label="b1"
                            onPointerDown={(e) => {
                                e.preventDefault();
                                (e.currentTarget as any).setPointerCapture?.(e.pointerId);
                                setDrag("b1");
                            }}
                        />
                        <SvgPoint
                            ctx={ctx}
                            p={b2}
                            label="b2"
                            onPointerDown={(e) => {
                                e.preventDefault();
                                (e.currentTarget as any).setPointerCapture?.(e.pointerId);
                                setDrag("b2");
                            }}
                        />
                        <SvgPoint ctx={ctx} p={u2} label="u2" />
                    </g>
                )}
            </GeoPlane>

            <MathMarkdown
                markdown={String.raw`
Gram–Schmidt in 2D:

$$u_1=b_1$$
$$u_2=b_2-\pi_{\mathrm{span}(u_1)}(b_2)$$
$$\pi_{\mathrm{span}(u_1)}(b_2)=\frac{u_1^\top b_2}{u_1^\top u_1}\,u_1$$

Then normalize \(e_i=\frac{u_i}{\|u_i\|}\) to get an orthonormal basis.
`.trim()}
            />
        </div>
    );
}
