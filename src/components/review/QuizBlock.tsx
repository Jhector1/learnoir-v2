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
                                    strictSequential = false,
                                    onReset,

                                    /** NEW: deterministic ordering across topic page */
                                    orderBase = 0,
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
  strictSequential?: boolean;

  onReset?: () => void;

  orderBase?: number;
}) {
  const initState = initialState ?? null;

  const stableQuizKeyRef = useRef<string>("");
  if (!stableQuizKeyRef.current) {
    stableQuizKeyRef.current = quizKey?.trim()
        ? quizKey.trim()
        : buildReviewQuizKey(spec, quizCardId ?? quizId, 0);
  }
  const stableKey = stableQuizKeyRef.current;

  const [reloadNonce, setReloadNonce] = useState(0);
  const resetKey = `${stableKey}:${reloadNonce}`;

  const { quizLoading, quizError, questions, serverQuizKey } =
      useReviewQuizQuestions({
        quizId,
        spec,
        stableQuizKey: stableKey,
        reloadNonce,
      });

  const [excusedById, setExcusedById] = useState<Record<string, boolean>>({});





  const onPassRef = useRef(onPass);
  useEffect(() => { onPassRef.current = onPass; }, [onPass]);

  const autoKeyRef = useRef<string>("");







  useEffect(() => {
    setExcusedById(initState?.excusedById ?? {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

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
    if (isExcused(q.id)) return true;
    if (q.kind === "practice") return practiceBank.isPracticeChecked(q);
    return Boolean(local.checkedById[q.id]);
  }

  function isUnlocked(index: number): boolean {
    if (!prereqsMet) return false;
    if (!sequential) return true;
    if (index === 0) return true;

    const prev = questions[index - 1];
    if (isExcused(prev.id)) return true;

    const ok = getQuestionOk(prev) === true;

    if (!ok) {
      if (strictSequential) return false;

      if (prev.kind === "practice") {
        const ps = practiceBank.practice[prev.id];
        const outOfAttempts =
            ps && !unlimitedAttempts && ps.attempts >= ps.maxAttempts;
        if (outOfAttempts) return true;
      }
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
        continue;
      }

      denom++;
      if (getQuestionOk(q) === true) correctCount++;
    }

    const allChecked = checkedCount >= questions.length && questions.length > 0;
    const score = denom === 0 ? 1 : correctCount / denom;
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
  useEffect(() => {
    if (!prereqsMet || locked || isCompleted) return;
    if (!summary.passed) return;

    // fire once per resetKey
    if (autoKeyRef.current === resetKey) return;
    autoKeyRef.current = resetKey;

    onPassRef.current();
  }, [prereqsMet, locked, isCompleted, summary.passed, resetKey]);

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
      excusedById,
    };
  }, [
    questions,
    local.answers,
    local.checkedById,
    practiceBank.practice,
    initState,
    excusedById,
  ]);




  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(Boolean(mq.matches));
    apply();

    // Safari fallback
    if (mq.addEventListener) mq.addEventListener("change", apply);
    else (mq as any).addListener?.(apply);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", apply);
      else (mq as any).removeListener?.(apply);
    };
  }, []);

  const qElRef = useRef(new Map<string, HTMLElement | null>());
  const footerElRef = useRef<HTMLDivElement | null>(null);

  const lastActionQidRef = useRef<string | null>(null);
  const advanceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
    };
  }, []);

  function setQuestionEl(qid: string) {
    return (el: HTMLElement | null) => qElRef.current.set(qid, el);
  }

  function focusFirstControl(root: HTMLElement) {
    const el = root.querySelector<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    el?.focus({ preventScroll: true } as any);
  }

  function scrollToEl(root: HTMLElement) {
    root.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
    // focus after scroll starts (prevents jumpy behavior)
    requestAnimationFrame(() => focusFirstControl(root));
  }

  function scrollToFooter() {
    const el = footerElRef.current;
    if (!el) return;
    el.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }


  function findNextUnlockedIndex(fromIdx: number) {
    for (let i = fromIdx + 1; i < questions.length; i++) {
      if (isUnlocked(i)) return i;
    }
    return -1;
  }

  function advanceFrom(qid: string) {
    const idx = questions.findIndex((qq) => qq.id === qid);
    if (idx < 0) return;

    const nextIdx = findNextUnlockedIndex(idx);
    if (nextIdx < 0) {
      // nothing else to advance to; land on footer (nice UX)
      scrollToFooter();
      return;
    }

    const nextQ = questions[nextIdx];
    const el = qElRef.current.get(nextQ.id);
    if (el) scrollToEl(el);
  }



  function isFlowDone(q: ReviewQuestion): boolean {
    // excused counts as flow-done
    if (isExcused(q.id)) return true;

    if (q.kind === "practice") {
      const ps = practiceBank.practice[q.id];
      if (ps?.ok === true) return true;

      const outOfAttempts =
          ps && !unlimitedAttempts && ps.attempts >= ps.maxAttempts;

      // non-strict: out-of-attempts allows progression (your rule)
      if (!strictSequential && outOfAttempts) return true;

      return false;
    }

    // local (mcq/numeric): flow-done only when correct
    return getQuestionOk(q) === true;
  }

  function hasExplain(q: ReviewQuestion) {
    const ex = (q as any).explain;
    return typeof ex === "string" && ex.trim().length > 0;
  }

  useEffect(() => {
    if (!prereqsMet || locked || isCompleted) return;

    const qid = lastActionQidRef.current;
    if (!qid) return;

    const q = questions.find((x) => x.id === qid);
    if (!q) return;

    if (!isFlowDone(q)) return;

    // Don’t auto-advance instantly if there’s an explanation
    // (let user see it; still “smooth”)
    const delay = hasExplain(q) ? 650 : 150;

    if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = window.setTimeout(() => {

      advanceFrom(qid);
      // ✅ prevent repeated auto-advance on later renders
      lastActionQidRef.current = null;

      // optional: clear ref
      advanceTimerRef.current = null;
    }, delay);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    prereqsMet,
    locked,
    isCompleted,
    questions,
    local.checkedById,
    local.answers,
    practiceBank.practice,
    excusedById,
    strictSequential,
    unlimitedAttempts,
  ]);





  const emitState = useCallback(
      (s: SavedQuizState) => onStateChange?.(s),
      [onStateChange],
  );

  const emitter = useDebouncedEmit(nextState, emitState, {
    delayMs: 400,
    enabled: Boolean(onStateChange && questions.length),
  });

  useLayoutEffect(() => {
    emitter.prime({
      answers: initState?.answers ?? {},
      checkedById: initState?.checkedById ?? {},
      practiceItemPatch: initState?.practiceItemPatch ?? {},
      practiceMeta: initState?.practiceMeta ?? {},
      excusedById: initState?.excusedById ?? {},
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

          return (
              <div key={q.id} ref={setQuestionEl(q.id)} data-qid={q.id}>
                {q.kind === "practice" ? (
                    <QuizPracticeCard
                        q={q}
                        ps={practiceBank.practice[q.id]}
                        unlocked={unlocked}
                        isCompleted={isCompleted}
                        locked={locked}
                        unlimitedAttempts={unlimitedAttempts}
                        strictSequential={strictSequential}
                        seqOrder={orderBase + idx}
                        padRef={practiceBank.getPadRef(q.id) as any}
                        excused={isExcused(q.id)}
                        onExcused={() => {
                          if (!unlocked) return;
                          const ps0 = practiceBank.practice[q.id];
                          if (!ps0?.error) return;
                          setExcusedById((prev) => ({ ...prev, [q.id]: true }));
                          // treat “Continue” as last action so it can advance
                          lastActionQidRef.current = q.id;
                        }}
                        onUpdateItem={(patch) => practiceBank.updatePracticeItem(q.id, patch)}
                        onSubmit={() => {
                          lastActionQidRef.current = q.id;
                          void practiceBank.submitPractice(q);
                        }}
                        onReveal={() => void practiceBank.revealPractice(q)}
                    />
                ) : (
                    <QuizLocalCard
                        prereqsMet={prereqsMet}
                        q={q}
                        unlocked={unlocked}
                        isCompleted={isCompleted}
                        locked={locked}
                        value={local.answers[q.id]}
                        checked={Boolean(local.checkedById[q.id])}
                        ok={getQuestionOk(q)}
                        onPick={(val) => local.setAnswer(q.id, val)}
                        onCheck={() => {
                          if (isCompleted || locked) return;
                          lastActionQidRef.current = q.id;
                          local.check(q.id);
                        }}
                    />
                )}
              </div>
          );
        })}
        <div ref={footerElRef}>
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
        </div>
        {isCompleted ? (
            <div className="...">✓ Completed</div>
        ) : prereqsMet && summary.passed ? (
            <div className="...">✓ Passed — saving…</div>
        ) : null}
        {/*{isCompleted ? (*/}
        {/*    <div className="rounded-xl border border-emerald-600/25 bg-emerald-500/10 px-3 py-2 text-xs font-extrabold text-emerald-900 dark:border-emerald-300/30 dark:bg-emerald-300/10 dark:text-emerald-100">*/}
        {/*      ✓ Completed*/}
        {/*    </div>*/}
        {/*) : prereqsMet && summary.passed ? (*/}
        {/*    <button*/}
        {/*        type="button"*/}
        {/*        onClick={onPass}*/}
        {/*        className="rounded-xl border border-emerald-600/25 bg-emerald-500/10 px-3 py-2 text-xs font-extrabold text-emerald-950 hover:bg-emerald-500/15 dark:border-emerald-300/30 dark:bg-emerald-300/10 dark:text-white/90 dark:hover:bg-emerald-300/15"*/}
        {/*    >*/}
        {/*      Mark complete*/}
        {/*    </button>*/}
        {/*) : null}*/}

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