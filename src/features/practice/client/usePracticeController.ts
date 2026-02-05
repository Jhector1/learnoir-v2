"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import type { Difficulty } from "@/lib/practice/types";
import type { QItem } from "@/components/practice/practiceType";
import PracticeShell from "@/components/practice/PracticeShell";

import { usePracticeRunMeta, type TopicValue } from "./usePracticeRunMeta";
import {
  usePracticeStatePersistence,
  type Phase,
} from "./usePracticeStatePersistence";
import { usePracticeEngine } from "./usePracticeEngine";
import { useVectorPadRef } from "./useVectorPadRef";
import { SESSION_DEFAULT } from "./constants";

type PendingChange =
  | { kind: "topic"; value: TopicValue }
  | { kind: "difficulty"; value: Difficulty | "all" }
  | null;

export function usePracticeController(args: {
  subjectSlug: string;
  moduleSlug: string;
}) {
  const { subjectSlug, moduleSlug } = args;

  const t = useTranslations("Practice");

  const router = useRouter();
  const pathname = usePathname();

  const {
    sp,
    run,
    setRun,
    returnUrlFromQuery,

    isAssignmentRun,
    isSessionRun,
    isLockedRun,
    topicLocked,
    difficultyLocked,

    allowReveal,
    maxAttempts,
    showDebug,

    effectiveTopicOptions,
    effectiveDifficultyOptions,
  } = usePracticeRunMeta({ subjectSlug, moduleSlug });

  // filters / phase / misc UI state
  const [topic, setTopic] = useState<TopicValue>("all");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [section, setSection] = useState<string | null>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);

  const [phase, setPhase] = useState<Phase>("practice");
  const [showMissed, setShowMissed] = useState(true);

  const [busy, setBusy] = useState(false);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [actionErr, setActionErr] = useState<string | null>(null);

  const [sessionSize, setSessionSize] = useState<number>(SESSION_DEFAULT);
  const [autoSummarized, setAutoSummarized] = useState(false);

  // ✅ new: once completed, refresh should default to summary
  const [completed, setCompleted] = useState(false);

  const [completionReturnUrl, setCompletionReturnUrl] = useState<string | null>(
    null,
  );

  // ✅ SINGLE SOURCE OF TRUTH for progress
  const [stack, setStack] = useState<QItem[]>([]);
  const [idx, setIdx] = useState(0);

  const current = stack[idx] ?? null;

  // internal refs used by persistence/url-sync and filter reset
  const firstFiltersEffectRef = useRef(true);
  const skipUrlSyncRef = useRef(true);

  // ✅ persistence hydrates + persists stack/idx (+ completed)
  const { hydrated, resolvedSessionIdRef } = usePracticeStatePersistence({
    subjectSlug,
    moduleSlug,

    section,
    topic,
    difficulty,
    sessionId,
    run,

    phase,
    autoSummarized,
    completed, // ✅
    showMissed,

    stack,
    idx,
    sessionSize,

    setSection,
    setTopic,
    setDifficulty,
    setSessionId,
    setRun,

    setPhase,
    setAutoSummarized,
    setCompleted, // ✅
    setShowMissed,

    setStack,
    setIdx,
    setSessionSize,

    setLoadErr,

    firstFiltersEffectRef,
    skipUrlSyncRef,
  });

  // vector refs based on current (shared)
  const { padRef, zHeldRef } = useVectorPadRef(current);

  // ✅ engine uses controller-owned stack/idx + can set completed
  const engine = usePracticeEngine({
    subjectSlug,
    moduleSlug,

    run,
    setRun,
    isLockedRun,
    allowReveal,
    maxAttempts,
    returnUrlFromQuery,

    hydrated,
    resolvedSessionIdRef,

    topic,
    difficulty,
    section,
    sessionSize,
    setSessionSize,
    sessionId,
    setSessionId,

    phase,
    setPhase,
    autoSummarized,
    setAutoSummarized,

    completed, // ✅
    setCompleted, // ✅

    busy,
    setBusy,
    setLoadErr,
    setActionErr,

    completionReturnUrl,
    setCompletionReturnUrl,

    stack,
    setStack,
    idx,
    setIdx,

    padRef,
  } as any);

  // lock selected values when run says so
  useEffect(() => {
    if (!run) return;
    if (run.mode === "assignment" || run.mode === "session") {
      setDifficulty(run.lockDifficulty as any);
      setTopic(run.lockTopic as any);
    }
  }, [run]);

  // ✅ force initial landing to Summary once completed
  // (but still allow user to go back to questions afterward)
  const forcedSummaryOnceRef = useRef(false);
  useEffect(() => {
    if (!hydrated) return;
    if (!completed) return;
    if (forcedSummaryOnceRef.current) return;

    forcedSummaryOnceRef.current = true;
    setPhase("summary");
  }, [hydrated, completed]);

  // filter-change reset (unlocked only)
  useEffect(() => {
    if (!hydrated) return;
    if (isLockedRun) return;

    if (firstFiltersEffectRef.current) {
      firstFiltersEffectRef.current = false;
      return;
    }

    setLoadErr(null);

    // ✅ changing filters starts a new run; clear completion
    setCompleted(false);
    forcedSummaryOnceRef.current = false;

    setPhase("practice");
    setAutoSummarized(false);

    setShowMissed(true);
    setSessionId(null);
    setStack([]);
    setIdx(0);

    void engine.loadNextExercise({ forceNew: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic, difficulty, section, hydrated, isLockedRun]);

  // URL sync (unlocked only)
  useEffect(() => {
    if (!hydrated) return;
    if (isLockedRun) return;

    if (skipUrlSyncRef.current) {
      skipUrlSyncRef.current = false;
      return;
    }

    const qs = new URLSearchParams(sp.toString());

    if (sessionId) qs.set("sessionId", sessionId);
    else qs.delete("sessionId");

    if (section) qs.set("section", section);
    else qs.delete("section");

    qs.set("topic", String(topic));
    qs.set("difficulty", String(difficulty));

    if (sessionSize && sessionSize !== SESSION_DEFAULT)
      qs.set("questionCount", String(sessionSize));
    else qs.delete("questionCount");

    const desired = qs.toString();
    const currentSearch = sp.toString();
    if (desired === currentSearch) return;

    router.replace(`${pathname}?${desired}`, { scroll: false });
  }, [
    hydrated,
    isLockedRun,
    sp,
    sessionId,
    section,
    topic,
    difficulty,
    sessionSize,
    router,
    pathname,
  ]);

  // confirm modal + guarded filter changes
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingChange, setPendingChange] = useState<PendingChange>(null);

  const hasProgress =
    phase === "practice" &&
    (engine.answeredCount > 0 ||
      !!sessionId ||
      !!current?.result ||
      (current?.single?.trim()?.length ?? 0) > 0 ||
      (current?.multi?.length ?? 0) > 0 ||
      (current?.num?.trim()?.length ?? 0) > 0 ||
      (current?.code?.trim()?.length ?? 0) > 0 ||
      (current?.codeStdin?.trim()?.length ?? 0) > 0);

  function requestChange(next: PendingChange) {
    if (!next) return;
    if (isLockedRun) return;

    if (!hasProgress) {
      if (next.kind === "topic") setTopic(next.value);
      if (next.kind === "difficulty") setDifficulty(next.value);
      return;
    }
    setPendingChange(next);
    setConfirmOpen(true);
  }

  function applyPendingChange() {
    if (!pendingChange) return;
    if (pendingChange.kind === "topic") setTopic(pendingChange.value);
    if (pendingChange.kind === "difficulty") setDifficulty(pendingChange.value);
    setConfirmOpen(false);
    setPendingChange(null);
  }

  function cancelPendingChange() {
    setConfirmOpen(false);
    setPendingChange(null);
  }

  const shellProps: React.ComponentProps<typeof PracticeShell> = useMemo(
    () => ({
      returnUrl: completionReturnUrl,
      reviewStack: engine.reviewStack,

      onReturn: () => {
        if (!completionReturnUrl) return;
        router.replace(completionReturnUrl);
      },

      t,

      isAssignmentRun,
      isSessionRun,
      isLockedRun,
      topicLocked,
      difficultyLocked,
      allowReveal,
      showDebug,
      maxAttempts,

      sessionSize,
      setSessionSize,

      topic,
      setTopic: (v: any) => requestChange({ kind: "topic", value: v }),
      difficulty,
      setDifficulty: (v: any) =>
        requestChange({ kind: "difficulty", value: v }),

      section,
      setSection,

      topicOptionsFixed: effectiveTopicOptions as any,
      difficultyOptions: effectiveDifficultyOptions as any,

      badge: engine.badge,
      // reviewStack: (engine as any).reviewStack,

      busy,
      loadErr,
      actionErr,

      phase,
      setPhase, // ✅ allow back to questions

      showMissed,
      setShowMissed,

      pct: engine.pct,
      answeredCount: engine.answeredCount,
      correctCount: engine.correctCount,

      stack,
      idx,
      setIdx,

      current,
      exercise: engine.exercise,

      missed: engine.missed,

      confirmOpen,
      applyPendingChange,
      cancelPendingChange,

      canGoPrev: engine.canGoPrev,
      canGoNext: engine.canGoNext,
      goPrev: engine.goPrev,
      goNext: engine.goNext,
      submit: engine.submit,
      reveal: engine.reveal,
      retryLoad: engine.retryLoad,

      padRef,
      zHeldRef,
      updateCurrent: engine.updateCurrent,
    }),
    [
      completionReturnUrl,
      router,
      t,
    engine.reviewStack, // ✅ add this

      isAssignmentRun,
      isSessionRun,
      isLockedRun,
      topicLocked,
      difficultyLocked,
      allowReveal,
      showDebug,
      maxAttempts,

      sessionSize,
      topic,
      difficulty,
      section,

      effectiveTopicOptions,
      effectiveDifficultyOptions,

      engine.badge,
      engine.pct,
      engine.answeredCount,
      engine.correctCount,
      engine.exercise,
      engine.missed,
      engine.canGoPrev,
      engine.canGoNext,

      busy,
      loadErr,
      actionErr,
      phase,
      showMissed,
      confirmOpen,
      padRef,
      zHeldRef,

      stack,
      idx,
      current,
    ],
  );
  console.log("PracticeController shellProps:", engine.reviewStack);

  return { shellProps };
}
