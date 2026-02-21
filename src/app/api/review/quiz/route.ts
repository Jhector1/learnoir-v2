// src/app/api/review/quiz/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

import {
  getActor,
  ensureGuestId,
  attachGuestCookie,
  actorKeyOf,
} from "@/lib/practice/actor";

import { rngFromActor } from "@/lib/practice/catalog";
import { toDbTopicSlug } from "@/lib/practice/topicSlugs";
import { PracticeKind } from "@prisma/client";






type PoolItem = { key: string; w: number; kind?: string | null };

function readPoolFromTopicMeta(meta: any): PoolItem[] {
  const raw = meta?.pool;
  if (!Array.isArray(raw)) return [];
  return raw
      .map((p: any) => ({
        key: String(p?.key ?? "").trim(),
        w: Number(p?.w ?? 0),
        kind: p?.kind ? String(p.kind).trim() : undefined,
      }))
      .filter((p) => p.key && Number.isFinite(p.w) && p.w > 0);
}

function filterPoolByPreferKind(pool: PoolItem[], preferKind: PracticeKind | null | undefined) {
  if (!preferKind) return pool;
  const pk = String(preferKind);
  // keep items that either match kind OR have no kind (wildcards)
  return pool.filter((p) => !p.kind || String(p.kind) === pk);
}

function weightedPickKey(rng: any, pool: PoolItem[]) {
  // deterministic weighted pick using rng.int(lo, hi) inclusive
  const total = pool.reduce((s, p) => s + p.w, 0);
  if (total <= 0) return null;

  let r = rng.int(1, total); // 1..total
  for (const p of pool) {
    r -= p.w;
    if (r <= 0) return p.key;
  }
  return pool[pool.length - 1]?.key ?? null;
}

function pickUniqueExerciseKey(rng: any, pool: PoolItem[], used: Set<string>) {
  const remaining = pool.filter((p) => !used.has(p.key));
  if (!remaining.length) return null;
  const key = weightedPickKey(rng, remaining);
  if (!key) return null;
  used.add(key);
  return key;
}





export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------------------- helpers -------------------------------- */

function json(body: any, status = 200, setGuestId?: string) {
  const res = NextResponse.json(body, { status });
  return attachGuestCookie(res, setGuestId);
}

function shortHash(s: string) {
  return createHash("sha1").update(s).digest("hex").slice(0, 10);
}

function stableJsonHash(v: any) {
  // best-effort stable hash (keep it small)
  return shortHash(JSON.stringify(v ?? null));
}

function shuffleInPlace<T>(rng: any, arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = rng.int(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Prefer unique topics first; repeat only if unavoidable
function pickTopicsForQuizPreferUnique(rng: any, slugs: string[], n: number) {
  const unique = Array.from(new Set(slugs));
  if (!unique.length) return [];

  shuffleInPlace(rng, unique);

  const out = unique.slice(0, Math.min(n, unique.length));
  let k = 0;
  while (out.length < n) out.push(unique[k++ % unique.length]);
  return out;
}

/* -------------------------------- schemas -------------------------------- */

const StepSchema = z.object({
  id: z.string().min(1),
  title: z.string().optional(),
  topic: z.string().min(1), // can be genKey-like or slug; we normalize via toDbTopicSlug()
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  preferKind: z.nativeEnum(PracticeKind).nullable().optional(),

  // forwarded to /api/practice (if you support these)
  exerciseKey: z.string().optional(),
  seedPolicy: z.enum(["actor", "global"]).optional(),

  maxAttempts: z.number().int().min(1).max(20).optional(),
  carryFromPrev: z.boolean().optional(),
});

const SpecSchemaBase = z.object({
  subject: z.string().min(1),
  module: z.string().optional(),
  section: z.string().optional(),

  // quiz-mode "topic selector"
  topic: z.string().optional(), // "py0.io_vars" | "all" | ""
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  n: z.number().int().min(1).max(20).optional(),

  allowReveal: z.boolean().optional(),
  preferKind: z.nativeEnum(PracticeKind).nullable().optional(),
  maxAttempts: z.number().int().min(1).max(10).optional(),

  // client can override
  quizKey: z.string().optional(),

  // ✅ new
  mode: z.enum(["quiz", "project"]).optional(),
  steps: z.array(StepSchema).optional(),
});

const SpecSchema = SpecSchemaBase.superRefine((val, ctx) => {
  const mode = val.mode ?? "quiz";
  if (mode === "project") {
    if (!val.steps || val.steps.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["steps"],
        message: "steps[] is required when mode='project'.",
      });
    }
  }
});

