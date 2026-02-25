"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import VectorPad from "@/components/vectorpad/VectorPad";
import type { VectorPadState } from "@/components/vectorpad/types";
import type { Mode, Vec3 } from "@/lib/math/vec3";
import { fmtNum, fmtVec2Latex } from "@/lib/subjects/latex";
import MathMarkdown from "@/components/markdown/MathMarkdown";
import { type Overlay2DArgs, unit2 } from "../../_vec2";

type Props = {
  initialX?: number;
  initialY?: number;
};

function cn(...cls: Array<string | false | undefined | null>) {
  return cls.filter(Boolean).join(" ");
}

// shared “theme-aware” surfaces (match your homepage/billing style)
const CARD =
  "rounded-2xl border border-neutral-200/70 bg-white/80 shadow-sm overflow-hidden " +
  "dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none";

const PANEL =
  "rounded-2xl border border-neutral-200/70 bg-white/70 shadow-sm p-4 " +
  "dark:border-white/10 dark:bg-black/20 dark:shadow-none";

function VectorBasicsSketch({ initialX = 2, initialY = 2 }: Props) {
  const mode: Mode = "2d";
  const zHeldRef = useRef(false);

  const stateRef = useRef<VectorPadState>({
    a: { x: initialX, y: initialY, z: 0 },
    b: { x: 0, y: 0, z: 0 },
    scale: 26,
    showGrid: true,
    snapToGrid: true,
    autoGridStep: false,
    gridStep: 1,
    showComponents: false,
    showAngle: false,
    showProjection: false,
    showPerp: false,
    showUnitB: false,
    depthMode: false,
  });

  const [v, setV] = useState<Vec3>(stateRef.current.a);

  const handles = useMemo(() => ({ a: true, b: false }), []);
  const onPreview = useCallback((na: Vec3) => setV(na), []);
  const onCommit = useCallback((na: Vec3) => setV(na), []);

  // ✅ container-width aware layout
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [sideBySide, setSideBySide] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setSideBySide(w >= 760);
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const vMag = useMemo(() => Math.hypot(v.x, v.y), [v.x, v.y]);
  const u = useMemo(() => unit2({ x: v.x, y: v.y }), [v.x, v.y]);
  const angleDeg = useMemo(() => (Math.atan2(v.y, v.x) * 180) / Math.PI, [v.x, v.y]);

  const hud = useMemo(() => {
    const vLatex = fmtVec2Latex(Number(fmtNum(v.x, 2)), Number(fmtNum(v.y, 2)));
    const uLatex = fmtVec2Latex(Number(fmtNum(u.x, 2)), Number(fmtNum(u.y, 2)));
    const note =
      vMag < 1e-9 ? "Zero vector: unit vector is undefined." : "Unit vector keeps the same direction.";

    return String.raw`
**Vector basics**

Drag the tip of $\vec v$ (blue).

$$
\vec v = ${vLatex}
\qquad
\|\vec v\| = ${fmtNum(vMag, 3)}
\qquad
\theta = ${fmtNum(angleDeg, 1)}^\circ
$$

- Unit vector:
  $$
  \hat v = \frac{\vec v}{\|\vec v\|} = ${uLatex}
  $$

**Note:** ${note}
`.trim();
  }, [v.x, v.y, u.x, u.y, vMag, angleDeg]);

  const overlay2D = useCallback(({ s, origin, worldToScreen2 }: Overlay2DArgs) => {
    const A = stateRef.current.a;
    const o = origin();

    const m = Math.hypot(A.x, A.y);
    const ux = m < 1e-12 ? 0 : A.x / m;
    const uy = m < 1e-12 ? 0 : A.y / m;

    const uTip = worldToScreen2({ x: ux, y: uy, z: 0 });

    s.push();
    s.stroke("rgba(52,211,153,0.9)");
    s.strokeWeight(3);
  
    s.line(o.x, o.y, uTip.x, uTip.y);
    s.drawingContext.setLineDash([]);
    s.pop();

    s.push();
    s.noStroke();
    s.fill("rgba(255,255,255,0.75)");
    s.textSize(12);
    s.textAlign(s.LEFT, s.TOP);
    s.text("green dashed = unit vector", 12, 48);
    s.pop();
  }, []);

  return (
    <div ref={rootRef} className="w-full" style={{ touchAction: "none" }}>
      <div
        className={cn(
          "grid gap-3",
          sideBySide ? "grid-cols-[minmax(0,1fr)_320px]" : "grid-cols-1",
        )}
      >
        {/* VectorPad surface */}
        <div className={CARD}>
          <VectorPad
            mode={mode}
            stateRef={stateRef}
            zHeldRef={zHeldRef}
            handles={handles}
            previewThrottleMs={33}
            onPreview={onPreview}
            onCommit={onCommit}
            overlay2D={overlay2D}
            className={cn(
              "w-full",
              sideBySide ? "h-[420px]" : "h-[260px]",
              // subtle background that looks good in both themes
              "bg-white dark:bg-neutral-950",
            )}
          />
        </div>

        {/* HUD panel */}
        <div className={PANEL}>
          <MathMarkdown
            className={cn(
              "text-sm leading-6",
              // base text
              "text-neutral-700 dark:text-white/80",
              // katex inherits + slightly stronger
              "[&_.katex]:text-neutral-900 dark:[&_.katex]:text-white/90",
              // nice headings
              "[&_strong]:text-neutral-900 dark:[&_strong]:text-white",
              // lists
              "[&_li]:my-1",
            )}
            content={hud}
          />
        </div>
      </div>
    </div>
  );
}

export default React.memo(VectorBasicsSketch);
