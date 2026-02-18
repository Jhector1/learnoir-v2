// src/components/review/quiz/QuizBlock.tsx
"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import type { ReviewQuestion, ReviewQuizSpec } from "@/lib/subjects/types";
import type { SavedQuizState } from "@/lib/subjects/progressTypes";
import { buildReviewQuizKey } from "@/lib/subjects/quizClient";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

import { useQuizLocalAnswers } from "./quiz/hooks/useQuizLocalAnswers";
import { useQuizPracticeBank } from "./quiz/hooks/useQuizPracticeBank";
import { useDebouncedEmit } from "./quiz/hooks/useDebouncedEmit";
import { useReviewQuizQuestions } from "./quiz/hooks/useReviewQuizQuestions";

import QuizPracticeCard from "./quiz/components/QuizPracticeCard";
import QuizLocalCard from "./quiz/components/QuizLocalCard";
import QuizFooter from "./quiz/components/QuizFooter";

export default function QuizBlock({
  prereqsMet = true,
  quizId,
  spec,
  quizKey,
  passScore,
  onPass,
  sequential = true,
  unlimitedAttempts = true,

  initialState,
  onStateChange,

  isCompleted = false,
  quizCardId,
  locked = false,

  onReset,
}: {
  prereqsMet?: boolean;
  quizId: string;
  spec: ReviewQuizSpec;
  quizKey?: string;
  passScore: number;
  onPass: () => void;
  sequential?: boolean;
  unlimitedAttempts?: boolean;

  initialState?: SavedQuizState | null;
  onStateChange?: (s: SavedQuizState) => void;

  isCompleted?: boolean;
  quizCardId?: string;
  locked?: boolean;

  onReset?: () => void;
}) {
  const initState = initialState ?? null;

  // const stableQuizKey = useMemo(() => {
  //   if (quizKey?.trim()) return quizKey.trim();
  //   return buildReviewQuizKey(spec, quizCardId ?? quizId, 0);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [
  //   quizKey,
  //   quizId,
  //   quizCardId,
  //   spec.subject,
  //   spec.module,
  //   spec.section,
  //   spec.topic,
  //   spec.difficulty,
  //   spec.n,
  //   (spec as any).allowReveal,
  //   (spec as any).preferKind,
  //   (spec as any).maxAttempts,
  // ]);
const stableQuizKeyRef = useRef<string>("");

if (!stableQuizKeyRef.current) {
  stableQuizKeyRef.current = quizKey?.trim()
    ? quizKey.trim()
    : buildReviewQuizKey(spec, quizCardId ?? quizId, 0); // or 1 if you prefer
}

const stableKey = stableQuizKeyRef.current;

const [reloadNonce, setReloadNonce] = useState(0);
const resetKey = `${stableKey}:${reloadNonce}`;

  const { quizLoading, quizError, questions, serverQuizKey } =
    useReviewQuizQuestions({
      quizId,
      spec,
      stableQuizKey:stableKey,
      reloadNonce,
    });
  const [excusedById, setExcusedById] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setExcusedById(initState?.excusedById ?? {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  // useEffect(() => {
  //   // reset when quiz resets
  //   setExcusedById({});
  // }, [resetKey]);
  const isExcused = useCallback(
    (qid: string) => Boolean(excusedById[qid]),
    [excusedById],
  );

  const local = useQuizLocalAnswers();

  const practiceBank = useQuizPracticeBank({
    questions,
    spec,
    unlimitedAttempts,
    initialState: initState,
    resetKey,
    isCompleted,
    locked,
  });

  useEffect(() => {
    local.hydrate(initState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  function getQuestionOk(q: ReviewQuestion): boolean | null {
    if (q.kind === "mcq") {
      if (!local.checkedById[q.id]) return null;
      return local.answers[q.id] === q.answerId;
    }
    if (q.kind === "numeric") {
      if (!local.checkedById[q.id]) return null;
      const v = Number(local.answers[q.id]);
      if (!Number.isFinite(v)) return false;
      const tol = q.tolerance ?? 0;
      return Math.abs(v - q.answer) <= tol;
    }
    if (q.kind === "practice") {
      const ps = practiceBank.practice[q.id];
      return ps ? ps.ok : null;
    }
    return null;
  }

  function isQuestionChecked(q: ReviewQuestion): boolean {
    // ✅ excused bypass (system error)
    if (isExcused(q.id)) return true;
    if (q.kind === "practice") return practiceBank.isPracticeChecked(q);
    return Boolean(local.checkedById[q.id]);
  }

  function isUnlocked(index: number): boolean {

    if (!prereqsMet) return false;
    if (!sequential) return true;
    if (index === 0) return true;

    const prev = questions[index - 1];
    // ✅ excused bypass (system error)
    if (isExcused(prev.id)) return true;

    const ok = getQuestionOk(prev) === true;

    if (!ok && prev.kind === "practice") {
      const ps = practiceBank.practice[prev.id];
      const outOfAttempts =
        ps && !unlimitedAttempts && ps.attempts >= ps.maxAttempts;
      if (outOfAttempts) return true;
    }

    return ok;
  }

  const summary = useMemo(() => {
    let checkedCount = 0;
    let correctCount = 0;
    let denom = 0;
    let excusedCount = 0;

    for (const q of questions) {
      if (isQuestionChecked(q)) checkedCount++;

      if (isExcused(q.id)) {
        excusedCount++;
        continue; // ✅ excused questions do not affect score
      }

      denom++;
      if (getQuestionOk(q) === true) correctCount++;
    }

    const allChecked = checkedCount >= questions.length && questions.length > 0;

    const score = denom === 0 ? 1 : correctCount / denom; // ✅ if everything excused, treat as passable

    const passed = allChecked && (denom === 0 ? true : score >= passScore);

    return {
      checkedCount,
      correctCount,
      total: questions.length,
      denom,
      score,
      allChecked,
      passed,
      excusedCount,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    questions,
    local.checkedById,
    local.answers,
    practiceBank.practice,
    passScore,
    excusedById,
  ]);

  const nextState = useMemo<SavedQuizState>(() => {
    const base = initState;

    const practiceItemPatch: Record<string, any> = {
      ...(base?.practiceItemPatch ?? {}),
    };
    const practiceMeta: Record<string, any> = { ...(base?.practiceMeta ?? {}) };

    for (const q of questions) {
      if (q.kind !== "practice") continue;

      const ps = practiceBank.practice[q.id];
      if (ps) {
        practiceMeta[q.id] = {
          attempts: ps.attempts ?? practiceMeta[q.id]?.attempts ?? 0,
          ok: ps.ok ?? practiceMeta[q.id]?.ok ?? null,
        };
      }

      if (ps?.item) {
        const { key, kind, ...rest } = ps.item as any;
        practiceItemPatch[q.id] = rest;
      }
    }

    return {
      answers: local.answers,
      checkedById: local.checkedById,
      practiceItemPatch,
      practiceMeta,
      excusedById, // ✅ NEW
    };
  }, [
    questions,
    local.answers,
    local.checkedById,
    practiceBank.practice,
    initState,
    excusedById,
  ]);

  const emitState = useCallback(
    (s: SavedQuizState) => onStateChange?.(s),
    [onStateChange],
  );

  const emitter = useDebouncedEmit(nextState, emitState, {
    delayMs: 400,
    enabled: Boolean(onStateChange && questions.length),
  });

  // useLayoutEffect(() => {
  //   emitter.prime({
  //     answers: initState?.answers ?? {},
  //     checkedById: initState?.checkedById ?? {},
  //     practiceItemPatch: initState?.practiceItemPatch ?? {},
  //     practiceMeta: initState?.practiceMeta ?? {},
  //   } as SavedQuizState);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [resetKey]);
  useLayoutEffect(() => {
    emitter.prime({
      answers: initState?.answers ?? {},
      checkedById: initState?.checkedById ?? {},
      practiceItemPatch: initState?.practiceItemPatch ?? {},
      practiceMeta: initState?.practiceMeta ?? {},
      excusedById: initState?.excusedById ?? {}, // ✅
    } as SavedQuizState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  const [confirmResetQuiz, setConfirmResetQuiz] = useState(false);
async function resetThisQuiz() {
  const key = (serverQuizKey || stableKey).trim();
  if (!key) return;

  await fetch(`/api/review/quiz?quizKey=${encodeURIComponent(key)}`, {
    method: "DELETE",
    cache: "no-store",
  });

  onReset?.();
  local.reset();
  practiceBank.setPractice({});
  setExcusedById({});
  setReloadNonce((n) => n + 1);
}

  if (quizLoading) {
    return (
      <div className="mt-2 text-xs text-neutral-500 dark:text-white/60">
        Loading quiz…
      </div>
    );
  }

  if (quizError) {
    return (
      <div className="mt-2 rounded-lg border border-rose-300/20 bg-rose-300/10 p-2 text-xs text-rose-700 dark:text-rose-200/90">
        {quizError}
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="mt-2 text-xs text-neutral-500 dark:text-white/60">
        No questions.
      </div>
    );
  }

  return (
    <div className="mt-3 grid gap-3">
      {questions.map((q, idx) => {
        const unlocked = isUnlocked(idx);

        if (q.kind === "practice") {
          const ps = practiceBank.practice[q.id];
          const pr = practiceBank.getPadRef(q.id);
          const excused = isExcused(q.id);

          return (
            <QuizPracticeCard
              key={q.id}
              q={q}
              excused={excused}
              onExcused={() => {
                const ps = practiceBank.practice[q.id];
                if (!unlocked) return;
                if (!ps?.error) return; // ✅ error-only

                setExcusedById((prev) => ({ ...prev, [q.id]: true }));
              }}
              ps={ps}
              unlocked={unlocked}
              isCompleted={isCompleted}
              locked={locked}
              unlimitedAttempts={unlimitedAttempts}
              padRef={pr as any}
              onUpdateItem={(patch) =>
                practiceBank.updatePracticeItem(q.id, patch)
              }
              onSubmit={() => void practiceBank.submitPractice(q)}
              onReveal={() => void practiceBank.revealPractice(q)}
            />
          );
        }

        const checked = Boolean(local.checkedById[q.id]);
        const ok = getQuestionOk(q);
        // const excused = isExcused(q.id);
        return (

          <QuizLocalCard
          prereqsMet={prereqsMet}
            key={q.id}
            q={q}
            unlocked={unlocked}
            isCompleted={isCompleted}
            locked={locked}
            value={local.answers[q.id]}
            checked={checked}
            ok={ok}
            onPick={(val) => local.setAnswer(q.id, val)}
            onCheck={() => {
              if (isCompleted || locked) return;
              local.check(q.id);
            }}
          />
        );
      })}

      <QuizFooter
        checkedCount={summary.checkedCount}
        correctCount={summary.correctCount}
        total={summary.total}
        scorePct={Math.round(summary.score * 100)}
        isCompleted={isCompleted}
        passed={summary.passed}
        sequential={sequential}
        onResetClick={() => setConfirmResetQuiz(true)}
      />

      {isCompleted ? (
        <div className="rounded-xl border border-emerald-600/25 bg-emerald-500/10 px-3 py-2 text-xs font-extrabold text-emerald-900 dark:border-emerald-300/30 dark:bg-emerald-300/10 dark:text-emerald-100">
          ✓ Completed
        </div>
      ) : prereqsMet && summary.passed ? (
        <button
          type="button"
          onClick={onPass}
          className="rounded-xl border border-emerald-600/25 bg-emerald-500/10 px-3 py-2 text-xs font-extrabold text-emerald-950 hover:bg-emerald-500/15 dark:border-emerald-300/30 dark:bg-emerald-300/10 dark:text-white/90 dark:hover:bg-emerald-300/15"
        >
          Mark complete
        </button>
      ) : null}

     {!isCompleted && summary.allChecked && !prereqsMet ? (
  <div>Finish “Mark as read” items in this topic first.</div>
) : null}


      <ConfirmDialog
        open={confirmResetQuiz}
        onOpenChange={setConfirmResetQuiz}
        danger
        title="Reset this quiz?"
        confirmLabel="Reset quiz"
        description={
          <div className="grid gap-2">
            <div>This will:</div>
            <ul className="list-disc pl-5 space-y-1">
              <li>Clear your selected answers and checked status.</li>
              <li>Clear practice attempts and local state for this quiz.</li>
              <li>
                Reload the <span className="font-black">same</span> question set
                (it does <span className="font-black">not</span> generate a new
                set).
              </li>
            </ul>
            <div className="text-neutral-500 dark:text-white/60 text-xs font-extrabold">
              This can’t be undone.
            </div>
          </div>
        }
        onConfirm={resetThisQuiz}
      />
    </div>
  );
}
