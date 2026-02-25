import type {
    Difficulty,
    ExerciseKind,
    SingleChoiceExercise,
    NumericExercise,
    MatrixInputExercise,
} from "../../../types";
import type { GenOut } from "../../shared/expected";
import type { RNG } from "../../shared/rng";
import type { TopicContext } from "../../generatorTypes";

// ------------------------------------------------------------
// Pool helpers (same shape as python_part1)
// ------------------------------------------------------------
type PoolItem = { key: string; w: number };
type HandlerArgs = { rng: RNG; diff: Difficulty; id: string; topic: string };
type Handler = (args: HandlerArgs) => GenOut<ExerciseKind>;

function readPoolFromMeta(meta: any): PoolItem[] {
    const pool = meta?.pool;
    if (!Array.isArray(pool)) return [];
    return pool
        .map((p: any) => ({
            key: String(p?.key ?? "").trim(),
            w: Number(p?.w ?? 0),
        }))
        .filter((p) => p.key && Number.isFinite(p.w) && p.w > 0);
}

function weightedKey(rng: RNG, pool: PoolItem[]): string {
    const picked = rng.weighted(pool.map((p) => ({ value: p.key, w: p.w })));
    return String(picked);
}

// ------------------------------------------------------------
// Difficulty helpers
// ------------------------------------------------------------
function rangeForDiff(diff: Difficulty) {
    if (diff === "easy") return { lo: -4, hi: 4 };
    if (diff === "medium") return { lo: -7, hi: 7 };
    return { lo: -10, hi: 10 };
}

function dimsForDiff(diff: Difficulty) {
    if (diff === "easy") return { n: 2 };
    if (diff === "medium") return { n: 3 };
    return { n: 3 };
}

// ------------------------------------------------------------
// Math helpers
// ------------------------------------------------------------
function safeInt(rng: RNG, lo: number, hi: number) {
    return rng.int(lo, hi);
}

function randNonZeroVec(rng: RNG, n: number, lo: number, hi: number): number[] {
    for (let tries = 0; tries < 50; tries++) {
        const v = Array.from({ length: n }, () => safeInt(rng, lo, hi));
        const all0 = v.every((x) => x === 0);
        if (!all0) return v;
    }
    // fallback
    const v = Array.from({ length: n }, () => 0);
    v[0] = 1;
    return v;
}

function dot(x: readonly number[], y: readonly number[]) {
    let s = 0;
    for (let i = 0; i < Math.min(x.length, y.length); i++) s += x[i] * y[i];
    return s;
}

function l1(x: number[]) {
    return x.reduce((s, v) => s + Math.abs(v), 0);
}

function l2Squared(x: number[]) {
    return dot(x, x);
}

function randPythag2D(rng: RNG) {
    // guarantees integer √(a^2+b^2)
    const pairs: Array<[number, number, number]> = [
        [3, 4, 5],
        [5, 12, 13],
        [8, 15, 17],
        [7, 24, 25],
        [9, 12, 15],
    ];
    const [a, b, c] = rng.pick(pairs as any) as [number, number, number];
    const s1 = rng.pick([1, -1] as const);
    const s2 = rng.pick([1, -1] as const);
    return { x: [s1 * a, s2 * b], norm: c };
}

function randSPD2x2(rng: RNG) {
    // A = [[a,b],[b,c]], with a>0, c>0, det>0
    const a = safeInt(rng, 1, 6);
    const c = safeInt(rng, 1, 6);
    const b = safeInt(rng, -2, 2);
    // enforce det positive: ac - b^2 > 0
    if (a * c - b * b <= 0) return randSPD2x2(rng);
    return [
        [a, b],
        [b, c],
    ];
}

function matVec(A: number[][], x: number[]) {
    return A.map((row) => dot(row, x));
}

function xTAy(x: number[], A: number[][], y: number[]) {
    const Ay = matVec(A, y);
    return dot(x, Ay);
}

function xTAx(x: number[], A: number[][]) {
    return xTAy(x, A, x);
}

function vecToLatexCol(v: readonly number[]) {
    return String.raw`\begin{bmatrix}${v.map((x) => String(x)).join(String.raw`\\`)}\end{bmatrix}`;
}

