import type {
  Difficulty,
  ExerciseKind,
  SingleChoiceExercise,
  NumericExercise,
} from "../../../types";
import type { GenOut } from "../../shared/expected";
import type { RNG } from "../../shared/rng";
import type { TopicContext } from "../../generatorTypes";

// ------------------------------------------------------------
// Pool helpers (same as python_part1)
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
// Tiny builders
// ------------------------------------------------------------
function safeInt(rng: RNG, lo: number, hi: number) {
  return rng.int(lo, hi);
}

function mkSingleChoice(
  id: string,
  topic: string,
  diff: Difficulty,
  archetype: string,
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
    title: archetype,
    prompt,
    options,
    hint,
  };
  return { archetype, exercise, expected: { kind: "single_choice", optionId: answerId } as any };
}

function mkNumeric(
  id: string,
  topic: string,
  diff: Difficulty,
  archetype: string,
  prompt: string,
  value: number,
  hint?: string,
): GenOut<ExerciseKind> {
  const exercise: NumericExercise = {
    id,
    topic,
    difficulty: diff,
    kind: "numeric",
    title: archetype,
    prompt,
    hint,
  } as any;

  return { archetype, exercise, expected: { kind: "numeric", value } as any };
}

// ------------------------------------------------------------
// Helpers for part2 topics
// ------------------------------------------------------------
function det2(A: [[number, number], [number, number]]): number {
  return A[0][0] * A[1][1] - A[0][1] * A[1][0];
}

