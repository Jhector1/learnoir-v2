// src/components/review/module/ReviewModuleView.tsx
"use client";

import React, { useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";

import type { ReviewModule, ReviewCard } from "@/lib/review/types";
import type { SavedQuizState, ReviewProgressState } from "@/lib/review/progressTypes";

import CardRenderer from "@/components/review/module/CardRenderer";
import RingButton from "@/components/review/module/RingButton";

import { useReviewProgress } from "@/components/review/module/hooks/useReviewProgress";
import { useAssignmentStatus } from "@/components/review/module/hooks/useAssignmentStatus";
import { useModuleNav } from "@/components/review/module/hooks/useModuleNav";

import { cn } from "@/lib/cn";

function isTopicComplete(topicCards: ReviewCard[], tstate: any) {
  const cardsDone = tstate?.cardsDone ?? {};
  const quizzesDone = tstate?.quizzesDone ?? {};
  for (const c of topicCards) {
    if (c.type === "quiz") {
      if (!quizzesDone[c.id]) return false;
    } else {
      if (!cardsDone[c.id]) return false;
    }
  }
  return true;
}

function prereqsMetForQuiz(cards: ReviewCard[], tp: any, quizCardId: string) {
  const idx = cards.findIndex((c) => c.id === quizCardId);
  const prereqCards = idx >= 0 ? cards.slice(0, idx).filter((c) => c.type !== "quiz") : [];
  console.log("bfbfhfhfh",tp?.cardsDone);
  return prereqCards.every((c) => Boolean(tp?.cardsDone?.[c.id]));
}

export default function ReviewModuleView({
  mod,
  onModuleCompleteChange,
}: {
  mod: ReviewModule;
  onModuleCompleteChange?: (done: boolean) => void;
}) {
  const params = useParams<{ locale: string; subjectSlug: string; moduleId: string }>();
  const router = useRouter();

  const locale = params?.locale ?? "en";
  const subjectSlug = params?.subjectSlug ?? "";
  const moduleId = params?.moduleId ?? "";

  const topics = Array.isArray(mod?.topics) ? mod.topics : [];
  const firstTopicId = topics[0]?.id ?? "";

  const {
    hydrated: progressHydrated,
    progress,
    setProgress,
    activeTopicId,
    setActiveTopicId,
    viewTopicId,
    setViewTopicId,
    flushNow,
  } = useReviewProgress({ subjectSlug, moduleId, locale, firstTopicId });

  const viewTopic = useMemo(
    () => topics.find((t) => t.id === viewTopicId) ?? topics[0] ?? null,
    [topics, viewTopicId],
  );

  const viewCards = Array.isArray(viewTopic?.cards) ? viewTopic!.cards : [];
  const viewTid = viewTopic?.id ?? firstTopicId ?? "";

  const viewProg: any = (progress as any)?.topics?.[viewTid] ?? {};

  const moduleV = (progress as any)?.quizVersion ?? 0;
  const topicV = (viewProg as any)?.quizVersion ?? 0;
  const versionStr = `${moduleV}.${topicV}`;
  const topicRenderKey = `${viewTid}:${versionStr}`;

  const activeIdx = useMemo(() => topics.findIndex((t) => t.id === activeTopicId), [topics, activeTopicId]);

  const topicUnlocked = useMemo(() => {
    return (tid: string) => {
      const idx = topics.findIndex((x) => x.id === tid);
      if (idx <= 0) return true;
      const prev = topics[idx - 1];
      const prevState = (progress as any)?.topics?.[prev.id];
      return isTopicComplete(prev.cards ?? [], prevState);
    };
  }, [topics, progress]);

  const moduleComplete = useMemo(() => {
    if (!topics.length) return false;
    return topics.every((t) => {
      const cards = Array.isArray(t.cards) ? t.cards : [];
      const tstate = (progress as any)?.topics?.[t.id];
      return isTopicComplete(cards, tstate);
    });
  }, [topics, progress]);

  useEffect(() => {
    onModuleCompleteChange?.(moduleComplete || Boolean((progress as any)?.moduleCompleted));
  }, [moduleComplete, progress, onModuleCompleteChange]);

  // ✅ mark module complete once
  useEffect(() => {
    if (!progressHydrated) return;
    if (!moduleComplete) return;
    if ((progress as any)?.moduleCompleted) return;

    const nowIso = new Date().toISOString();
    const next: ReviewProgressState = { ...(progress as any), moduleCompleted: true, moduleCompletedAt: nowIso };

    setProgress(next);
    flushNow(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleComplete, progressHydrated]);

  // ✅ mark topic complete once (used for section/module progress bars on previous page)
  useEffect(() => {
    if (!progressHydrated) return;
    if (!viewTid) return;

    const doneNow = isTopicComplete(viewCards, (progress as any)?.topics?.[viewTid]);
    if (!doneNow) return;

    const tp: any = (progress as any)?.topics?.[viewTid] ?? {};
    if (tp.completed) return;

    const nowIso = new Date().toISOString();

    setProgress((p: any) => {
      const cur = p?.topics?.[viewTid] ?? {};
      if (cur.completed) return p;
      return {
        ...p,
        topics: {
          ...(p.topics ?? {}),
          [viewTid]: { ...cur, completed: true, completedAt: cur.completedAt ?? nowIso },
        },
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressHydrated, viewTid, viewCards, progress]);

  // ---------------- Assignment ----------------
  const assignmentSessionId = (progress as any)?.assignmentSessionId
    ? String((progress as any).assignmentSessionId)
    : null;

  const { status: assignmentStatus, complete: assignmentDone, pct: assignmentPct } = useAssignmentStatus({
    sessionId: assignmentSessionId,
    enabled: progressHydrated,
  });

  const assignmentLabel =
    assignmentStatus.phase === "complete"
      ? "✓ Assignment complete"
      : assignmentStatus.phase === "in_progress"
        ? "Assignment in progress"
        : "Start module assignment";

  const assignmentSublabel =
    assignmentStatus.phase === "in_progress"
      ? `${assignmentStatus.answeredCount}/${assignmentStatus.targetCount} questions`
      : assignmentStatus.phase === "complete"
        ? `${assignmentStatus.answeredCount}/${assignmentStatus.targetCount} questions`
        : undefined;

  // ---------------- Nav ----------------
  const nav = useModuleNav({ subjectSlug, moduleId });
  const canGoNextModule =
    (moduleComplete || Boolean((progress as any)?.moduleCompleted)) && assignmentDone;

  async function handleAssignmentClick() {
    const returnToCurrentModule =
      `/${encodeURIComponent(locale)}/subjects/${encodeURIComponent(subjectSlug)}/review/${encodeURIComponent(moduleId)}`;

    if (assignmentSessionId && assignmentStatus.phase !== "idle") {
      router.push(
        `/subjects/${encodeURIComponent(subjectSlug)}/modules/${encodeURIComponent(moduleId)}/practice` +
          `?sessionId=${encodeURIComponent(assignmentSessionId)}` +
          `&returnTo=${encodeURIComponent(returnToCurrentModule)}`,
      );
      return;
    }

    const moduleSlug = (mod as any).practiceSectionSlug ?? moduleId;

    const r = await fetch(`/api/modules/${encodeURIComponent(moduleSlug)}/practice/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ returnUrl: returnToCurrentModule }),
    });

    const data = await r.json().catch(() => null);

    if (!r.ok) {
      alert(data?.message ?? "Unable to start.");
      return;
    }

    const newSid = String(data.sessionId);

    const next: ReviewProgressState = { ...(progress as any), assignmentSessionId: newSid as any };
    setProgress(next);
    flushNow(next);

    router.push(
      `/subjects/${encodeURIComponent(subjectSlug)}/modules/${encodeURIComponent(moduleId)}/practice` +
        `?sessionId=${encodeURIComponent(newSid)}` +
        `&returnTo=${encodeURIComponent(returnToCurrentModule)}`,
    );
  }

  async function resetModule() {
    if (!window.confirm("Reset the entire module? This cannot be undone.")) return;

    const fallback = firstTopicId || "";
    const nextModuleV = ((progress as any)?.quizVersion ?? 0) + 1;

    const next: ReviewProgressState = {
      quizVersion: nextModuleV,
      topics: {},
      activeTopicId: fallback as any,
      moduleCompleted: false,
      moduleCompletedAt: undefined,
    } as any;

    setProgress(next);
    setActiveTopicId(fallback);
    setViewTopicId(fallback);
    flushNow(next);
  }

  async function resetTopic(tid: string) {
    if (!tid) return;
    if (!window.confirm("Reset this topic? This cannot be undone.")) return;

    setProgress((p: any) => {
      const nextTopics = { ...(p.topics ?? {}) };
      const cur = nextTopics[tid] ?? {};
      const nextTopicV = (cur.quizVersion ?? 0) + 1;

      nextTopics[tid] = {
        quizVersion: nextTopicV,
        cardsDone: {},
        quizzesDone: {},
        quizState: {},
        completed: false,
        completedAt: undefined,
      };

      const next = { ...p, topics: nextTopics };
      flushNow(next);
      return next;
    });
  }

  if (!topics.length) {
    return <div className="p-6 text-sm text-neutral-600 dark:text-white/70">This module has no topics yet.</div>;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_700px_at_20%_0%,#eafff5_0%,#ffffff_55%,#f6f7ff_100%)] dark:bg-[radial-gradient(1200px_700px_at_20%_0%,#151a2c_0%,#0b0d12_50%)] text-neutral-900 dark:text-white/90">
      <div className="ui-container py-4 md:py-6 grid gap-4 md:grid-cols-[280px_1fr]">
        {/* sidebar */}
        <aside className="ui-card p-3 md:sticky md:top-4 h-fit">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">
                {mod.title}
              </div>
              {mod.subtitle ? (
                <div className="mt-1 text-sm text-neutral-600 dark:text-white/60">{mod.subtitle}</div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={resetModule}
              className={cn(
                "ui-btn ui-btn-secondary",
                "px-3 py-2 text-[11px] font-extrabold",
                "text-rose-700 dark:text-rose-200",
              )}
              title="Reset all progress in this module"
            >
              Reset
            </button>
          </div>

          <div className="mt-4 grid gap-2">
            {topics.map((t) => {
              const idx = topics.findIndex((x) => x.id === t.id);
              const isEarlierOrActive = idx <= activeIdx;
              const canGoForward = topicUnlocked(t.id);
              const disabled = !isEarlierOrActive && !canGoForward;

              const doneTopic = isTopicComplete(t.cards ?? [], (progress as any)?.topics?.[t.id]);
              const isViewing = viewTopicId === t.id;
              const isActive = activeTopicId === t.id;

              return (
                <button
                  key={t.id}
                  disabled={disabled}
                  onClick={() => {
                    if (disabled) return;
                    if (idx <= activeIdx) {
                      setViewTopicId(t.id);
                      return;
                    }
                    setActiveTopicId(t.id);
                    setViewTopicId(t.id);
                  }}
                  className={cn(
                    "w-full text-left rounded-xl border px-3 py-2 transition",
                    disabled && "opacity-60 cursor-not-allowed",
                    isViewing
                      ? "border-emerald-600/25 bg-emerald-500/10 dark:border-emerald-300/30 dark:bg-emerald-300/10"
                      : "border-neutral-200 bg-white hover:bg-neutral-50 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-extrabold">{t.label}</div>

                    <div className="flex items-center gap-2">
                      {isActive ? <span className="ui-pill ui-pill--neutral">CURRENT</span> : null}
                      {doneTopic ? (
                        <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-300/80">✓</span>
                      ) : null}
                    </div>
                  </div>

                  {t.summary ? (
                    <div className="mt-1 text-xs text-neutral-600 dark:text-white/55">{t.summary}</div>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="mt-3">
            <RingButton
              pct={assignmentPct}
              label={assignmentLabel}
              sublabel={assignmentSublabel}
              onClick={handleAssignmentClick}
              disabled={false}
            />
          </div>
        </aside>

        {/* main */}
        <main className="ui-card p-4 md:p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-sm font-black text-neutral-600 dark:text-white/60">Topic</div>
              <div className="text-xl font-black text-neutral-900 dark:text-white">{viewTopic?.label}</div>
              {viewTopic?.summary ? (
                <div className="mt-1 text-sm text-neutral-600 dark:text-white/60">{viewTopic.summary}</div>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <button type="button" onClick={() => resetTopic(viewTid)} className="ui-btn ui-btn-secondary text-xs font-extrabold">
                Reset topic
              </button>

              <button
                type="button"
                disabled={!nav?.prevModuleId}
                onClick={() => {
                  if (!nav?.prevModuleId) return;
                  router.push(
                    `/${encodeURIComponent(locale)}/subjects/${encodeURIComponent(subjectSlug)}/review/${encodeURIComponent(nav.prevModuleId)}`,
                  );
                }}
                className={cn("ui-btn ui-btn-secondary text-xs font-extrabold", !nav?.prevModuleId && "opacity-50 cursor-not-allowed")}
              >
                ← Prev
              </button>

              <button
                type="button"
                disabled={!nav?.nextModuleId || !canGoNextModule}
                onClick={() => {
                  if (!nav?.nextModuleId || !canGoNextModule) return;
                  router.push(
                    `/${encodeURIComponent(locale)}/subjects/${encodeURIComponent(subjectSlug)}/review/${encodeURIComponent(nav.nextModuleId)}`,
                  );
                  router.refresh();
                }}
                className={cn("ui-btn ui-btn-secondary text-xs font-extrabold", (!nav?.nextModuleId || !canGoNextModule) && "opacity-50 cursor-not-allowed")}
              >
                Next →
              </button>
            </div>
          </div>

          {!progressHydrated ? (
            <div className="mt-4 text-xs text-neutral-600 dark:text-white/60">Loading your saved progress…</div>
          ) : null}

          <div key={topicRenderKey} className="mt-4 grid gap-3">

            {viewCards.map((card) => {
             
              const tp: any = (progress as any)?.topics?.[viewTid] ?? {};
               console.log(9000, progress, tp)
              const done =
                card.type === "quiz"
                  ? Boolean(tp?.quizzesDone?.[card.id])
                  : Boolean(tp?.cardsDone?.[card.id]);

              const savedQuiz = (tp?.quizState?.[card.id] ?? null) as SavedQuizState | null;
              const prereqsMet = card.type === "quiz" ? prereqsMetForQuiz(viewCards, tp, card.id) : true;

              return (
                <CardRenderer
                  key={card.id}
                  card={card}
                  done={done}
                  prereqsMet={prereqsMet}
                  progressHydrated={progressHydrated}
                  savedQuiz={progressHydrated ? savedQuiz : null}
                  versionStr={versionStr}
                  onMarkDone={() => {
                    setProgress((p: any) => {
                      const tid = viewTid;
                      const tp0: any = p.topics?.[tid] ?? {};
                      const cardsDone = { ...(tp0.cardsDone ?? {}), [card.id]: true };
                      return { ...p, topics: { ...(p.topics ?? {}), [tid]: { ...tp0, cardsDone } } };
                    });
                  }}
                  onQuizPass={(quizId) => {
                    setProgress((p: any) => {
                      const tid = viewTid;
                      const tp0: any = p.topics?.[tid] ?? {};
                      const quizzesDone = { ...(tp0.quizzesDone ?? {}), [quizId]: true };
                      return { ...p, topics: { ...(p.topics ?? {}), [tid]: { ...tp0, quizzesDone } } };
                    });
                  }}
                  onQuizStateChange={(quizCardId, s) => {
                    setProgress((p: any) => {
                      const tid = viewTid;
                      const tp0: any = p.topics?.[tid] ?? {};
                      const quizState = { ...(tp0.quizState ?? {}), [quizCardId]: s };
                      return { ...p, topics: { ...(p.topics ?? {}), [tid]: { ...tp0, quizState } } };
                    });
                  }}
                  onQuizReset={(quizCardId) => {
                    setProgress((p: any) => {
                      const tid = viewTid;
                      const tp0: any = p.topics?.[tid] ?? {};

                      const nextQuizState = { ...(tp0.quizState ?? {}) };
                      delete nextQuizState[quizCardId];

                      const nextQuizzesDone = { ...(tp0.quizzesDone ?? {}) };
                      delete nextQuizzesDone[quizCardId];

                      return {
                        ...p,
                        topics: {
                          ...(p.topics ?? {}),
                          [tid]: { ...tp0, quizState: nextQuizState, quizzesDone: nextQuizzesDone },
                        },
                      };
                    });
                  }}
                />
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
