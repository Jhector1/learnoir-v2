// src/components/review/ReviewModuleView.tsx
"use client";

import React, {
  useEffect,
  useMemo,
  useCallback,
  useState,
  useRef,
} from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";

import type {
  ReviewModule,
  ReviewCard,
  ReviewQuizSpec,
} from "@/lib/review/types";
import SketchHost from "./SketchHost";
import QuizBlock from "./QuizBlock";
import MathMarkdown from "../math/MathMarkdown";

import type {
  SavedQuizState,
  ReviewProgressState,
} from "@/lib/review/progressTypes";
import { buildReviewQuizKey } from "@/lib/review/quizClient";
import ConfirmDialog from "../ui/ConfirmDialog";
// import { useRouter } from "@/i18n/navigation";

function emptyProgress(): ReviewProgressState {
  return {
    topics: {},
    quizVersion: 0,
    moduleCompleted: false,
    moduleCompletedAt: undefined,
  };
}

function isTopicComplete(
  topicCards: ReviewCard[],
  tstate?: ReviewProgressState["topics"][string],
) {
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
  // Only require non-quiz cards BEFORE this quiz in the topic order.
  // (In your usual flow where quiz is last, this effectively means "all read/explored first".)
  const idx = cards.findIndex((c) => c.id === quizCardId);
  const prereqCards =
    idx >= 0 ? cards.slice(0, idx).filter((c) => c.type !== "quiz") : [];

  return prereqCards.every((c) => Boolean(tp?.cardsDone?.[c.id]));
}

