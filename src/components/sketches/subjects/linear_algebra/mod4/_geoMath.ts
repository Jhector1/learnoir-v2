export type Vec2 = [number, number];
export type Vec3 = [number, number, number];

export function clamp(v: number, lo: number, hi: number) {
    return Math.max(lo, Math.min(hi, v));
}

export function dot2(a: Vec2, b: Vec2) {
    return a[0] * b[0] + a[1] * b[1];
}

export function add2(a: Vec2, b: Vec2): Vec2 {
    return [a[0] + b[0], a[1] + b[1]];
}

export function sub2(a: Vec2, b: Vec2): Vec2 {
    return [a[0] - b[0], a[1] - b[1]];
}

export function scale2(a: Vec2, s: number): Vec2 {
    return [a[0] * s, a[1] * s];
}

export function norm1(a: Vec2) {
    return Math.abs(a[0]) + Math.abs(a[1]);
}

export function norm2(a: Vec2) {
    return Math.sqrt(dot2(a, a));
}

export function norm2Sq(a: Vec2) {
    return dot2(a, a);
}

export function safeDiv(a: number, b: number, fallback = 0) {
    return Math.abs(b) < 1e-12 ? fallback : a / b;
}

export type Mat2 = [[number, number], [number, number]];

export function mat2mulVec(A: Mat2, x: Vec2): Vec2 {
    return [A[0][0] * x[0] + A[0][1] * x[1], A[1][0] * x[0] + A[1][1] * x[1]];
}

export function xTAy(x: Vec2, A: Mat2, y: Vec2) {
    const Ay = mat2mulVec(A, y);
    return dot2(x, Ay);
}

export function xTAx(x: Vec2, A: Mat2) {
    return xTAy(x, A, x);
}

export function isSymmetric2(A: Mat2) {
    return Math.abs(A[0][1] - A[1][0]) < 1e-12;
}

export function det2(A: Mat2) {
    return A[0][0] * A[1][1] - A[0][1] * A[1][0];
}

// SPD check for 2×2: symmetric, a11>0, det>0
export function isSPD2(A: Mat2) {
    return isSymmetric2(A) && A[0][0] > 0 && det2(A) > 0;
}

export function unitBallPointsL2(samples = 240): Vec2[] {
    const pts: Vec2[] = [];
    for (let k = 0; k < samples; k++) {
        const t = (2 * Math.PI * k) / samples;
        pts.push([Math.cos(t), Math.sin(t)]);
    }
    return pts;
}

export function unitBallPointsL1(): Vec2[] {
    // |x|+|y|=1 (diamond)
    return [
        [1, 0],
        [0, 1],
        [-1, 0],
        [0, -1],
        [1, 0],
    ];
}

// For A-norm unit ball: x^T A x = 1
// polar sampling: direction u=(cos t, sin t), radius r = 1/sqrt(u^T A u)
export function unitBallPointsAxEq1(A: Mat2, samples = 360): Vec2[] {
    const pts: Vec2[] = [];
    for (let k = 0; k < samples; k++) {
        const t = (2 * Math.PI * k) / samples;
        const u: Vec2 = [Math.cos(t), Math.sin(t)];
        const q = xTAx(u, A);
        const r = q > 1e-12 ? 1 / Math.sqrt(q) : 0;
        pts.push([u[0] * r, u[1] * r]);
    }
    pts.push(pts[0]);
    return pts;
}

export function fmt(n: number, digits = 3) {
    if (!Number.isFinite(n)) return "NaN";
    const s = n.toFixed(digits);
    return s.replace(/\.000$/, "").replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
}

export function vec2Latex(v: Vec2) {
    return String.raw`\begin{bmatrix}${v[0]}\\${v[1]}\end{bmatrix}`;
}

export function mat2Latex(A: Mat2) {
    return String.raw`\begin{bmatrix}${A[0][0]} & ${A[0][1]}\\${A[1][0]} & ${A[1][1]}\end{bmatrix}`;
}
