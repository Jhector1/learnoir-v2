// src/app/(public)/[locale]/(learn)/subjects/[subjectSlug]/modules/page.tsx
import { prisma } from "@/lib/prisma";
import SubjectModulesClient from "./SubjectModulesClient";

// ✅ pick the right auth import for your project
// If you use Auth.js v5 style:
import { auth } from "@/lib/auth";
// If you use NextAuth v4 getServerSession, swap the above for:
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth"; // wherever your options live

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
  const { locale, subjectSlug } = await params;

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

  // -----------------------------
  // ✅ Server-controlled unlock (roles)
  // -----------------------------
  // Auth.js v5:
  const session = await auth();
  // NextAuth v4 alternative:
  // const session = await getServerSession(authOptions);

  const sessionUser: any = (session as any)?.user ?? null;
  const userId: string | null = sessionUser?.id ?? null;
  const email: string | null = sessionUser?.email ?? null;

  const user = userId
      ? await prisma.user.findUnique({
        where: { id: userId },
        select: { roles: true },
      })
      : email
          ? await prisma.user.findUnique({
            where: { email },
            select: { roles: true },
          })
          : null;

  const roles: string[] = (user as any)?.roles ?? [];
  const canUnlockAll =
      roles.includes("teacher") || roles.includes("admin");

  // -----------------------------
  // Subject query
  // -----------------------------
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

  // -----------------------------
  // ✅ IMPORTANT FIX:
  // Topic keys should match what ReviewProgress stores:
  // use PracticeTopic.genKey (preferred) or PracticeTopic.slug (fallback),
  // NOT PracticeTopic.id
  // -----------------------------
  const moduleTopics = await prisma.practiceTopic.findMany({
    where: { moduleId: { in: moduleDbIds } },
    select: { moduleId: true, genKey: true, slug: true },
  });

  const topicIdsByModuleDbId: Record<string, string[]> = {};
  for (const t of moduleTopics) {
    const mid = t.moduleId ? String(t.moduleId) : "";
    if (!mid) continue;
    const key = String(t.genKey ?? t.slug);
    (topicIdsByModuleDbId[mid] ??= []).push(key);
  }

  // For section mapping, pull the topic relation so you can access genKey/slug
  const sectionLinks = await prisma.practiceSectionTopic.findMany({
    where: { sectionId: { in: sectionIds } },
    select: {
      sectionId: true,
      topic: { select: { genKey: true, slug: true } },
    },
    orderBy: { order: "asc" },
  });

  const topicIdsBySectionId: Record<string, string[]> = {};
  for (const link of sectionLinks) {
    const sid = String(link.sectionId);
    const key = String(link.topic.genKey ?? link.topic.slug);
    (topicIdsBySectionId[sid] ??= []).push(key);
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
          canUnlockAll={canUnlockAll} // ✅ NEW
      />
  );
}
