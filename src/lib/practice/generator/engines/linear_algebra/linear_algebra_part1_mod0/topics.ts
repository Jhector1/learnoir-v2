import {
    defineTopic,
    type Handler,
    type HandlerArgs,
    type TopicBundle,
    makeSingleChoiceOut,
} from "@/lib/practice/generator/engines/utils";

import type {
    Difficulty,
    ExerciseKind,
    MatrixInputExercise,
    NumericExercise,
} from "@/lib/practice/types";
import type { GenOut } from "@/lib/practice/generator/shared/expected";
import type { RNG } from "@/lib/practice/generator/shared/rng";
import { LA_TOPIC_MOD0 } from "@/lib/practice/catalog/subjects/linear_algebra/slugs";

/* ----------------------------- helpers ----------------------------- */

type OptId = "a" | "b" | "c" | "d";

function fmtCol(v: number[]) {
    return String.raw`\begin{bmatrix}${v.map(String).join("\\\\")}\end{bmatrix}`;
}

function fmtRow(v: number[]) {
    return String.raw`\begin{bmatrix}${v.join(" & ")}</begin{bmatrix}`;
}

function fmtVec2(x: number, y: number) {
    return String.raw`\begin{bmatrix}${x}\\${y}\end{bmatrix}`;
}

function vecToCol(v: number[]) {
    return v.map((x) => [x]);
}

function addVec(a: number[], b: number[]) {
    return a.map((x, i) => x + b[i]);
}

function mulScalar(s: number, v: number[]) {
    return v.map((x) => s * x);
}

function dot(a: number[], b: number[]) {
    let s = 0;
    for (let i = 0; i < a.length; i++) s += a[i] * b[i];
    return s;
}

function norm(a: number[]) {
    return Math.sqrt(dot(a, a));
}

function roundTo(x: number, d: number) {
    const p = 10 ** d;
    return Math.round(x * p) / p;
}

function randNonZeroInt(rng: RNG, lo: number, hi: number) {
    let v = 0;
    while (v === 0) v = rng.int(lo, hi);
    return v;
}

function pickLen(rng: RNG, diff: Difficulty) {
    return diff === "easy" ? 3 : diff === "medium" ? 4 : 5;
}

function vecInts(rng: RNG, n: number, range: number, allowZero = true) {
    let v = Array.from({ length: n }, () => rng.int(-range, range));
    if (!allowZero) {
        while (v.every((x) => x === 0)) {
            v = Array.from({ length: n }, () => rng.int(-range, range));
        }
    }
    return v;
}

function buildOptions(key: string, ids: OptId[]) {
    return ids.map((id) => ({
        id,
        text: `@:quiz.${key}.options.${id}`,
    }));
}

function sc(
    key: string,
    answerOptionId: OptId,
    optionIds: OptId[] = ["a", "b", "c", "d"],
    make: (args: HandlerArgs) => { title: string; prompt: string; hint: string },
): Handler {
    return (args: HandlerArgs) => {
        const payload = make(args);
        return makeSingleChoiceOut({
            archetype: key,
            id: args.id,
            topic: args.topic,
            diff: args.diff,
            title: payload.title,
            prompt: payload.prompt,
            hint: payload.hint,
            options: buildOptions(key, optionIds),
            answerOptionId,
        });
    };
}

function num(args: {
    archetype: string;
    id: string;
    topic: string;
    diff: Difficulty;
    title: string;
    prompt: string;
    hint: string;
    value: number;
    tolerance: number;
}): GenOut<ExerciseKind> {
    const exercise: NumericExercise = {
        id: args.id,
        topic: args.topic,
        difficulty: args.diff,
        kind: "numeric",
        title: args.title,
        prompt: args.prompt,
        hint: args.hint,
    };

    return {
        archetype: args.archetype,
        exercise,
        expected: {
            kind: "numeric",
            value: args.value,
            tolerance: args.tolerance,
        },
    };
}

