// src/app/api/review/quiz/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
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

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// src/app/api/review/quiz/route.ts
import { createHash } from "crypto";

function shortHash(s: string) {
  return createHash("sha1").update(s).digest("hex").slice(0, 10);
}

const SpecSchema = z.object({
  subject: z.string().min(1),
  module: z.string().optional(),
  section: z.string().optional(),
  topic: z.string().optional(), // "py0.io_vars" | "all" | ""
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  n: z.number().int().min(1).max(20).optional(),
  allowReveal: z.boolean().optional(),
  preferKind: z.nativeEnum(PracticeKind).nullable().optional(),
  maxAttempts: z.number().int().min(1).max(10).optional(),
  quizKey: z.string().optional(),
});

function json(body: any, status = 200, setGuestId?: string) {
  const res = NextResponse.json(body, { status });
  return attachGuestCookie(res, setGuestId);
}

// Stable quiz identity for “same user + same spec”
function buildQuizKey(spec: z.infer<typeof SpecSchema>) {
  return [
    "review-quiz",
    `subject=${spec.subject}`,
    `module=${spec.module ?? ""}`,
    `section=${spec.section ?? ""}`,
    `topic=${spec.topic ?? ""}`,
    `difficulty=${spec.difficulty ?? ""}`,
    `n=${spec.n ?? 4}`,
    `allowReveal=${spec.allowReveal ? 1 : 0}`,
    `preferKind=${spec.preferKind ?? ""}`,
    `maxAttempts=${spec.maxAttempts ?? 1}`,
  ].join("|");
}
// src/app/api/review/quiz/route.ts

function shuffleInPlace<T>(rng: any, arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = rng.int(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickTopicsForQuiz(rng: any, slugs: string[], n: number) {
  if (!slugs.length) return [];
  if (slugs.length === 1) return Array.from({ length: n }, () => slugs[0]); // can’t avoid repeats

  const pool = shuffleInPlace(rng, [...slugs]);
  if (pool.length >= n) return pool.slice(0, n);

  // not enough unique topics — still avoid 4 identical by cycling
  const out = [...pool];
  let k = 0;
  while (out.length < n) out.push(pool[k++ % pool.length]);
  return out;
}

function pickTopicsForQuizUnique(rng: any, slugs: string[], n: number) {
  const unique = Array.from(new Set(slugs));
  if (!unique.length) return [];

  shuffleInPlace(rng, unique);
  return unique.slice(0, Math.min(n, unique.length)); // ✅ never repeats
}

function pickTopicsForQuizPreferUnique(rng: any, slugs: string[], n: number) {
  const unique = Array.from(new Set(slugs));
  if (!unique.length) return [];

  shuffleInPlace(rng, unique);

  // ✅ use each topic at most once until we run out
  const out = unique.slice(0, Math.min(n, unique.length));

  // ✅ if not enough unique topics, repeat (unavoidable)
  let k = 0;
  while (out.length < n) out.push(unique[k++ % unique.length]);

  return out;
}

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
    return json({ message: "Invalid quiz spec", issues: parsed.error.issues }, 400, setGuestId);
  }

  const spec = parsed.data;
  const n = spec.n ?? 4;
  const maxAttempts = spec.maxAttempts ?? 1;

  const actorKey = actorKeyOf(actor);

  // ✅ IMPORTANT: honor client-provided quizKey (if sent)
  const quizKey = (spec.quizKey?.trim() || buildQuizKey(spec)).trim();

  // 1) If exists, return it
  const existing = await prisma.reviewQuizInstance.findUnique({
    where: { actorKey_quizKey: { actorKey, quizKey } },
    select: { questions: true },
  });

  if (existing?.questions) {
    return json({ questions: existing.questions, quizKey }, 200, setGuestId);
  }

  // 2) Otherwise generate it
  const rng = rngFromActor({
    userId: actor.userId,
    guestId: actor.guestId,
    sessionId: null,
    salt: `review-quiz-instance:${quizKey}`,
  });

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

    if (!section) return json({ message: `Section "${spec.section}" not found.` }, 404, setGuestId);
    if (section.subject?.slug !== spec.subject) {
      return json({ message: `Section "${spec.section}" is not in subject "${spec.subject}".` }, 400, setGuestId);
    }
    if (spec.module && section.module?.slug !== spec.module) {
      return json({ message: `Section "${spec.section}" is not in module "${spec.module}".` }, 400, setGuestId);
    }

    const pool = section.topics
      .map((x) => x.topic)
      .filter((t) => t?.genKey)
      .map((t) => t.slug);

    if (!pool.length) return json({ message: `Section "${spec.section}" has no topics with genKey.` }, 400, setGuestId);

    if (wantsAll) {
      allowedTopicSlugs = pool;
    } else {
      const dbSlug = toDbTopicSlug(spec.topic);
      if (!pool.includes(dbSlug)) {
        return json({ message: `Topic "${dbSlug}" is not part of section "${spec.section}".` }, 400, setGuestId);
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
        { message: `No topics found for subject="${spec.subject}" module="${spec.module ?? ""}" (with genKey).` },
        404,
        setGuestId,
      );
    }

    if (wantsAll) {
      allowedTopicSlugs = rows.map((r) => r.slug);
    } else {
      const dbSlug = toDbTopicSlug(spec.topic);
      const ok = rows.some((r) => r.slug === dbSlug);
      if (!ok) return json({ message: `Topic "${dbSlug}" is not in this subject/module.` }, 400, setGuestId);
      allowedTopicSlugs = [dbSlug];
    }
  }
