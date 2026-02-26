// src/app/(public)/[locale]/subjects/[subjectSlug]/modules/SubjectModulesClient.tsx
"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useReviewProgressMany } from "@/components/review/module/hooks/useReviewProgressMany";
import { ROUTES } from "@/utils";

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

  // ✅ NEW: server-controlled unlock (teacher/admin)
  canUnlockAll?: boolean;
};

function sortByOrderThenSlug<T extends { order: number | null; slug: string }>(
    a: T,
    b: T,
) {
  const ao = a.order ?? 0;
  const bo = b.order ?? 0;
  return ao - bo || a.slug.localeCompare(b.slug);
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function ProgressBar({ pct, label }: { pct: number; label?: React.ReactNode }) {
  const w = `${Math.round(clamp01(pct) * 100)}%`;

  return (
      <div className="grid gap-1.5">
        {label ? (
            <div className="flex items-center justify-between text-[11px] font-extrabold tracking-wide text-neutral-600 dark:text-white/60">
              {label}
              <span className="tabular-nums text-neutral-500 dark:text-white/45">
            {w}
          </span>
            </div>
        ) : null}

        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200/80 dark:bg-white/10">
          <div
              className={cn(
                  "h-full rounded-full",
                  "bg-gradient-to-r from-emerald-400/80 via-emerald-500/70 to-teal-400/70",
                  "dark:from-emerald-200/40 dark:via-emerald-300/30 dark:to-teal-200/30",
                  "shadow-[0_0_0_1px_rgba(16,185,129,0.15)] dark:shadow-[0_0_0_1px_rgba(110,231,183,0.12)]",
              )}
              style={{ width: w }}
          />
        </div>
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

function Kicker({ children }: { children: React.ReactNode }) {
  return (
      <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-neutral-500 dark:text-white/45">
        {children}
      </div>
  );
}

function Pill({
                variant,
                children,
              }: {
  variant: "good" | "neutral" | "warn";
  children: React.ReactNode;
}) {
  const cls =
      variant === "good"
          ? "bg-emerald-500/12 text-emerald-800 ring-1 ring-emerald-500/20 dark:bg-emerald-300/10 dark:text-emerald-200 dark:ring-emerald-200/15"
          : variant === "warn"
              ? "bg-amber-500/12 text-amber-800 ring-1 ring-amber-500/20 dark:bg-amber-300/10 dark:text-amber-200 dark:ring-amber-200/15"
              : "bg-neutral-500/10 text-neutral-700 ring-1 ring-neutral-500/15 dark:bg-white/8 dark:text-white/70 dark:ring-white/10";

  return (
      <span
          className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-extrabold",
              cls,
          )}
      >
      {children}
    </span>
  );
}

function IconCircle({ idx }: { idx: number }) {
  return (
      <div
          className={cn(
              "h-9 w-9 rounded-xl grid place-items-center font-black tabular-nums",
              "bg-white/70 ring-1 ring-black/5 shadow-sm",
              "dark:bg-white/5 dark:ring-white/10 dark:shadow-none",
          )}
          aria-hidden
      >
        {idx + 1}
      </div>
  );
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
    // topicIdsBySectionId, // (not used here yet, keep prop for future)
    canUnlockAll = false,
  } = props;

  const unlockAll = Boolean(canUnlockAll);

  const sortedModules = useMemo(
      () => modules.slice().sort(sortByOrderThenSlug),
      [modules],
  );

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

  const moduleIds = useMemo(() => sortedModules.map((m) => m.slug), [sortedModules]);

  const { loading: progressLoading, byModuleId: progByModuleSlug } =
      useReviewProgressMany({
        subjectSlug,
        locale,
        moduleIds,
        enabled: moduleIds.length > 0,
        refreshMs: 0,
      });

  // ✅ lock module i unless previous module is completed (unless unlockAll)
  const unlockedBySlug = useMemo(() => {
    const set = new Set<string>();

    if (unlockAll) {
      for (const m of sortedModules) set.add(m.slug);
      return set;
    }

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
  }, [sortedModules, progByModuleSlug, unlockAll]);

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

      // Fallback for mismatched keysets (keeps UI from looking broken)
      const fallback =
          direct === 0 &&
          moduleTopicKeys.length > 0 &&
          (mp?.completedTopicKeys?.size ?? 0) > 0
              ? Math.min(moduleTopicKeys.length, mp!.completedTopicKeys.size)
              : direct;

      doneTopics += fallback;
    }

    const pct =
        totalTopics > 0 ? clamp01(doneTopics / totalTopics) : completedModules ? 1 : 0;

    return {
      totalTopics,
      doneTopics,
      pct,
      totalModules: sortedModules.length,
      completedModules,
    };
  }, [sortedModules, progByModuleSlug, topicIdsByModuleDbId]);

  const backHref = `/${encodeURIComponent(locale)}/subjects`;

  return (
      <div
          className={cn(
              "min-h-screen text-neutral-900 dark:text-white/90",
              "bg-[radial-gradient(1200px_700px_at_20%_0%,#eafff5_0%,#ffffff_52%,#f6f7ff_100%)]",
              "dark:bg-[radial-gradient(1200px_700px_at_20%_0%,#151a2c_0%,#0b0d12_52%)]",
          )}
      >
        <div
            className={cn(
                "pointer-events-none absolute inset-x-0 top-0 h-48",
                "bg-[linear-gradient(90deg,rgba(16,185,129,0.10),rgba(59,130,246,0.06),rgba(236,72,153,0.05))]",
                "dark:bg-[linear-gradient(90deg,rgba(110,231,183,0.08),rgba(147,197,253,0.05),rgba(251,113,133,0.04))]",
                "opacity-70 blur-2xl",
            )}
            aria-hidden
        />

        <div className="ui-container py-5 md:py-8 grid gap-4 md:gap-5 relative">
          {/* Header card */}
          <div
              className={cn(
                  "rounded-3xl p-4 md:p-6",
                  "bg-white/70 ring-1 ring-black/5 shadow-[0_14px_50px_-20px_rgba(0,0,0,0.25)]",
                  "backdrop-blur-xl",
                  "dark:bg-white/[0.06] dark:ring-white/10 dark:shadow-none",
              )}
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Kicker>Subject</Kicker>
                  {unlockAll ? <Pill variant="warn">UNLOCK ENABLED</Pill> : null}
                </div>

                <div className="mt-1 text-2xl md:text-3xl font-black tracking-tight">
                  {subjectTitle}
                </div>

                {subjectDescription ? (
                    <div className="mt-2 text-sm md:text-base text-neutral-600 dark:text-white/70">
                      {subjectDescription}
                    </div>
                ) : null}

                <div className="mt-4">
                  <ProgressBar
                      pct={subjectStats.pct}
                      label={
                        <>
                          <span>Overall progress</span>
                          <span className="tabular-nums">
                        {progressLoading
                            ? "Syncing…"
                            : `${subjectStats.doneTopics}/${subjectStats.totalTopics} topics`}
                            {subjectStats.totalModules ? (
                                <span className="ml-2 text-neutral-500 dark:text-white/45">
                            • {subjectStats.completedModules}/{subjectStats.totalModules} modules
                          </span>
                            ) : null}
                      </span>
                        </>
                      }
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 md:pt-1">
                <Link
                    href={backHref}
                    className={cn(
                        "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-extrabold",
                        "bg-neutral-900 text-white shadow-sm hover:shadow-md active:scale-[0.99]",
                        "dark:bg-white/10 dark:text-white/90 dark:hover:bg-white/12",
                        "transition",
                    )}
                >
                  ← Change subject
                </Link>
              </div>
            </div>
          </div>

          {/* Modules list */}
          {sortedModules.length ? (
              <div className="grid gap-3 md:gap-4">
                {sortedModules.map((m, idx) => {
                  const modSections = sectionsByModuleDbId.get(String(m.id)) ?? [];
                  const mp = progByModuleSlug[m.slug];

                  const unlocked = unlockedBySlug.has(m.slug);
                  const locked = !unlockAll && !unlocked && idx !== 0;

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

                  const modulePct =
                      totalTopics > 0 ? clamp01(doneTopics / totalTopics) : completed ? 1 : 0;

                  const hasAnyProgress =
                      (mp?.completedTopicKeys?.size ?? 0) > 0 || doneTopics > 0;
                  const ctaLabel = completed
                      ? "Review module →"
                      : hasAnyProgress
                          ? "Continue →"
                          : "Start module →";

                  const moduleHref = `/${encodeURIComponent(locale)}/${ROUTES.moduleIntro(
                      encodeURIComponent(subjectSlug),
                      encodeURIComponent(m.slug),
                  )}`;

                  return (
                      <div
                          key={m.slug}
                          className={cn(
                              "group relative overflow-hidden rounded-3xl",
                              "bg-white/70 ring-1 ring-black/5 shadow-[0_16px_55px_-26px_rgba(0,0,0,0.25)]",
                              "backdrop-blur-xl",
                              "dark:bg-white/[0.06] dark:ring-white/10 dark:shadow-none",
                              "transition-transform duration-200",
                              !locked && "hover:-translate-y-[2px]",
                          )}
                      >
                        <div
                            className={cn(
                                "pointer-events-none absolute -inset-24 opacity-0 group-hover:opacity-100 transition-opacity",
                                "bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.14),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(59,130,246,0.10),transparent_55%)]",
                                "dark:bg-[radial-gradient(circle_at_20%_20%,rgba(110,231,183,0.10),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(147,197,253,0.07),transparent_55%)]",
                            )}
                            aria-hidden
                        />

                        <div className="relative p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="min-w-0 flex gap-3">
                            <IconCircle idx={idx} />

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <Kicker>Module</Kicker>

                                {completed ? (
                                    <Pill variant="good">✓ Completed</Pill>
                                ) : locked ? (
                                    <Pill variant="neutral">🔒 Locked</Pill>
                                ) : hasAnyProgress ? (
                                    <Pill variant="warn">↻ In progress</Pill>
                                ) : (
                                    <Pill variant="neutral">• Not started</Pill>
                                )}

                                {progressLoading ? <Pill variant="neutral">Syncing…</Pill> : null}
                              </div>

                              <div className="mt-1 text-lg md:text-xl font-black tracking-tight">
                                {m.title}
                              </div>

                              {m.description ? (
                                  <div className="mt-2 text-sm text-neutral-600 dark:text-white/70">
                                    {m.description}
                                  </div>
                              ) : null}

                              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-semibold text-neutral-500 dark:text-white/45">
                                {m.weekStart != null || m.weekEnd != null ? (
                                    <span className="inline-flex items-center gap-1">
                              <span className="opacity-70">Weeks</span>
                              <span className="tabular-nums">
                                {m.weekStart ?? "?"}–{m.weekEnd ?? "?"}
                              </span>
                            </span>
                                ) : null}

                                {modSections.length ? (
                                    <span className="inline-flex items-center gap-1">
                              <span className="opacity-70">Sections</span>
                              <span className="tabular-nums">{modSections.length}</span>
                            </span>
                                ) : null}

                                {totalTopics ? (
                                    <span className="inline-flex items-center gap-1">
                              <span className="opacity-70">Topics</span>
                              <span className="tabular-nums">
                                {doneTopics}/{totalTopics}
                              </span>
                            </span>
                                ) : (
                                    <span className="opacity-70">No topics</span>
                                )}

                                <span className="opacity-60">•</span>
                                <span className="font-mono text-[11px] opacity-70">{m.slug}</span>
                              </div>

                              <div className="mt-3">
                                <ProgressBar
                                    pct={modulePct}
                                    label={
                                      <span className="inline-flex items-center gap-2">
                                <span>
                                  {totalTopics
                                      ? `${doneTopics}/${totalTopics} topics complete`
                                      : completed
                                          ? "Completed"
                                          : "No topics"}
                                </span>
                              </span>
                                    }
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 md:pl-4">
                            {locked ? (
                                <span
                                    className={cn(
                                        "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-extrabold",
                                        "bg-neutral-900/10 text-neutral-600 ring-1 ring-black/5",
                                        "dark:bg-white/6 dark:text-white/55 dark:ring-white/10",
                                        "opacity-80 cursor-not-allowed select-none",
                                    )}
                                >
                          {ctaLabel}
                        </span>
                            ) : (
                                <Link
                                    href={moduleHref}
                                    className={cn(
                                        "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-extrabold",
                                        "bg-neutral-900 text-white shadow-sm hover:shadow-md active:scale-[0.99]",
                                        "dark:bg-white/10 dark:text-white/90 dark:hover:bg-white/12",
                                        "transition",
                                    )}
                                >
                                  {ctaLabel}
                                </Link>
                            )}
                          </div>
                        </div>

                        <div className="h-px w-full bg-black/5 dark:bg-white/10" aria-hidden />
                      </div>
                  );
                })}
              </div>
          ) : (
              <div
                  className={cn(
                      "rounded-3xl p-4 md:p-6",
                      "bg-white/70 ring-1 ring-black/5 shadow-[0_14px_50px_-20px_rgba(0,0,0,0.25)]",
                      "backdrop-blur-xl",
                      "dark:bg-white/[0.06] dark:ring-white/10 dark:shadow-none",
                  )}
              >
                <div className="text-lg font-black tracking-tight">No modules yet</div>
                <div className="mt-2 text-sm text-neutral-600 dark:text-white/70">
                  Seed at least one module for this subject to enable navigation.
                </div>
              </div>
          )}
        </div>
      </div>
  );
}