function mi(args: {
    archetype: string;
    id: string;
    topic: string;
    diff: Difficulty;
    title: string;
    prompt: string;
    hint: string;
    values: number[][];
}): GenOut<ExerciseKind> {
    const rows = args.values.length;
    const cols = args.values[0]?.length ?? 0;

    const exercise: MatrixInputExercise = {
        id: args.id,
        topic: args.topic,
        difficulty: args.diff,
        kind: "matrix_input",
        title: args.title,
        prompt: args.prompt,
        rows,
        cols,
        tolerance: 0,
        integerOnly: true,
        step: 1,
        hint: args.hint,
    };

    return {
        archetype: args.archetype,
        exercise,
        expected: {
            kind: "matrix_input",
            rows,
            cols,
            values: args.values,
            tolerance: 0,
        },
    };
}

/* ============================= VECTORS ============================= */

export const M0_VECTORS_POOL = [
    { key: "la_vectors_dimension", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_vectors_orientation", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_vectors_membership", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_vectors_add_defined", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_vectors_scalar_mult_input", w: 1, kind: "matrix_input", purpose: "quiz" },
    { key: "la_vectors_add_input", w: 1, kind: "matrix_input", purpose: "quiz" },
] as const;

export const M0_VECTORS_HANDLERS: Record<(typeof M0_VECTORS_POOL)[number]["key"], Handler> = {
    la_vectors_dimension: ({ rng, diff, id, topic }: HandlerArgs) => {
        const n = pickLen(rng, diff);
        const v = vecInts(rng, n, 6, false);

        return makeSingleChoiceOut({
            archetype: "la_vectors_dimension",
            id,
            topic,
            diff,
            title: "@:quiz.la_vectors_dimension.title",
            prompt: String.raw`
Consider

$$
v=${fmtCol(v)}.
$$

Which space does this vector belong to?
`.trim(),
            options: buildOptions("la_vectors_dimension", ["a", "b", "c", "d"]),
            answerOptionId: "a",
            hint: "@:quiz.la_vectors_dimension.hint",
        });
    },

    la_vectors_orientation: ({ rng, diff, id, topic }: HandlerArgs) => {
        const n = pickLen(rng, diff);
        const v = vecInts(rng, n, 5, false);
        const asRow = rng.int(0, 1) === 1;
        const display = asRow
            ? String.raw`\begin{bmatrix}${v.join(" & ")}\end{bmatrix}`
            : fmtCol(v);

        return makeSingleChoiceOut({
            archetype: "la_vectors_orientation",
            id,
            topic,
            diff,
            title: "@:quiz.la_vectors_orientation.title",
            prompt: String.raw`
Look at

$$
v=${display}.
$$

How is it written?
`.trim(),
            options: buildOptions("la_vectors_orientation", ["a", "b", "c"]),
            answerOptionId: asRow ? "a" : "b",
            hint: "@:quiz.la_vectors_orientation.hint",
        });
    },

    la_vectors_membership: ({ rng, diff, id, topic }: HandlerArgs) => {
        const n = pickLen(rng, diff);
        const v = vecInts(rng, n, 5, false);
        const wrong1 = Math.max(2, n - 1);
        const wrong2 = n + 1;

        return makeSingleChoiceOut({
            archetype: "la_vectors_membership",
            id,
            topic,
            diff,
            title: "@:quiz.la_vectors_membership.title",
            prompt: String.raw`
Let

$$
v=${fmtCol(v)}.
$$

Which statement is correct?
`.trim(),
            options: [
                { id: "a", text: String.raw`$$v\in\mathbb{R}^{${n}}$$` },
                { id: "b", text: String.raw`$$v\in\mathbb{R}^{${wrong1}}$$` },
                { id: "c", text: String.raw`$$v\in\mathbb{R}^{${wrong2}}$$` },
                { id: "d", text: "@:quiz.la_vectors_membership.options.d" },
            ],
            answerOptionId: "a",
            hint: "@:quiz.la_vectors_membership.hint",
        });
    },

    la_vectors_add_defined: ({ rng, diff, id, topic }: HandlerArgs) => {
        const n1 = pickLen(rng, diff);
        const same = rng.int(0, 1) === 1;
        const n2 = same ? n1 : n1 + 1;

        const a = vecInts(rng, n1, 5, false);
        const b = vecInts(rng, n2, 5, false);

        return makeSingleChoiceOut({
            archetype: "la_vectors_add_defined",
            id,
            topic,
            diff,
            title: "@:quiz.la_vectors_add_defined.title",
            prompt: String.raw`
Let

$$
a=${fmtCol(a)},
\qquad
b=${fmtCol(b)}.
$$

Is the sum $$a+b$$ defined?
`.trim(),
            options: buildOptions("la_vectors_add_defined", ["a", "b"]),
            answerOptionId: same ? "a" : "b",
            hint: "@:quiz.la_vectors_add_defined.hint",
        });
    },

    la_vectors_scalar_mult_input: ({ rng, diff, id, topic }: HandlerArgs) => {
        const n = pickLen(rng, diff);
        const v = vecInts(rng, n, 4, false);
        const s = rng.pick([-3, -2, 2, 3] as const);

        return mi({
            archetype: "la_vectors_scalar_mult_input",
            id,
            topic,
            diff,
            title: "@:quiz.la_vectors_scalar_mult_input.title",
            prompt: String.raw`
Let

$$
v=${fmtCol(v)}.
$$

Compute

$$
${s}v
$$

and enter the answer as a column vector.
`.trim(),
            hint: "@:quiz.la_vectors_scalar_mult_input.hint",
            values: vecToCol(mulScalar(s, v)),
        });
    },

    la_vectors_add_input: ({ rng, diff, id, topic }: HandlerArgs) => {
        const n = pickLen(rng, diff);
        const a = vecInts(rng, n, 5, false);
        const b = vecInts(rng, n, 5, false);

        return mi({
            archetype: "la_vectors_add_input",
            id,
            topic,
            diff,
            title: "@:quiz.la_vectors_add_input.title",
            prompt: String.raw`
Let

$$
a=${fmtCol(a)},
\qquad
b=${fmtCol(b)}.
$$

Compute

$$
a+b
$$

and enter the result as a column vector.
`.trim(),
            hint: "@:quiz.la_vectors_add_input.hint",
            values: vecToCol(addVec(a, b)),
        });
    },
};

