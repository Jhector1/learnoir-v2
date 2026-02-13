import type { Vec3 } from "@/lib/math/vec3";

export function v3(x: number, y: number, z = 0): Vec3 {
    return { x, y, z };
}

export function dot(a: Vec3, b: Vec3) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function norm(a: Vec3) {
    return Math.sqrt(dot(a, a));
}

export function clamp(x: number, lo: number, hi: number) {
    return Math.max(lo, Math.min(hi, x));
}

export function add(a: Vec3, b: Vec3): Vec3 {
    return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

export function sub(a: Vec3, b: Vec3): Vec3 {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function mulS(a: Vec3, s: number): Vec3 {
    return { x: a.x * s, y: a.y * s, z: a.z * s };
}

export function safeDiv(a: number, b: number, fallback = 0) {
    return Math.abs(b) < 1e-12 ? fallback : a / b;
}

export function fmt(n: number, digits = 3) {
    if (!Number.isFinite(n)) return "NaN";
    const s = n.toFixed(digits);
    return s.replace(/\.000$/, "").replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
}

export type Mat2 = [[number, number], [number, number]];

export function xTAy(x: Vec3, A: Mat2, y: Vec3) {
    const Ay = {
        x: A[0][0] * y.x + A[0][1] * y.y,
        y: A[1][0] * y.x + A[1][1] * y.y,
        z: 0,
    };
    return x.x * Ay.x + x.y * Ay.y;
}

export function xTAx(x: Vec3, A: Mat2) {
    return xTAy(x, A, x);
}

export function isSPD2(A: Mat2) {
    const sym = Math.abs(A[0][1] - A[1][0]) < 1e-12;
    const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
    return sym && A[0][0] > 0 && det > 0;
}

export function mat2Latex(A: Mat2) {
    return String.raw`\begin{bmatrix}${A[0][0]} & ${A[0][1]}\\${A[1][0]} & ${A[1][1]}\end{bmatrix}`;
}
