// src/app/(public)/[locale]/subjects/[subjectSlug]/modules/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = {
  locale: string;
  subjectSlug: string;
};

function sortByOrderThenSlug<T extends { order: number | null; slug: string }>(a: T, b: T) {
  const ao = a.order ?? 0;
  const bo = b.order ?? 0;
  return ao - bo || a.slug.localeCompare(b.slug);
}

export default async function SubjectModulesPage({ params }: { params: Promise<Params> }) {
  const { locale, subjectSlug } = await params;

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
      <div className="min-h-screen p-4 md:p-6 bg-[radial-gradient(1200px_700px_at_20%_0%,#151a2c_0%,#0b0d12_50%)] text-white/90">
        <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <div className="text-lg font-black tracking-tight">Subject not found</div>
          <div className="mt-2 text-sm text-white/70">No subject with slug “{subjectSlug}”.</div>

          <div className="mt-4">
            <Link
              href={`/${encodeURIComponent(locale)}/subjects`}
              className="inline-flex rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm font-extrabold text-white/90 hover:bg-black/30 transition"
            >
              ← Back to subjects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Group sections by moduleId (true source of truth)
  const sectionsByModuleId = new Map<string, typeof subject.sections>();
  for (const s of subject.sections) {
    const k = String(s.moduleId ?? "no-module");
    const arr = sectionsByModuleId.get(k) ?? [];
    arr.push(s);
    sectionsByModuleId.set(k, arr);
  }
  for (const [k, arr] of sectionsByModuleId) {
    arr.sort(sortByOrderThenSlug);
    sectionsByModuleId.set(k, arr);
  }

  return (
    <div className="min-h-screen p-4 md:p-6 bg-[radial-gradient(1200px_700px_at_20%_0%,#151a2c_0%,#0b0d12_50%)] text-white/90">
      <div className="mx-auto max-w-5xl grid gap-4">
        {/* Header */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:p-5">
          <div className="text-xs font-extrabold text-white/60">Subject</div>
          <div className="mt-1 text-2xl font-black tracking-tight">{subject.title}</div>
          {subject.description ? (
            <div className="mt-2 text-sm text-white/70">{subject.description}</div>
          ) : null}

          <div className="mt-4">
            <Link
              href={`/${encodeURIComponent(locale)}/subjects`}
              className="inline-flex rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm font-extrabold text-white/90 hover:bg-black/30 transition"
            >
              ← Change subject
            </Link>
          </div>
        </div>

        {/* Modules */}
        {subject.modules.length ? (
          <div className="grid gap-3">
            {subject.modules.slice().sort(sortByOrderThenSlug).map((m) => {
              const modSections = sectionsByModuleId.get(String(m.id)) ?? [];

              // const modulePracticeHref =
              //   `/${encodeURIComponent(locale)}/subjects/${encodeURIComponent(subject.slug)}` +
              //   `/modules/${encodeURIComponent(m.slug)}/practice`;
const modulePracticeHref =
                `/${encodeURIComponent(locale)}/subjects/${encodeURIComponent(subject.slug)}` +
                `/review/${encodeURIComponent(m.slug)}`;

              return (
                <div
                  key={m.slug}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden"
                >
                  <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <div className="text-xs font-extrabold text-white/60">Module</div>
                      <div className="mt-1 text-lg font-black tracking-tight">{m.title}</div>
                      {m.description ? (
                        <div className="mt-2 text-sm text-white/70">{m.description}</div>
                      ) : null}
                      <div className="mt-2 text-xs text-white/50">
                        {m.weekStart != null || m.weekEnd != null ? (
                          <>Weeks {m.weekStart ?? "?"}–{m.weekEnd ?? "?"} • </>
                        ) : null}
                        {m.slug}
                      </div>
                    </div>

                    <Link
                      href={modulePracticeHref}
                      className="inline-flex rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm font-extrabold text-white/90 hover:bg-black/30 transition"
                    >
                      Start module →
                    </Link>
                  </div>

                  {/* Sections */}
                  {modSections.length ? (
                    <div className="border-t border-white/10 p-4 md:p-5">
                      <div className="text-xs font-extrabold text-white/60">Sections</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {modSections.map((s) => {
                          const sectionHref = `${modulePracticeHref}?section=${encodeURIComponent(s.slug)}`;
                          return (
                            <Link
                              key={s.slug}
                              href={sectionHref}
                              className="inline-flex rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm font-extrabold text-white/85 hover:bg-black/30 transition"
                            >
                              {s.title}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:p-5">
            <div className="text-lg font-black tracking-tight">No modules yet</div>
            <div className="mt-2 text-sm text-white/70">
              Seed at least one module for this subject to enable navigation.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