export const LA_VECTORS_TOPIC: TopicBundle = defineTopic(
    LA_TOPIC_MOD0.vectors,
    M0_VECTORS_POOL as any,
    M0_VECTORS_HANDLERS as any,
);

/* ============================== NUMPY ============================== */

export const M0_NUMPY_POOL = [
    { key: "la_numpy_shapes_basic", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_numpy_column_shape", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_numpy_transpose_shape", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_numpy_broadcast_shape", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_numpy_list_vs_array", w: 1, kind: "single_choice", purpose: "quiz" },
] as const;

export const M0_NUMPY_HANDLERS: Record<(typeof M0_NUMPY_POOL)[number]["key"], Handler> = {
    la_numpy_shapes_basic: sc(
        "la_numpy_shapes_basic",
        "a",
        ["a", "b", "c", "d"],
        () => ({
            title: "@:quiz.la_numpy_shapes_basic.title",
            prompt: String.raw`
In NumPy:

~~~python
asArray = np.array([1, 2, 3])
rowVec  = np.array([[1, 2, 3]])
colVec  = np.array([[1], [2], [3]])
~~~

Which set of shapes is correct?
`.trim(),
            hint: "@:quiz.la_numpy_shapes_basic.hint",
        }),
    ),

    la_numpy_column_shape: sc(
        "la_numpy_column_shape",
        "c",
        ["a", "b", "c", "d"],
        () => ({
            title: "@:quiz.la_numpy_column_shape.title",
            prompt: "@:quiz.la_numpy_column_shape.prompt",
            hint: "@:quiz.la_numpy_column_shape.hint",
        }),
    ),

    la_numpy_transpose_shape: sc(
        "la_numpy_transpose_shape",
        "b",
        ["a", "b", "c", "d"],
        () => ({
            title: "@:quiz.la_numpy_transpose_shape.title",
            prompt: "@:quiz.la_numpy_transpose_shape.prompt",
            hint: "@:quiz.la_numpy_transpose_shape.hint",
        }),
    ),

    la_numpy_broadcast_shape: sc(
        "la_numpy_broadcast_shape",
        "c",
        ["a", "b", "c", "d"],
        () => ({
            title: "@:quiz.la_numpy_broadcast_shape.title",
            prompt: "@:quiz.la_numpy_broadcast_shape.prompt",
            hint: "@:quiz.la_numpy_broadcast_shape.hint",
        }),
    ),

    la_numpy_list_vs_array: sc(
        "la_numpy_list_vs_array",
        "b",
        ["a", "b", "c", "d"],
        () => ({
            title: "@:quiz.la_numpy_list_vs_array.title",
            prompt: "@:quiz.la_numpy_list_vs_array.prompt",
            hint: "@:quiz.la_numpy_list_vs_array.hint",
        }),
    ),
};