function matToLatex(A: number[][]): string {
    const rows = A.map((row) => row.join(" & ")).join(String.raw` \\ `);
    return String.raw`\begin{bmatrix}${rows}\end{bmatrix}`;
}

function mkColMatrix(v: number[]) {
    return v.map((x) => [x]);
}

function normalizeDir2D(b: number[]) {
    // returns a perpendicular direction (always orthogonal in dot product)
    // if b=[p,q], perp=[-q,p]
    return [-b[1], b[0]];
}

// ------------------------------------------------------------
// Small builders (keep expected shapes in one place)
// NOTE: If your validator expects different fields for numeric/matrix_input,
// adjust ONLY these helpers.
// ------------------------------------------------------------
function mkSingleChoice(
    id: string,
    topic: string,
    diff: Difficulty,
    title: string,
    prompt: string,
    options: Array<{ id: string; text: string }>,
    answerId: string,
    hint?: string,
): GenOut<ExerciseKind> {
    const exercise: SingleChoiceExercise = {
        id,
        topic,
        difficulty: diff,
        kind: "single_choice",
        title,
        prompt,
        options,
        hint,
    };
    return {
        archetype: title,
        exercise,
        expected: { kind: "single_choice", optionId: answerId } as any,
    };
}

function mkNumeric(
    id: string,
    topic: string,
    diff: Difficulty,
    title: string,
    prompt: string,
    value: number,
    hint?: string,
): GenOut<ExerciseKind> {
    const exercise: NumericExercise = {
        id,
        topic,
        difficulty: diff,
        kind: "numeric",
        title,
        prompt,
        hint,
    } as any;

    return { archetype: title, exercise, expected: { kind: "numeric", value } as any };
}

function mkMatrixInput(
    id: string,
    topic: string,
    diff: Difficulty,
    title: string,
    prompt: string,
    rows: number,
    cols: number,
    answer: number[][],
    hint?: string,
): GenOut<ExerciseKind> {
    const exercise: MatrixInputExercise = {
        id,
        topic,
        difficulty: diff,
        kind: "matrix_input",
        title,
        prompt,
        rows,
        cols,
        hint,
    } as any;

    return {
        archetype: title,
        exercise,
        expected: { kind: "matrix_input", rows, cols, value: answer } as any,
    };
}

