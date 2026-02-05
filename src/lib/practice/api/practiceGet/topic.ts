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
  // Fast path: topic.moduleId stamped
  if (topic.moduleId) return topic.moduleId === moduleId;

  // Fallback: check section links -> section.moduleId
  const link = await prisma.practiceSectionTopic.findFirst({
    where: {
      topicId: topic.id,
      section: { moduleId },
    },
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
}): Promise<
  | {
      kind: "ok";
      topicId: string;
      topicSlug: TopicSlug;
      genKey: string | null;
      variant: string | null;
      meta: any;
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
  } = args;

  const requested = String(rawTopic ?? "").trim();
  const wantsAll = !requested || requested === "all";

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

    if (!row) return { kind: "missing", message: `Topic "${dbSlug}" not found.` };

    // ✅ Assignment scope: must be in assignment
    if (assignmentIdFromSession) {
      const ok = await topicInAssignment(prisma, assignmentIdFromSession, row.id);
      if (!ok) return { kind: "missing", message: `Topic "${dbSlug}" is not in this assignment.` };
    }

    // ✅ Module scope: must be in this module
    if (moduleIdFromSession) {
      const ok = await topicInModule(prisma, moduleIdFromSession, row);
      if (!ok) return { kind: "missing", message: `Topic "${dbSlug}" is not in this module.` };
    }

    // ✅ Section scope: must be linked to this section
    if (!moduleIdFromSession && sectionSlug) {
      const ok = await topicInSection(prisma, sectionSlug, row.id);
      if (!ok) return { kind: "missing", message: `Topic "${dbSlug}" is not in section "${sectionSlug}".` };
    }

    // ✅ Subject session scope (fallback check)
    if (!moduleIdFromSession && subjectIdFromSession && row.subjectId && row.subjectId !== subjectIdFromSession) {
      return { kind: "missing", message: `Topic "${dbSlug}" not in this session’s subject.` };
    }

    return {
      kind: "ok",
      topicId: row.id,
      topicSlug: row.slug as TopicSlug,
      genKey: row.genKey ? String(row.genKey) : null,
      variant: readVariantFromMeta(row),
      meta: row.meta ?? null,
    };
  }

  // ----------------------------
  // wantsAll: pick from the correct pool (priority: assignment -> module -> section -> moduleSlug -> subjectSlug)
  // ----------------------------

  // 1) Assignment pool
  if (assignmentIdFromSession) {
    const links = await prisma.assignmentTopic.findMany({
      where: { assignmentId: assignmentIdFromSession },
      orderBy: { order: "asc" },
      select: {
        topic: {
          select: { id: true, slug: true, genKey: true, meta: true, moduleId: true },
        },
      },
    });

    const pool = links
      .map((x) => x.topic)
      .filter((t) => t?.genKey) as Array<{ id: string; slug: string; genKey: string; meta: any; moduleId: string | null }>;

    if (!pool.length) return { kind: "missing", message: "Assignment has no topics with genKey." };

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

    // Fallback if moduleId not stamped on topics: use section links
    let pool = rows;
    if (!pool.length) {
      const links = await prisma.practiceSectionTopic.findMany({
        where: { section: { moduleId: moduleIdFromSession } },
        orderBy: [{ order: "asc" }],
        select: {
          topic: { select: { id: true, slug: true, genKey: true, meta: true, moduleId: true } },
        },
        take: 4000,
      });

      pool = links.map((x) => x.topic).filter((t) => t?.genKey) as any;
    }

    if (!pool.length) return { kind: "missing", message: "Module has no topics with genKey." };

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
      .filter((t) => t?.genKey) as any[];

    if (!pool.length) return { kind: "missing", message: `Section "${sectionSlug}" has no topics with genKey.` };

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

    if (!rows.length) return { kind: "missing", message: `Module "${moduleSlug}" has no topics with genKey.` };

    const picked = rng.pick(rows);
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

  if (!rows.length) {
    return { kind: "missing", message: `No topics found for subject="${subjectSlug ?? ""}" (with genKey).` };
  }

  const picked = rng.pick(rows);
  return {
    kind: "ok",
    topicId: picked.id,
    topicSlug: picked.slug as TopicSlug,
    genKey: String(picked.genKey),
    variant: readVariantFromMeta(picked),
    meta: picked.meta ?? null,
  };
}