export const LA_NUMPY_TOPIC: TopicBundle = defineTopic(
    LA_TOPIC_MOD0.numpy,
    M0_NUMPY_POOL as any,
    M0_NUMPY_HANDLERS as any,
);

/* =============================== DOT ============================== */

export const M0_DOT_POOL = [
    { key: "la_dot_numeric", w: 1, kind: "numeric", purpose: "quiz" },
    { key: "la_dot_sign_angle", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_dot_zero_means", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_dot_commutative", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_dot_self_norm", w: 1, kind: "single_choice", purpose: "quiz" },
] as const;

export const M0_DOT_HANDLERS: Record<(typeof M0_DOT_POOL)[number]["key"], Handler> = {
    la_dot_numeric: ({ rng, diff, id, topic }: HandlerArgs) => {
        const n = pickLen(rng, diff);
        const a = vecInts(rng, n, 5, false);
        const b = vecInts(rng, n, 5, false);

        return num({
            archetype: "la_dot_numeric",
            id,
            topic,
            diff,
            title: "@:quiz.la_dot_numeric.title",
            prompt: String.raw`
Let

$$
a=${fmtCol(a)},
\qquad
b=${fmtCol(b)}.
$$

Compute

$$
a\cdot b.
$$
`.trim(),
            hint: "@:quiz.la_dot_numeric.hint",
            value: dot(a, b),
            tolerance: 0,
        });
    },

    la_dot_sign_angle: ({ rng, diff, id, topic }: HandlerArgs) => {
        const a = [randNonZeroInt(rng, -5, 5), randNonZeroInt(rng, -5, 5)];
        const kind = rng.pick(["positive", "negative", "zero"] as const);

        let b = [0, 0];
        if (kind === "positive") b = [a[0], a[1]];
        else if (kind === "negative") b = [-a[0], -a[1]];
        else b = [-a[1], a[0]];

        return makeSingleChoiceOut({
            archetype: "la_dot_sign_angle",
            id,
            topic,
            diff,
            title: "@:quiz.la_dot_sign_angle.title",
            prompt: String.raw`
Let

$$
a=${fmtVec2(a[0], a[1])},
\qquad
b=${fmtVec2(b[0], b[1])}.
$$

What kind of angle lies between them?
`.trim(),
            options: buildOptions("la_dot_sign_angle", ["a", "b", "c"]),
            answerOptionId: kind === "positive" ? "a" : kind === "zero" ? "b" : "c",
            hint: "@:quiz.la_dot_sign_angle.hint",
        });
    },

    la_dot_zero_means: sc(
        "la_dot_zero_means",
        "b",
        ["a", "b", "c", "d"],
        () => ({
            title: "@:quiz.la_dot_zero_means.title",
            prompt: "@:quiz.la_dot_zero_means.prompt",
            hint: "@:quiz.la_dot_zero_means.hint",
        }),
    ),

    la_dot_commutative: sc(
        "la_dot_commutative",
        "a",
        ["a", "b", "c", "d"],
        () => ({
            title: "@:quiz.la_dot_commutative.title",
            prompt: "@:quiz.la_dot_commutative.prompt",
            hint: "@:quiz.la_dot_commutative.hint",
        }),
    ),

    la_dot_self_norm: sc(
        "la_dot_self_norm",
        "c",
        ["a", "b", "c", "d"],
        () => ({
            title: "@:quiz.la_dot_self_norm.title",
            prompt: "@:quiz.la_dot_self_norm.prompt",
            hint: "@:quiz.la_dot_self_norm.hint",
        }),
    ),
};

export const LA_DOT_TOPIC: TopicBundle = defineTopic(
    LA_TOPIC_MOD0.dot,
    M0_DOT_POOL as any,
    M0_DOT_HANDLERS as any,
);

/* ============================ PRODUCTS ============================ */

export const M0_PRODUCTS_POOL = [
    { key: "la_products_hadamard_defined", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_products_outer_shape", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_products_outer_entry", w: 1, kind: "numeric", purpose: "quiz" },
    { key: "la_products_hadamard_vs_dot", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_products_hadamard_meaning", w: 1, kind: "single_choice", purpose: "quiz" },
] as const;

export const M0_PRODUCTS_HANDLERS: Record<(typeof M0_PRODUCTS_POOL)[number]["key"], Handler> = {
    la_products_hadamard_defined: ({ rng, diff, id, topic }: HandlerArgs) => {
        const n = pickLen(rng, diff);
        const same = rng.int(0, 1) === 1;
        const m = same ? n : n + 1;

        const a = vecInts(rng, n, 4, false);
        const b = vecInts(rng, m, 4, false);

        return makeSingleChoiceOut({
            archetype: "la_products_hadamard_defined",
            id,
            topic,
            diff,
            title: "@:quiz.la_products_hadamard_defined.title",
            prompt: String.raw`
Let

$$
a=${fmtCol(a)},
\qquad
b=${fmtCol(b)}.
$$

Is the Hadamard product $$a\odot b$$ defined?
`.trim(),
            options: buildOptions("la_products_hadamard_defined", ["a", "b"]),
            answerOptionId: same ? "a" : "b",
            hint: "@:quiz.la_products_hadamard_defined.hint",
        });
    },

    la_products_outer_shape: ({ rng, diff, id, topic }: HandlerArgs) => {
        const m = diff === "easy" ? 2 : 3;
        const n = diff === "easy" ? 3 : 4;

        return makeSingleChoiceOut({
            archetype: "la_products_outer_shape",
            id,
            topic,
            diff,
            title: "@:quiz.la_products_outer_shape.title",
            prompt: String.raw`
If

$$
a\in\mathbb{R}^{${m}}
\qquad\text{and}\qquad
b\in\mathbb{R}^{${n}},
$$

what is the shape of the outer product $$ab^T$$?
`.trim(),
            options: [
                { id: "a", text: `${m} × ${n}` },
                { id: "b", text: `${n} × ${m}` },
                { id: "c", text: `${m} × 1` },
                { id: "d", text: `1 × ${n}` },
            ],
            answerOptionId: "a",
            hint: "@:quiz.la_products_outer_shape.hint",
        });
    },

    la_products_outer_entry: ({ rng, diff, id, topic }: HandlerArgs) => {
        const a = vecInts(rng, 2, 4, false);
        const b = vecInts(rng, 3, 4, false);
        const i = rng.int(1, 2);
        const j = rng.int(1, 3);

        return num({
            archetype: "la_products_outer_entry",
            id,
            topic,
            diff,
            title: "@:quiz.la_products_outer_entry.title",
            prompt: String.raw`
Let

$$
a=${fmtCol(a)},
\qquad
b^T=\begin{bmatrix}${b.join(" & ")}\end{bmatrix}.
$$

Compute the entry

$$
(ab^T)_{${i}${j}}.
$$
`.trim(),
            hint: "@:quiz.la_products_outer_entry.hint",
            value: a[i - 1] * b[j - 1],
            tolerance: 0,
        });
    },

    la_products_hadamard_vs_dot: sc(
        "la_products_hadamard_vs_dot",
        "b",
        ["a", "b", "c", "d"],
        () => ({
            title: "@:quiz.la_products_hadamard_vs_dot.title",
            prompt: "@:quiz.la_products_hadamard_vs_dot.prompt",
            hint: "@:quiz.la_products_hadamard_vs_dot.hint",
        }),
    ),

    la_products_hadamard_meaning: sc(
        "la_products_hadamard_meaning",
        "a",
        ["a", "b", "c", "d"],
        () => ({
            title: "@:quiz.la_products_hadamard_meaning.title",
            prompt: "@:quiz.la_products_hadamard_meaning.prompt",
            hint: "@:quiz.la_products_hadamard_meaning.hint",
        }),
    ),
};

export const LA_PRODUCTS_TOPIC: TopicBundle = defineTopic(
    LA_TOPIC_MOD0.products,
    M0_PRODUCTS_POOL as any,
    M0_PRODUCTS_HANDLERS as any,
);

/* =========================== PROJECTION =========================== */

export const M0_PROJECTION_POOL = [
    { key: "la_projection_meaning", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_projection_formula", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_projection_beta_numeric", w: 1, kind: "numeric", purpose: "quiz" },
    { key: "la_projection_perp_zero", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_projection_split", w: 1, kind: "single_choice", purpose: "quiz" },
] as const;

export const M0_PROJECTION_HANDLERS: Record<(typeof M0_PROJECTION_POOL)[number]["key"], Handler> = {
    la_projection_meaning: sc(
        "la_projection_meaning",
        "b",
        ["a", "b", "c", "d"],
        () => ({
            title: "@:quiz.la_projection_meaning.title",
            prompt: "@:quiz.la_projection_meaning.prompt",
            hint: "@:quiz.la_projection_meaning.hint",
        }),
    ),

    la_projection_formula: sc(
        "la_projection_formula",
        "c",
        ["a", "b", "c", "d"],
        () => ({
            title: "@:quiz.la_projection_formula.title",
            prompt: "@:quiz.la_projection_formula.prompt",
            hint: "@:quiz.la_projection_formula.hint",
        }),
    ),

    la_projection_beta_numeric: ({ rng, diff, id, topic }: HandlerArgs) => {
        const a = [randNonZeroInt(rng, -4, 4), randNonZeroInt(rng, -4, 4)];
        const betaExact = randNonZeroInt(rng, -3, 3);
        const p = [-a[1], a[0]];
        const t = rng.int(-2, 2);
        const b = [betaExact * a[0] + t * p[0], betaExact * a[1] + t * p[1]];

        return num({
            archetype: "la_projection_beta_numeric",
            id,
            topic,
            diff,
            title: "@:quiz.la_projection_beta_numeric.title",
            prompt: String.raw`
Let

$$
a=${fmtVec2(a[0], a[1])},
\qquad
b=${fmtVec2(b[0], b[1])}.
$$

Compute

$$
\beta=\frac{a\cdot b}{a\cdot a}.
$$
`.trim(),
            hint: "@:quiz.la_projection_beta_numeric.hint",
            value: roundTo(betaExact, 2),
            tolerance: 0.01,
        });
    },

    la_projection_perp_zero: sc(
        "la_projection_perp_zero",
        "a",
        ["a", "b", "c", "d"],
        () => ({
            title: "@:quiz.la_projection_perp_zero.title",
            prompt: "@:quiz.la_projection_perp_zero.prompt",
            hint: "@:quiz.la_projection_perp_zero.hint",
        }),
    ),

    la_projection_split: sc(
        "la_projection_split",
        "d",
        ["a", "b", "c", "d"],
        () => ({
            title: "@:quiz.la_projection_split.title",
            prompt: "@:quiz.la_projection_split.prompt",
            hint: "@:quiz.la_projection_split.hint",
        }),
    ),
};

export const LA_PROJECTION_TOPIC: TopicBundle = defineTopic(
    LA_TOPIC_MOD0.projection,
    M0_PROJECTION_POOL as any,
    M0_PROJECTION_HANDLERS as any,
);

/* ============================== registry ============================== */

export const LA_PART1_MOD0_TOPIC_BUNDLES = {
    [LA_TOPIC_MOD0.vectors]: LA_VECTORS_TOPIC,
    [LA_TOPIC_MOD0.numpy]: LA_NUMPY_TOPIC,
    [LA_TOPIC_MOD0.dot]: LA_DOT_TOPIC,
    [LA_TOPIC_MOD0.products]: LA_PRODUCTS_TOPIC,
    [LA_TOPIC_MOD0.projection]: LA_PROJECTION_TOPIC,
} as const;