const pickedTopics = pickTopicsForQuiz(rng, allowedTopicSlugs, n);
const qk = shortHash(quizKey);

const questions = Array.from({ length: n }, (_v, i) => {
  const pickedTopic = pickedTopics[i];
  return {
    kind: "practice" as const,
    id: `p${i + 1}:${qk}`, // ✅ unique per quiz instance
    fetch: {
      subject: spec.subject,
      module: spec.module,
      section: spec.section,
      topic: pickedTopic,
      difficulty: spec.difficulty ?? "easy",
      allowReveal: Boolean(spec.allowReveal),
      preferKind: spec.preferKind ?? null,
      salt: `${quizKey}|q=${i + 1}`,
    },
    maxAttempts,
  };
});

  // const pickedTopics = pickTopicsForQuizPreferUnique(rng, allowedTopicSlugs, n);
  // const qk = shortHash(quizKey);
  //
  // const questions = pickedTopics.map((pickedTopic, i) => ({
  //   kind: "practice" as const,
  //   id: `p${i + 1}:${qk}`,
  //   fetch: {
  //     subject: spec.subject,
  //     module: spec.module,
  //     section: spec.section,
  //     topic: pickedTopic,
  //     difficulty: spec.difficulty ?? "easy",
  //     allowReveal: Boolean(spec.allowReveal),
  //     preferKind: spec.preferKind ?? null,
  //     salt: `${quizKey}|topic=${pickedTopic}|q=${i + 1}`, // ✅ different per slot
  //   },
  //   maxAttempts,
  // }));

//   const pickedTopics = pickTopicsForQuizUnique(rng, allowedTopicSlugs, n);
//   const qk = shortHash(quizKey);
//
//   const questions = pickedTopics.map((pickedTopic, i) => ({
//     kind: "practice" as const,
//     id: `p${i + 1}:${qk}`, // ✅ unique per quiz instance
//     fetch: {
//       subject: spec.subject,
//       module: spec.module,
//       section: spec.section,
//       topic: pickedTopic,
//       difficulty: spec.difficulty ?? "easy",
//       allowReveal: Boolean(spec.allowReveal),
//       preferKind: spec.preferKind ?? null,
//       salt: `${quizKey}|topic=${pickedTopic}|q=${i + 1}`, // ✅ extra explicit
//     },
//     maxAttempts,
//   }));
// const questions = Array.from({ length: n }, (_v, i) => {
//   const pickedTopic = pickedTopics[i];
//   return {
//     kind: "practice" as const,
//     id: `p${i + 1}`,
//     fetch: {
//       subject: spec.subject,
//       module: spec.module,
//       section: spec.section,
//       topic: pickedTopic,
//       difficulty: spec.difficulty ?? "easy",
//       allowReveal: Boolean(spec.allowReveal),
//       preferKind: spec.preferKind ?? null,
//       salt: `${quizKey}|q=${i + 1}`, // keep this
//     },
//     maxAttempts,
//   };
// });

  // ✅ Handle StrictMode / double POST race:
  // create may throw unique violation; if so, re-read and return.
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

  return json({ questions: saved?.questions ?? questions, quizKey }, 200, setGuestId);
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
