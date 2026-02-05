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
// Math helpers
// ------------------------------------------------------------
function safeInt(rng: RNG, lo: number, hi: number) {
  return rng.int(lo, hi);
}

function randMat(rng: RNG, r: number, c: number, lo = -3, hi = 3): number[][] {
  const A: number[][] = Array.from({ length: r }, () =>
    Array.from({ length: c }, () => safeInt(rng, lo, hi)),
  );
  // Avoid all-zero matrices too often (keeps prompts interesting)
  if (A.every((row) => row.every((v) => v === 0))) A[0][0] = 1;
  return A;
}

function matToLatex(A: number[][]): string {
  const rows = A.map((row) => row.join(" & ")).join(String.raw` \\ `);
  return String.raw`\begin{bmatrix}${rows}\end{bmatrix}`;
}

function transpose(A: number[][]): number[][] {
  const r = A.length;
  const c = A[0]?.length ?? 0;
  return Array.from({ length: c }, (_, j) => Array.from({ length: r }, (_, i) => A[i][j]));
}

function matMul(A: number[][], B: number[][]): number[][] {
  const m = A.length;
  const n = A[0]?.length ?? 0;
  const p = B[0]?.length ?? 0;

  const out: number[][] = Array.from({ length: m }, () => Array.from({ length: p }, () => 0));
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < p; j++) {
      let s = 0;
      for (let k = 0; k < n; k++) s += A[i][k] * B[k][j];
      out[i][j] = s;
    }
  }
  return out;
}

function hadamard(A: number[][], B: number[][]): number[][] {
  return A.map((row, i) => row.map((v, j) => v * B[i][j]));
}

function add(A: number[][], B: number[][]): number[][] {
  return A.map((row, i) => row.map((v, j) => v + B[i][j]));
}

function addScalarAll(A: number[][], s: number): number[][] {
  return A.map((row) => row.map((v) => v + s));
}

function addScalarDiag(A: number[][], s: number): number[][] {
  const r = A.length;
  const c = A[0]?.length ?? 0;
  return A.map((row, i) => row.map((v, j) => v + (i === j ? s : 0)));
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
  return { archetype: title, exercise, expected: { kind: "single_choice", optionId: answerId } as any };
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
    expected: {
      kind: "matrix_input",
      rows,
      cols,
      value: answer,
    } as any,
  };
}

