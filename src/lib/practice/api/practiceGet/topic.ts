// src/lib/practice/api/practiceGet/topic.ts
import type { PrismaClient } from "@prisma/client";
import type { TopicSlug } from "@/lib/practice/types";
import { rngFromActor } from "@/lib/practice/catalog";
import { toDbTopicSlug } from "@/lib/practice/topicSlugs";

type RngSeedParts = {
  userId?: string | null;
  guestId?: string | null;
  sessionId?: string | null;
};

function readVariantFromMeta(topicRow: { meta?: any }) {
  const v = topicRow?.meta?.variant;
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

async function topicInAssignment(prisma: PrismaClient, assignmentId: string, topicId: string) {
  const link = await prisma.assignmentTopic.findFirst({
    where: { assignmentId, topicId },
    select: { assignmentId: true },
  });
  return Boolean(link);
}

async function topicInSection(prisma: PrismaClient, sectionSlug: string, topicId: string) {
  const link = await prisma.practiceSectionTopic.findFirst({
    where: { section: { slug: sectionSlug }, topicId },
    select: { sectionId: true },
  });
  return Boolean(link);
}

async function topicInModule(prisma: PrismaClient, moduleId: string, topic: { id: string; moduleId: string | null }) {
  if (topic.moduleId) return topic.moduleId === moduleId;

  const link = await prisma.practiceSectionTopic.findFirst({
    where: { topicId: topic.id, section: { moduleId } },
    select: { sectionId: true },
  });
  return Boolean(link);
}

export async function resolveTopicFromDb(args: {
  prisma: PrismaClient;

  // non-session (navigational) scope
  subjectSlug?: string;
  moduleSlug?: string;
  sectionSlug?: string;

  rawTopic?: string;

  // session-derived scope locks
  subjectIdFromSession?: string | null;
  moduleIdFromSession?: string | null;
  assignmentIdFromSession?: string | null;

  rngSeedParts: RngSeedParts;
  topicPickSalt?: string | null;

  // ✅ existing
  fallbackOnMissing?: boolean;

  // ✅ NEW: excludes (used by retry loop when generator rejects a DB topic)
  excludeTopicSlugs?: string[] | null;
}): Promise<
    | {
  kind: "ok";
  topicId: string;
  topicSlug: TopicSlug;
  genKey: string | null;
  variant: string | null;
  meta: any;

  // (optional: keep if you already added these)
  requestedTopic?: string | null;
  topicFallbackUsed?: boolean;
  topicFallbackReason?: string | null;
}
    | { kind: "missing"; message: string }
> {
  const {
    prisma,
    subjectSlug,
    moduleSlug,
    sectionSlug,
    rawTopic,
    subjectIdFromSession,
    moduleIdFromSession,
    assignmentIdFromSession,
    rngSeedParts,
    topicPickSalt,
    fallbackOnMissing = false,
    excludeTopicSlugs,
  } = args;

  const requested = String(rawTopic ?? "").trim();
  let wantsAll = !requested || requested === "all";

  const exclude = new Set(
      (excludeTopicSlugs ?? []).map((s) => String(s)).filter(Boolean),
  );

  const rng = rngFromActor({
    ...rngSeedParts,
    salt: String(topicPickSalt ?? "topic-pick"),
  });

  // ----------------------------
  // If a specific topic is requested, validate it belongs to the scope
  // ----------------------------
  if (!wantsAll) {
    const dbSlug = toDbTopicSlug(requested);

    const row = await prisma.practiceTopic.findUnique({
      where: { slug: dbSlug },
      select: {
        id: true,
        slug: true,
        genKey: true,
        meta: true,
        subjectId: true,
        moduleId: true,
      },
    });

    const fallbackToAll = (message: string) => {
      if (!fallbackOnMissing) return { kind: "missing" as const, message };
      wantsAll = true;
      return null;
    };

    if (!row) {
      const fb = fallbackToAll(`Topic "${dbSlug}" not found.`);
      if (fb) return fb;
    } else {
      // ✅ NEW: excluded by caller
      if (exclude.has(String(row.slug))) {
        const fb = fallbackToAll(`Topic "${String(row.slug)}" is excluded.`);
        if (fb) return fb;
      }

      // Assignment scope
      if (assignmentIdFromSession) {
        const ok = await topicInAssignment(prisma, assignmentIdFromSession, row.id);
        if (!ok) {
          const fb = fallbackToAll(`Topic "${dbSlug}" is not in this assignment.`);
          if (fb) return fb;
        }
      }

      // Module scope (session lock)
      if (moduleIdFromSession) {
        const ok = await topicInModule(prisma, moduleIdFromSession, row);
        if (!ok) {
          const fb = fallbackToAll(`Topic "${dbSlug}" is not in this module.`);
          if (fb) return fb;
        }
      }

      // Section scope (only if no module lock)
      if (!moduleIdFromSession && sectionSlug) {
        const ok = await topicInSection(prisma, sectionSlug, row.id);
        if (!ok) {
          const fb = fallbackToAll(`Topic "${dbSlug}" is not in section "${sectionSlug}".`);
          if (fb) return fb;
        }
      }

      // Subject session scope fallback check
      if (!moduleIdFromSession && subjectIdFromSession && row.subjectId && row.subjectId !== subjectIdFromSession) {
        const fb = fallbackToAll(`Topic "${dbSlug}" not in this session’s subject.`);
        if (fb) return fb;
      }

      if (!wantsAll) {
        return {
          kind: "ok",
          topicId: row.id,
          topicSlug: row.slug as TopicSlug,
          genKey: row.genKey ? String(row.genKey) : null,
          variant: readVariantFromMeta(row),
          meta: row.meta ?? null,
        };
      }
    }
  }

  // ----------------------------
  // wantsAll: pick from correct pool
  // priority: assignment -> module(session) -> section -> moduleSlug -> subjectSlug
  // ----------------------------

  // 1) Assignment pool
  if (assignmentIdFromSession) {
    const links = await prisma.assignmentTopic.findMany({
      where: { assignmentId: assignmentIdFromSession },
      orderBy: { order: "asc" },
      select: {
        topic: { select: { id: true, slug: true, genKey: true, meta: true, moduleId: true } },
      },
    });

    const pool = links
        .map((x) => x.topic)
        .filter((t) => t?.genKey && !exclude.has(String(t.slug))) as any[];

    if (!pool.length) return { kind: "missing", message: "Assignment has no topics with genKey (or all excluded)." };

    const picked = rng.pick(pool);
    return {
      kind: "ok",
      topicId: picked.id,
      topicSlug: picked.slug as TopicSlug,
      genKey: String(picked.genKey),
      variant: readVariantFromMeta(picked),
      meta: picked.meta ?? null,
    };
  }

  // 2) Module pool (SESSION LOCK)
  if (moduleIdFromSession) {
    const rows = await prisma.practiceTopic.findMany({
      where: { moduleId: moduleIdFromSession, genKey: { not: null } },
      orderBy: [{ order: "asc" }, { slug: "asc" }],
      select: { id: true, slug: true, genKey: true, meta: true, moduleId: true },
      take: 2000,
    });

    let pool = rows.filter((t) => !exclude.has(String(t.slug)));

    if (!pool.length) {
      const links = await prisma.practiceSectionTopic.findMany({
        where: { section: { moduleId: moduleIdFromSession } },
        orderBy: [{ order: "asc" }],
        select: { topic: { select: { id: true, slug: true, genKey: true, meta: true, moduleId: true } } },
        take: 4000,
      });

      pool = links
          .map((x) => x.topic)
          .filter((t) => t?.genKey && !exclude.has(String(t.slug))) as any[];
    }

    if (!pool.length) return { kind: "missing", message: "Module has no topics with genKey (or all excluded)." };

    const picked = rng.pick(pool);
    return {
      kind: "ok",
      topicId: picked.id,
      topicSlug: picked.slug as TopicSlug,
      genKey: String(picked.genKey),
      variant: readVariantFromMeta(picked),
      meta: picked.meta ?? null,
    };
  }

  // 3) Section pool
  if (sectionSlug) {
    const sectionRow = await prisma.practiceSection.findUnique({
      where: { slug: sectionSlug },
      select: {
        topics: {
          orderBy: { order: "asc" },
          select: { topic: { select: { id: true, slug: true, genKey: true, meta: true, moduleId: true } } },
        },
      },
    });

    if (!sectionRow) return { kind: "missing", message: `Section "${sectionSlug}" not found.` };

    const pool = (sectionRow.topics ?? [])
        .map((x) => x.topic)
        .filter((t) => t?.genKey && !exclude.has(String(t.slug))) as any[];

    if (!pool.length) return { kind: "missing", message: `Section "${sectionSlug}" has no topics with genKey (or all excluded).` };

    const picked = rng.pick(pool);
    return {
      kind: "ok",
      topicId: picked.id,
      topicSlug: picked.slug as TopicSlug,
      genKey: String(picked.genKey),
      variant: readVariantFromMeta(picked),
      meta: picked.meta ?? null,
    };
  }

  // 4) Non-session module slug pool
  if (moduleSlug) {
    const mod = await prisma.practiceModule.findUnique({
      where: { slug: moduleSlug },
      select: { id: true },
    });
    if (!mod) return { kind: "missing", message: `Module "${moduleSlug}" not found.` };

    const rows = await prisma.practiceTopic.findMany({
      where: { moduleId: mod.id, genKey: { not: null } },
      orderBy: [{ order: "asc" }, { slug: "asc" }],
      select: { id: true, slug: true, genKey: true, meta: true, moduleId: true },
      take: 2000,
    });

    const pool = rows.filter((t) => !exclude.has(String(t.slug)));
    if (!pool.length) return { kind: "missing", message: `Module "${moduleSlug}" has no topics with genKey (or all excluded).` };

    const picked = rng.pick(pool);
    return {
      kind: "ok",
      topicId: picked.id,
      topicSlug: picked.slug as TopicSlug,
      genKey: String(picked.genKey),
      variant: readVariantFromMeta(picked),
      meta: picked.meta ?? null,
    };
  }

  // 5) Subject pool (last resort)
  const rows = await prisma.practiceTopic.findMany({
    where: {
      subject: subjectSlug ? { slug: subjectSlug } : undefined,
      genKey: { not: null },
    },
    orderBy: [{ order: "asc" }, { slug: "asc" }],
    select: { id: true, slug: true, genKey: true, meta: true, moduleId: true },
    take: 2000,
  });

  const pool = rows.filter((t) => !exclude.has(String(t.slug)));
  if (!pool.length) {
    return { kind: "missing", message: `No topics found for subject="${subjectSlug ?? ""}" (with genKey) or all excluded.` };
  }

  const picked = rng.pick(pool);
  return {
    kind: "ok",
    topicId: picked.id,
    topicSlug: picked.slug as TopicSlug,
    genKey: String(picked.genKey),
    variant: readVariantFromMeta(picked),
    meta: picked.meta ?? null,
  };
}