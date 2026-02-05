// src/features/practice/client/usePracticeRunMeta.ts
"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Difficulty, TopicSlug } from "@/lib/practice/types";
import { difficultyOptions } from "@/components/vectorpad/types";
import { useTopicOptions } from "./topicOptions";
import { readReturnUrlFromSearchParams } from "./storage";

export type TopicValue = TopicSlug | "all";

export type RunMetaBase = {
  allowReveal: boolean;
  showDebug: boolean;
  maxAttempts: number;
  targetCount: number;
  returnUrl?: string | null;
};

export type RunMeta =
  | (RunMetaBase & {
      mode: "assignment";
      lockDifficulty: Difficulty;
      lockTopic: "all" | TopicSlug;
    })
  | (RunMetaBase & {
      mode: "session";
      lockDifficulty: Difficulty;
      lockTopic: "all" | TopicSlug;
    })
  | (RunMetaBase & {
      mode: "practice";
      lockDifficulty: null;
      lockTopic: null;
    });

export function usePracticeRunMeta(args: { subjectSlug: string; moduleSlug: string }) {
  const { subjectSlug, moduleSlug } = args;

  const sp = useSearchParams();
  const returnUrlFromQuery = useMemo(
    () => readReturnUrlFromSearchParams(new URLSearchParams(sp.toString())),
    [sp],
  );

  const [run, setRun] = useState<RunMeta | null>(null);

  const isAssignmentRun = run?.mode === "assignment";
  const isSessionRun = run?.mode === "session";
  const isLockedRun = isAssignmentRun || isSessionRun;

  const topicLocked = isLockedRun || run?.lockTopic != null;
  const difficultyLocked = isLockedRun || run?.lockDifficulty != null;

  const topicOptionsFixed = useTopicOptions(subjectSlug, moduleSlug);

  const effectiveTopicOptions = useMemo(() => {
    if (run?.mode === "assignment" || run?.mode === "session") {
      if (run.lockTopic === "all") {
        return [{ id: "all" as const, label: "All topics (locked)" }];
      }
      const only = topicOptionsFixed.find((x) => String(x.id) === String(run.lockTopic));
      return only ? [only] : [{ id: run.lockTopic, label: String(run.lockTopic) } as any];
    }
    return topicOptionsFixed;
  }, [run, topicOptionsFixed]);

  const effectiveDifficultyOptions = useMemo(() => {
    if (run?.mode === "assignment" || run?.mode === "session") {
      return [{ id: run.lockDifficulty, label: `${run.lockDifficulty} (locked)` }];
    }
    return difficultyOptions;
  }, [run]);

  // reveal default safety (if a sessionId is in URL but run not loaded yet)
  const hasSessionInUrl = Boolean(sp.get("sessionId"));
  const allowReveal = run ? run.allowReveal : hasSessionInUrl ? false : true;

  const maxAttempts = run ? run.maxAttempts : 5;
  const showDebug = run ? run.showDebug : false;

  return {
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
  };
}