// ------------------------------------------------------------
// Handlers (keys MUST match DB pool keys)
// ------------------------------------------------------------
const HANDLERS: Record<string, Handler> = {
  // ----- NORMS -----
  norm_compute_l2: ({ rng, diff, id, topic }) => {
    // force Pythagorean triple for clean integer norm
    const triples = [
      [3, 4, 5],
      [5, 12, 13],
      [8, 15, 17],
      [7, 24, 25],
    ] as const;
    const [a, b, n] = rng.pick(triples);
    const flip = rng.pick([true, false] as const);
    const x = flip ? a : -a;
    const y = flip ? b : -b;

    return mkNumeric(
      id,
      topic,
      diff,
      "norm_compute_l2",
      String.raw`Compute the Euclidean norm $$\|v\|_2$$ for $$v=\begin{bmatrix}${x}\\${y}\end{bmatrix}$$.`,
      n,
      String.raw`For $$v=(x,y)$$, $$\|v\|_2 = \sqrt{x^2+y^2}$$.`,
    );
  },

  norm_compare_vectors: ({ rng, diff, id, topic }) => {
    const v1 = [safeInt(rng, -5, 5), safeInt(rng, -5, 5)];
    const v2 = [safeInt(rng, -5, 5), safeInt(rng, -5, 5)];
    const n1 = v1[0] * v1[0] + v1[1] * v1[1];
    const n2 = v2[0] * v2[0] + v2[1] * v2[1];

    const ans = n1 === n2 ? "c" : n1 > n2 ? "a" : "b";

    return mkSingleChoice(
      id,
      topic,
      diff,
      "norm_compare_vectors",
      String.raw`Which vector has the larger Euclidean norm?

$$v=\begin{bmatrix}${v1[0]}\\${v1[1]}\end{bmatrix}, \quad
w=\begin{bmatrix}${v2[0]}\\${v2[1]}\end{bmatrix}$$`,
      [
        { id: "a", text: "v" },
        { id: "b", text: "w" },
        { id: "c", text: "They are equal" },
      ],
      ans,
      String.raw`Compare $$x^2+y^2$$ (no need to take $$\sqrt{\cdot}$$).`,
    );
  },

  norm_unit_vector: ({ rng, diff, id, topic }) => {
    // use 3-4-5 again
    const x = rng.pick([3, -3] as const);
    const y = rng.pick([4, -4] as const);
    // unit vector = (x/5, y/5)
    const correct = `(${x}/5, ${y}/5)`;
    const wrong1 = `(${x}/3, ${y}/4)`;
    const wrong2 = `(${x}/25, ${y}/25)`;

    return mkSingleChoice(
      id,
      topic,
      diff,
      "norm_unit_vector",
      String.raw`Which is the unit vector in the same direction as $$v=(${x}, ${y})$$?`,
      [
        { id: "a", text: correct },
        { id: "b", text: wrong1 },
        { id: "c", text: wrong2 },
      ],
      "a",
      String.raw`Unit vector is $$\dfrac{v}{\|v\|}$$.`,
    );
  },

  // ----- RANK -----
  rank_from_rref_pivots: ({ rng, diff, id, topic }) => {
    const pivots = safeInt(rng, 1, 3);
    return mkNumeric(
      id,
      topic,
      diff,
      "rank_from_rref_pivots",
      String.raw`A matrix’s RREF has ${pivots} pivot(s). What is the rank?`,
      pivots,
      "Rank = number of pivots.",
    );
  },

  rank_full_rank_check: ({ rng, diff, id, topic }) => {
    const m = safeInt(rng, 2, 5);
    const n = safeInt(rng, 2, 5);
    const r = safeInt(rng, 1, Math.min(m, n));
    const full = r === Math.min(m, n);

    return mkSingleChoice(
      id,
      topic,
      diff,
      "rank_full_rank_check",
      String.raw`$$A$$ is ${m}×${n} with $$\mathrm{rank}(A)=${r}$$. Is $$A$$ full rank?`,
      [
        { id: "a", text: "Yes" },
        { id: "b", text: "No" },
      ],
      full ? "a" : "b",
      String.raw`Full rank means $$\mathrm{rank}(A)=\min(m,n)$$.`,
    );
  },

  rank_vs_nullity_relation: ({ rng, diff, id, topic }) => {
    const n = safeInt(rng, 2, 6);
    const rank = safeInt(rng, 0, n);
    const nullity = n - rank;
    return mkNumeric(
      id,
      topic,
      diff,
      "rank_vs_nullity_relation",
      String.raw`$$A$$ is an $$m\times ${n}$$ matrix with $$\mathrm{rank}(A)=${rank}$$. What is $$\mathrm{nullity}(A)$$?`,
      nullity,
      String.raw`Rank–nullity: $$\mathrm{nullity}=n-\mathrm{rank}$$.`,
    );
  },

  // ----- DETERMINANT -----
  det_2x2_compute: ({ rng, diff, id, topic }) => {
    const A: [[number, number], [number, number]] = [
      [safeInt(rng, -4, 6), safeInt(rng, -4, 6)],
      [safeInt(rng, -4, 6), safeInt(rng, -4, 6)],
    ];
    const d = det2(A);

    return mkNumeric(
      id,
      topic,
      diff,
      "det_2x2_compute",
      String.raw`Compute $$\det(A)$$ for $$A=\begin{bmatrix}${A[0][0]} & ${A[0][1]}\\${A[1][0]} & ${A[1][1]}\end{bmatrix}$$.`,
      d,
      String.raw`For $$2\times 2$$: $$\det=\;ad-bc$$.`,
    );
  },

  det_invertible_iff_nonzero: ({ diff, id, topic }) => {
    return mkSingleChoice(
      id,
      topic,
      diff,
      "det_invertible_iff_nonzero",
      `Which statement is true (square matrices)?`,
      [
        { id: "a", text: "A is invertible iff det(A) = 0." },
        { id: "b", text: "A is invertible iff det(A) ≠ 0." },
        { id: "c", text: "det(A) is always positive." },
      ],
      "b",
      String.raw`Invertible $$\Leftrightarrow$$ determinant is nonzero.`,
    );
  },

  det_effect_row_swap_scale: ({ diff, id, topic }) => {
    return mkSingleChoice(
      id,
      topic,
      diff,
      "det_effect_row_swap_scale",
      String.raw`If you swap two rows of a matrix, what happens to $$\det(A)$$?`,
      [
        { id: "a", text: "It stays the same." },
        { id: "b", text: "It changes sign." },
        { id: "c", text: "It becomes 0." },
      ],
      "b",
      String.raw`A row swap multiplies the determinant by $$-1$$.`,
    );
  },

  // ----- CHARACTERISTIC POLYNOMIAL -----
  charpoly_2x2_setup_lambdaI_minus_A: ({ rng, diff, id, topic }) => {
    const a = safeInt(rng, -3, 6);
    const d = safeInt(rng, -3, 6);

    return mkSingleChoice(
      id,
      topic,
      diff,
      "charpoly_2x2_setup_lambdaI_minus_A",
      String.raw`For $$A=\mathrm{diag}(${a}, ${d})$$, what is $$\lambda I - A$$?`,
      [
        { id: "a", text: `[[λ-${a}, 0],[0, λ-${d}]]` },
        { id: "b", text: `[[λ+${a}, 0],[0, λ+${d}]]` },
        { id: "c", text: `[[${a}-λ, 0],[0, ${d}-λ]]` },
      ],
      "a",
      "Subtract A from λI entrywise.",
    );
  },

  charpoly_2x2_expand: ({ rng, diff, id, topic }) => {
    const a = safeInt(rng, -3, 6);
    const d = safeInt(rng, -3, 6);

    const correct = `(λ-${a})(λ-${d})`;
    const wrong1 = `(λ+${a})(λ+${d})`;
    const wrong2 = `(λ-${a})+(λ-${d})`;

    return mkSingleChoice(
      id,
      topic,
      diff,
      "charpoly_2x2_expand",
      String.raw`For $$A=\mathrm{diag}(${a}, ${d})$$, what is the characteristic polynomial?`,
      [
        { id: "a", text: correct },
        { id: "b", text: wrong1 },
        { id: "c", text: wrong2 },
      ],
      "a",
      String.raw`Characteristic polynomial = $$\det(\lambda I - A)$$.`,
    );
  },

  charpoly_eigenvalue_roots_relation: ({ diff, id, topic }) => {
    return mkSingleChoice(
      id,
      topic,
      diff,
      "charpoly_eigenvalue_roots_relation",
      String.raw`Which statement is true for a $$2\times 2$$ matrix $$A$$?`,
      [
        { id: "a", text: "det(A) = sum of eigenvalues" },
        { id: "b", text: "trace(A) = product of eigenvalues" },
        { id: "c", text: "trace(A) = sum of eigenvalues" },
      ],
      "c",
      String.raw`For $$2\times 2$$: $$\mathrm{tr}(A)=\lambda_1+\lambda_2$$, $$\det(A)=\lambda_1\lambda_2$$.`,
    );
  },

  // ultimate fallback
  fallback: ({ rng, diff, id, topic }) => {
    const n = safeInt(rng, 2, 6);
    const r = safeInt(rng, 0, n);
    return mkNumeric(
      id,
      topic,
      diff,
      "fallback",
      String.raw`(Fallback) If $$n=${n}$$ and $$\mathrm{rank}=${r}$$, what is $$\mathrm{nullity}$$?`,
      n - r,
      String.raw`Use $$\mathrm{nullity}=n-\mathrm{rank}$$.`,
    );
  },
};

// Safe “mixed” = only implemented handlers (excluding fallback)
const SAFE_MIXED_POOL: PoolItem[] = Object.keys(HANDLERS)
  .filter((k) => k !== "fallback")
  .map((k) => ({ key: k, w: 1 }));

export function makeGenMatricesPart2(ctx: TopicContext) {
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
