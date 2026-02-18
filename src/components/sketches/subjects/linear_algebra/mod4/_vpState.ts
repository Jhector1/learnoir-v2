import type { Vec3 } from "@/lib/math/vec3";
import type { VectorPadState } from "@/components/vectorpad/types";

/**
 * Minimal, safe initializer for VectorPadState.
 * We cast to any to avoid tight coupling to your exact type shape
 * (since VectorPadState may evolve).
 */
export function makeVPState(init?: Partial<VectorPadState> & { a?: Vec3; b?: Vec3 }) {
    const a = init?.a ?? ({ x: 2, y: 1, z: 0 } as Vec3);
    const b = init?.b ?? ({ x: 1, y: 2, z: 0 } as Vec3);

    const st: any = {
        a,
        b,

        // view
        scale: init?.scale ?? 80,

        // grid
        showGrid: init?.showGrid ?? true,
        snapToGrid: init?.snapToGrid ?? false,
        gridStep: init?.gridStep ?? 1,
        autoGridStep: init?.autoGridStep ?? true,

        // overlays / visuals
        showComponents: init?.showComponents ?? false,
        showAngle: init?.showAngle ?? false,
        showProjection: init?.showProjection ?? false,
        showPerp: init?.showPerp ?? true,
        showUnitB: init?.showUnitB ?? false,

        // 3D only (harmless in 2D)
        depthMode: (init as any)?.depthMode ?? false,
    };

    return st as VectorPadState;
}