/* -------------------------- quizKey (server side) -------------------------- */
/**
 * NOTE:
 * - If your client sends spec.quizKey (recommended), server honors it.
 * - Otherwise we build a stable quizKey from the spec.
 * - We include mode; for project we include a steps signature to avoid collisions.
 */
function buildQuizKey(spec: z.infer<typeof SpecSchema>) {
  const mode = spec.mode ?? "quiz";

  const base = [
    "review-quiz",
    `mode=${mode}`,
    `subject=${spec.subject}`,
    `module=${spec.module ?? ""}`,
    `section=${spec.section ?? ""}`,
    `difficulty=${spec.difficulty ?? ""}`,
    `allowReveal=${spec.allowReveal ? 1 : 0}`,
    `preferKind=${spec.preferKind ?? ""}`,
    `maxAttempts=${spec.maxAttempts ?? 1}`,
  ];

  if (mode === "project") {
    const stepsSig = stableJsonHash(
        (spec.steps ?? []).map((s) => ({
          id: s.id,
          topic: s.topic,
          difficulty: s.difficulty ?? "",
          preferKind: s.preferKind ?? "",
          exerciseKey: s.exerciseKey ?? "",
          seedPolicy: s.seedPolicy ?? "",
          maxAttempts: s.maxAttempts ?? "",
          carryFromPrev: s.carryFromPrev ? 1 : 0,
        })),
    );
    base.push(`steps=${stepsSig}`);
  } else {
    base.push(`topic=${spec.topic ?? ""}`);
    base.push(`n=${spec.n ?? 4}`);
  }

  return base.join("|");
}

/* --------------------------------- handler -------------------------------- */

