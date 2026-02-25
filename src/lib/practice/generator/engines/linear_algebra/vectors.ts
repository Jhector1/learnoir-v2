// src/lib/practice/generator/topics/vectors.ts
import type {
  Difficulty,
  ExerciseKind,
  VectorDragDotExercise,
  VectorDragTargetExercise,
} from "../../../types";
import { nonZeroVec, toleranceFor } from "../../utils";

import type { GenOut } from "../../shared/expected";
import { RNG } from "../../shared/rng";

// helpers
function dot3(
    a: { x: number; y: number; z?: number },
    b: { x: number; y: number; z?: number },
) {
  const az = a.z ?? 0;
  const bz = b.z ?? 0;
  return a.x * b.x + a.y * b.y + az * bz;
}

export function genVectors(
  rng: RNG,
  diff: Difficulty,
  id: string,
): GenOut<ExerciseKind> {
  const archetype = rng.weighted([
    { value: "drag_target" as const, w: 6 },
    { value: "drag_perp" as const, w: diff === "hard" ? 5 : 2 },

    // ✅ NEW dot variants (safe with current validator)
    { value: "drag_parallel" as const, w: diff === "easy" ? 4 : 3 },
    { value: "drag_antiparallel" as const, w: diff === "easy" ? 3 : 2 },

    // ✅ NEW target variant (safe with current types)
    { value: "drag_target_swap" as const, w: 2 },
  ]);

  // ------------------------------------------------------------
  // dot: perpendicular
  // ------------------------------------------------------------
  if (archetype === "drag_perp") {
    const B = nonZeroVec(rng, diff);
    const tol = toleranceFor(diff, "vector_drag_dot");

    const exercise: VectorDragDotExercise = {
      id,
      topic: "vectors",
      difficulty: diff,
      kind: "vector_drag_dot",
      title: "Drag: make perpendicular",
      prompt:
        diff === "hard"
          ? "Drag a so that a · b ≈ 0 (perpendicular). Try to do it with a not too small."
          : "Drag a so that a · b ≈ 0 (perpendicular).",
      initialA: { x: 0, y: 0, z: 0 },
      b: B,
      targetDot: 0,
      tolerance: tol,
    };

    return {
      archetype,
      exercise,
      expected: { kind: "vector_drag_dot", targetDot: 0, tolerance: tol },
    };
  }

  // ------------------------------------------------------------
  // dot: parallel (targetDot = b·b)
  // ------------------------------------------------------------
  if (archetype === "drag_parallel") {
    const B = nonZeroVec(rng, diff);
    const tol = toleranceFor(diff, "vector_drag_dot");
    const targetDot = dot3(B, B);

    const exercise: VectorDragDotExercise = {
      id,
      topic: "vectors",
      difficulty: diff,
      kind: "vector_drag_dot",
      title: "Drag: make parallel",
      prompt: "Drag a so that it points in the same direction as b (parallel).",
      initialA: { x: 0, y: 0, z: 0 },
      b: B,
      targetDot,
      tolerance: tol,
    };

    return {
      archetype,
      exercise,
      expected: { kind: "vector_drag_dot", targetDot, tolerance: tol },
    };
  }

  // ------------------------------------------------------------
  // dot: anti-parallel (targetDot = -b·b)
  // ------------------------------------------------------------
  if (archetype === "drag_antiparallel") {
    const B = nonZeroVec(rng, diff);
    const tol = toleranceFor(diff, "vector_drag_dot");
    const targetDot = -dot3(B, B);

    const exercise: VectorDragDotExercise = {
      id,
      topic: "vectors",
      difficulty: diff,
      kind: "vector_drag_dot",
      title: "Drag: opposite direction",
      prompt: "Drag a so that it points in the opposite direction of b (anti-parallel).",
      initialA: { x: 0, y: 0, z: 0 },
      b: B,
      targetDot,
      tolerance: tol,
    };

    return {
      archetype,
      exercise,
      expected: { kind: "vector_drag_dot", targetDot, tolerance: tol },
    };
  }

  // ------------------------------------------------------------
  // target: swap/attention check (b is locked, only a graded)
  // ------------------------------------------------------------
  if (archetype === "drag_target_swap") {
    const targetA = nonZeroVec(rng, diff);
    const initialA = { x: 0, y: 0, z: 0 };
    const initialB = nonZeroVec(rng, diff);
    const tol = toleranceFor(diff, "vector_drag_target");

    const exercise: VectorDragTargetExercise = {
      id,
      topic: "vectors",
      difficulty: diff,
      kind: "vector_drag_target",
      title: "Drag to target: careful",
      prompt: "Drag a to match the target (don’t get distracted by b).",
      initialA,
      initialB,
      targetA,
      lockB: true,
      tolerance: tol,
    };

    return {
      archetype,
      exercise,
      expected: { kind: "vector_drag_target", targetA, tolerance: tol, lockB: true },
    };
  }

  // ------------------------------------------------------------
  // default: existing drag_target
  // ------------------------------------------------------------
  const targetA = nonZeroVec(rng, diff);
  const initialA = { x: 0, y: 0, z: 0 };
  const initialB = nonZeroVec(rng, diff);

  const lockB = diff !== "hard";
  const tol = toleranceFor(diff, "vector_drag_target");

  const exercise: VectorDragTargetExercise = {
    id,
    topic: "vectors",
    difficulty: diff,
    kind: "vector_drag_target",
    title: diff === "hard" ? "Drag to target (hard)" : "Drag to target",
    prompt:
      diff === "hard"
        ? "Drag a to match the target. (Hard: tolerance is tight.)"
        : "Drag a to match the target within tolerance.",
    initialA,
    initialB,
    targetA,
    lockB,
    tolerance: tol,
  };

  return {
    archetype: "drag_target",
    exercise,
    expected: { kind: "vector_drag_target", targetA, tolerance: tol, lockB },
  };
}


export function genVectorDrags(
  rng: RNG,
  diff: Difficulty,
  id: string,
  topicSlug: string,        // ✅ override topic
  variantHint?: string,     // optional label for title/prompt
): GenOut<ExerciseKind> {
  const out = genVectors(rng, diff, id);

  // out.exercise.topic is "vectors" right now — overwrite it
  return {
    ...out,
    archetype: variantHint ? `${out.archetype}|${variantHint}` : out.archetype,
    exercise: { ...(out.exercise as any), topic: topicSlug } as any,
    // expected stays the same; only exercise topic changes
    expected: out.expected,
  };
}