export default function ReviewModuleView({
  mod,
  onModuleCompleteChange,
}: {
  mod: ReviewModule;
  onModuleCompleteChange?: (done: boolean) => void;
}) {
  const params = useParams<{
    locale: string;
    subjectSlug: string;
    moduleId: string;
  }>();
  const moduleId = params?.moduleId ?? "";
  const subjectSlug = params?.subjectSlug ?? "";
  const locale = params?.locale ?? "en";

  const topics = Array.isArray(mod?.topics) ? mod.topics : [];

  const [progress, setProgress] =
    useState<ReviewProgressState>(emptyProgress());

  // ✅ block quizzes from mounting until progress has been loaded
  const [progressHydrated, setProgressHydrated] = useState(false);

  // ✅ persisted
  const [activeTopicId, setActiveTopicId] = useState(topics[0]?.id ?? "");

  // ✅ not persisted
  const [viewTopicId, setViewTopicId] = useState(topics[0]?.id ?? "");
  const [assignmentDone, setAssignmentDone] = useState(false);

  const activeTopic = useMemo(
    () => topics.find((t) => t.id === activeTopicId) ?? topics[0],
    [topics, activeTopicId],
  );
  const viewTopic = useMemo(
    () => topics.find((t) => t.id === viewTopicId) ?? topics[0],
    [topics, viewTopicId],
  );

  type ResetKind = "module" | "topic";

  const [confirmReset, setConfirmReset] = useState<{
    open: boolean;
    kind: ResetKind | null;
  }>({ open: false, kind: null });

  function openReset(kind: ResetKind) {
    setConfirmReset({ open: true, kind });
  }
  type AssignmentStatus =
    | { phase: "idle" }
    | {
        phase: "in_progress";
        pct: number;
        answeredCount: number;
        targetCount: number;
      }
    | {
        phase: "complete";
        pct: number;
        answeredCount: number;
        targetCount: number;
      };

  const [assignmentStatus, setAssignmentStatus] = useState<AssignmentStatus>({
    phase: "idle",
  });

  const viewCards = Array.isArray(viewTopic?.cards) ? viewTopic!.cards : [];
  // const viewProg: any = progress.topics?.[viewTopic?.id ?? ""] ?? {};

  const activeCards = Array.isArray(activeTopic?.cards)
    ? activeTopic!.cards
    : [];
  const activeProg = progress.topics?.[activeTopic?.id ?? ""] ?? {};
  const activeTopicComplete = isTopicComplete(activeCards, activeProg);

  const modulePracticeHref =
    `/subjects/${encodeURIComponent(subjectSlug)}` +
    `/modules/${encodeURIComponent(moduleId)}/practice`;
  // const [assignmentDone, setAssignmentDone] = useState(false);

  // useEffect(() => {
  //   if (!progressHydrated) return;
  //   const sid = (progress as any)?.assignmentSessionId;
  //   if (!sid) {
  //     setAssignmentDone(false);
  //     return;
  //   }

  //   fetch(
  //     `/api/practice?sessionId=${encodeURIComponent(String(sid))}&statusOnly=true`,
  //     {
  //       cache: "no-store",
  //     },
  //   )
  //     .then((r) => (r.ok ? r.json() : null))
  //     .then((d) => setAssignmentDone(Boolean(d?.complete)))
  //     .catch(() => setAssignmentDone(false));
  // }, [progressHydrated, progress]);
  const assignmentSessionId = useMemo(
    () => String((progress as any)?.assignmentSessionId ?? ""),
    [(progress as any)?.assignmentSessionId],
  );

  useEffect(() => {
    if (!progressHydrated) return;

    const sid = assignmentSessionId;
    if (!sid) {
      setAssignmentDone(false);
      setAssignmentStatus({ phase: "idle" });
      return;
    }

    // ✅ stop polling once complete
    if (assignmentStatus.phase === "complete") return;

    let alive = true;

    async function loadStatus() {
      try {
        const r = await fetch(
          `/api/practice?sessionId=${encodeURIComponent(sid)}&statusOnly=true`,
          { cache: "no-store" },
        );
        const d = r.ok ? await r.json() : null;
        if (!alive) return;

        const pct = Number(d?.pct ?? 0);
        const answeredCount = Number(d?.answeredCount ?? 0);
        const targetCount = Number(d?.targetCount ?? 0);

        const complete =
          Boolean(d?.complete) ||
          Boolean(d?.sessionComplete) ||
          (targetCount > 0 && answeredCount >= targetCount);

        console.log("assignment status", { ...d });

        setAssignmentDone(complete);

        if (complete) {
          setAssignmentStatus({
            phase: "complete",
            pct: 1,
            answeredCount,
            targetCount,
          });
        } else {
          setAssignmentStatus({
            phase: "in_progress",
            pct: Math.max(0, Math.min(1, pct)),
            answeredCount,
            targetCount,
          });
        }
      } catch {
        // ignore
      }
    }

    loadStatus();

    const t = setInterval(loadStatus, 4000);
    const onFocus = () => loadStatus();
    window.addEventListener("focus", onFocus);

    return () => {
      alive = false;
      clearInterval(t);
      window.removeEventListener("focus", onFocus);
    };
  }, [progressHydrated, assignmentSessionId, assignmentStatus.phase]);

  // --- load progress (when route changes) ---
  useEffect(() => {
    if (!subjectSlug || !moduleId) return;

    const ctrl = new AbortController();
    setProgressHydrated(false);

    (async () => {
      try {
        const res = await fetch(
          `/api/review/progress?subjectSlug=${encodeURIComponent(subjectSlug)}&moduleId=${encodeURIComponent(
            moduleId,
          )}&locale=${encodeURIComponent(locale)}`,
          { signal: ctrl.signal },
        );

        if (!res.ok) {
          const fallback = topics[0]?.id ?? "";
          setProgress(emptyProgress());
          setActiveTopicId(fallback);
          setViewTopicId(fallback);
          return;
        }

        const data = await res.json();
        const p = (data?.progress ?? null) as ReviewProgressState | null;

        if (p) {
          setProgress(p);

          const nextActive = (p as any).activeTopicId ?? topics[0]?.id ?? "";
          setActiveTopicId(nextActive);
          setViewTopicId(nextActive);
        } else {
          const fallback = topics[0]?.id ?? "";
          setProgress(emptyProgress());
          setActiveTopicId(fallback);
          setViewTopicId(fallback);
        }
      } catch {
        // ignore
      } finally {
        setProgressHydrated(true);
      }
    })();

    return () => ctrl.abort();
  }, [subjectSlug, moduleId, locale, topics]);

  // --- save progress (debounced) ---
  useEffect(() => {
    if (!subjectSlug || !moduleId) return;
    if (!progressHydrated) return;

    const t = setTimeout(() => {
      fetch("/api/review/progress", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectSlug,
          moduleId,
          locale,
          state: { ...progress, activeTopicId },
        }),
      }).catch(() => {});
    }, 600);

    return () => clearTimeout(t);
  }, [
    progress,
    activeTopicId,
    subjectSlug,
    moduleId,
    locale,
    progressHydrated,
  ]);

  const topicUnlocked = useCallback(
    (tid: string) => {
      const idx = topics.findIndex((x) => x.id === tid);
      if (idx <= 0) return true;
      const prev = topics[idx - 1];
      const prevState = progress.topics?.[prev.id];
      return isTopicComplete(prev.cards ?? [], prevState);
    },
    [topics, progress.topics],
  );

  const activeIdx = useMemo(
    () => topics.findIndex((t) => t.id === activeTopicId),
    [topics, activeTopicId],
  );
  const viewIsReviewing = viewTopicId !== activeTopicId;

  // ✅ module + topic versions -> included into quizKey
  // const moduleV = progress.quizVersion ?? 0;
  // const topicV = (viewProg as any)?.quizVersion ?? 0;
  // const versionStr = `${moduleV}.${topicV}`;

  // ✅ always key off the actual state id (not the derived object)
  const viewTid = viewTopicId || topics[0]?.id || "";

  // ✅ read progress by id
  const viewProg: any = progress.topics?.[viewTid] ?? {};

  // ✅ module + topic versions
  const moduleV = progress.quizVersion ?? 0;
  const topicV = viewProg.quizVersion ?? 0;

  // ✅ changes when either reset happens
  const versionStr = `${moduleV}.${topicV}`;

  // ✅ wrapper key to force remount of the whole topic card stack
  const topicRenderKey = `${viewTid}:${versionStr}`;

  async function resetModule() {
    // 1) best-effort delete all frozen quiz instances on server
    try {
      const quizCards = topics.flatMap((t) =>
        (t.cards ?? []).filter((c) => c.type === "quiz"),
      ) as Array<Extract<ReviewCard, { type: "quiz" }>>;

      await Promise.allSettled(
        quizCards.map((c) => {
          // delete only current version (optional best-effort)
          const key = buildReviewQuizKey(
            c.spec,
            c.id,
            `${moduleV}.${(progress.topics?.[tIdOfCard(c.id, topics)] as any)?.quizVersion ?? 0}`,
          );
          return fetch(`/api/review/quiz?quizKey=${encodeURIComponent(key)}`, {
            method: "DELETE",
            cache: "no-store",
          });
        }),
      );
    } catch {
      // ignore
    }

    // 2) clear local progress + bump module version
    const fallback = topics[0]?.id ?? "";
    const nextModuleV = (progress.quizVersion ?? 0) + 1;

    const next: ReviewProgressState = {
      quizVersion: nextModuleV,
      topics: {},
      activeTopicId: fallback,
    };

    setProgress(next);
    setActiveTopicId(fallback);
    setViewTopicId(fallback);

    // 3) persist immediately
    fetch("/api/review/progress", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subjectSlug,
        moduleId,
        locale,
        state: { ...next, activeTopicId: fallback },
      }),
    }).catch(() => {});
  }

  function tIdOfCard(cardId: string, allTopics: any[]) {
    for (const t of allTopics) {
      if ((t.cards ?? []).some((c: any) => c.id === cardId)) return t.id;
    }
    return "";
  }
  const nextProgressRef = React.useRef<ReviewProgressState | null>(null);

  async function resetCurrentTopic() {
    const tid = viewTopicId || "";
    if (!tid) return;

    const topic = topics.find((t) => t.id === tid);
    const quizCards = (topic?.cards ?? []).filter(
      (c) => c.type === "quiz",
    ) as Array<Extract<ReviewCard, { type: "quiz" }>>;

    try {
      const moduleV0 = progress.quizVersion ?? 0;
      const topicV0 = (progress.topics?.[tid] as any)?.quizVersion ?? 0;

      await Promise.allSettled(
        quizCards.map((c) => {
          const key = buildReviewQuizKey(
            c.spec,
            c.id,
            `${moduleV0}.${topicV0}`,
          );
          return fetch(`/api/review/quiz?quizKey=${encodeURIComponent(key)}`, {
            method: "DELETE",
            cache: "no-store",
          });
        }),
      );
    } catch {}

    setProgress((p) => {
      const nextTopics: any = { ...(p.topics ?? {}) };
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
      nextProgressRef.current = next; // ✅ capture
      return next;
    });

    // ✅ persist immediately (avoids debounce-loss on refresh)
    queueMicrotask(() => {
      const next = nextProgressRef.current;
      if (!next) return;

      fetch("/api/review/progress", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectSlug,
          moduleId,
          locale,
          state: { ...next, activeTopicId },
        }),
      }).catch(() => {});
    });
  }

  const topicLabel = viewTopic?.label ?? "this topic";

  // const router = useRouter();
  // const autoAdvanceRef = useRef(false);
  const progressRef = useRef(progress);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const moduleComplete = useMemo(() => {
    if (!topics.length) return false;

    return topics.every((t) => {
      const cards = Array.isArray(t.cards) ? t.cards : [];
      const tstate = progress.topics?.[t.id];
      return isTopicComplete(cards, tstate);
    });
  }, [topics, progress.topics]);

  const canGoNext =
    (moduleComplete || Boolean(progress.moduleCompleted)) && assignmentDone;
  const router = useRouter();
  useEffect(() => {
    onModuleCompleteChange?.(
      moduleComplete || Boolean(progress.moduleCompleted),
    );
  }, [moduleComplete, progress.moduleCompleted, onModuleCompleteChange]);

  useEffect(() => {
    if (!progressHydrated) return;
    if (!subjectSlug || !moduleId) return;
    if (!moduleComplete) return;

    if (progress.moduleCompleted) return;

    const nowIso = new Date().toISOString();
    const nextState: ReviewProgressState = {
      ...progress,
      moduleCompleted: true,
      moduleCompletedAt: nowIso,
    };

    setProgress(nextState);

    // persist immediately (don’t rely on debounce)
    fetch("/api/review/progress", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subjectSlug,
        moduleId,
        locale,
        state: { ...nextState, activeTopicId },
      }),
    }).catch(() => {});
  }, [
    moduleComplete,
    progressHydrated,
    subjectSlug,
    moduleId,
    locale,
    activeTopicId,
    progress.moduleCompleted,
  ]);

  type NavInfo = {
    prevModuleId: string | null;
    nextModuleId: string | null;
    index: number;
    total: number;
  };

  const [nav, setNav] = useState<NavInfo | null>(null);

  useEffect(() => {
    if (!subjectSlug || !moduleId) return;

    fetch(
      `/api/review/module-nav?subjectSlug=${encodeURIComponent(subjectSlug)}&moduleId=${encodeURIComponent(moduleId)}`,
      { cache: "no-store" },
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setNav(d))
      .catch(() => setNav(null));
  }, [subjectSlug, moduleId]);

  function pctLabel(p: number) {
    const n = Math.round(Math.max(0, Math.min(1, p)) * 100);
    return `${n}%`;
  }

  function RingButton(props: {
    disabled?: boolean;
    onClick?: () => void;
    pct: number; // 0..1
    label: string;
    sublabel?: string;
  }) {
    const pct = Math.max(0, Math.min(1, props.pct));
    const deg = pct * 360;

    return (
      <button
        type="button"
        disabled={props.disabled}
        onClick={props.onClick}
        className={[
          "mt-4 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2",
          "text-xs font-extrabold hover:bg-white/15 text-center",
          "disabled:opacity-50 disabled:cursor-not-allowed",
        ].join(" ")}
      >
        <div className="flex items-center justify-between gap-3">
          {/* ring */}
          <span
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(rgba(16,185,129,0.9) ${deg}deg, rgba(255,255,255,0.14) 0deg)`,
            }}
          >
            <span className="h-7 w-7 inline-grid place-items-center rounded-full bg-[#0b0d12] border border-white/10">
              <span className="text-[7px] leading-none text-white tabular-nums">
                {Math.round(pct * 100)}%
              </span>
            </span>{" "}
          </span>

          <span className="min-w-0 text-left">
            <div className="truncate">{props.label}</div>
            {props.sublabel ? (
              <div className="text-[11px] font-black text-white/60 truncate">
                {props.sublabel}
              </div>
            ) : null}
          </span>
        </div>
      </button>
    );
  }

  const sid = (progress as any)?.assignmentSessionId
    ? String((progress as any).assignmentSessionId)
    : null;

  const assignmentLabel =
    assignmentStatus.phase === "complete"
      ? "✓ Assignment complete"
      : assignmentStatus.phase === "in_progress"
        ? `Assignment in progress` //· ${pctLabel(assignmentStatus.pct)}`
        : "Start module assignment";

  const assignmentSublabel =
    assignmentStatus.phase === "in_progress"
      ? `${assignmentStatus.answeredCount}/${assignmentStatus.targetCount} questions`
      : assignmentStatus.phase === "complete"
        ? `${assignmentStatus.answeredCount}/${assignmentStatus.targetCount} questions`
        : undefined;

  const assignmentPct =
    assignmentStatus.phase === "idle"
      ? 0
      : assignmentStatus.phase === "complete"
        ? 1
        : assignmentStatus.pct;

  // behavior:
  // - idle: starts session
  // - in_progress: resumes the session
  // - complete: optionally still lets them open the session page (read-only summary), or disable
  async function handleAssignmentClick() {
    // if already have a session, just resume it
    const returnToCurrentModule = `/${encodeURIComponent(locale)}/subjects/${encodeURIComponent(subjectSlug)}/review/${encodeURIComponent(moduleId)}`;

    if (sid && assignmentStatus.phase !== "idle") {
      router.push(
        `/subjects/${encodeURIComponent(subjectSlug)}` +
          `/modules/${encodeURIComponent(moduleId)}/practice` +
          `?sessionId=${encodeURIComponent(sid)}` +
          `&returnTo=${encodeURIComponent(returnToCurrentModule)}`,
      );
      return;
    }

    // otherwise create it (your existing start logic)
    const moduleSlug = (mod as any).practiceSectionSlug ?? moduleId;

    const r = await fetch(
      `/api/modules/${encodeURIComponent(moduleSlug)}/practice/start`,
      {
        method: "POST",
        body: JSON.stringify({
          returnUrl: returnToCurrentModule,
        }),
      },
    );
    const data = await r.json().catch(() => null);

    if (!r.ok) {
      alert(data?.message ?? "Unable to start.");
      return;
    }

    const newSid = String(data.sessionId);
    setProgress((p) => {
      const next = { ...(p as any), assignmentSessionId: newSid };
      // persist using NEXT (not stale progress)
      fetch("/api/review/progress", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectSlug,
          moduleId,
          locale,
          state: { ...next, activeTopicId },
        }),
      }).catch(() => {});
      return next;
    });

    const returnTo = `/${encodeURIComponent(locale)}/subjects/${encodeURIComponent(subjectSlug)}/review/${encodeURIComponent(moduleId)}`;
    router.push(
      `/subjects/${encodeURIComponent(subjectSlug)}` +
        `/modules/${encodeURIComponent(moduleId)}/practice` +
        `?sessionId=${encodeURIComponent(newSid)}` +
        `&returnTo=${encodeURIComponent(returnTo)}`,
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_700px_at_20%_0%,#151a2c_0%,#0b0d12_50%)] text-white/90">
      <div className="mx-auto max-w-6xl p-4 md:p-6 grid gap-4 md:grid-cols-[280px_1fr]">
        {/* sidebar */}
        <aside className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 md:sticky md:top-4 h-fit">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-lg font-black tracking-tight">
                {mod.title}
              </div>
              {mod.subtitle ? (
                <div className="mt-1 text-sm text-white/60">{mod.subtitle}</div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => openReset("module")}
              className="shrink-0 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-[11px] font-extrabold hover:bg-white/15"
              title="Reset all progress in this module"
            >
              Reset module
            </button>
          </div>
          <div className="mt-4 grid gap-2">
            {topics.map((t) => {
              const idx = topics.findIndex((x) => x.id === t.id);

              const isEarlierOrActive = idx <= activeIdx;
              const canGoForward = topicUnlocked(t.id);
              const disabled = !isEarlierOrActive && !canGoForward;

              const doneTopic = isTopicComplete(
                t.cards ?? [],
                progress.topics?.[t.id],
              );
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
                  className={[
                    "w-full text-left rounded-xl border px-3 py-2 transition",
                    disabled ? "opacity-50 cursor-not-allowed" : "",
                    isViewing
                      ? "border-sky-300/30 bg-sky-300/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-extrabold">{t.label}</div>

                    <div className="flex items-center gap-2">
                      {isActive ? (
                        <span className="rounded-md border border-white/10 bg-white/10 px-1.5 py-0.5 text-[10px] font-black text-white/70">
                          CURRENT
                        </span>
                      ) : null}
                      {doneTopic ? (
                        <span className="text-[11px] font-black text-emerald-300/80">
                          ✓
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {t.summary ? (
                    <div className="mt-1 text-xs text-white/55">
                      {t.summary}
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
          {!activeTopicComplete ? (
            <div className="mt-3 rounded-xl border border-amber-300/20 bg-amber-300/10 p-2 text-xs text-amber-100/90">
              Finish all cards in the{" "}
              <span className="font-black">CURRENT</span> topic to unlock the
              next topic.
            </div>
          ) : null}
          {/* {modulePracticeHref && viewTopic ? (
            <Link
              href={`${modulePracticeHref}?topic=all`}
              className="mt-4 block rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-extrabold hover:bg-white/15 text-center"
            >
              Start practice for {viewTopic.label}
            </Link>
          ) : null} */}
          {/* <button
            type="button"
            onClick={async () => {
              // IMPORTANT: you need the section slug for this module.
              // If your sectionSlug === moduleId, great. If not, pass it via mod.practiceSectionSlug.
              const moduleSlug = (mod as any).practiceSectionSlug ?? moduleId;

              const r = await fetch(
                `/api/modules/${encodeURIComponent(moduleSlug)}/practice/start`,
                {
                  method: "POST",
                },
              );

              const data = await r.json().catch(() => null);

              // const data = await r.json().catch(() => null);
              const sid = String(data.sessionId);

              setProgress((p) => ({
                ...p,
                // store it somewhere in JSON state (since state is Json anyway)
                assignmentSessionId: sid as any,
              }));

              // persist immediately
              fetch("/api/review/progress", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  subjectSlug,
                  moduleId,
                  locale,
                  state: {
                    ...(progress as any),
                    assignmentSessionId: sid,
                    activeTopicId,
                  },
                }),
              }).catch(() => {});

              if (!r.ok) {
                alert(data?.message ?? "Unable to start.");
                return;
              }

              const returnTo = `/${encodeURIComponent(locale)}/subjects/${encodeURIComponent(subjectSlug)}/review/${encodeURIComponent(moduleId)}`;

              router.push(
                `/subjects/${encodeURIComponent(subjectSlug)}` +
                  `/modules/${encodeURIComponent(moduleId)}/practice` +
                  `?sessionId=${encodeURIComponent(data.sessionId)}` +
                  `&returnTo=${encodeURIComponent(returnTo)}`,
              );
            }}
            className="mt-4 block w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-extrabold hover:bg-white/15 text-center"
          >
            Start module assignment
          </button> */}
          <RingButton
            pct={assignmentPct}
            label={assignmentLabel}
            sublabel={assignmentSublabel}
            onClick={handleAssignmentClick}
            disabled={false}
          />
        </aside>

        {/* main */}
        <main className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-sm font-black text-white/60">Topic</div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-xl font-black">{viewTopic?.label}</div>
                {viewIsReviewing ? (
                  <span className="rounded-lg border border-white/10 bg-white/10 px-2 py-1 text-[11px] font-black text-white/70">
                    Reviewing
                  </span>
                ) : null}
              </div>
              {viewTopic?.summary ? (
                <div className="mt-1 text-sm text-white/60">
                  {viewTopic.summary}
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              {viewTopic?.minutes ? (
                <div className="text-xs font-extrabold text-white/50">
                  {viewTopic.minutes} min
                </div>
              ) : null}
              <div className="flex items-center gap-2">
                {progress.moduleCompleted ? (
                  <span className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs font-extrabold text-emerald-100/90">
                    ✓ Module complete
                  </span>
                ) : null}

                <button
                  type="button"
                  disabled={!nav?.prevModuleId}
                  onClick={() => {
                    if (!nav?.prevModuleId) return;
                    router.push(
                      `/${encodeURIComponent(locale)}/subjects/${encodeURIComponent(subjectSlug)}/review/${encodeURIComponent(nav.prevModuleId)}`,
                    );
                  }}
                  className={[
                    "rounded-xl border px-3 py-2 text-xs font-extrabold",
                    nav?.prevModuleId
                      ? "border-white/10 bg-white/10 hover:bg-white/15"
                      : "border-white/10 bg-white/5 opacity-50 cursor-not-allowed",
                  ].join(" ")}
                >
                  ← Prev
                </button>

                <button
                  type="button"
                  disabled={!nav?.nextModuleId || !canGoNext}
                  onClick={() => {
                    if (!nav?.nextModuleId || !canGoNext) return;

                    router.push(
                      `/subjects/${encodeURIComponent(subjectSlug)}/review/${encodeURIComponent(nav.nextModuleId)}`,
                    );
                    router.refresh();
                  }}
                  className={[
                    "rounded-xl border px-3 py-2 text-xs font-extrabold",
                    nav?.nextModuleId && canGoNext
                      ? "border-white/10 bg-white/10 hover:bg-white/15"
                      : "border-white/10 bg-white/5 opacity-50 cursor-not-allowed",
                  ].join(" ")}
                >
                  Next →
                </button>

                {/* keep your existing buttons */}
                <button
                  type="button"
                  onClick={() => openReset("topic")}
                  className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-extrabold hover:bg-white/15"
                >
                  Reset topic
                </button>

                {viewIsReviewing ? (
                  <button
                    type="button"
                    onClick={() => setViewTopicId(activeTopicId)}
                    className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-extrabold hover:bg-white/15"
                  >
                    Back to current
                  </button>
                ) : null}
              </div>

              {/* <button
                type="button"
                onClick={() => openReset("topic")}
                className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-extrabold hover:bg-white/15"
              >
                Reset topic
              </button> */}

              {/* {viewIsReviewing ? (
                <button
                  type="button"
                  onClick={() => setViewTopicId(activeTopicId)}
                  className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-extrabold hover:bg-white/15"
                >
                  Back to current
                </button>
              ) : null} */}
            </div>
          </div>

          {!progressHydrated ? (
            <div className="mt-4 text-xs text-white/60">
              Loading your saved progress…
            </div>
          ) : null}
          <div key={topicRenderKey} className="mt-4 grid gap-3">
            {viewCards.map((card) => {
              const tp: any = progress.topics?.[viewTid] ?? {}; // ✅ use viewTid
              const done =
                card.type === "quiz"
                  ? Boolean(tp?.quizzesDone?.[card.id])
                  : Boolean(tp?.cardsDone?.[card.id]);

              const savedQuiz = tp?.quizState?.[card.id] ?? null;
              // ✅ prereqs for quiz: read/explore prerequisites must be done first
              const prereqsMet =
                card.type === "quiz"
                  ? prereqsMetForQuiz(viewCards, tp, card.id)
                  : true;

              return (
                <CardRenderer
                  key={card.id}
                  card={card}
                  done={done}
                  savedQuiz={progressHydrated ? savedQuiz : null}
                  topicId={viewTid} // ✅ optional but consistent
                  progressHydrated={progressHydrated}
                  versionStr={versionStr}
                  prereqsMet={prereqsMet} // ✅ PASS IT DOWN
                  onMarkDone={() => {
                    setProgress((p) => {
                      const tid = viewTid;
                      if (!tid) return p;

                      const tp0: any = (p.topics?.[tid] ?? {}) as any;
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
                    setProgress((p) => {
                      const tid = viewTid;
                      if (!tid) return p;

                      const tp0: any = (p.topics?.[tid] ?? {}) as any;
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
                    setProgress((p) => {
                      const tid = viewTid;
                      if (!tid) return p;

                      const tp0: any = (p.topics?.[tid] ?? {}) as any;
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
                    setProgress((p) => {
                      const tid = viewTid;
                      if (!tid) return p;

                      const tp0: any = (p.topics?.[tid] ?? {}) as any;

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
        </main>
      </div>

      <ConfirmDialog
        open={confirmReset.open}
        onOpenChange={(open) =>
          setConfirmReset((s) => ({ ...s, open, kind: open ? s.kind : null }))
        }
        danger
        title={
          confirmReset.kind === "module"
            ? "Reset this module?"
            : `Reset ${topicLabel}?`
        }
        confirmLabel={
          confirmReset.kind === "module" ? "Reset module" : "Reset topic"
        }
        description={
          confirmReset.kind === "module" ? (
            <div className="grid gap-2">
              <div>This will:</div>
              <ul className="list-disc pl-5 space-y-1">
                <li>Clear all completed cards and quizzes in every topic.</li>
                <li>Delete saved frozen quiz instances for this module.</li>
                <li>
                  Generate a <span className="font-black">new set</span> of
                  exercises across the whole module.
                </li>
              </ul>
              <div className="text-white/60 text-xs font-extrabold">
                This can’t be undone.
              </div>
            </div>
          ) : (
            <div className="grid gap-2">
              <div>This will:</div>
              <ul className="list-disc pl-5 space-y-1">
                <li>Clear completed state for every card in this topic.</li>
                <li>
                  Delete saved frozen quiz instances for quizzes in this topic.
                </li>
                <li>
                  Generate a <span className="font-black">new set</span> of
                  exercises for this topic.
                </li>
              </ul>
              <div className="text-white/60 text-xs font-extrabold">
                This can’t be undone.
              </div>
            </div>
          )
        }
        onConfirm={async () => {
          if (confirmReset.kind === "module") {
            await resetModule();
          } else if (confirmReset.kind === "topic") {
            await resetCurrentTopic();
          }
        }}
      />
    </div>
  );
}

function CardRenderer({
  card,
  done,
  savedQuiz,
  topicId,
  onMarkDone,
  prereqsMet, // ✅ NEW

  onQuizPass,
  onQuizStateChange,
  onQuizReset,
  progressHydrated,
  versionStr,
}: {
  card: ReviewCard;
  done?: boolean;
  savedQuiz?: SavedQuizState | null;
  topicId: string;
  prereqsMet: boolean; // ✅ NEW
  onMarkDone: () => void;
  onQuizPass: (quizId: string) => void;
  onQuizStateChange: (quizCardId: string, s: SavedQuizState) => void;
  onQuizReset: (quizCardId: string) => void;
  progressHydrated: boolean;
  versionStr: string;
}) {
  if (card.type === "text") {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        {card.title ? (
          <div className="text-sm font-black">{card.title}</div>
        ) : null}
        <MathMarkdown
          className="text-sm text-white/80 [&_.katex]:text-white/90"
          content={card.markdown}
        />
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onMarkDone}
            className={[
              "rounded-xl border px-3 py-2 text-xs font-extrabold transition",
              done
                ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100/90"
                : "border-white/10 bg-white/10 text-white/80 hover:bg-white/15",
            ].join(" ")}
          >
            {done ? "✓ Read" : "Mark as read"}
          </button>
        </div>
      </div>
    );
  }

  if (card.type === "sketch") {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        {card.title ? (
          <div className="text-sm font-black">{card.title}</div>
        ) : null}
        <div className="mt-3">
          <SketchHost
            sketchId={card.sketchId}
            props={card.props}
            height={card.height ?? 360}
          />
        </div>
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onMarkDone}
            className={[
              "rounded-xl border px-3 py-2 text-xs font-extrabold transition",
              done
                ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100/90"
                : "border-white/10 bg-white/10 text-white/80 hover:bg-white/15",
            ].join(" ")}
          >
            {done ? "✓ Explored" : "Mark explored"}
          </button>
        </div>
      </div>
    );
  }

  // ✅ quiz key changes when module/topic version changes
  const quizKey = buildReviewQuizKey(card.spec, card.id, versionStr);
  // const prereqsMet = topicCards
  //   .filter((c) => c.type !== "quiz")
  //   .every((c) => Boolean(topicProgress.cardsDone?.[c.id]));

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      {card.title ? (
        <div className="text-sm font-black">{card.title}</div>
      ) : null}

      {!progressHydrated ? (
        <div className="mt-2 text-xs text-white/60">
          Loading saved quiz state…
        </div>
      ) : (
        <QuizBlock
          key={quizKey} // ✅ forces clean remount when version changes
          quizId={card.id}
          spec={card.spec as ReviewQuizSpec}
          quizKey={quizKey}
          quizCardId={card.id}
          passScore={card.passScore ?? 1.0}
          onPass={() => onQuizPass(card.id)}
          unlimitedAttempts
          initialState={savedQuiz ?? null}
          onStateChange={(s) => onQuizStateChange(card.id, s)}
          onReset={() => onQuizReset(card.id)}
          isCompleted={Boolean(done)}
          prereqsMet={Boolean(prereqsMet)} // ✅ HERE
        />
      )}

      {done ? (
        <div className="mt-2 text-xs font-extrabold text-emerald-300/80">
          ✓ Completed
        </div>
      ) : null}
    </div>
  );
}