export async function POST(req: Request) {
  const actor0 = await getActor();
  const ensured = ensureGuestId(actor0);
  const actor = ensured.actor;
  const setGuestId = ensured.setGuestId;

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return json({ message: "Invalid JSON body." }, 400, setGuestId);
  }

  const parsed = SpecSchema.safeParse(payload);
  if (!parsed.success) {
    return json(
        { message: "Invalid quiz spec", issues: parsed.error.issues },
        400,
        setGuestId,
    );
  }

  const spec = parsed.data;
  const mode = spec.mode ?? "quiz";
  const n = spec.n ?? 4;
  const defaultMaxAttempts = spec.maxAttempts ?? 1;

  const actorKey = actorKeyOf(actor);

  // ✅ IMPORTANT: honor client-provided quizKey (if sent)
  const quizKey = (spec.quizKey?.trim() || buildQuizKey(spec)).trim();

  // 1) If exists, return it (frozen quiz/project instance)
  const existing = await prisma.reviewQuizInstance.findUnique({
    where: { actorKey_quizKey: { actorKey, quizKey } },
    select: { questions: true },
  });

  if (existing?.questions) {
    return json(
        {
          questions: existing.questions,
          quizKey,
          requested: mode === "project" ? (spec.steps?.length ?? 0) : n,
          generated: Array.isArray(existing.questions) ? existing.questions.length : undefined,
          frozen: true,
        },
        200,
        setGuestId,
    );
  }

  // 2) Otherwise generate it
  // We will resolve the *allowed topic pool* once (for validation + quiz picking).
  const wantsAll = !spec.topic || spec.topic === "all";
  let allowedTopicSlugs: string[] = [];

  if (spec.section) {
    const section = await prisma.practiceSection.findUnique({
      where: { slug: spec.section },
      select: {
        slug: true,
        module: { select: { slug: true } },
        subject: { select: { slug: true } },
        topics: {
          orderBy: { order: "asc" },
          select: { topic: { select: { slug: true, genKey: true } } },
        },
      },
    });

    if (!section) {
      return json({ message: `Section "${spec.section}" not found.` }, 404, setGuestId);
    }
    if (section.subject?.slug !== spec.subject) {
      return json(
          { message: `Section "${spec.section}" is not in subject "${spec.subject}".` },
          400,
          setGuestId,
      );
    }
    if (spec.module && section.module?.slug !== spec.module) {
      return json(
          { message: `Section "${spec.section}" is not in module "${spec.module}".` },
          400,
          setGuestId,
      );
    }

    const pool = section.topics
        .map((x) => x.topic)
        .filter((t) => t?.genKey) // keep your "genKey required" rule
        .map((t) => t.slug);

    if (!pool.length) {
      return json(
          { message: `Section "${spec.section}" has no topics with genKey.` },
          400,
          setGuestId,
      );
    }

    allowedTopicSlugs = pool;

    // quiz-mode topic narrowing (project mode ignores spec.topic)
    if (mode === "quiz" && !wantsAll) {
      const dbSlug = toDbTopicSlug(spec.topic!);
      if (!pool.includes(dbSlug)) {
        return json(
            { message: `Topic "${dbSlug}" is not part of section "${spec.section}".` },
            400,
            setGuestId,
        );
      }
      allowedTopicSlugs = [dbSlug];
    }
  } else {
    const rows = await prisma.practiceTopic.findMany({
      where: {
        subject: { slug: spec.subject },
        module: spec.module ? { slug: spec.module } : undefined,
        genKey: { not: null },
      },
      select: { slug: true },
      orderBy: [{ order: "asc" }, { slug: "asc" }],
      take: 2000,
    });

    if (!rows.length) {
      return json(
          {
            message: `No topics found for subject="${spec.subject}" module="${spec.module ?? ""}" (with genKey).`,
          },
          404,
          setGuestId,
      );
    }

    allowedTopicSlugs = rows.map((r) => r.slug);

    // quiz-mode topic narrowing (project mode ignores spec.topic)
    if (mode === "quiz" && !wantsAll) {
      const dbSlug = toDbTopicSlug(spec.topic!);
      const ok = rows.some((r) => r.slug === dbSlug);
      if (!ok) {
        return json({ message: `Topic "${dbSlug}" is not in this subject/module.` }, 400, setGuestId);
      }
      allowedTopicSlugs = [dbSlug];
    }
  }

  let questions: any[] = [];

  if (mode === "project") {
    const steps = spec.steps ?? [];
    // schema already enforces non-empty, but keep guard
    if (!steps.length) return json({ message: "Project spec requires steps[]." }, 400, setGuestId);

    const qk = shortHash(quizKey);

    // Validate each step topic is allowed (when we have an allowed pool)
    for (const st of steps) {
      const dbSlug = toDbTopicSlug(st.topic);
      if (!allowedTopicSlugs.includes(dbSlug)) {
        return json(
            {
              message: `Project step topic "${dbSlug}" is not allowed by this subject/module/section.`,
              detail: { stepId: st.id, stepTopic: st.topic, normalized: dbSlug },
            },
            400,
            setGuestId,
        );
      }
    }

    questions = steps.map((st, i) => {
      const dbSlug = toDbTopicSlug(st.topic);

      return {
        kind: "practice" as const,
        id: `proj:${st.id}:${qk}`,
        title: st.title ?? `Step ${i + 1}`,
        carryFromPrev: Boolean(st.carryFromPrev),
        fetch: {
          subject: spec.subject,
          module: spec.module,
          section: spec.section,
          topic: dbSlug,

          difficulty: st.difficulty ?? spec.difficulty ?? "easy",
          allowReveal: Boolean(spec.allowReveal),
          preferKind: st.preferKind ?? spec.preferKind ?? null,

          // forwarded to /api/practice (if supported)
          exerciseKey: st.exerciseKey ?? undefined,
          seedPolicy: st.seedPolicy ?? "global",

          // stable salt per step
          salt: `${quizKey}|step=${st.id}|slot=${i + 1}`,
        },
        maxAttempts: st.maxAttempts ?? (spec.maxAttempts ?? 10),
      };
    });
  } else {
    // ✅ quiz mode: frozen by quizKey, AND no duplicate exercises within the quiz
    const rng = rngFromActor({
      userId: actor.userId,
      guestId: actor.guestId,
      sessionId: null,
      salt: `review-quiz-instance:${quizKey}`,
    });

    const pickedTopics = pickTopicsForQuizPreferUnique(rng, allowedTopicSlugs, n);
    const qk = shortHash(quizKey);

    // 1) Load each picked topic's meta.pool so we can force unique exerciseKey
    const uniqPickedTopics = Array.from(new Set(pickedTopics));
    const topicRows = await prisma.practiceTopic.findMany({
      where: { slug: { in: uniqPickedTopics } },
      // IMPORTANT: adjust if your column name isn't "meta"
      select: { slug: true, meta: true },
    });

    const poolBySlug = new Map<string, PoolItem[]>();
    for (const row of topicRows) {
      const pool = readPoolFromTopicMeta((row as any).meta);
      poolBySlug.set(row.slug, filterPoolByPreferKind(pool, spec.preferKind ?? null));
    }

    // 2) Validate pools exist (strict uniqueness guarantee)
    const missingPool = uniqPickedTopics.filter((s) => (poolBySlug.get(s)?.length ?? 0) === 0);
    if (missingPool.length) {
      return json(
          {
            message:
                "Cannot generate a no-duplicate quiz because some topics have empty meta.pool (or preferKind filtered everything out).",
            detail: { missingPool, preferKind: spec.preferKind ?? null },
          },
          400,
          setGuestId
      );
    }

    // 3) Build questions and force unique keys per topic
    const usedByTopic = new Map<string, Set<string>>();
    const out: any[] = [];

    for (let i = 0; i < n; i++) {
      const pickedTopic = pickedTopics[i];
      const pool = poolBySlug.get(pickedTopic)!;

      const used = usedByTopic.get(pickedTopic) ?? new Set<string>();
      const exerciseKey = pickUniqueExerciseKey(rng, pool, used);

      // If we run out of unique keys for a repeated topic, truncate the quiz
      if (!exerciseKey) break;

      usedByTopic.set(pickedTopic, used);

      out.push({
        kind: "practice" as const,
        id: `p${i + 1}:${qk}`,
        fetch: {
          subject: spec.subject,
          module: spec.module,
          section: spec.section,
          topic: pickedTopic,
          difficulty: spec.difficulty ?? "easy",
          allowReveal: Boolean(spec.allowReveal),
          preferKind: spec.preferKind ?? null,

          // ✅ THIS is the guarantee: /api/practice is now forced and cannot repeat
          exerciseKey,

          // stable salt per slot
          salt: `${quizKey}|topic=${pickedTopic}|slot=${i + 1}|q=${i + 1}|k=${exerciseKey}`,
        },
        maxAttempts: defaultMaxAttempts,
      });
    }

    questions = out;
  }
  // 3) Persist (handle StrictMode/double POST race)
  try {
    await prisma.reviewQuizInstance.create({
      data: {
        actorKey,
        quizKey,
        spec,
        questions,
      },
    });
  } catch (e: any) {
    // Prisma unique violation is usually code "P2002"
    if (e?.code !== "P2002") throw e;
  }

  const saved = await prisma.reviewQuizInstance.findUnique({
    where: { actorKey_quizKey: { actorKey, quizKey } },
    select: { questions: true },
  });

  const outQuestions = (saved?.questions ?? questions) as any[];

  return json(
      {
        questions: outQuestions,
        quizKey,
        mode,
        requested: mode === "project" ? (spec.steps?.length ?? 0) : n,
        generated: Array.isArray(outQuestions) ? outQuestions.length : undefined,
        truncated: mode === "quiz" ? Array.isArray(outQuestions) && outQuestions.length < n : false,
        frozen: true,
      },
      200,
      setGuestId,
  );
}

export async function DELETE(req: Request) {
  const actor0 = await getActor();
  const ensured = ensureGuestId(actor0);
  const actor = ensured.actor;
  const setGuestId = ensured.setGuestId;

  const { searchParams } = new URL(req.url);
  const quizKey = (searchParams.get("quizKey") ?? "").trim();
  if (!quizKey) return json({ message: "Missing quizKey." }, 400, setGuestId);

  const actorKey = actorKeyOf(actor);

  await prisma.reviewQuizInstance.deleteMany({
    where: { actorKey, quizKey },
  });

  return json({ ok: true }, 200, setGuestId);
}
