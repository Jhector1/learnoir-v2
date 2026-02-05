// src/lib/practice/generator/generatorTypes.ts
import { PracticeKind } from "@prisma/client";
import type { Difficulty, ExerciseKind, TopicSlug } from "../types";
import type { GenOut } from "./shared/expected";
import type { RNG } from "./shared/rng";

/**
 * Context for a single exercise generation.
 * Single source of truth:
 * - genKey is NOT part of TopicContext (it's the registry key)
 * - topicSlug is the DB canonical slug (e.g. "py0.print")
 * - variant can be null for "mixed"
 * - meta is PracticeTopic.meta (contains pool/label/etc.)
 */
export type TopicContext = {
  topicSlug: TopicSlug;

  /** null => mixed; undefined => treated as default by callers */
  variant?: string | null;

  subjectSlug?: string | null;
  moduleSlug?: string | null;
  sectionSlug?: string | null;

  meta?: any;
  preferKind?: PracticeKind | null;
   salt?: string | null;
  rng?: RNG | null; // ✅ not any
};

export type TopicGenerator = (
  rng: RNG,
  diff: Difficulty,
  id: string,
) => GenOut<ExerciseKind>;
export type GenFactory = (ctx: TopicContext) => TopicGenerator;
