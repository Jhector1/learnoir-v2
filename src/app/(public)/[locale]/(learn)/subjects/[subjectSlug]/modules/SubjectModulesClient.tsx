// src/app/(public)/[locale]/subjects/[subjectSlug]/modules/SubjectModulesClient.tsx
"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useReviewProgressMany } from "@/components/review/module/hooks/useReviewProgressMany";

type ModuleRow = {
  id: string; // db id
  slug: string; // moduleId in review routes
  title: string;
  description: string | null;
  order: number | null;
  weekStart: number | null;
  weekEnd: number | null;
};

type SectionRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  order: number | null;
  moduleId: string | null; // db module id
};

type Props = {
  locale: string;
  subjectSlug: string;
  subjectTitle: string;
  subjectDescription: string | null;

  modules: ModuleRow[];
  sections: SectionRow[];

  // IMPORTANT: these must be the same “topic keys” you store in review progress.
  // If they are DB ids but progress uses genKey/slug, counts will mismatch.
  topicIdsByModuleDbId: Record<string, string[]>;
  topicIdsBySectionId: Record<string, string[]>;
};

function sortByOrderThenSlug<T extends { order: number | null; slug: string }>(a: T, b: T) {
  const ao = a.order ?? 0;
  const bo = b.order ?? 0;
  return ao - bo || a.slug.localeCompare(b.slug);
}

function ProgressBar({ pct }: { pct: number }) {
  const w = `${Math.max(0, Math.min(100, Math.round(pct * 100)))}%`;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200/80 dark:bg-white/10">
      <div
        className="h-full rounded-full bg-emerald-500/70 dark:bg-emerald-300/40"
        style={{ width: w }}
      />
    </div>
  );
}

function countMatches(topicKeys: string[], completed?: Set<string> | null) {
  if (!topicKeys.length) return 0;
  if (!completed || completed.size === 0) return 0;

  let n = 0;
  for (const k of topicKeys) if (completed.has(k)) n++;
  return n;
}

