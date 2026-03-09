// src/lib/practice/generator/registry.ts
import type { Difficulty, GenKey, ExerciseKind } from "../types";
import type { GenOut } from "./shared/expected";
import type { TopicContext } from "./generatorTypes";
import type { RNG } from "./shared/rng";

// --- old engines (GenFn style)
import { genDot } from "./engines/linear_algebra/thumbs_stoneLla/dot";
import { genProjection } from "./engines/linear_algebra/thumbs_stoneLla/projection";
import { genAngle } from "./engines/linear_algebra/thumbs_stoneLla/angle";
import { genVectors } from "./engines/linear_algebra/thumbs_stoneLla/vectors";
import { genLinearSystems } from "./engines/linear_algebra/thumbs_stoneLla/linearSystems";
import { genAugmented } from "./engines/linear_algebra/thumbs_stoneLla/augmented";
import { genRref } from "./engines/linear_algebra/thumbs_stoneLla/rref";
import { genSolutionTypes } from "./engines/linear_algebra/thumbs_stoneLla/solutionTypes";
import { genParametric } from "./engines/linear_algebra/thumbs_stoneLla/parametric";
import { genMatrixOps } from "./engines/linear_algebra/thumbs_stoneLla/matrixOps";
import { genMatrixInverse } from "./engines/linear_algebra/thumbs_stoneLla/matrixInverse";
import { genMatrixProperties } from "./engines/linear_algebra/thumbs_stoneLla/matrixProperties";
import { genVectorsPart2 } from "./engines/linear_algebra/thumbs_stoneLla/vectorsPart2";
import { genVectorsPart1 } from "./engines/linear_algebra/thumbs_stoneLla/vectorsPart1";

// --- factories
import { makeGenMatricesPart1 } from "./engines/linear_algebra/thumbs_stoneLla/matricesPart1";
import { makeGenMatricesPart2 } from "./engines/linear_algebra/thumbs_stoneLla/matricesPart2";
import { makeGenPythonStatementsPart1 } from "./engines/python/python_part1";
// import { makeGenHaitianCreolePart1 } from "./engines/haitian-creole/hc_part1";
import {makeGenAnalyticGeometry} from "@/lib/practice/generator/engines/linear_algebra/thumbs_stoneLla/matricePart4";
import {makeGenAiMod0} from "@/lib/practice/generator/engines/ai/intro_ai/mod0";
import {makeGenHaitianCreolePart1} from "@/lib/practice/generator/engines/haitian_creole/haitian_creole_part1";
// import {makeGenLinearAlgebraPart1} from "@/lib/practice/generator/engines/linear_algebra/linear_algebra_part1";
// import {makeGenAiMod0keGenHaitianCreolePart1} from "@/lib/practice/generator/engines/haitian-creole_thumb/hc_part1";
// import {makeGenAiMod0} from "@/lib/practice/generator/engines/ai/genAiMod0";

export type GenFn = (
  rng: RNG,
  diff: Difficulty,
  id: string,
  opts?: { variant?: string | null; topicSlug?: string; subject?: string | null; seed?: any }
) => { exercise: any; expected: any; archetype?: string };

export type TopicGeneratorFactory =
  (ctx: TopicContext) => (rng: RNG, diff: Difficulty, id: string) => GenOut<ExerciseKind>;

function wrapGenFn(fn: GenFn): TopicGeneratorFactory {
  return (ctx) => (rng, diff, id) => {
    const out = fn(rng, diff, id, {
      variant: ctx.variant,
      topicSlug: String(ctx.topicSlug),
      subject: ctx.subjectSlug ?? null,
    });

    return {
      archetype: String(out.archetype ?? "default"),
      exercise: out.exercise,
      expected: out.expected,
    } as GenOut<ExerciseKind>;
  };
}

export const TOPIC_GENERATORS: Record<GenKey, TopicGeneratorFactory> = {
  dot: wrapGenFn(genDot as any),
  projection: wrapGenFn(genProjection as any),
  angle: wrapGenFn(genAngle as any),
  vectors: wrapGenFn(genVectors as any),

  // ✅ make these "ctx-first" (even if internally they still call the old GenFn)
  linear_algebra_mod0: (ctx) => (rng, diff, id) =>
    wrapGenFn(genVectorsPart1 as any)(ctx)(rng, diff, id),

  linear_algebra_mod1: (ctx) => (rng, diff, id) =>
    wrapGenFn(genVectorsPart2 as any)(ctx)(rng, diff, id),

  linear_systems: wrapGenFn(genLinearSystems as any),
  augmented: wrapGenFn(genAugmented as any),
  rref: wrapGenFn(genRref as any),
  solution_types: wrapGenFn(genSolutionTypes as any),
  parametric: wrapGenFn(genParametric as any),

  matrix_ops: wrapGenFn(genMatrixOps as any),
  matrix_inverse: wrapGenFn(genMatrixInverse as any),
  matrix_properties: wrapGenFn(genMatrixProperties as any),
  // vectors_part1:(ctx) => makeGenLinearAlgebraPart1(ctx),
      // (ctx) => (rng, diff, id) =>
      // wrapGenFn(genVectorsPart1 as any)(ctx)(rng, diff, id),

  vectors_part2: (ctx) => (rng, diff, id) =>
      wrapGenFn(genVectorsPart2 as any)(ctx)(rng, diff, id),

  matrices_part1: (ctx) => makeGenMatricesPart1(ctx),
  matrices_part2: (ctx) => makeGenMatricesPart2(ctx),
  // ✅ true ctx factories (so matrices generators can read ctx.variant/subjectSlug if desired)
  linear_algebra_mod2: (ctx) => makeGenMatricesPart1(ctx),
  linear_algebra_mod3: (ctx) => makeGenMatricesPart2(ctx),
  linear_algebra_mod4: (ctx) => makeGenAnalyticGeometry(ctx),

  // ✅ already ctx-first
  python_part1: (ctx) => makeGenPythonStatementsPart1(ctx),
  haitian_creole_part1: (ctx) => makeGenHaitianCreolePart1(ctx),

  // ai_mod0: (ctx) => makeGenAiMod0(ctx),
  ai_mod0: (ctx) => makeGenAiMod0(ctx),

};
