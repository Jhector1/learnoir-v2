// src/components/review/module/ReviewModuleView.tsx
"use client";

import React, { useMemo, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";

import type { ReviewModule, ReviewCard } from "@/lib/review/types";
import type {
  SavedQuizState,
  ReviewProgressState,
} from "@/lib/review/progressTypes";

import CardRenderer from "@/components/review/module/CardRenderer";
import RingButton from "@/components/review/module/RingButton";

import { useReviewProgress } from "@/components/review/module/hooks/useReviewProgress";
import { useAssignmentStatus } from "@/components/review/module/hooks/useAssignmentStatus";
import { useModuleNav } from "@/components/review/module/hooks/useModuleNav";

import { cn } from "@/lib/cn";
import ConfirmResetModal from "../practice/ConfirmResetModal";
import { ROUTES } from "@/utils";

// -----------------------------
// helpers
// -----------------------------
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
  const prereqCards =
      idx >= 0 ? cards.slice(0, idx).filter((c) => c.type !== "quiz") : [];
  return prereqCards.every((c) => Boolean(tp?.cardsDone?.[c.id]));
}

function countAnswered(cards: ReviewCard[], tstate: any) {
  let answered = 0;
  for (const c of cards) {
    const done =
        c.type === "quiz"
            ? Boolean(tstate?.quizzesDone?.[c.id])
            : Boolean(tstate?.cardsDone?.[c.id]);
    if (done) answered++;
  }
  return { answeredCount: answered, sessionSize: cards.length };
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function TopicShell({
                      title,
                      subtitle,
                      right,
                      children,
                    }: {
  title: string;
  subtitle?: string | null;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
      <div className="ui-card p-4 md:p-5">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-black text-neutral-600 dark:text-white/60">
              Topic
            </div>
            <div className="text-xl font-black text-neutral-900 dark:text-white truncate">
              {title}
            </div>
            {subtitle ? (
                <div className="mt-1 text-sm text-neutral-600 dark:text-white/60">
                  {subtitle}
                </div>
            ) : null}
          </div>
          {right ? (
              <div className="shrink-0 flex items-center gap-2">{right}</div>
          ) : null}
        </div>

        <div className="mt-4 grid gap-3">{children}</div>
      </div>
  );
}

function BannerCard({
                      title,
                      body,
                      tone = "neutral",
                      actions,
                    }: {
  title: string;
  body?: React.ReactNode;
  tone?: "neutral" | "good";
  actions?: React.ReactNode;
}) {
  const toneCls =
      tone === "good"
          ? "border-emerald-600/25 bg-emerald-500/10 dark:border-emerald-300/30 dark:bg-emerald-300/10"
          : "border-neutral-200 bg-white dark:border-white/10 dark:bg-white/[0.04]";

  return (
      <div className={cn("rounded-2xl border p-4 md:p-5", toneCls)}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="text-sm font-black text-neutral-900 dark:text-white">
              {title}
            </div>
            {body ? (
                <div className="mt-1 text-sm text-neutral-700 dark:text-white/70">
                  {body}
                </div>
            ) : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      </div>
  );
}

// -----------------------------
// NEW: topic intro/outro meta
// -----------------------------
function TopicIntro({ topic }: { topic: any }) {
  const intro = topic?.intro ?? null;
  const bullets: string[] = intro?.bullets ?? [];

  return (
      <BannerCard
          title={intro?.title ?? "Quick intro"}
          body={
            <div className="grid gap-2">
              <div>{intro?.body ?? "Here’s what to focus on before you start."}</div>
              {bullets.length ? (
                  <ul className="mt-1 grid gap-1 text-sm">
                    {bullets.map((b) => (
                        <li key={b} className="flex gap-2">
                          <span className="mt-[2px]">✓</span>
                          <span>{b}</span>
                        </li>
                    ))}
                  </ul>
              ) : null}
            </div>
          }
      />
  );
}

function TopicOutro({
                      topic,
                      onContinue,
                    }: {
  topic: any;
  onContinue?: () => void;
}) {
  const outro = topic?.outro ?? null;
  const bullets: string[] = outro?.bullets ?? [];

  return (
      <BannerCard
          tone="good"
          title={outro?.title ?? "Nice — topic complete"}
          body={
            <div className="grid gap-2">
              <div>
                {outro?.body ??
                    "You finished everything in this topic. You can move on or review anything you want."}
              </div>
              {bullets.length ? (
                  <ul className="mt-1 grid gap-1 text-sm">
                    {bullets.map((b) => (
                        <li key={b} className="flex gap-2">
                          <span className="mt-[2px]">•</span>
                          <span>{b}</span>
                        </li>
                    ))}
                  </ul>
              ) : null}
            </div>
          }
          actions={
            onContinue ? (
                <button
                    type="button"
                    onClick={onContinue}
                    className={cn("ui-btn ui-btn-primary", "px-4 py-2 text-sm font-extrabold")}
                >
                  Next topic →
                </button>
            ) : null
          }
      />
  );
}

export default function ReviewModuleView({
                                           mod,
                                           onModuleCompleteChange,
                                           canUnlockAll = false,
                                         }: {
  mod: ReviewModule;
  onModuleCompleteChange?: (done: boolean) => void;

  // ✅ server-controlled "staff unlock" (teacher/admin)
  canUnlockAll?: boolean;
}) {
  const params = useParams<{
    locale: string;
    subjectSlug: string;
    moduleSlug: string;
  }>();
  const router = useRouter();

  const locale = params?.locale ?? "en";
  const subjectSlug = params?.subjectSlug ?? "";
  const moduleId = params?.moduleSlug ?? "";

  // ✅ no env, no URL param; server decides
  const unlockAll = Boolean(canUnlockAll);

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

  const activeIdx = useMemo(
      () => topics.findIndex((t) => t.id === activeTopicId),
      [topics, activeTopicId],
  );

  const topicUnlocked = useMemo(() => {
    return (tid: string) => {
      if (unlockAll) return true;
      const idx = topics.findIndex((x) => x.id === tid);
      if (idx <= 0) return true;
      const prev = topics[idx - 1];
      const prevState = (progress as any)?.topics?.[prev.id];
      return isTopicComplete(prev.cards ?? [], prevState);
    };
  }, [topics, progress, unlockAll]);

  const moduleComplete = useMemo(() => {
    if (!topics.length) return false;
    return topics.every((t) => {
      const cards = Array.isArray(t.cards) ? t.cards : [];
      const tstate = (progress as any)?.topics?.[t.id];
      return isTopicComplete(cards, tstate);
    });
  }, [topics, progress]);

  useEffect(() => {
    onModuleCompleteChange?.(
        moduleComplete || Boolean((progress as any)?.moduleCompleted),
    );
  }, [moduleComplete, progress, onModuleCompleteChange]);

  // ✅ mark module complete once
  useEffect(() => {
    if (!progressHydrated) return;
    if (!moduleComplete) return;
    if ((progress as any)?.moduleCompleted) return;

    const nowIso = new Date().toISOString();
    const next: ReviewProgressState = {
      ...(progress as any),
      moduleCompleted: true,
      moduleCompletedAt: nowIso,
    };

    setProgress(next);
    flushNow(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleComplete, progressHydrated]);

  // ✅ mark topic complete once
  useEffect(() => {
    if (!progressHydrated) return;
    if (!viewTid) return;

    const doneNow = isTopicComplete(
        viewCards,
        (progress as any)?.topics?.[viewTid],
    );
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
          [viewTid]: {
            ...cur,
            completed: true,
            completedAt: cur.completedAt ?? nowIso,
          },
        },
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressHydrated, viewTid, viewCards, progress]);

  // ---------------- Assignment ----------------
  const assignmentSessionId = (progress as any)?.assignmentSessionId
      ? String((progress as any).assignmentSessionId)
      : null;

  const {
    status: assignmentStatus,
    complete: assignmentDone,
    pct: assignmentPct,
  } = useAssignmentStatus({
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
      unlockAll ||
      ((moduleComplete || Boolean((progress as any)?.moduleCompleted)) &&
          assignmentDone);

  async function handleAssignmentClick() {
    const returnToCurrentModule = `/${ROUTES.learningPath(
        encodeURIComponent(subjectSlug),
        encodeURIComponent(moduleId),
    )}`;

    if (assignmentSessionId && assignmentStatus.phase !== "idle") {
      router.push(
          `/${ROUTES.practicePath(
              encodeURIComponent(subjectSlug),
              encodeURIComponent(moduleId),
          )}` +
          `?sessionId=${encodeURIComponent(assignmentSessionId)}` +
          `&returnTo=${encodeURIComponent(returnToCurrentModule)}`,
      );
      return;
    }

    const moduleSlug = (mod as any).practiceSectionSlug ?? moduleId;

    const r = await fetch(
        `/api/modules/${encodeURIComponent(moduleSlug)}/practice/start`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ returnUrl: returnToCurrentModule }),
        },
    );

    const data = await r.json().catch(() => null);

    if (!r.ok) {
      alert(data?.message ?? "Unable to start.");
      return;
    }

    const newSid = String(data.sessionId);

    const next: ReviewProgressState = {
      ...(progress as any),
      assignmentSessionId: newSid as any,
    };
    setProgress(next);
    flushNow(next);

    router.push(
        `/${encodeURIComponent(locale)}/${ROUTES.practicePath(
            encodeURIComponent(subjectSlug),
            encodeURIComponent(moduleId),
        )}` +
        `?sessionId=${encodeURIComponent(newSid)}` +
        `&returnTo=${encodeURIComponent(returnToCurrentModule)}`,
    );
  }

  // ---------------- ✅ Confirm modal state ----------------
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState<null | { kind: "module" | "topic"; tid?: string }>(null);

  const pendingStats = useMemo(() => {
    if (!pending) return { answeredCount: 0, sessionSize: 0, title: "", description: "" };

    if (pending.kind === "topic") {
      const tid = pending.tid ?? "";
      const cards = (topics.find((t) => t.id === tid)?.cards ?? []) as ReviewCard[];
      const tp = (progress as any)?.topics?.[tid] ?? {};
      const { answeredCount, sessionSize } = countAnswered(cards, tp);
      return {
        answeredCount,
        sessionSize,
        title: "Reset this topic?",
        description: `You’ve completed ${answeredCount}/${sessionSize} items in this topic. This will clear them and cannot be undone.`,
      };
    }

    let answeredCount = 0;
    let sessionSize = 0;
    for (const t of topics) {
      const cards = (t.cards ?? []) as ReviewCard[];
      const tp = (progress as any)?.topics?.[t.id] ?? {};
      const r = countAnswered(cards, tp);
      answeredCount += r.answeredCount;
      sessionSize += r.sessionSize;
    }

    return {
      answeredCount,
      sessionSize,
      title: "Reset the entire module?",
      description: `You’ve completed ${answeredCount}/${sessionSize} items in this module. This will clear everything and cannot be undone.`,
    };
  }, [pending, progress, topics]);

  function cancelPendingChange() {
    setConfirmOpen(false);
    setPending(null);
  }

  function applyPendingChange() {
    if (!pending) return;

    if (pending.kind === "module") {
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

      cancelPendingChange();
      return;
    }

    const tid = pending.tid ?? "";
    if (!tid) return cancelPendingChange();

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

    cancelPendingChange();
  }

  function requestResetModule() {
    setPending({ kind: "module" });
    setConfirmOpen(true);
  }

  function requestResetTopic(tid: string) {
    if (!tid) return;
    setPending({ kind: "topic", tid });
    setConfirmOpen(true);
  }

  if (!topics.length) {
    return (
        <div className="p-6 text-sm text-neutral-600 dark:text-white/70">
          This module has no topics yet.
        </div>
    );
  }

  // -----------------------------
  // topic completion + next target
  // -----------------------------
  const viewIsComplete = isTopicComplete(
      viewCards,
      (progress as any)?.topics?.[viewTid],
  );
  const viewIdx = topics.findIndex((t) => t.id === viewTid);
  const nextTopic = viewIdx >= 0 ? topics[viewIdx + 1] : null;

  function goToTopic(tid: string) {
    if (!tid) return;
    const idx = topics.findIndex((x) => x.id === tid);
    if (idx < 0) return;

    if (!unlockAll) {
      // allow going back freely; forward only if unlocked
      const isEarlierOrActive = idx <= activeIdx;
      const canGoForward = topicUnlocked(tid);
      if (!isEarlierOrActive && !canGoForward) return;
    }

    if (idx > activeIdx) setActiveTopicId(tid);
    setViewTopicId(tid);
  }

  function goNextTopic() {
    if (!nextTopic?.id) return;
    goToTopic(nextTopic.id);
  }

  // sidebar stats
  const moduleProgress = useMemo(() => {
    const total = topics.length;
    const done = topics.reduce((acc, t) => {
      const tstate = (progress as any)?.topics?.[t.id];
      const cards = (t.cards ?? []) as ReviewCard[];
      return acc + (isTopicComplete(cards, tstate) ? 1 : 0);
    }, 0);
    return { total, done, pct: total ? clamp01(done / total) : 0 };
  }, [topics, progress]);

  return (
      <div className="min-h-screen bg-[radial-gradient(1200px_700px_at_20%_0%,#eafff5_0%,#ffffff_55%,#f6f7ff_100%)] dark:bg-[radial-gradient(1200px_700px_at_20%_0%,#151a2c_0%,#0b0d12_50%)] text-neutral-900 dark:text-white/90">
        {confirmOpen ? (
            <ConfirmResetModal
                open={confirmOpen}
                title={pendingStats.title}
                description={pendingStats.description}
                confirmText="Reset"
                cancelText="Cancel"
                danger={true}
                onConfirm={applyPendingChange}
                onClose={cancelPendingChange}
            />
        ) : null}

        <div className="ui-container py-4 md:py-6 grid gap-4 md:grid-cols-[280px_1fr]">
          {/* sidebar */}
          <aside className="ui-card p-3 md:sticky md:top-4 h-fit">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">
                  {mod.title}
                </div>
                {mod.subtitle ? (
                    <div className="mt-1 text-sm text-neutral-600 dark:text-white/60">
                      {mod.subtitle}
                    </div>
                ) : null}

                <div className="mt-3 flex items-center gap-2">
                <span className="text-[11px] font-extrabold text-neutral-500 dark:text-white/45">
                  Topics
                </span>
                  <span className="text-[11px] font-black tabular-nums text-neutral-700 dark:text-white/70">
                  {moduleProgress.done}/{moduleProgress.total}
                </span>
                </div>

                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-200/70 dark:bg-white/10">
                  <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500/70 via-emerald-500/60 to-teal-400/60 dark:from-emerald-200/30 dark:via-emerald-200/25 dark:to-teal-200/25"
                      style={{ width: `${Math.round(moduleProgress.pct * 100)}%` }}
                  />
                </div>

                {unlockAll ? (
                    <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-400/10 px-3 py-2 text-xs font-black text-amber-800 dark:border-amber-300/25 dark:bg-amber-200/10 dark:text-amber-200">
                      UNLOCK ENABLED
                    </div>
                ) : null}
              </div>

              <button
                  type="button"
                  onClick={requestResetModule}
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
                const disabled = unlockAll ? false : (!isEarlierOrActive && !canGoForward);

                const doneTopic = isTopicComplete(
                    t.cards ?? [],
                    (progress as any)?.topics?.[t.id],
                );
                const isViewing = viewTopicId === t.id;
                const isActive = activeTopicId === t.id;

                return (
                    <button
                        key={t.id}
                        disabled={disabled}
                        onClick={() => goToTopic(t.id)}
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
                          {isActive ? (
                              <span className="ui-pill ui-pill--neutral">CURRENT</span>
                          ) : null}
                          {doneTopic ? (
                              <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-300/80">
                          ✓
                        </span>
                          ) : null}
                        </div>
                      </div>

                      {t.summary ? (
                          <div className="mt-1 text-xs text-neutral-600 dark:text-white/55">
                            {t.summary}
                          </div>
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

            {nav?.nextModuleId ? (
                <div className="mt-3 rounded-xl border border-neutral-200 bg-white p-3 text-xs dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="font-extrabold text-neutral-700 dark:text-white/70">
                    Next module
                  </div>
                  <div className="mt-1 text-neutral-600 dark:text-white/55">
                    {canGoNextModule
                        ? unlockAll
                            ? "Unlocked."
                            : "Unlocked after assignment."
                        : "Finish topics + assignment to unlock."}
                  </div>
                </div>
            ) : null}
          </aside>

          {/* main */}
          <main>
            <TopicShell
                title={viewTopic?.label ?? ""}
                subtitle={viewTopic?.summary ?? null}
                right={
                  <>
                    <button
                        type="button"
                        onClick={() => requestResetTopic(viewTid)}
                        className="ui-btn ui-btn-secondary text-xs font-extrabold"
                    >
                      Reset topic
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                          const prevId = (nav as any)?.prevTopicId ?? null;
                          if (prevId) goToTopic(prevId);
                        }}
                        className="ui-btn ui-btn-secondary text-xs font-extrabold"
                        disabled={!(nav as any)?.prevTopicId}
                        title="Previous topic"
                    >
                      ←
                    </button>

                    <button
                        type="button"
                        onClick={goNextTopic}
                        className="ui-btn ui-btn-secondary text-xs font-extrabold"
                        disabled={!nextTopic?.id || (!unlockAll && !viewIsComplete)}
                        title={
                          !nextTopic?.id
                              ? "No next topic"
                              : !unlockAll && !viewIsComplete
                                  ? "Complete the topic to continue"
                                  : "Next topic"
                        }
                    >
                      →
                    </button>
                  </>
                }
            >
              {/* ✅ Intro BEFORE topic content */}
              <TopicIntro topic={viewTopic} />

              {/* ✅ Cards */}
              <div key={topicRenderKey} className="grid gap-3">
                {viewCards.map((card) => {
                  const tp: any = (progress as any)?.topics?.[viewTid] ?? {};
                  const done =
                      card.type === "quiz"
                          ? Boolean(tp?.quizzesDone?.[card.id])
                          : Boolean(tp?.cardsDone?.[card.id]);

                  const savedQuiz = (tp?.quizState?.[card.id] ?? null) as
                      | SavedQuizState
                      | null;

                  const prereqsMet =
                      unlockAll
                          ? true
                          : card.type === "quiz"
                              ? prereqsMetForQuiz(viewCards, tp, card.id)
                              : true;

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
                              const cardsDone = {
                                ...(tp0.cardsDone ?? {}),
                                [card.id]: true,
                              };
                              return {
                                ...p,
                                topics: {
                                  ...(p.topics ?? {}),
                                  [tid]: { ...tp0, cardsDone },
                                },
                              };
                            });
                          }}
                          onQuizPass={(quizId) => {
                            setProgress((p: any) => {
                              const tid = viewTid;
                              const tp0: any = p.topics?.[tid] ?? {};
                              const quizzesDone = {
                                ...(tp0.quizzesDone ?? {}),
                                [quizId]: true,
                              };
                              return {
                                ...p,
                                topics: {
                                  ...(p.topics ?? {}),
                                  [tid]: { ...tp0, quizzesDone },
                                },
                              };
                            });
                          }}
                          onQuizStateChange={(quizCardId, s) => {
                            setProgress((p: any) => {
                              const tid = viewTid;
                              const tp0: any = p.topics?.[tid] ?? {};
                              const quizState = {
                                ...(tp0.quizState ?? {}),
                                [quizCardId]: s,
                              };
                              return {
                                ...p,
                                topics: {
                                  ...(p.topics ?? {}),
                                  [tid]: { ...tp0, quizState },
                                },
                              };
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
                                  [tid]: {
                                    ...tp0,
                                    quizState: nextQuizState,
                                    quizzesDone: nextQuizzesDone,
                                  },
                                },
                              };
                            });
                          }}
                      />
                  );
                })}
              </div>

              {/* ✅ Outro AFTER topic content (only when complete) */}
              {viewIsComplete ? (
                  <TopicOutro
                      topic={viewTopic}
                      onContinue={nextTopic?.id ? goNextTopic : undefined}
                  />
              ) : null}
            </TopicShell>
          </main>
        </div>
      </div>
  );
}