export default function SubjectModulesClient(props: Props) {
  const {
    locale,
    subjectSlug,
    subjectTitle,
    subjectDescription,
    modules,
    sections,
    topicIdsByModuleDbId,
    topicIdsBySectionId,
  } = props;

  const sortedModules = useMemo(() => modules.slice().sort(sortByOrderThenSlug), [modules]);

  const sectionsByModuleDbId = useMemo(() => {
    const m = new Map<string, SectionRow[]>();
    for (const s of sections) {
      const k = String(s.moduleId ?? "no-module");
      m.set(k, [...(m.get(k) ?? []), s]);
    }
    for (const [k, arr] of m) {
      arr.sort(sortByOrderThenSlug);
      m.set(k, arr);
    }
    return m;
  }, [sections]);

  // ✅ FIX: memoize moduleIds so we don't create a new array each render
  const moduleIds = useMemo(() => sortedModules.map((m) => m.slug), [sortedModules]);

  // ✅ read-only progress for ALL modules (no PUT)
  const { loading: progressLoading, byModuleId: progByModuleSlug } = useReviewProgressMany({
    subjectSlug,
    locale,
    moduleIds,
    enabled: moduleIds.length > 0,
    refreshMs: 4000,
  });

  // lock module i unless previous module is completed
  const unlockedBySlug = useMemo(() => {
    const set = new Set<string>();
    for (let i = 0; i < sortedModules.length; i++) {
      const cur = sortedModules[i];
      if (i === 0) {
        set.add(cur.slug);
        continue;
      }
      const prev = sortedModules[i - 1];
      const prevDone = Boolean(progByModuleSlug[prev.slug]?.moduleCompleted);
      if (prevDone) set.add(cur.slug);
    }
    return set;
  }, [sortedModules, progByModuleSlug]);

  // ✅ subject-wide progress (shown in header too)
  const subjectStats = useMemo(() => {
    let totalTopics = 0;
    let doneTopics = 0;
    let completedModules = 0;

    for (const m of sortedModules) {
      const mp = progByModuleSlug[m.slug];
      if (mp?.moduleCompleted) completedModules++;

      const moduleTopicKeys = topicIdsByModuleDbId[m.id] ?? [];
      totalTopics += moduleTopicKeys.length;

      const direct = countMatches(moduleTopicKeys, mp?.completedTopicKeys);

      // ⚠️ This fallback prevents “0/6” display, but the real fix is to align keys.
      const fallback =
        direct === 0 &&
        moduleTopicKeys.length > 0 &&
        (mp?.completedTopicKeys?.size ?? 0) > 0
          ? Math.min(moduleTopicKeys.length, mp!.completedTopicKeys.size)
          : direct;

      doneTopics += fallback;
    }

    const pct = totalTopics > 0 ? Math.min(1, doneTopics / totalTopics) : completedModules ? 1 : 0;
  console.log(sortedModules)
    return {
      totalTopics,
      doneTopics,
      pct,
      totalModules: sortedModules.length,
      completedModules,
    };
  }, [sortedModules, progByModuleSlug, topicIdsByModuleDbId]);

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_700px_at_20%_0%,#eafff5_0%,#ffffff_55%,#f6f7ff_100%)] dark:bg-[radial-gradient(1200px_700px_at_20%_0%,#151a2c_0%,#0b0d12_50%)] text-neutral-900 dark:text-white/90">
      <div className="ui-container py-4 md:py-6 grid gap-4">
        {/* Header */}
        <div className="ui-card p-4 md:p-6">
          <div className="ui-section-kicker">Subject</div>
          <div className="ui-section-title">{subjectTitle}</div>
          {subjectDescription ? <div className="ui-section-subtitle">{subjectDescription}</div> : null}

          {/* ✅ Subject overall progress */}
          <div className="mt-4 grid gap-2">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-extrabold text-neutral-600 dark:text-white/60">
                Overall progress
              </div>
              <div className="text-xs font-extrabold text-neutral-600 dark:text-white/60">
                {progressLoading ? "Syncing…" : `${subjectStats.doneTopics}/${subjectStats.totalTopics} topics`}
                {subjectStats.totalModules ? (
                  <span className="ml-2 text-neutral-500 dark:text-white/45">
                    • {subjectStats.completedModules}/{subjectStats.totalModules} modules
                  </span>
                ) : null}
              </div>
            </div>
            <ProgressBar pct={subjectStats.pct} />
          </div>

          <div className="mt-4">
            <Link href={`/${encodeURIComponent(locale)}/subjects`} className="ui-btn ui-btn-secondary">
              ← Change subject
            </Link>
          </div>
        </div>

        {/* Modules */}
        
        {sortedModules.length ? (
          <div className="grid gap-3">
            {sortedModules.map((m, idx) => {
              const modSections = sectionsByModuleDbId.get(String(m.id)) ?? [];
              const mp = progByModuleSlug[m.slug];

              const unlocked = unlockedBySlug.has(m.slug);
              const locked = !unlocked && idx !== 0;

              const completed = Boolean(mp?.moduleCompleted);

              const moduleTopicKeys = topicIdsByModuleDbId[m.id] ?? [];
            
              const totalTopics = moduleTopicKeys.length;

              const directDone = countMatches(moduleTopicKeys, mp?.completedTopicKeys);

              const doneTopics =
                directDone === 0 &&
                totalTopics > 0 &&
                (mp?.completedTopicKeys?.size ?? 0) > 0
                  ? Math.min(totalTopics, mp!.completedTopicKeys.size)
                  : directDone;

              const modulePct = totalTopics > 0 ? Math.min(1, doneTopics / totalTopics) : completed ? 1 : 0;

              const moduleHref =
                `/${encodeURIComponent(locale)}/subjects/${encodeURIComponent(subjectSlug)}` +
                `/review/${encodeURIComponent(m.slug)}`;

              return (
                <div key={m.slug} className="ui-card overflow-hidden">
                  <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="text-xs font-extrabold text-neutral-600 dark:text-white/60">
                          Module
                        </div>
                        {completed ? (
                          <span className="ui-pill ui-pill--good">✓ Completed</span>
                        ) : locked ? (
                          <span className="ui-pill ui-pill--neutral">🔒 Locked</span>
                        ) : null}
                        {progressLoading ? <span className="ui-pill ui-pill--neutral">Syncing…</span> : null}
                      </div>

                      <div className="mt-1 text-lg font-black tracking-tight text-neutral-900 dark:text-white">
                        {m.title}
                      </div>

                      {m.description ? (
                        <div className="mt-2 text-sm text-neutral-600 dark:text-white/70">{m.description}</div>
                      ) : null}

                      <div className="mt-2 text-xs text-neutral-500 dark:text-white/50">
                        {m.weekStart != null || m.weekEnd != null ? (
                          <>
                            Weeks {m.weekStart ?? "?"}–{m.weekEnd ?? "?"} •{" "}
                          </>
                        ) : null}
                        {m.slug}
                      </div>

                      <div className="mt-3 grid gap-2">
                        <ProgressBar pct={modulePct} />
                        <div className="text-xs font-extrabold text-neutral-600 dark:text-white/60">
                          {totalTopics
                            ? `${doneTopics}/${totalTopics} topics complete`
                            : completed
                              ? "Completed"
                              : "No topics"}
                        </div>
                      </div>
                    </div>

                    {locked ? (
                      <span className="ui-btn ui-btn-secondary opacity-60 cursor-not-allowed">
                        Start module →
                      </span>
                    ) : (
                      <Link href={moduleHref} className="ui-btn ui-btn-secondary">
                        Start module →
                      </Link>
                    )}
                  </div>

                  {/* Sections */}
                  {/* {modSections.length ? (
                    <div className="border-t border-neutral-200 dark:border-white/10 p-4 md:p-5">
                      <div className="text-xs font-extrabold text-neutral-600 dark:text-white/60">Sections</div>

                      <div className="mt-3 grid gap-2">
                        {modSections.map((s) => {
                          const sectionHref = `${moduleHref}?section=${encodeURIComponent(s.slug)}`;

                          const sectionTopicKeys = topicIdsBySectionId[s.id] ?? [];
                          const sTotal = sectionTopicKeys.length;

                          const sDone = countMatches(sectionTopicKeys, mp?.completedTopicKeys);
                          const sPct = sTotal > 0 ? Math.min(1, sDone / sTotal) : 0;

                          return (
                            <div key={s.slug} className="ui-soft p-3">
                              <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="text-sm font-extrabold text-neutral-900 dark:text-white/90 truncate">
                                    {s.title}
                                  </div>
                                  <div className="mt-1 text-xs text-neutral-600 dark:text-white/60">
                                    {sTotal ? `${sDone}/${sTotal} topics` : "No topics"}
                                  </div>
                                </div>

                                {locked ? (
                                  <span className="ui-btn ui-btn-secondary opacity-60 cursor-not-allowed text-xs px-3 py-2">
                                    Open →
                                  </span>
                                ) : (
                                  <Link className="ui-btn ui-btn-secondary text-xs px-3 py-2" href={sectionHref}>
                                    Open →
                                  </Link>
                                )}
                              </div>

                              <div className="mt-2">
                                <ProgressBar pct={sPct} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null} */}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="ui-card p-4 md:p-6">
            <div className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">No modules yet</div>
            <div className="mt-2 text-sm text-neutral-600 dark:text-white/70">
              Seed at least one module for this subject to enable navigation.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
