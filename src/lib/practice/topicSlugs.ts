// src/lib/practice/topicSlugs.ts
import type { GenKey, TopicSlug } from "./types";

/**
 * Map generator keys (engine) -> DB slugs (PracticeTopic.slug)
 * Keep this aligned with prisma/seed/data.ts TOPICS values.
 */
export const GENKEY_TO_DB: Record<GenKey, TopicSlug> = {
  // -----------------------------
  // Linear Algebra - legacy keys
  // -----------------------------
  dot: "m0.dot",
  projection: "m0.projection",
  angle: "m0.angle",
  vectors: "m0.vectors",

  vectors_part1: "m0.vectors_part1",
  vectors_part2: "m0.vectors_part2",

  linear_systems: "m1.linear_systems",
  augmented: "m1.augmented",
  rref: "m1.rref",
  solution_types: "m1.solution_types",
  parametric: "m1.parametric",

  matrix_ops: "m2.matrix_ops",
  matrix_inverse: "m2.matrix_inverse",
  matrix_properties: "m2.matrix_properties",

  matrices_part1: "m2.matrices_part1",
  matrices_part2: "m2.matrices_part2",

  // -----------------------------
  // Linear Algebra - module keys (new)
  // -----------------------------
  // Keep these aligned with how you seed modules/topics in DB.
  linear_algebra_mod0: "m0.linear_algebra_mod0",
  linear_algebra_mod1: "m1.linear_algebra_mod1",
  linear_algebra_mod2: "m2.linear_algebra_mod2",
  linear_algebra_mod3: "m3.linear_algebra_mod3",
  linear_algebra_mod4: "m4.linear_algebra_mod4",

  // -----------------------------
  // Python
  // -----------------------------
  python_part1: "py0.python_part1",

  // -----------------------------
  // Haitian Creole
  // -----------------------------
  haitian_creole_part1: "hc0.haitian_creole_part1",

  // -----------------------------
  // AI
  // -----------------------------
  ai_mod0: "ai0.ai_mod0",
};

/**
 * Extract GenKey from either:
 * - "vectors_part2"
 * - "m0.vectors_part2"
 */
export function genKeyFromAnySlug(s: string): GenKey | null {
  const raw = String(s || "").trim();
  if (!raw) return null;

  const maybe = (raw.includes(".") ? raw.split(".").pop() : raw) as GenKey;
  return maybe in GENKEY_TO_DB ? maybe : null;
}

/**
 * Convert any incoming slug ("vectors", "m0.vectors") to the DB slug.
 * If it already looks namespaced (has '.'), we assume it's DB slug already.
 */
export function toDbTopicSlug(s: string): TopicSlug {
  const raw = String(s || "").trim();
  if (!raw) return raw as TopicSlug;

  if (raw.includes(".")) return raw as TopicSlug; // already DB-style

  const gk = genKeyFromAnySlug(raw);
  return (gk ? GENKEY_TO_DB[gk] : raw) as TopicSlug; // unknown stays as-is
}