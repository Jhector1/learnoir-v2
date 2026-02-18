"use client";

import React, { useMemo, useRef, useState } from "react";
import type p5 from "p5";
import MathMarkdown from "@/components/markdown/MathMarkdown";
import VectorPad from "@/components/vectorpad/VectorPad";
import type { VectorPadState } from "@/components/vectorpad/types";
import type { Mode, Vec3 } from "@/lib/math/vec3";
import { makeVPState } from "./_vpState";
import { dot, fmt, mulS, safeDiv, sub } from "./_vpUtils";

export default function GeoGramSchmidtSketch() {
    // interpret a=b1, b=b2
    const stateRef = useRef<VectorPadState>(
        makeVPState({
            a: { x: 2, y: 0.5, z: 0 },
            b: { x: 1.2, y: 2.2, z: 0 },
            showAngle: false,
            showProjection: false, // we draw GS projection ourselves (b2 onto b1)
            showUnitB: false,
            showComponents: false,
            scale: 85,
        }),
    );
    const zHeldRef = useRef(false);

    const [b1, setB1] = useState<Vec3>(stateRef.current.a);
    const [b2, setB2] = useState<Vec3>(stateRef.current.b);

    const alpha = safeDiv(dot(b1, b2), dot(b1, b1), 0);
    const proj = mulS(b1, alpha);
    const u2 = sub(b2, proj);

    const overlay2D = useMemo(() => {
        return ({ s, worldToScreen2, origin }: any) => {
            const O = origin();
            const toS = (v: Vec3) => worldToScreen2(v);

            const pProj = toS(proj);
            const pB2 = toS(b2);

            // dashed drop from b2 to proj
            s.push();
            s.stroke("rgba(255,255,255,0.3)");
            s.strokeWeight(2);
            s.drawingContext.setLineDash([6, 6]);
            s.line(pB2.x, pB2.y, pProj.x, pProj.y);
            (s.drawingContext as any).setLineDash([]);
            s.pop();

            // draw proj vector
            s.push();
            s.stroke("rgba(255,255,255,0.45)");
            s.strokeWeight(4);
            s.line(O.x, O.y, pProj.x, pProj.y);
            s.pop();

            // draw u2 vector
            const pU2 = toS(u2);
            s.push();
            s.stroke("rgba(255,255,255,0.85)");
            s.strokeWeight(4);
            s.line(O.x, O.y, pU2.x, pU2.y);
            s.pop();

            // labels
            s.push();
            s.noStroke();
            s.fill("rgba(255,255,255,0.75)");
            s.textSize(12);
            s.textAlign(s.LEFT, s.TOP);
            s.text("proj_{span(b1)}(b2)  and  u2 = b2 - proj", 12, 40);
            s.pop();
        };
    }, [b2, proj, u2]);

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-white/80">
                <span>α = (b1ᵀb2)/(b1ᵀb1) = {fmt(alpha)}</span>
                <span className="ml-auto">u2 = ({fmt(u2.x)}, {fmt(u2.y)})</span>
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
                        setB1(na);
                        setB2(nb);
                    }}
                    onCommit={(na, nb) => {
                        setB1(na);
                        setB2(nb);
                    }}
                    overlay2D={overlay2D as any}
                    className="h-full w-full"
                />
            </div>

            <MathMarkdown
                markdown={String.raw`
Gram–Schmidt:

$$u_1=b_1$$
$$\mathrm{proj}_{u_1}(b_2)=\frac{u_1^\top b_2}{u_1^\top u_1}\,u_1$$
$$u_2=b_2-\mathrm{proj}_{u_1}(b_2)$$

Then normalize \(e_i=\frac{u_i}{\|u_i\|}\) to get an orthonormal basis.
`.trim()}
            />
        </div>
    );
}
