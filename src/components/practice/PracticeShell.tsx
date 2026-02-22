"use client";

import React, { useMemo } from "react";
import type { Exercise, Difficulty } from "@/lib/practice/types";
import type { VectorPadState } from "@/components/vectorpad/types";

import type { MissedItem, QItem, TopicValue } from "./practiceType";
import { buildSubmitAnswerFromItem } from "@/lib/practice/uiHelpers";

import SummaryView from "./shell/SummaryView";
import PracticeView from "./shell/PracticeView";

import { useConceptExplain } from "./hooks/useConceptExplain";
export type TFn = (key: string, values?: Record<string, any>) => string;

export type PracticeShellProps = {
  t: TFn;

  // run-mode flags
  isAssignmentRun: boolean;
  isSessionRun: boolean;
  isLockedRun: boolean;

  returnUrl?: string | null;
  onReturn?: () => void;

  allowReveal: boolean;
  showDebug: boolean;
  maxAttempts: number;
reviewStack?: QItem[];
  // locks for the filter UI
  topicLocked: boolean;
  difficultyLocked: boolean;

  sessionSize: number;
  setSessionSize: (n: number) => void;

  topic: TopicValue;
  setTopic: (v: TopicValue) => void;

  difficulty: Difficulty | "all";
  setDifficulty: (v: Difficulty | "all") => void;

  section: string | null;
  setSection: (s: string | null) => void;

  topicOptionsFixed: { id: TopicValue; label: string }[];
  difficultyOptions: { id: Difficulty | "all"; label: string }[];

  badge: string;

  busy: boolean;
  loadErr: string | null;
  actionErr: string | null;

  phase: "practice" | "summary";
  setPhase: (p: "practice" | "summary") => void;

  showMissed: boolean;
  setShowMissed: (v: boolean) => void;

  pct: number;
  answeredCount: number;
  correctCount: number;

  stack: QItem[];
  idx: number;
  setIdx: (n: number) => void;

  current: QItem | null;
  exercise: Exercise | null;

  missed: MissedItem[];

  confirmOpen: boolean;
  applyPendingChange: () => void;
  cancelPendingChange: () => void;

  canGoPrev: boolean;
  canGoNext: boolean;
  goPrev: () => void;
  goNext: () => Promise<void> | void;
  submit: () => Promise<void> | void;
  reveal: () => Promise<void> | void;
  retryLoad: () => void;

  padRef: React.MutableRefObject<VectorPadState>;
  zHeldRef: React.MutableRefObject<boolean>;

  updateCurrent: (patch: Partial<QItem>) => void;
};

function getResultBoxClass(current: QItem | null) {
  if (current?.revealed) return "border-sky-300/20 bg-sky-300/10";
  if (current?.result?.ok === true) return "border-emerald-300/30 bg-emerald-300/10";
  if (current?.result) return "border-rose-300/30 bg-rose-300/10";
  return "border-white/10 bg-white/5";
}

export default function PracticeShell(props: PracticeShellProps) {
  const { phase, isLockedRun, reviewStack, maxAttempts, busy, allowReveal, current, exercise } = props;

  const canSubmitNow = useMemo(
    () => !!(current && buildSubmitAnswerFromItem(current)),
    [current],
  );

  const finalized = Boolean((current as any)?.result?.finalized);
  const attempts = current?.attempts ?? 0;

  const outOfAttempts =
    isLockedRun && attempts >= maxAttempts && current?.result?.ok !== true;

  const resultBoxClass = useMemo(() => getResultBoxClass(current), [current]);

  const concept = useConceptExplain({ current, exercise });

  if (phase === "summary") {
    return <SummaryView {...props} />;
  }

  return (
    <PracticeView
      {...props}
      canSubmitNow={canSubmitNow}
      finalized={finalized}
      attempts={attempts}
      outOfAttempts={outOfAttempts}
      resultBoxClass={resultBoxClass}
      concept={concept}
    />
  );
}