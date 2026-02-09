// src/app/(public)/[locale]/(learn)/subjects/[subjectSlug]/modules/page.tsx
import { prisma } from "@/lib/prisma";
import SubjectModulesClient from "./SubjectModulesClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = {
  locale: string;
  subjectSlug: string;
};

export default async function SubjectModulesPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, subjectSlug } = await params; // ✅ IMPORTANT

  if (!subjectSlug) {
    return (
      <div className="min-h-screen p-6">
        <div className="mx-auto max-w-3xl ui-card p-6">
          <div className="text-lg font-black">Missing subject</div>
          <div className="mt-2 text-sm text-neutral-600 dark:text-white/70">
            subjectSlug param is missing.
          </div>
        </div>
      </div>
    );
  }

  const subject = await prisma.practiceSubject.findUnique({
    where: { slug: subjectSlug },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      modules: {
        orderBy: [{ order: "asc" }, { slug: "asc" }],
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          order: true,
          weekStart: true,
          weekEnd: true,
        },
      },
      sections: {
        orderBy: [{ order: "asc" }, { slug: "asc" }],
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          order: true,
          moduleId: true,
        },
      },
    },
  });

  if (!subject) {
    return (
      <div className="min-h-screen p-6">
        <div className="mx-auto max-w-3xl ui-card p-6">
          <div className="text-lg font-black">Subject not found</div>
          <div className="mt-2 text-sm text-neutral-600 dark:text-white/70">
            No subject with slug “{subjectSlug}”.
          </div>
        </div>
      </div>
    );
  }

  const moduleDbIds = subject.modules.map((m) => m.id);
  const sectionIds = subject.sections.map((s) => s.id);

  const moduleTopics = await prisma.practiceTopic.findMany({
    where: { moduleId: { in: moduleDbIds } },
    select: { id: true, moduleId: true },
  });

  const topicIdsByModuleDbId: Record<string, string[]> = {};
  for (const t of moduleTopics) {
    const mid = t.moduleId ? String(t.moduleId) : "";
    if (!mid) continue;
    (topicIdsByModuleDbId[mid] ??= []).push(String(t.id));
  }

  const sectionLinks = await prisma.practiceSectionTopic.findMany({
    where: { sectionId: { in: sectionIds } },
    select: { sectionId: true, topicId: true },
  });

  const topicIdsBySectionId: Record<string, string[]> = {};
  console.log(sectionLinks)
  for (const link of sectionLinks) {
    const sid = String(link.sectionId);
    (topicIdsBySectionId[sid] ??= []).push(String(link.topicId));
  }

  return (
    <SubjectModulesClient
      locale={locale}
      subjectSlug={subject.slug}
      subjectTitle={subject.title}
      subjectDescription={subject.description}
      modules={subject.modules}
      sections={subject.sections}
      topicIdsByModuleDbId={topicIdsByModuleDbId}
      topicIdsBySectionId={topicIdsBySectionId}
    />
  );
}
