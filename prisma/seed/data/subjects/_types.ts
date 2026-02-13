// prisma/seed/data/subjects/_types.ts

export type SubjectSlug = string;
export type ModuleSlug = string;
export type SectionSlug = string;
export type TopicSlug = string;
export type GenKey = string;

export type SubjectSeed = {
  slug: SubjectSlug;
  order: number;
  title: string;
  description?: string;
  meta?: any;
};

export type ModuleSeed = {
  slug: ModuleSlug;
  subjectSlug: SubjectSlug;
  order: number;
  title: string;
  description?: string;
  weekStart?: number;
  weekEnd?: number;
  meta?: ModuleMeta;
};

export type PoolItem = { key: string; w: number };

// export type TopicMeta = {
//   label: string;
//   minutes: number; // 0 ok
//   pool?: PoolItem[]; // optional (used by python)
//   [k: string]: any;
// };

export type TopicSeed = {
  slug: TopicSlug; // e.g. "py0.io_vars"
  subjectSlug: SubjectSlug;
  moduleSlug: ModuleSlug;
  order: number;
  titleKey: string; // e.g. "topic.py0.io_vars"
  description?: string;
  genKey: GenKey;
  variant: string | null; // IMPORTANT: null allowed (mixed)
  meta?: any;
};
// ✅ define ModuleMeta first (before ModuleSeed uses it)
export const ModuleMetaSchema = z.object({
  outcomes: z.array(z.string().min(1)).optional(),
  why: z.array(z.string().min(1)).optional(),
  prereqs: z.array(z.string().min(1)).optional(),
  videoUrl: z.string().url().nullable().optional(),
  estimatedMinutes: z.number().int().positive().optional(),
});
export type ModuleMeta = z.infer<typeof ModuleMetaSchema>;

export type SectionSeed = {
  slug: SectionSlug;
  subjectSlug: SubjectSlug;
  moduleSlug: ModuleSlug;
  order: number;
  title: string;
  description?: string;
  meta?: any;
  topicSlugs: TopicSlug[]; // derived from topic group
};

// ---------- Builder inputs (authoring types) ----------

export type TopicDef = {
  id: string; // "io_vars" (NO prefix, NO dots)
  order?: number;
  variant?: string | null; // null means “mixed”
  titleKey?: string; // optional override
  description?: string;
  meta: TopicMeta; // required
};

export type SectionDef = {
  moduleSlug: ModuleSlug;
  prefix: string; // e.g. "py0" (no dots)
  genKey: GenKey; // e.g. "python_part1"
  topics: TopicDef[];

  section: {
    slug: SectionSlug;
    order: number;
    title: string;
    description?: string;
    meta?: any;
  };
};



// prisma/seed/data/subjects/python/topics.ts
import { PracticeKind } from "@prisma/client";

/**
 * Optional: when you want “Now do it in code” (or “MCQ only”)
 * without hardcoding key->kind maps, store kind on the pool items.
 */
// export type PracticeKind =
//   | "numeric"
//   | "single_choice"
//   | "multi_choice"
//   | "vector_drag_target"
//   | "vector_drag_dot"
//   | "matrix_input"
//   | "code_input";

export type TopicPoolItem = {
  key: string;
  w: number;

  /**
   * Optional categorization for filtering (preferKind) without key maps.
   * If omitted, the item is “compatible with any mode”.
   */
  kind?: PracticeKind;
};

export type TopicMeta = {
  label: string;
  minutes: number;

  /**
   * Optional: default mode for this topic (caller can override via API).
   * Example: preferKind: "code_input" to bias to code exercises.
   */
  preferKind?: PracticeKind | null;

  /**
   * Optional: explicit pool for the topic.
   * If omitted, generator can fallback to SAFE_MIXED_POOL.
   */
  pool?: TopicPoolItem[];
};

// If your existing TopicDef already exists, you can ignore this,
// and just ensure it is compatible with the fields above.
// This is only here to show a “full” typed shape.
export type TopicDefCompat = Omit<TopicDef, "meta"> & { meta: TopicMeta };


// prisma/seed/data/subjects/_types.ts
import { z } from "zod";

// export const ModuleMetaSchema = z.object({
//   outcomes: z.array(z.string().min(1)).optional(),
//   why: z.array(z.string().min(1)).optional(),
//   prereqs: z.array(z.string().min(1)).optional(),
//
//   videoUrl: z.string().url().nullable().optional(),
//   estimatedMinutes: z.number().int().positive().optional(),
// });
//
// export type ModuleMeta = z.infer<typeof ModuleMetaSchema>;
