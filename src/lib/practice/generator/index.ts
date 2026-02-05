// src/lib/practice/generator/index.ts
import crypto from "crypto";
import type { Difficulty, GenKey, ExerciseKind } from "../types";
import type { GenOut } from "./shared/expected";
import { makeRng } from "./shared/rng";
import type { TopicContext } from "./generatorTypes";
import { TOPIC_GENERATORS } from "./registry";

function assertNonEmptyString(x: unknown, label: string) {
  if (typeof x !== "string" || !x.trim()) throw new Error(`${label} must be a non-empty string.`);
}

function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function stableId(prefix: string, salt: string) {
  const h = crypto.createHash("sha256").update(salt).digest("hex").slice(0, 12);
  return `${prefix}_${h}`;
}

/**
 * IMPORTANT:
 * - genKey is the registry key (single source of truth)
 * - ctx carries DB topicSlug + variant/meta, but NOT genKey
 *
 * ✅ If ctx.salt exists -> deterministic generation (quiz flow)
 * ✅ If no ctx.salt -> random generation (practice flow)
 */
export async function getExerciseWithExpected(
  genKey: GenKey,
  diff: Difficulty,
  ctx: TopicContext,
): Promise<GenOut<ExerciseKind>> {
  assertNonEmptyString(genKey, "genKey");
  assertNonEmptyString(ctx?.topicSlug, "ctx.topicSlug");

  const factory = TOPIC_GENERATORS[genKey];
  if (!factory) throw new Error(`No generator registered for genKey="${String(genKey)}".`);

  const salt = String((ctx as any)?.salt ?? "").trim() || null;

  // ✅ deterministic id when salt provided
  const id = salt
    ? stableId(String(genKey), `${genKey}|${ctx.topicSlug}|${ctx.variant ?? "default"}|${salt}`)
    : newId(String(genKey));

  // ✅ deterministic seed when salt provided
  const seed = salt
    ? `${genKey}:${ctx.topicSlug}:${ctx.variant ?? "default"}:${salt}`
    : `${genKey}:${ctx.topicSlug}:${ctx.variant ?? "default"}:${id}`;

  // ✅ if caller passed an rng, prefer it
  const rng = (ctx as any)?.rng ?? makeRng(seed);

  const gen = factory(ctx);
  const out = gen(rng as any, diff, id);

  if (!out || !out.exercise) {
    throw new Error(
      `Generator returned empty output. genKey="${String(genKey)}" ctx=${JSON.stringify(
        { topicSlug: ctx.topicSlug, variant: ctx.variant ?? null },
        null,
        2,
      )}`,
    );
  }

  const kind = (out.exercise as any)?.kind;
  if (typeof kind !== "string" || !kind.trim()) {
    throw new Error(
      `Generator returned exercise without kind. genKey="${String(genKey)}" got=${JSON.stringify(out.exercise, null, 2)}`,
    );
  }

  if (!out.expected) {
    throw new Error(`Generator returned missing expected. genKey="${String(genKey)}" kind="${kind}"`);
  }

  return out as GenOut<ExerciseKind>;
}
