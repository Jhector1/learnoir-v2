// prisma/seed/seed.ts
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { SUBJECTS, MODULES, TOPICS, SECTIONS } from "./data";

function getPrisma() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  return new PrismaClient({
    adapter: new PrismaPg(new Pool({ connectionString })),
  });
}

export async function runSeed() {
  const prisma = getPrisma();
  const started = Date.now();

  try {
    return await prisma.$transaction(async (tx) => {
      // -------------------------
      // 1) Subjects
      // -------------------------
      const subjectIdBySlug = new Map<string, string>();

      for (const s of SUBJECTS) {
        const row = await tx.practiceSubject.upsert({
          where: { slug: s.slug },
          update: {
            order: s.order,
            title: s.title,
            description: s.description,
            meta: s.meta ?? undefined,
          },
          create: {
            slug: s.slug,
            order: s.order,
            title: s.title,
            description: s.description,
            meta: s.meta ?? undefined,
          },
        });
        subjectIdBySlug.set(s.slug, row.id);
      }

      // -------------------------
      // 2) Modules
      // -------------------------
      const moduleIdBySlug = new Map<string, string>();

      for (const m of MODULES) {
        const subjectId = subjectIdBySlug.get(m.subjectSlug) ?? null;

        const row = await tx.practiceModule.upsert({
          where: { slug: m.slug },
          update: {
            order: m.order,
            title: m.title,
            description: m.description,
            weekStart: m.weekStart ?? null,
            weekEnd: m.weekEnd ?? null,
            subjectId,
            meta: m.meta ?? undefined, // ✅ ADD

          },
          create: {
            slug: m.slug,
            order: m.order,
            title: m.title,
            description: m.description,
            weekStart: m.weekStart ?? null,
            weekEnd: m.weekEnd ?? null,
            subjectId,
            meta: m.meta ?? undefined, // ✅ ADD

          },
        });

        moduleIdBySlug.set(m.slug, row.id);
      }

      // -------------------------
      // 3) Topics (source of truth: TOPICS dataset)
      // -------------------------
      const topicIdBySlug = new Map<string, string>();

      for (const t of TOPICS) {
        const subjectId = subjectIdBySlug.get(t.subjectSlug) ?? null;
        const moduleId = moduleIdBySlug.get(t.moduleSlug) ?? null;

        // store variant inside meta, so API can read it
        const meta =
          t.variant === undefined
            ? (t.meta ?? undefined)
            : { ...(t.meta ?? {}), variant: t.variant };

        const row = await tx.practiceTopic.upsert({
          where: { slug: t.slug },
          update: {
            titleKey: t.titleKey,
            description: t.description ?? null,
            order: t.order ?? 0,
            genKey: t.genKey ?? null,
            subjectId,
            moduleId,
            meta: meta ?? undefined,
          },
          create: {
            slug: t.slug,
            titleKey: t.titleKey,
            description: t.description ?? null,
            order: t.order ?? 0,
            genKey: t.genKey ?? null,
            subjectId,
            moduleId,
            meta: meta ?? undefined,
          },
        });

        topicIdBySlug.set(t.slug, row.id);
      }

      // -------------------------
      // 4) Sections + section<->topic links
      // -------------------------
      for (const s of SECTIONS) {
        const subjectId = subjectIdBySlug.get(s.subjectSlug) ?? null;
        const moduleId = moduleIdBySlug.get(s.moduleSlug) ?? null;

        const section = await tx.practiceSection.upsert({
          where: { slug: s.slug },
          update: {
            order: s.order,
            title: s.title,
            description: s.description ?? null,
            meta: s.meta ?? undefined,
            subjectId,
            moduleId,
          },
          create: {
            slug: s.slug,
            order: s.order,
            title: s.title,
            description: s.description ?? null,
            meta: s.meta ?? undefined,
            subjectId,
            moduleId,
          },
        });

        await tx.practiceSectionTopic.deleteMany({ where: { sectionId: section.id } });

        if (s.topicSlugs.length) {
          await tx.practiceSectionTopic.createMany({
            data: s.topicSlugs.map((topicSlug, idx) => {
              const topicId = topicIdBySlug.get(topicSlug);
              if (!topicId) throw new Error(`Missing topicId for ${topicSlug}`);
              return { sectionId: section.id, topicId, order: idx };
            }),
          });
        }
      }

      return {
        ok: true as const,
        subjects: SUBJECTS.length,
        modules: MODULES.length,
        topics: TOPICS.length,
        sections: SECTIONS.length,
        ms: Date.now() - started,
      };
    });
  } finally {
    await prisma.$disconnect();
  }
}