// ------------------------------------------------------------
// Handlers (keys MUST match DB meta.pool keys)
// ------------------------------------------------------------
const HANDLERS: Record<string, Handler> = {
  // ----- INTRO -----
  intro_read_shape_mxn: ({ rng, diff, id, topic }) => {
    const m = safeInt(rng, 2, 4);
    const n = safeInt(rng, 2, 4);
    const A = randMat(rng, m, n, -2, 5);

    const correct = `${m}×${n}`;
    const o1 = `${n}×${m}`;
    const o2 = `${m}×${m}`;
    const o3 = `${n}×${n}`;

    const options = rng.pick([
      [correct, o1, o2],
      [correct, o1, o3],
      [correct, o2, o3],
    ] as const);

    const mapped = [
      { id: "a", text: options[0] },
      { id: "b", text: options[1] },
      { id: "c", text: options[2] },
    ];

    const ans = mapped.find((x) => x.text === correct)!.id;

    return mkSingleChoice(
      id,
      topic,
      diff,
      "intro_read_shape_mxn",
      String.raw`Matrix $$A=${matToLatex(A)}$$. What is the shape of $$A$$ (rows × columns)?`,
      mapped,
      ans,
      "Count rows first, then columns.",
    );
  },

  intro_count_entries: ({ rng, diff, id, topic }) => {
    const m = safeInt(rng, 2, 5);
    const n = safeInt(rng, 2, 5);
    const A = randMat(rng, m, n, -1, 4);
    return mkNumeric(
      id,
      topic,
      diff,
      "intro_count_entries",
      String.raw`Matrix $$A=${matToLatex(A)}$$ is $$${m}\times${n}$$. How many total entries does it have?`,
      m * n,
      "Total entries = rows × columns.",
    );
  },

  intro_row_vs_column_interpret: ({ rng, diff, id, topic }) => {
    const A = randMat(rng, 3, 3, -2, 6);
    const i = safeInt(rng, 1, 3);
    const j = safeInt(rng, 1, 3);
    const correct = A[i - 1][j - 1];
    const wrong1 = A[j - 1][i - 1];
    const wrong2 = A[i - 1][j % 3];
    const opts = [
      { id: "a", text: String(correct) },
      { id: "b", text: String(wrong1) },
      { id: "c", text: String(wrong2) },
    ];
    const shuffled = rng.pick([opts, [opts[0], opts[2], opts[1]], [opts[1], opts[0], opts[2]]] as const) as any;

    const ans = (shuffled as any[]).find((o) => Number(o.text) === correct).id;

    return mkSingleChoice(
      id,
      topic,
      diff,
      "intro_row_vs_column_interpret",
      String.raw`Let $$A=${matToLatex(A)}$$. What is $$a_{${i},${j}}$$ (row ${i}, column ${j})?`,
      shuffled,
      ans,
      String.raw`In $$a_{ij}$$, $$i$$ = row, $$j$$ = column.`,
    );
  },

  intro_column_vectors_view: ({ rng, diff, id, topic }) => {
    const m = safeInt(rng, 2, 5);
    const n = safeInt(rng, 2, 4);
    const A = randMat(rng, m, n, -2, 4);
    const correct = `${n} column vectors in R^${m}`;
    const wrong1 = `${m} column vectors in R^${n}`;
    const wrong2 = `${n} row vectors in R^${m}`;
    const wrong3 = `${m} row vectors in R^${n}`;

    const options = [
      { id: "a", text: correct },
      { id: "b", text: wrong1 },
      { id: "c", text: wrong2 },
      { id: "d", text: wrong3 },
    ];

    const order = rng.pick([
      ["a", "b", "c", "d"],
      ["b", "a", "c", "d"],
      ["c", "b", "a", "d"],
      ["d", "b", "c", "a"],
    ] as const);
    const shuffled = order.map((k) => options.find((o) => o.id === k)!);

    return mkSingleChoice(
      id,
      topic,
      diff,
      "intro_column_vectors_view",
      String.raw`Matrix $$A=${matToLatex(A)}$$ is $$${m}\times${n}$$. Interpreting $$A$$ as stacked **columns**, which is correct?`,
      shuffled,
      "a",
      String.raw`An $$m\times n$$ matrix has $$n$$ columns, each a vector in $$\mathbb{R}^m$$.`,
    );
  },

  // ----- INDEX + SLICE -----
  index_get_entry_aij: ({ rng, diff, id, topic }) => {
    const A = randMat(rng, 3, 4, -2, 7);
    const i = safeInt(rng, 1, 3);
    const j = safeInt(rng, 1, 4);
    const correct = A[i - 1][j - 1];

    const distractors = [
      A[i - 1][j % 4],
      A[i % 3][j - 1],
      A[Math.max(0, i - 2)][Math.max(0, j - 2)],
    ].filter((v) => v !== correct);

    const opts = [
      { id: "a", text: String(correct) },
      { id: "b", text: String(distractors[0] ?? correct + 1) },
      { id: "c", text: String(distractors[1] ?? correct - 1) },
    ];

    return mkSingleChoice(
      id,
      topic,
      diff,
      "index_get_entry_aij",
      String.raw`Let $$A=${matToLatex(A)}$$. What is $$a_{${i},${j}}$$?`,
      opts,
      "a",
      String.raw`Remember: $$a_{ij}$$ = row $$i$$, column $$j$$.`,
    );
  },

  index_convert_math_to_zero_based: ({ rng, diff, id, topic }) => {
    const i = safeInt(rng, 1, 4);
    const j = safeInt(rng, 1, 4);
    const correct = `[${i - 1}][${j - 1}]`;
    const wrong1 = `[${i}][${j}]`;
    const wrong2 = `[${j - 1}][${i - 1}]`;

    return mkSingleChoice(
      id,
      topic,
      diff,
      "index_convert_math_to_zero_based",
      String.raw`In math, $$a_{${i},${j}}$$ uses 1-based indexing. In Python (0-based), which index is equivalent?`,
      [
        { id: "a", text: correct },
        { id: "b", text: wrong1 },
        { id: "c", text: wrong2 },
      ],
      "a",
      "Subtract 1 from each index.",
    );
  },

  slice_row_column_extract: ({ rng, diff, id, topic }) => {
    const A = randMat(rng, 3, 3, -1, 6);
    const row = safeInt(rng, 1, 3);
    const correct = `Row ${row}: (${A[row - 1].join(", ")})`;

    const wrongRow = (row % 3) + 1;
    const wrong = `Row ${wrongRow}: (${A[wrongRow - 1].join(", ")})`;

    const col = safeInt(rng, 1, 3);
    const colVec = [A[0][col - 1], A[1][col - 1], A[2][col - 1]];
    const wrong2 = `Column ${col}: (${colVec.join(", ")})`;

    return mkSingleChoice(
      id,
      topic,
      diff,
      "slice_row_column_extract",
      String.raw`Let $$A=${matToLatex(A)}$$. Which correctly extracts **row ${row}**?`,
      [
        { id: "a", text: correct },
        { id: "b", text: wrong },
        { id: "c", text: wrong2 },
      ],
      "a",
      "A row is a horizontal list of entries.",
    );
  },

  slice_predict_result_shape: ({ rng, diff, id, topic }) => {
    const m = safeInt(rng, 3, 6);
    const n = safeInt(rng, 3, 6);
    const r1 = safeInt(rng, 1, m - 1);
    const r2 = safeInt(rng, r1 + 1, m);
    const rowsPicked = r2 - r1 + 1;

    const correct = `${rowsPicked}×${n}`;
    const wrong1 = `${n}×${rowsPicked}`;
    const wrong2 = `${rowsPicked}×${rowsPicked}`;

    return mkSingleChoice(
      id,
      topic,
      diff,
      "slice_predict_result_shape",
      `A is ${m}×${n}. If you keep rows ${r1}..${r2} (inclusive) and keep all columns, what is the resulting shape?`,
      [
        { id: "a", text: correct },
        { id: "b", text: wrong1 },
        { id: "c", text: wrong2 },
      ],
      "a",
      "Keeping a subset of rows changes #rows, not #columns.",
    );
  },

  // ----- SPECIAL MATRICES -----
  special_identity_recognize: ({ rng, diff, id, topic }) => {
    const n = safeInt(rng, 2, 4);
    const I: number[][] = Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
    );
    const A = rng.pick([I, randMat(rng, n, n, -1, 2)] as const);

    const isIdentity = A.every((row, i) => row.every((v, j) => v === (i === j ? 1 : 0)));

    return mkSingleChoice(
      id,
      topic,
      diff,
      "special_identity_recognize",
      String.raw`Is $$A=${matToLatex(A)}$$ the identity matrix?`,
      [
        { id: "a", text: "Yes" },
        { id: "b", text: "No" },
      ],
      isIdentity ? "a" : "b",
      "Identity has 1s on the diagonal and 0s elsewhere.",
    );
  },

  special_diagonal_recognize: ({ rng, diff, id, topic }) => {
    const n = safeInt(rng, 2, 4);
    const diag = Array.from({ length: n }, () => safeInt(rng, -3, 5));
    const D: number[][] = Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => (i === j ? diag[i] : 0)),
    );
    const A = rng.pick([D, randMat(rng, n, n, -2, 3)] as const);

    const isDiagonal = A.every((row, i) => row.every((v, j) => (i === j ? true : v === 0)));

    return mkSingleChoice(
      id,
      topic,
      diff,
      "special_diagonal_recognize",
      String.raw`Is $$A=${matToLatex(A)}$$ a diagonal matrix?`,
      [
        { id: "a", text: "Yes" },
        { id: "b", text: "No" },
      ],
      isDiagonal ? "a" : "b",
      "Diagonal matrices have 0s off the diagonal.",
    );
  },

  special_zero_matrix: ({ rng, diff, id, topic }) => {
    const m = safeInt(rng, 2, 4);
    const n = safeInt(rng, 2, 4);
    const Z = Array.from({ length: m }, () => Array.from({ length: n }, () => 0));
    const A = rng.pick([Z, randMat(rng, m, n, -1, 1)] as const);

    const isZero = A.every((row) => row.every((v) => v === 0));

    return mkSingleChoice(
      id,
      topic,
      diff,
      "special_zero_matrix",
      String.raw`Is $$A=${matToLatex(A)}$$ the zero matrix?`,
      [
        { id: "a", text: "Yes" },
        { id: "b", text: "No" },
      ],
      isZero ? "a" : "b",
      "Zero matrix means every entry is 0.",
    );
  },

  special_symmetric_check: ({ rng, diff, id, topic }) => {
    const n = safeInt(rng, 2, 4);
    const makeSym = rng.pick([true, false] as const);

    let A = randMat(rng, n, n, -2, 4);
    if (makeSym) {
      const AT = transpose(A);
      A = A.map((row, i) => row.map((v, j) => (v + AT[i][j]) / 2));
      A = A.map((row) => row.map((v) => Math.round(v)));
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) A[j][i] = A[i][j];
    }

    const isSym = A.every((row, i) => row.every((v, j) => v === A[j][i]));

    return mkSingleChoice(
      id,
      topic,
      diff,
      "special_symmetric_check",
      String.raw`Is $$A=${matToLatex(A)}$$ symmetric? (i.e., $$A^T=A$$)`,
      [
        { id: "a", text: "Yes" },
        { id: "b", text: "No" },
      ],
      isSym ? "a" : "b",
      "Symmetric means mirrored across the diagonal.",
    );
  },

  // ----- ELEMENTWISE + SHIFT -----
  elemwise_add_sub: ({ rng, diff, id, topic }) => {
    const A = randMat(rng, 2, 2, -2, 5);
    const B = randMat(rng, 2, 2, -2, 5);
    const C = add(A, B);

    return mkMatrixInput(
      id,
      topic,
      diff,
      "elemwise_add_sub",
      String.raw`Compute $$A+B$$ (entrywise).

$$A=${matToLatex(A)}$$, \quad $$B=${matToLatex(B)}$$`,
      2,
      2,
      C,
      "Add corresponding entries.",
    );
  },

  elemwise_multiply_hadamard: ({ rng, diff, id, topic }) => {
    const A = randMat(rng, 2, 2, -2, 4);
    const B = randMat(rng, 2, 2, -2, 4);
    const C = hadamard(A, B);

    return mkMatrixInput(
      id,
      topic,
      diff,
      "elemwise_multiply_hadamard",
      String.raw`Compute the Hadamard (elementwise) product $$A\circ B$$.

$$A=${matToLatex(A)}$$, \quad $$B=${matToLatex(B)}$$`,
      2,
      2,
      C,
      "Multiply corresponding entries.",
    );
  },

  shift_add_scalar_to_all_entries: ({ rng, diff, id, topic }) => {
    const A = randMat(rng, 2, 3, -2, 4);
    const s = safeInt(rng, -3, 5);
    const C = addScalarAll(A, s);

    return mkMatrixInput(
      id,
      topic,
      diff,
      "shift_add_scalar_to_all_entries",
      String.raw`Compute $$A + ${s}$$ (add ${s} to **every** entry).

$$A=${matToLatex(A)}$$`,
      2,
      3,
      C,
      "Add the scalar to each entry.",
    );
  },

  shift_add_scalar_to_diagonal: ({ rng, diff, id, topic }) => {
    const n = 3;
    const A = randMat(rng, n, n, -2, 4);
    const s = safeInt(rng, -3, 5);
    const C = addScalarDiag(A, s);

    return mkMatrixInput(
      id,
      topic,
      diff,
      "shift_add_scalar_to_diagonal",
      String.raw`Compute $$A + ${s}I$$ (add ${s} to **diagonal** entries only).

$$A=${matToLatex(A)}$$`,
      n,
      n,
      C,
      "Only diagonal entries change.",
    );
  },

  // ----- MATMUL -----
  matmul_is_defined_shape_check: ({ rng, diff, id, topic }) => {
    const m = safeInt(rng, 2, 5);
    const n = safeInt(rng, 2, 5);
    const p = safeInt(rng, 2, 5);
    const q = safeInt(rng, 2, 5);

    const defined = n === p;

    return mkSingleChoice(
      id,
      topic,
      diff,
      "matmul_is_defined_shape_check",
      `A is ${m}×${n} and B is ${p}×${q}. Is the product AB defined?`,
      [
        { id: "a", text: "Yes" },
        { id: "b", text: "No" },
      ],
      defined ? "a" : "b",
      "AB is defined iff (#cols of A) = (#rows of B).",
    );
  },

  matmul_result_shape: ({ rng, diff, id, topic }) => {
    const m = safeInt(rng, 2, 5);
    const n = safeInt(rng, 2, 5);
    const p = n; // ensure defined
    const q = safeInt(rng, 2, 5);

    const correct = `${m}×${q}`;
    const wrong1 = `${n}×${q}`;
    const wrong2 = `${m}×${n}`;

    return mkSingleChoice(
      id,
      topic,
      diff,
      "matmul_result_shape",
      `A is ${m}×${n} and B is ${p}×${q}. What is the shape of AB?`,
      [
        { id: "a", text: correct },
        { id: "b", text: wrong1 },
        { id: "c", text: wrong2 },
      ],
      "a",
      "Result is (#rows of A) × (#cols of B).",
    );
  },

  matmul_compute_entry_rowcol: ({ rng, diff, id, topic }) => {
    const A = randMat(rng, 2, 3, -2, 4);
    const B = randMat(rng, 3, 2, -2, 4);
    const C = matMul(A, B);

    const i = safeInt(rng, 1, 2);
    const j = safeInt(rng, 1, 2);

    return mkNumeric(
      id,
      topic,
      diff,
      "matmul_compute_entry_rowcol",
      String.raw`Let $$A=${matToLatex(A)}$$ and $$B=${matToLatex(B)}$$.
Compute the $$(${i},${j})$$ entry of $$AB$$.`,
      C[i - 1][j - 1],
      "Entry (i,j) = row i of A · column j of B.",
    );
  },

  matmul_compute_small_2x2: ({ rng, diff, id, topic }) => {
    const A = randMat(rng, 2, 2, -3, 4);
    const B = randMat(rng, 2, 2, -3, 4);
    const C = matMul(A, B);

    return mkMatrixInput(
      id,
      topic,
      diff,
      "matmul_compute_small_2x2",
      String.raw`Compute $$AB$$.

$$A=${matToLatex(A)}$$, \quad $$B=${matToLatex(B)}$$`,
      2,
      2,
      C,
      "Multiply rows of A by columns of B.",
    );
  },

  // ----- MATVEC -----
  matvec_shape_check: ({ rng, diff, id, topic }) => {
    const m = safeInt(rng, 2, 5);
    const n = safeInt(rng, 2, 5);
    const len = safeInt(rng, 2, 5);
    const defined = n === len;

    return mkSingleChoice(
      id,
      topic,
      diff,
      "matvec_shape_check",
      String.raw`$$A$$ is ${m}×${n}. $$v$$ is a vector in $$\mathbb{R}^{${len}}$$. Is $$Av$$ defined?`,
      [
        { id: "a", text: "Yes" },
        { id: "b", text: "No" },
      ],
      defined ? "a" : "b",
      "Av is defined iff (#cols of A) = (length of v).",
    );
  },

  matvec_compute_numeric: ({ rng, diff, id, topic }) => {
    const A = randMat(rng, 2, 2, -3, 5);
    const v = [safeInt(rng, -3, 4), safeInt(rng, -3, 4)];
    const Av = [
      A[0][0] * v[0] + A[0][1] * v[1],
      A[1][0] * v[0] + A[1][1] * v[1],
    ];

    const askFirst = rng.pick([true, false] as const);
    const idx = askFirst ? 0 : 1;

    return mkNumeric(
      id,
      topic,
      diff,
      "matvec_compute_numeric",
      String.raw`Compute $$Av$$.

$$A=${matToLatex(A)}$$, \quad $$v=\begin{bmatrix}${v[0]}\\${v[1]}\end{bmatrix}$$

What is the ${idx === 0 ? "first" : "second"} entry of $$Av$$?`,
      Av[idx],
      "Each entry is a row·vector dot product.",
    );
  },

  matvec_linear_combo_of_columns: ({ diff, id, topic }) => {
    return mkSingleChoice(
      id,
      topic,
      diff,
      "matvec_linear_combo_of_columns",
      String.raw`Which statement is true about $$Av$$ (matrix–vector product)?`,
      [
        { id: "a", text: "Av is a linear combination of the columns of A, using entries of v as weights." },
        { id: "b", text: "Av is a linear combination of the rows of A, using entries of v as weights." },
        { id: "c", text: "Av adds v to every entry of A." },
      ],
      "a",
      String.raw`$$Av = v_1\cdot \text{col}_1 + v_2\cdot \text{col}_2 + \cdots$$`,
    );
  },

  // ----- TRANSPOSE -----
  transpose_shape_rule: ({ rng, diff, id, topic }) => {
    const m = safeInt(rng, 2, 6);
    const n = safeInt(rng, 2, 6);
    return mkSingleChoice(
      id,
      topic,
      diff,
      "transpose_shape_rule",
      `A is ${m}×${n}. What is the shape of Aᵀ?`,
      [
        { id: "a", text: `${n}×${m}` },
        { id: "b", text: `${m}×${n}` },
        { id: "c", text: `${m}×${m}` },
      ],
      "a",
      "Transpose swaps rows and columns.",
    );
  },

  transpose_compute: ({ rng, diff, id, topic }) => {
    const m = safeInt(rng, 2, 3);
    const n = safeInt(rng, 3, 4);
    const A = randMat(rng, m, n, -2, 5);
    const AT = transpose(A);

    return mkMatrixInput(
      id,
      topic,
      diff,
      "transpose_compute",
      String.raw`Compute $$A^T$$.

$$A=${matToLatex(A)}$$`,
      n,
      m,
      AT,
      "Swap rows with columns.",
    );
  },

  transpose_of_product_rule: ({ diff, id, topic }) => {
    return mkSingleChoice(
      id,
      topic,
      diff,
      "transpose_of_product_rule",
      `Which identity is correct?`,
      [
        { id: "a", text: String.raw`$$(AB)^T = A^T B^T$$` },
        { id: "b", text: String.raw`$$(AB)^T = B^T A^T$$` },
        { id: "c", text: String.raw`$$(AB)^T = AB$$` },
      ],
      "b",
      "Transpose reverses the order.",
    );
  },

  transpose_of_sum_rule: ({ diff, id, topic }) => {
    return mkSingleChoice(
      id,
      topic,
      diff,
      "transpose_of_sum_rule",
      `Which identity is correct?`,
      [
        { id: "a", text: String.raw`$$(A+B)^T = A^T + B^T$$` },
        { id: "b", text: String.raw`$$(A+B)^T = A^T B^T$$` },
        { id: "c", text: String.raw`$$(A+B)^T = A + B$$` },
      ],
      "a",
      "Transpose distributes over addition.",
    );
  },

  // ----- SYMMETRIC -----
  sym_check_a_equals_at: ({ rng, diff, id, topic }) => {
    const n = safeInt(rng, 2, 4);
    const makeSym = rng.pick([true, false] as const);
    let A = randMat(rng, n, n, -2, 5);
    if (makeSym) for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) A[j][i] = A[i][j];

    const isSym = A.every((row, i) => row.every((v, j) => v === A[j][i]));

    return mkSingleChoice(
      id,
      topic,
      diff,
      "sym_check_a_equals_at",
      String.raw`Is $$A=${matToLatex(A)}$$ symmetric?`,
      [
        { id: "a", text: "Yes" },
        { id: "b", text: "No" },
      ],
      isSym ? "a" : "b",
      String.raw`Symmetric: $$a_{ij} = a_{ji}$$.`,
    );
  },

  sym_fill_missing_entry: ({ rng, diff, id, topic }) => {
    const a12 = safeInt(rng, -4, 6);
    const a21 = a12;
    const a11 = safeInt(rng, -3, 6);
    const a22 = safeInt(rng, -3, 6);

    return mkNumeric(
      id,
      topic,
      diff,
      "sym_fill_missing_entry",
      String.raw`Fill in $$x$$ so the matrix is symmetric:

$$
A=\begin{bmatrix}
${a11} & ${a12}\\
x & ${a22}
\end{bmatrix}
$$`,
      a21,
      String.raw`For symmetry, $$x$$ must equal the mirrored entry $$a_{12}$$.`,
    );
  },

  sym_properties_true_false: ({ diff, id, topic }) => {
    return mkSingleChoice(
      id,
      topic,
      diff,
      "sym_properties_true_false",
      `Which statement is true?`,
      [
        { id: "a", text: "A symmetric matrix can be non-square." },
        { id: "b", text: "If A is symmetric, then Aᵀ = A." },
        { id: "c", text: "If A is symmetric, then AB = BA for all B." },
      ],
      "b",
      String.raw`Symmetric means $$A^T=A$$ and (must be square).`,
    );
  },

  // ultimate fallback
  fallback: ({ rng, diff, id, topic }) => {
    const A = randMat(rng, 2, 2, -2, 4);
    return mkSingleChoice(
      id,
      topic,
      diff,
      "fallback",
      String.raw`(Fallback) For $$A=${matToLatex(A)}$$, is $$A$$ a 2×2 matrix?`,
      [
        { id: "a", text: "Yes" },
        { id: "b", text: "No" },
      ],
      "a",
    );
  },
};

// Safe “mixed” = only implemented handlers (excluding fallback)
const SAFE_MIXED_POOL: PoolItem[] = Object.keys(HANDLERS)
  .filter((k) => k !== "fallback")
  .map((k) => ({ key: k, w: 1 }));

export function makeGenMatricesPart1(ctx: TopicContext) {
  return (rng: RNG, diff: Difficulty, id: string): GenOut<ExerciseKind> => {
    const topic = String(ctx.topicSlug);

    // ✅ DB decides allowed archetypes via meta.pool
    const fromDb = readPoolFromMeta(ctx.meta).filter((p) => p.key in HANDLERS);

    // if a topic has no pool (like mixed), safely use all implemented keys
    const pool = fromDb.length ? fromDb : SAFE_MIXED_POOL;

    const key = weightedKey(rng, pool);
    const handler = HANDLERS[key] ?? HANDLERS.fallback;

    return handler({ rng, diff, id, topic });
  };
}