// ------------------------------------------------------------
// Handlers (keys MUST match DB meta.pool keys)
// ------------------------------------------------------------
const HANDLERS: Record<string, Handler> = {
    // ============================================================
    // NORMS
    // ============================================================
    norms_l2_pythag: ({ rng, diff, id, topic }) => {
        const { x, norm } = randPythag2D(rng);
        return mkNumeric(
            id,
            topic,
            diff,
            "norms_l2_pythag",
            String.raw`Compute the Euclidean norm $$\|x\|_2$$.

$$x=${vecToLatexCol(x)}$$`,
            norm,
            String.raw`$$\|x\|_2=\sqrt{x_1^2+x_2^2}$$`,
        );
    },

    norms_l1_compute: ({ rng, diff, id, topic }) => {
        const { lo, hi } = rangeForDiff(diff);
        const x = randNonZeroVec(rng, 3, lo, hi);
        return mkNumeric(
            id,
            topic,
            diff,
            "norms_l1_compute",
            String.raw`Compute the $$\ell_1$$ norm $$\|x\|_1=\sum_i |x_i|$$.

$$x=${vecToLatexCol(x)}$$`,
            l1(x),
            "Add absolute values of the entries.",
        );
    },

    norms_triangle_inequality_true: ({ rng, diff, id, topic }) => {
        const { lo, hi } = rangeForDiff(diff);
        const x = randNonZeroVec(rng, 2, lo, hi);
        const y = randNonZeroVec(rng, 2, lo, hi);
        return mkSingleChoice(
            id,
            topic,
            diff,
            "norms_triangle_inequality_true",
            String.raw`Which statement is always true for any norm $$\|\cdot\|$$?`,
            [
                { id: "a", text: String.raw`$$\|x+y\|\le \|x\|+\|y\|$$` },
                { id: "b", text: String.raw`$$\|x+y\|= \|x\|+\|y\|$$` },
                { id: "c", text: String.raw`$$\|x+y\|\ge \|x\|+\|y\|$$` },
            ],
            "a",
            "Triangle inequality is one of the defining norm axioms.",
        );
    },

    // ============================================================
    // INNER PRODUCTS
    // ============================================================
    inner_dot_compute: ({ rng, diff, id, topic }) => {
        const { lo, hi } = rangeForDiff(diff);
        const x = randNonZeroVec(rng, 2, lo, hi);
        const y = randNonZeroVec(rng, 2, lo, hi);
        return mkNumeric(
            id,
            topic,
            diff,
            "inner_dot_compute",
            String.raw`Compute the dot product $$\langle x,y\rangle = x^\top y$$.

$$x=${vecToLatexCol(x)},\quad y=${vecToLatexCol(y)}$$`,
            dot(x, y),
            "Multiply matching entries, then add.",
        );
    },

    inner_xTAy_compute: ({ rng, diff, id, topic }) => {
        const A = randSPD2x2(rng);
        const { lo, hi } = rangeForDiff(diff);
        const x = randNonZeroVec(rng, 2, lo, hi);
        const y = randNonZeroVec(rng, 2, lo, hi);

        return mkNumeric(
            id,
            topic,
            diff,
            "inner_xTAy_compute",
            String.raw`Compute the weighted inner product $$\langle x,y\rangle_A = x^\top A y$$.

$$A=${matToLatex(A)},\quad x=${vecToLatexCol(x)},\quad y=${vecToLatexCol(y)}$$`,
            xTAy(x, A, y),
            "Compute Ay first, then dot with x.",
        );
    },

    inner_orthogonal_definition: ({ rng, diff, id, topic }) => {
        return mkSingleChoice(
            id,
            topic,
            diff,
            "inner_orthogonal_definition",
            String.raw`In an inner product space, what does it mean that $$x\perp y$$?`,
            [
                { id: "a", text: String.raw`$$\langle x,y\rangle = 0$$` },
                { id: "b", text: String.raw`$$\|x\|=\|y\|$$` },
                { id: "c", text: String.raw`$$x=y$$` },
            ],
            "a",
            "Orthogonal means inner product is zero.",
        );
    },

    // ============================================================
    // SPD MATRICES
    // ============================================================
    spd_check_2x2: ({ rng, diff, id, topic }) => {
        const makeSPD = rng.pick([true, false] as const);
        const A = makeSPD
            ? randSPD2x2(rng)
            : ([
                [safeInt(rng, -2, 3), safeInt(rng, -3, 3)],
                [safeInt(rng, -3, 3), safeInt(rng, -2, 3)],
            ] as number[][]);

        const isSym = A[0][1] === A[1][0];
        const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
        const isSPD = isSym && A[0][0] > 0 && det > 0;

        return mkSingleChoice(
            id,
            topic,
            diff,
            "spd_check_2x2",
            String.raw`Is $$A$$ symmetric positive definite (SPD)?

$$A=${matToLatex(A)}$$`,
            [
                { id: "a", text: "Yes" },
                { id: "b", text: "No" },
            ],
            isSPD ? "a" : "b",
            String.raw`For 2×2 SPD: symmetric, $$a_{11}>0$$, and $$\det(A)>0$$.`,
        );
    },

    spd_compute_xTAx: ({ rng, diff, id, topic }) => {
        const A = randSPD2x2(rng);
        const { lo, hi } = rangeForDiff(diff);
        const x = randNonZeroVec(rng, 2, lo, hi);

        return mkNumeric(
            id,
            topic,
            diff,
            "spd_compute_xTAx",
            String.raw`Compute $$x^\top A x$$.

$$A=${matToLatex(A)},\quad x=${vecToLatexCol(x)}$$`,
            xTAx(x, A),
            "Compute Ax first, then dot with x.",
        );
    },

    spd_symmetry_required: ({ rng, diff, id, topic }) => {
        return mkSingleChoice(
            id,
            topic,
            diff,
            "spd_symmetry_required",
            `Which is required for a matrix A to define an inner product ⟨x,y⟩=xᵀAy on R^n?`,
            [
                { id: "a", text: "A must be symmetric positive definite (SPD)." },
                { id: "b", text: "A must be upper triangular." },
                { id: "c", text: "A must have all entries equal to 1." },
            ],
            "a",
            "SPD ensures ⟨x,x⟩>0 for x≠0 and symmetry.",
        );
    },

    // ============================================================
    // LENGTHS + DISTANCES
    // ============================================================
    dist_euclidean_2d: ({ rng, diff, id, topic }) => {
        const cases: Array<{ x: [number, number]; y: [number, number]; d: number }> = [
            { x: [2, 1], y: [5, 5], d: 5 },
            { x: [-1, 2], y: [2, 6], d: 5 },
            { x: [3, -2], y: [0, 2], d: 5 },
        ];

        const base = rng.pick(cases); // ✅ now typed

        return mkNumeric(
            id,
            topic,
            diff,
            "dist_euclidean_2d",
            String.raw`Compute the Euclidean distance $$d(x,y)=\|x-y\|_2$$.

$$x=${vecToLatexCol(base.x)},\quad y=${vecToLatexCol(base.y)}$$`,
            base.d,
            "Compute x−y, then its Euclidean norm.",
        );
    },
    dist_from_inner_product_definition: ({ rng, diff, id, topic }) => {
        return mkSingleChoice(
            id,
            topic,
            diff,
            "dist_from_inner_product_definition",
            `Given an inner product ⟨·,·⟩, which formula defines the induced distance?`,
            [
                { id: "a", text: String.raw`$$d(x,y)=\sqrt{\langle x-y,\;x-y\rangle}$$` },
                { id: "b", text: String.raw`$$d(x,y)=\langle x,y\rangle$$` },
                { id: "c", text: String.raw`$$d(x,y)=\langle x-y,\;x+y\rangle$$` },
            ],
            "a",
            "Distance is the norm of the difference.",
        );
    },

    cauchy_schwarz_true: ({ rng, diff, id, topic }) => {
        return mkSingleChoice(
            id,
            topic,
            diff,
            "cauchy_schwarz_true",
            `Which statement is always true in any inner product space?`,
            [
                { id: "a", text: String.raw`$$|\langle x,y\rangle|\le \|x\|\|y\|$$` },
                { id: "b", text: String.raw`$$|\langle x,y\rangle|= \|x\|\|y\|$$ for all x,y` },
                { id: "c", text: String.raw`$$\langle x,y\rangle = \|x\|+\|y\|$$` },
            ],
            "a",
            "Cauchy–Schwarz bounds similarity by the product of lengths.",
        );
    },

    // ============================================================
    // ANGLES + ORTHOGONALITY
    // ============================================================
    angle_sign_dot: ({ rng, diff, id, topic }) => {
        // pick easy: acute/obtuse/right via sign of dot
        const cases = [
            { x: [1, 0], y: [0, 2], ans: "right" }, // dot 0
            { x: [1, 1], y: [2, 1], ans: "acute" }, // dot >0
            { x: [1, 1], y: [-2, 0], ans: "obtuse" }, // dot <0
        ] as const;
        const c = rng.pick(cases as any) as (typeof cases)[number];
        const d = dot(c.x, c.y);

        const correct =
            c.ans === "right"
                ? "90° (right angle)"
                : c.ans === "acute"
                    ? "Acute (< 90°)"
                    : "Obtuse (> 90°)";

        return mkSingleChoice(
            id,
            topic,
            diff,
            "angle_sign_dot",
            String.raw`Using the dot product, classify the angle between $$x$$ and $$y$$.

$$x=${vecToLatexCol(c.x)},\quad y=${vecToLatexCol(c.y)}$$

(Recall: sign of $$x^\top y$$ tells acute/obtuse.)`,
            [
                { id: "a", text: "Acute (< 90°)" },
                { id: "b", text: "90° (right angle)" },
                { id: "c", text: "Obtuse (> 90°)" },
            ],
            correct === "Acute (< 90°)" ? "a" : correct === "90° (right angle)" ? "b" : "c",
            String.raw`If $$x^\top y>0$$ → acute, $$=0$$ → right, $$<0$$ → obtuse. (Here $$x^\top y=${d}$$.)`,
        );
    },

    orthonormal_definition: ({ rng, diff, id, topic }) => {
        return mkSingleChoice(
            id,
            topic,
            diff,
            "orthonormal_definition",
            `Which description matches “orthonormal vectors”?`,
            [
                { id: "a", text: "They are perpendicular and each has length 1." },
                { id: "b", text: "They are parallel and each has length 1." },
                { id: "c", text: "They have the same length (any length)." },
            ],
            "a",
            "Orthonormal = orthogonal + normalized.",
        );
    },

    // ============================================================
    // ORTHOGONAL MATRICES
    // ============================================================
    orth_QtQ_identity: ({ rng, diff, id, topic }) => {
        const Q = rng.pick([
            [
                [0, -1],
                [1, 0],
            ], // 90° rotation
            [
                [1, 0],
                [0, -1],
            ], // reflection
            [
                [0, 1],
                [1, 0],
            ], // swap axes
        ] as any) as number[][];
        return mkSingleChoice(
            id,
            topic,
            diff,
            "orth_QtQ_identity",
            String.raw`For an orthogonal matrix $$Q$$, which equation must hold?`,
            [
                { id: "a", text: String.raw`$$Q^\top Q = I$$` },
                { id: "b", text: String.raw`$$Q^\top Q = 0$$` },
                { id: "c", text: String.raw`$$Q^\top Q = Q$$` },
            ],
            "a",
            "That’s the definition of orthogonal matrices.",
        );
    },

    orth_inverse_equals_transpose: ({ rng, diff, id, topic }) => {
        return mkSingleChoice(
            id,
            topic,
            diff,
            "orth_inverse_equals_transpose",
            `If Q is orthogonal, what is Q⁻¹?`,
            [
                { id: "a", text: "Q⁻¹ = Qᵀ" },
                { id: "b", text: "Q⁻¹ = −Q" },
                { id: "c", text: "Q⁻¹ = 0" },
            ],
            "a",
            "Orthogonal matrices satisfy QᵀQ=I, so Q⁻¹=Qᵀ.",
        );
    },

    orth_preserves_norm_numeric: ({ rng, diff, id, topic }) => {
        // 90° rotation preserves length
        const Q = [
            [0, -1],
            [1, 0],
        ];
        const { lo, hi } = rangeForDiff(diff);
        const x = randNonZeroVec(rng, 2, lo, hi);
        const Qx = matVec(Q, x);
        // ask for squared norm to keep integer
        return mkNumeric(
            id,
            topic,
            diff,
            "orth_preserves_norm_numeric",
            String.raw`Let $$Q=\begin{bmatrix}0&-1\\1&0\end{bmatrix}$$ (a 90° rotation). Compute $$\|Qx\|_2^2$$.

$$x=${vecToLatexCol(x)}$$`,
            l2Squared(Qx),
            String.raw`Orthogonal transforms preserve length, so $$\|Qx\|^2=\|x\|^2$$.`,
        );
    },

    // ============================================================
    // ORTHONORMAL BASIS + COORDINATES
    // ============================================================
    onb_coords_Bt_x: ({ rng, diff, id, topic }) => {
        return mkSingleChoice(
            id,
            topic,
            diff,
            "onb_coords_Bt_x",
            `If B has orthonormal columns (BᵀB=I), how do you get coordinates λ of x in that basis?`,
            [
                { id: "a", text: String.raw`$$\lambda = B^\top x$$` },
                { id: "b", text: String.raw`$$\lambda = Bx$$` },
                { id: "c", text: String.raw`$$\lambda = (B^\top B)^{-1}x$$` },
            ],
            "a",
            "For an ONB, coordinates are just dot products → Bᵀx.",
        );
    },

    onb_coords_standard_numeric: ({ rng, diff, id, topic }) => {
        // standard ONB in R^3: coordinates = components
        const { lo, hi } = rangeForDiff(diff);
        const x = randNonZeroVec(rng, 3, lo, hi);
        const k = rng.pick([1, 2, 3] as const);
        return mkNumeric(
            id,
            topic,
            diff,
            "onb_coords_standard_numeric",
            String.raw`In the standard orthonormal basis of $$\mathbb{R}^3$$, the coordinates of $$x$$ are just its components.
Given $$x=${vecToLatexCol(x)}$$, what is the ${k === 1 ? "1st" : k === 2 ? "2nd" : "3rd"} coordinate?`,
            x[k - 1],
            "Standard basis coordinates are the entries of x.",
        );
    },

    // ============================================================
    // ORTHOGONAL COMPLEMENT
    // ============================================================
    orth_comp_plane_in_R3: ({ rng, diff, id, topic }) => {
        return mkSingleChoice(
            id,
            topic,
            diff,
            "orth_comp_plane_in_R3",
            String.raw`Let $$U=\text{span}\left(\begin{bmatrix}1\\0\\0\end{bmatrix},\begin{bmatrix}0\\1\\0\end{bmatrix}\right)\subset\mathbb{R}^3$$.
What is $$U^\perp$$?`,
            [
                { id: "a", text: String.raw`$$\text{span}\left(\begin{bmatrix}0\\0\\1\end{bmatrix}\right)$$` },
                { id: "b", text: String.raw`$$\text{span}\left(\begin{bmatrix}1\\1\\0\end{bmatrix}\right)$$` },
                { id: "c", text: String.raw`$$\mathbb{R}^3$$` },
            ],
            "a",
            "U is the xy-plane; its orthogonal complement is the z-axis.",
        );
    },

    orth_comp_definition: ({ rng, diff, id, topic }) => {
        return mkSingleChoice(
            id,
            topic,
            diff,
            "orth_comp_definition",
            `Which is the correct definition of U⊥?`,
            [
                { id: "a", text: "All v such that ⟨v,u⟩=0 for every u in U." },
                { id: "b", text: "All v such that ⟨v,u⟩=1 for every u in U." },
                { id: "c", text: "All v such that v=u for some u in U." },
            ],
            "a",
            "Orthogonal complement means perpendicular to the whole subspace.",
        );
    },

    // ============================================================
    // INNER PRODUCT OF FUNCTIONS (keep answers clean: often 0)
    // ============================================================
    func_inner_sin_cos_zero: ({ rng, diff, id, topic }) => {
        return mkNumeric(
            id,
            topic,
            diff,
            "func_inner_sin_cos_zero",
            String.raw`Let $$\langle u,v\rangle=\int_{-\pi}^{\pi} u(x)v(x)\,dx$$.
Compute $$\langle \sin x,\cos x\rangle$$.`,
            0,
            "sin(x)cos(x) is odd on [-π,π], so it cancels to 0.",
        );
    },

    func_orthogonality_concept: ({ rng, diff, id, topic }) => {
        return mkSingleChoice(
            id,
            topic,
            diff,
            "func_orthogonality_concept",
            `For functions with ⟨u,v⟩ = ∫ u(x)v(x) dx, what does “orthogonal” mean?`,
            [
                { id: "a", text: "∫ u(x)v(x) dx = 0" },
                { id: "b", text: "u(x)=v(x) for all x" },
                { id: "c", text: "u and v have the same max value" },
            ],
            "a",
            "Same idea: inner product equals 0.",
        );
    },

    // ============================================================
    // PROJECTION ONTO A LINE
    // ============================================================
    proj_line_compute_vector: ({ rng, diff, id, topic }) => {
        const { lo, hi } = rangeForDiff(diff);
        const b = randNonZeroVec(rng, 2, lo, hi);
        const perp = normalizeDir2D(b);

        // build x = t*b + k*perp so projection is exactly t*b (integers)
        const t = safeInt(rng, -3, 3) || 2;
        const k = safeInt(rng, -2, 2) || 1;

        const x = [t * b[0] + k * perp[0], t * b[1] + k * perp[1]];
        const proj = [t * b[0], t * b[1]];

        return mkMatrixInput(
            id,
            topic,
            diff,
            "proj_line_compute_vector",
            String.raw`Project $$x$$ onto the line $$U=\text{span}(b)$$ (standard dot product).

$$b=${vecToLatexCol(b)},\quad x=${vecToLatexCol(x)}$$

Return $$\pi_U(x)$$ as a 2×1 vector.`,
            2,
            1,
            mkColMatrix(proj),
            String.raw`$$\pi_U(x)=\frac{b^\top x}{b^\top b}\,b$$. Here, $$x=t\,b+\text{(perp)}$$, so projection is $$t\,b$$.`,
        );
    },

    proj_line_scalar_coeff_t: ({ rng, diff, id, topic }) => {
        const b = [1, 2];
        const perp = normalizeDir2D(b); // [-2,1]
        const t = rng.pick([-3, -2, -1, 1, 2, 3] as any) as number;
        const k = rng.pick([-2, -1, 1, 2] as any) as number;
        const x = [t * b[0] + k * perp[0], t * b[1] + k * perp[1]];

        return mkNumeric(
            id,
            topic,
            diff,
            "proj_line_scalar_coeff_t",
            String.raw`Let $$U=\text{span}(b)$$ with $$b=${vecToLatexCol(b)}$$.
Suppose $$x=t\,b + (\text{something perpendicular to }b)$$.

Given $$x=${vecToLatexCol(x)}$$, what is $$t$$?`,
            t,
            "If x = t b + perp, the projection onto span(b) is exactly t b.",
        );
    },

    // ============================================================
    // PROJECTION ONTO A SUBSPACE
    // ============================================================
    proj_subspace_xy_in_R3: ({ rng, diff, id, topic }) => {
        // U = span(e1,e2) in R3 -> projection zeros out z
        const { lo, hi } = rangeForDiff(diff);
        const x = randNonZeroVec(rng, 3, lo, hi);
        const proj = [x[0], x[1], 0];

        return mkMatrixInput(
            id,
            topic,
            diff,
            "proj_subspace_xy_in_R3",
            String.raw`Let $$U=\text{span}(e_1,e_2)\subset\mathbb{R}^3$$ (the xy-plane).
Project $$x$$ onto $$U$$.

$$x=${vecToLatexCol(x)}$$`,
            3,
            1,
            mkColMatrix(proj),
            "Projection onto xy-plane keeps x,y and sets z→0.",
        );
    },

    proj_matrix_idempotent: ({ rng, diff, id, topic }) => {
        return mkSingleChoice(
            id,
            topic,
            diff,
            "proj_matrix_idempotent",
            `If P is a projection matrix, which property must hold?`,
            [
                { id: "a", text: "P² = P" },
                { id: "b", text: "P² = 0" },
                { id: "c", text: "P² = I" },
            ],
            "a",
            "Projecting twice does nothing extra.",
        );
    },

    // ============================================================
    // PROJECTION ONTO AFFINE SUBSPACES
    // ============================================================
    proj_affine_horizontal_line: ({ rng, diff, id, topic }) => {
        // L = { [t, c] : t in R } = x0 + span([1,0]), with x0=[0,c]
        const { lo, hi } = rangeForDiff(diff);
        const c = safeInt(rng, -3, 3);
        const x = [safeInt(rng, lo, hi), safeInt(rng, lo, hi)];
        const proj = [x[0], c];

        return mkMatrixInput(
            id,
            topic,
            diff,
            "proj_affine_horizontal_line",
            String.raw`Project the point $$x$$ onto the affine line $$L=\{(t,${c})\}$$ (a horizontal line).

$$x=${vecToLatexCol(x)}$$

Return $$\pi_L(x)$$ as a 2×1 vector.`,
            2,
            1,
            mkColMatrix(proj),
            "Closest point on y=c keeps same x-coordinate and sets y=c.",
        );
    },

    proj_affine_shift_project_unshift: ({ rng, diff, id, topic }) => {
        return mkSingleChoice(
            id,
            topic,
            diff,
            "proj_affine_shift_project_unshift",
            `How do you project onto an affine subspace L = x₀ + U?`,
            [
                { id: "a", text: "Shift: x−x₀, project onto U, then add x₀ back." },
                { id: "b", text: "Just project x onto U and ignore x₀." },
                { id: "c", text: "Multiply x by x₀." },
            ],
            "a",
            "Affine projection = shift → project → unshift.",
        );
    },

    // ============================================================
    // GRAM–SCHMIDT
    // ============================================================
    gs_compute_u2_easy: ({ rng, diff, id, topic }) => {
        // choose a clean pair so u2 is integer
        // b1=[2,0], b2=[1,1] -> proj=(1,0), u2=(0,1)
        const b1 = [2, 0];
        const b2 = [1, 1];
        const u2 = [0, 1];

        return mkMatrixInput(
            id,
            topic,
            diff,
            "gs_compute_u2_easy",
            String.raw`Gram–Schmidt (dot product). Let

$$b_1=${vecToLatexCol(b1)},\quad b_2=${vecToLatexCol(b2)}.$$

Compute $$u_2=b_2-\pi_{\text{span}(u_1)}(b_2)$$ where $$u_1=b_1$$.
Return $$u_2$$ as a 2×1 vector.`,
            2,
            1,
            mkColMatrix(u2),
            String.raw`Projection onto a line: $$\pi(b_2)=\frac{u_1^\top b_2}{u_1^\top u_1}u_1$$.`,
        );
    },

    gs_normalize_u2: ({ rng, diff, id, topic }) => {
        // u2 = [0,1] -> norm 1
        return mkNumeric(
            id,
            topic,
            diff,
            "gs_normalize_u2",
            String.raw`If $$u_2=\begin{bmatrix}0\\1\end{bmatrix}$$, what is $$\|u_2\|_2$$?`,
            1,
            "Euclidean norm of [0,1] is 1.",
        );
    },

    // ============================================================
    // ROTATIONS (and Givens idea)
    // ============================================================
    rot90_apply_vector: ({ rng, diff, id, topic }) => {
        const { lo, hi } = rangeForDiff(diff);
        const v = randNonZeroVec(rng, 2, lo, hi);
        // 90° CCW rotation: (x,y) -> (-y, x)
        const out = [-v[1], v[0]];
        return mkMatrixInput(
            id,
            topic,
            diff,
            "rot90_apply_vector",
            String.raw`Apply a 90° counterclockwise rotation to $$v$$.

$$R=\begin{bmatrix}0&-1\\1&0\end{bmatrix},\quad v=${vecToLatexCol(v)}$$

Compute $$Rv$$.`,
            2,
            1,
            mkColMatrix(out),
            "For 90° CCW: (x,y) → (−y, x).",
        );
    },

    rotation_det_choice: ({ rng, diff, id, topic }) => {
        return mkSingleChoice(
            id,
            topic,
            diff,
            "rotation_det_choice",
            `Which is true for a pure rotation matrix in 2D?`,
            [
                { id: "a", text: "It is orthogonal and has determinant +1." },
                { id: "b", text: "It is diagonal and has determinant 0." },
                { id: "c", text: "It is symmetric and has determinant −1." },
            ],
            "a",
            "Reflections have det −1; rotations have det +1.",
        );
    },

    givens_plane_concept: ({ rng, diff, id, topic }) => {
        return mkSingleChoice(
            id,
            topic,
            diff,
            "givens_plane_concept",
            `A Givens rotation in n-D primarily does what?`,
            [
                { id: "a", text: "Rotates only in a chosen (i,j) coordinate plane; other coordinates stay unchanged." },
                { id: "b", text: "Scales every coordinate by the same constant." },
                { id: "c", text: "Turns every vector into the zero vector." },
            ],
            "a",
            "Givens = a 2D rotation embedded inside a bigger space.",
        );
    },

    // ============================================================
    // FALLBACK
    // ============================================================
    fallback: ({ rng, diff, id, topic }) => {
        const { lo, hi } = rangeForDiff(diff);
        const x = randNonZeroVec(rng, 2, lo, hi);
        return mkSingleChoice(
            id,
            topic,
            diff,
            "fallback",
            String.raw`(Fallback) Which expression equals $$\|x\|_2^2$$ for $$x=${vecToLatexCol(x)}$$?`,
            [
                { id: "a", text: String.raw`$$x^\top x$$` },
                { id: "b", text: String.raw`$$x^\top -x$$` },
                { id: "c", text: String.raw`$$x+x$$` },
            ],
            "a",
            String.raw`By definition, $$\|x\|_2=\sqrt{x^\top x}$$.`,
        );
    },
};

// Safe “mixed” = only implemented handlers (excluding fallback)
const SAFE_MIXED_POOL: PoolItem[] = Object.keys(HANDLERS)
    .filter((k) => k !== "fallback")
    .map((k) => ({ key: k, w: 1 }));

export function makeGenAnalyticGeometry(ctx: TopicContext) {
    return (rng: RNG, diff: Difficulty, id: string): GenOut<ExerciseKind> => {
        const topic = String(ctx.topicSlug);

        // ✅ DB decides allowed archetypes via meta.pool
        const fromDb = readPoolFromMeta(ctx.meta).filter((p) => p.key in HANDLERS);

        // If a topic has no pool (like mixed), safely use all implemented keys
        const pool = fromDb.length ? fromDb : SAFE_MIXED_POOL;

        const key = weightedKey(rng, pool);
        const handler = HANDLERS[key] ?? HANDLERS.fallback;

        return handler({ rng, diff, id, topic });
    };
}
