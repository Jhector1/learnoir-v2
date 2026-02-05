// src/components/review/QuizBlock.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { ReviewQuestion, ReviewQuizSpec } from "@/lib/review/types";
import MathMarkdown from "../math/MathMarkdown";

import type { Exercise } from "@/lib/practice/types";
import type { VectorPadState } from "@/components/vectorpad/types";
import ExerciseRenderer from "@/components/practice/ExerciseRenderer";
import type { QItem } from "@/components/practice/practiceType";

import {
  fetchPracticeExercise,
  submitPracticeAnswer,
  type PracticeGetResponse,
} from "@/lib/practice/clientApi";
import {
  buildSubmitAnswerFromItem,
  cloneVec,
  initItemFromExercise,
} from "@/lib/practice/uiHelpers";
import { defaultVectorPadState } from "@/components/vectorpad/defaultState";

import { fetchReviewQuiz } from "@/lib/review/clientApi";
import type { SavedQuizState } from "@/lib/review/progressTypes";
import { buildReviewQuizKey } from "@/lib/review/quizClient";
import ConfirmDialog from "../ui/ConfirmDialog";
import RevealAnswerCard from "../practice/RevealAnswerCard";
import { makeDefaultPadState } from "../practice/helper";

/** Normalizes latex-ish strings into your MathMarkdown expectations */
function normalizeMath(md: string) {
  const s = String(md ?? "");

  const ttWrapped = s.replace(
    /\\\(\s*\\texttt\{([\s\S]*?)\}\s*\\\)/g,
    (_m, inner) => `\`${String(inner).trim()}\``,
  );

  const tt = ttWrapped.replace(
    /\\texttt\{([\s\S]*?)\}/g,
    (_m, inner) => `\`${String(inner).trim()}\``,
  );

  const inline = tt.replace(
    /\\\(([\s\S]*?)\\\)/g,
    (_m, inner) => `$${String(inner).trim()}$`,
  );

  const display = inline.replace(
    /\\\[([\s\S]*?)\\\]/g,
    (_m, inner) => `$$\n${String(inner).trim()}\n$$`,
  );

  return display;
}

type PracticeState = {
  loading: boolean;
  error: string | null;
  busy: boolean;

  exercise: Exercise | null;
  item: QItem | null;

  attempts: number;
  maxAttempts: number; // Infinity allowed
  ok: boolean | null;
};

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

  // parent can tell us it’s already completed
  isCompleted = false,
  quizCardId,
  locked = false,

  // parent can tell us to clear saved state when reset
  onReset,
}: {
  prereqsMet?: boolean;
  quizId: string;
  spec: ReviewQuizSpec;
  quizKey?: string; // stable quiz identity (persisted on server)
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
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ReviewQuestion[]>([]);

  // local answers (mcq/numeric)
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [checkedById, setCheckedById] = useState<Record<string, boolean>>({});

  // practice questions state
  const [practice, setPractice] = useState<Record<string, PracticeState>>({});
  // const [confirmRevealQid, setConfirmRevealQid] = useState<string | null>(null);

  // vector pad refs (practice)
 const padRefs = useRef<Record<string, React.MutableRefObject<VectorPadState>>>({});

  const [confirmResetQuiz, setConfirmResetQuiz] = useState(false);


function getPadRef(id: string) {
  if (!padRefs.current[id]) {
    padRefs.current[id] = { current: defaultVectorPadState() };
  }
  return padRefs.current[id];
}



  // stable identity (freeze quiz instance on server)
  const stableQuizKey = useMemo(() => {
    if (quizKey?.trim()) return quizKey.trim();
    return buildReviewQuizKey(spec, quizCardId ?? quizId, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    quizKey,
    quizId,
    quizCardId,
    spec.subject,
    spec.module,
    spec.section,
    spec.topic,
    spec.difficulty,
    spec.n,
    (spec as any).allowReveal,
    (spec as any).preferKind,
    (spec as any).maxAttempts,
  ]);

  const [reloadNonce, setReloadNonce] = useState(0);
  const [serverQuizKey, setServerQuizKey] = useState(stableQuizKey);
  useEffect(() => setServerQuizKey(stableQuizKey), [stableQuizKey]);

function isEmptyPracticeAnswer(ex: Exercise, item: QItem, pad?: VectorPadState | null) {
  // Vector drags: treat "no input" as missing vector
  if (ex.kind === "vector_drag_dot") {
    const a = pad?.a ?? (item as any).dragA;
    // if your vec shape is {x,y} or {x,y,z}, tweak as needed
    return !a || (![a.x, a.y, a.z].some((v) => Number.isFinite(v)));
  }

  if (ex.kind === "vector_drag_target") {
    const a = pad?.a ?? (item as any).dragA;
    const b = pad?.b ?? (item as any).dragB;
    const hasA = a && ([a.x, a.y, a.z].some((v) => Number.isFinite(v)));
    const hasB = b && ([b.x, b.y, b.z].some((v) => Number.isFinite(v)));
    return !(hasA && hasB);
  }

  // Everything else: rely on your existing builder
  // (it returns undefined when incomplete in your code)
  const built = buildSubmitAnswerFromItem(item);
  return !built;
}



  // keep initial state stable across parent re-renders
  const initialStateRef = useRef<SavedQuizState | null>(initialState ?? null);

  // dedupe emitter so parent doesn’t get spammed
  const lastEmitRef = useRef<string>("");

  // ---------------- correctness helpers ----------------
  function isPracticeChecked(q: Extract<ReviewQuestion, { kind: "practice" }>) {
    // const ps = practice[q.id];
    // return Boolean(ps && (ps.ok !== null || ps.item?.submitted));
    const ps = practice[q.id];

    // ✅ Only "checked" if user actually pressed "Check this answer"
    // (attempts increments only inside submitPractice)
    return Boolean(ps && ps.attempts > 0);
  }

  function isQuestionChecked(q: ReviewQuestion): boolean {
    if (q.kind === "practice") return isPracticeChecked(q);
    return Boolean(checkedById[q.id]);
  }

  function isUnlocked(index: number): boolean {
    if (!sequential) return true;
    if (index === 0) return true;

    const prev = questions[index - 1];
    const ok = getQuestionOk(prev) === true;

    // ✅ allow progress if out of attempts (only for practice questions)
    if (!ok && prev.kind === "practice") {
      const ps = practice[prev.id];
      const outOfAttempts =
        ps && !unlimitedAttempts && ps.attempts >= ps.maxAttempts;
      if (outOfAttempts) return true;
    }

    return ok;
  }
  async function revealPractice(
    q: Extract<ReviewQuestion, { kind: "practice" }>,
  ) {
    if (isCompleted) return;

    const ps = practice[q.id];
    if (!ps || ps.loading || ps.busy || !ps.item) return;

    setPractice((prev) => ({
      ...prev,
      [q.id]: { ...prev[q.id], busy: true, error: null },
    }));

    try {
      const data = await submitPracticeAnswer({
        key: (ps.item as any).key,
        reveal: true,
      } as any);
      console.log("revealPractice data:", data);

      // If server returns expected vectors, sync pads + item (optional)
  const solA =
  (data as any)?.revealAnswer?.solutionA ??
  (data as any)?.reveal?.solutionA ??
  (data as any)?.expected?.solutionA;

const bExp =
  (data as any)?.revealAnswer?.b ??
  (data as any)?.reveal?.b ??
  (data as any)?.expected?.b;

      if (solA) updatePracticeItem(q.id, { dragA: cloneVec(solA) } as any);
      if (bExp) updatePracticeItem(q.id, { dragB: cloneVec(bExp) } as any);

      const pr = getPadRef(q.id);
      if (pr.current) {
        if (solA) pr.current.a = cloneVec(solA) as any;
        if (bExp) pr.current.b = cloneVec(bExp) as any;
      }

      setPractice((prev) => ({
        ...prev,
        [q.id]: {
          ...prev[q.id],
          busy: false,
          error: null,
          // IMPORTANT:
          // - reveal should NOT force ok=true
          // - reveal should NOT force submitted=true unless your API says finalized
          ok: (prev[q.id].ok ?? null) as any,
          item: {
            ...prev[q.id].item!,
            result: data as any,
            revealed: true,
            submitted:
              Boolean((data as any)?.finalized) || prev[q.id].item!.submitted, // keep lock only if finalized
          } as any,
        },
      }));
    } catch (e: any) {
      setPractice((prev) => ({
        ...prev,
        [q.id]: {
          ...prev[q.id],
          busy: false,
          error: e?.message ?? "Reveal failed.",
        },
      }));
    }
  }

  function getQuestionOk(q: ReviewQuestion): boolean | null {
    if (q.kind === "mcq") {
      if (!checkedById[q.id]) return null;
      return answers[q.id] === q.answerId;
    }
    if (q.kind === "numeric") {
      if (!checkedById[q.id]) return null;
      const v = Number(answers[q.id]);
      if (!Number.isFinite(v)) return false;
      const tol = q.tolerance ?? 0;
      return Math.abs(v - q.answer) <= tol;
    }
    if (q.kind === "practice") {
      const ps = practice[q.id];
      return ps ? ps.ok : null;
    }
    return null;
  }

  // ---------------- persist quiz state (debounced + dedupe) ----------------
  useEffect(() => {
    if (!onStateChange) return;
    if (!questions.length) return;

    const t = setTimeout(() => {
      const practiceItemPatch: Record<string, any> = {};
      const practiceMeta: Record<string, any> = {};

      for (const q of questions) {
        if (q.kind !== "practice") continue;
        const ps = practice[q.id];
        if (!ps?.item) continue;

        // store item patch only (no key/kind)
        const { key, kind, ...rest } = ps.item as any;
        practiceItemPatch[q.id] = rest;

        practiceMeta[q.id] = {
          attempts: ps.attempts ?? 0,
          ok: ps.ok ?? null,
        };
      }

      const nextState: SavedQuizState = {
        answers,
        checkedById,
        practiceItemPatch,
        practiceMeta,
      };

      const snap = JSON.stringify(nextState);
      if (snap === lastEmitRef.current) return;
      lastEmitRef.current = snap;

      onStateChange(nextState);
    }, 400);

    return () => clearTimeout(t);
  }, [answers, checkedById, practice, questions, onStateChange]);

  // ---------------- 1) load quiz questions (frozen by quizKey) ----------------
  useEffect(() => {
    const ctrl = new AbortController();
    setQuizLoading(true);
    setQuizError(null);

    (async () => {
      try {
        const reqSpec = { ...(spec as any), quizKey: stableQuizKey } as any;
        const data = await fetchReviewQuiz(reqSpec, ctrl.signal);

        setServerQuizKey(data.quizKey ?? stableQuizKey);

        const qs = Array.isArray(data?.questions) ? data.questions : [];
        setQuestions(qs);

        const init = initialState ?? null;
        initialStateRef.current = init;

        setAnswers(init?.answers ?? {});
        setCheckedById(init?.checkedById ?? {});
        setPractice({});
        padRefs.current = {};

        lastEmitRef.current = JSON.stringify({
          answers: init?.answers ?? {},
          checkedById: init?.checkedById ?? {},
          practiceItemPatch: init?.practiceItemPatch ?? {},
          practiceMeta: init?.practiceMeta ?? {},
        });
      } catch (e: any) {
        if (e?.name !== "AbortError")
          setQuizError(e?.message ?? "Failed to load quiz.");
      } finally {
        setQuizLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [quizId, stableQuizKey, reloadNonce]);

  // ---------------- 2) fetch practice exercises for practice questions ----------------
  useEffect(() => {
    if (!questions.length) return;

    let cancelled = false;

    async function ensurePracticeQuestion(q: ReviewQuestion) {
      if (q.kind !== "practice") return;

      setPractice((prev) => {
        if (prev[q.id]) return prev;
        return {
          ...prev,
          [q.id]: {
            loading: true,
            error: null,
            busy: false,
            exercise: null,
            item: null,
            attempts: 0,
            maxAttempts: unlimitedAttempts
              ? Number.POSITIVE_INFINITY
              : Math.max(
                  1,
                  Math.floor(q.maxAttempts ?? (spec as any).maxAttempts ?? 1),
                ),
            ok: null,
          },
        };
      });

      try {
        const res: PracticeGetResponse = await fetchPracticeExercise({
          subject: q.fetch.subject,
          module: q.fetch.module,
          section: q.fetch.section,
          topic: q.fetch.topic ? String(q.fetch.topic) : "",
          difficulty: q.fetch.difficulty,
          allowReveal: q.fetch.allowReveal ? true : undefined,
          preferKind: q.fetch.preferKind ?? undefined,
          salt: (q.fetch as any).salt ?? undefined,
        } as any);

        const ex = (res as any)?.exercise;
        const key = (res as any)?.key;

        if (
          !ex ||
          typeof (ex as any)?.kind !== "string" ||
          typeof key !== "string"
        ) {
          throw new Error(
            "Malformed response from /api/practice (missing exercise/key).",
          );
        }

        const item = initItemFromExercise(ex as Exercise, key);
        if (cancelled) return;

        const init = initialStateRef.current;

        const patch = init?.practiceItemPatch?.[q.id];
        const patchedItem = patch ? { ...item, ...patch } : item;

        setPractice((prev) => ({
          ...prev,
          [q.id]: {
            ...prev[q.id],
            loading: false,
            error: null,
            exercise: ex as Exercise,
            item: patchedItem,
            attempts: init?.practiceMeta?.[q.id]?.attempts ?? 0,
            ok: init?.practiceMeta?.[q.id]?.ok ?? null,
          },
        }));
      } catch (e: any) {
        if (cancelled) return;
        setPractice((prev) => ({
          ...prev,
          [q.id]: {
            ...prev[q.id],
            loading: false,
            error: e?.message ?? "Failed to load practice exercise.",
            busy: false,
          },
        }));
      }
    }

    for (const q of questions) void ensurePracticeQuestion(q);

    return () => {
      cancelled = true;
    };
  }, [questions, unlimitedAttempts, (spec as any).maxAttempts]);

  // ---------------- state helpers ----------------
  function updatePracticeItem(qid: string, patch: Partial<QItem>) {
    setPractice((prev) => {
      const ps = prev[qid];
      if (!ps?.item) return prev;
      return { ...prev, [qid]: { ...ps, item: { ...ps.item, ...patch } } };
    });
  }

  async function resetThisQuiz() {
    const key = (serverQuizKey || stableQuizKey).trim();
    if (!key) return;

    await fetch(`/api/review/quiz?quizKey=${encodeURIComponent(key)}`, {
      method: "DELETE",
      cache: "no-store",
    });

    onReset?.();

    setAnswers({});
    setCheckedById({});
    setPractice({});
    padRefs.current = {};
    initialStateRef.current = null;
    lastEmitRef.current = "";

    setReloadNonce((n) => n + 1);
  }

  async function submitPractice(
    q: Extract<ReviewQuestion, { kind: "practice" }>,
  ) {
    if (isCompleted) return;

    const ps = practice[q.id];
    if (!ps || ps.loading || ps.busy || !ps.item || !ps.exercise) return;

    const outOfAttempts = !unlimitedAttempts && ps.attempts >= ps.maxAttempts;
    if (outOfAttempts) return;

    if (ps.ok === true) return;

    setPractice((prev) => ({
      ...prev,
      [q.id]: { ...prev[q.id], busy: true, error: null },
    }));

    try {
      const ex = ps.exercise;
      let answer: any = undefined;

      if (ex.kind === "vector_drag_dot") {
        const pr = getPadRef(q.id);
        const a = pr.current?.a ?? (ps.item as any).dragA;
        answer = { kind: "vector_drag_dot", a: cloneVec(a) };
        updatePracticeItem(q.id, { dragA: cloneVec(a) } as any);
      } else if (ex.kind === "vector_drag_target") {
        const pr = getPadRef(q.id);
        const a = pr.current?.a ?? (ps.item as any).dragA;
        const b = pr.current?.b ?? (ps.item as any).dragB;
        answer = { kind: "vector_drag_target", a: cloneVec(a), b: cloneVec(b) };
        updatePracticeItem(q.id, {
          dragA: cloneVec(a),
          dragB: cloneVec(b),
        } as any);
      } else {
        answer = buildSubmitAnswerFromItem(ps.item);
      }

      if (!answer) throw new Error("Incomplete answer.");

      const data = await submitPracticeAnswer({
        key: (ps.item as any).key,
        answer,
      } as any);
      const ok = Boolean((data as any)?.ok);

      setPractice((prev) => {
        const nextAttempts = prev[q.id].attempts + 1;
        const maxA = prev[q.id].maxAttempts;

        return {
          ...prev,
          [q.id]: {
            ...prev[q.id],
            busy: false,
            attempts: nextAttempts,
            ok,
            item: {
              ...prev[q.id].item!,
              result: data as any,
              submitted: true,
              // submitted: ok || (!unlimitedAttempts && nextAttempts >= maxA),
              attempts: nextAttempts,
            } as any,
          },
        };
      });
    } catch (e: any) {
      setPractice((prev) => ({
        ...prev,
        [q.id]: {
          ...prev[q.id],
          busy: false,
          error: e?.message ?? "Submit failed.",
        },
      }));
    }
  }

  function checkLocalQuestion(qid: string) {
    if (isCompleted) return;
    setCheckedById((prev) => ({ ...prev, [qid]: true }));
  }

  // ---------------- summary ----------------
  const summary = useMemo(() => {
    let checkedCount = 0;
    let correctCount = 0;

    for (const q of questions) {
      if (q.kind === "practice") {
        if (isPracticeChecked(q)) checkedCount++;
        if (getQuestionOk(q) === true) correctCount++;
      } else {
        if (checkedById[q.id]) checkedCount++;
        if (getQuestionOk(q) === true) correctCount++;
      }
    }

    const denom = Math.max(1, questions.length);
    const score = correctCount / denom;
    const allChecked = checkedCount >= questions.length && questions.length > 0;
    const passed = allChecked && score >= passScore;

    return {
      checkedCount,
      correctCount,
      total: questions.length,
      score,
      allChecked,
      passed,
    };
  }, [questions, checkedById, answers, practice, passScore]);

  const allChecked = useMemo(() => {
    if (!questions.length) return false;
    return questions.every((q) => isQuestionChecked(q));
  }, [questions, checkedById, practice]); // practice needed for practice attempts

  const allOk = useMemo(() => {
    if (!questions.length) return false;
    return questions.every((q) => getQuestionOk(q) === true);
  }, [questions, checkedById, answers, practice]);

  if (quizLoading)
    return <div className="mt-2 text-xs text-white/60">Loading quiz…</div>;
  if (quizError) {
    return (
      <div className="mt-2 rounded-lg border border-rose-300/20 bg-rose-300/10 p-2 text-xs text-rose-200/90">
        {quizError}
      </div>
    );
  }
  if (!questions.length)
    return <div className="mt-2 text-xs text-white/60">No questions.</div>;

  return (
    <div className="mt-3 grid gap-3">
      {questions.map((q, idx) => {
        const unlocked = isUnlocked(idx);

        if (q.kind === "practice") {
          const ps = practice[q.id];
          const outOfAttempts = ps
            ? !unlimitedAttempts && ps.attempts >= ps.maxAttempts
            : false;
const pr = getPadRef(q.id);
const hasInput =
  ps?.exercise && ps?.item
    ? !isEmptyPracticeAnswer(ps.exercise, ps.item, pr.current)
    : false;

          const disableCheckAnswer =
            !unlocked ||
            isCompleted ||
            locked ||
            (ps?.busy ?? false) ||
            outOfAttempts ||
            ps?.ok === true|| !hasInput; // ✅ o

          return (
            <div
              key={q.id}
              className={[
                "rounded-xl border border-white/10 bg-white/[0.03] p-3",
                !unlocked ? "opacity-70" : "",
              ].join(" ")}
            >
              {ps?.exercise?.prompt ? (
                <MathMarkdown
                  className="
                    text-sm text-white/80
                    [&_.katex]:text-white/90
                    [&_.katex-display]:overflow-x-auto
                    [&_.katex-display]:py-2
                  "
                  content={normalizeMath(String(ps.exercise.prompt))}
                />
              ) : null}

              {ps?.exercise?.title ? (
                <div className="mt-1 text-xs font-black text-white/60">
                  {String(ps.exercise.title)}
                </div>
              ) : null}

              {!unlocked ? (
                <div className="mt-2 text-xs font-extrabold text-white/50">
                  Answer the previous question correctly to unlock this one.
                </div>
              ) : null}
              {ps?.loading ? (
                <div className="mt-2 text-xs text-white/60">
                  Loading exercise…
                </div>
              ) : ps?.error ? (
                <div className="mt-2 rounded-lg border border-rose-300/20 bg-rose-300/10 p-2 text-xs text-rose-200/90">
                  {ps.error}
                </div>
              ) : ps?.exercise && ps?.item ? (
                <div className="mt-2">
                  <ExerciseRenderer
                    exercise={ps.exercise}
                    current={ps.item}
                    busy={ps.busy || !unlocked || isCompleted || locked}
                    isAssignmentRun={false}
                    maxAttempts={ps.maxAttempts}
                    padRef={getPadRef(q.id) as any}
                    updateCurrent={(patch) => {
                      if (!unlocked || isCompleted || locked) return;
                      updatePracticeItem(q.id, patch);
                    }}
                  />
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void submitPractice(q)}
                        disabled={disableCheckAnswer}
                        className={[
                          "shrink-0 rounded-xl border px-3 py-2 text-xs font-extrabold transition",
                          disableCheckAnswer
                            ? "cursor-not-allowed border-white/10 bg-white/5 text-white/40"
                            : "border-white/10 bg-white/10 text-white/80 hover:bg-white/15",
                        ].join(" ")}
                      >
                        Check this answer
                      </button>

                      <button
                        type="button"
                        onClick={() => void revealPractice(q)}

                        // onClick={() => setConfirmRevealQid(q.id)}
                        disabled={!unlocked || isCompleted || locked || ps.busy}
                        className={[
                          "shrink-0 rounded-xl border px-3 py-2 text-xs font-extrabold transition",
                          !unlocked || isCompleted || locked || ps.busy
                            ? "cursor-not-allowed border-white/10 bg-white/5 text-white/40"
                            : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10",
                        ].join(" ")}
                      >
                        Reveal
                      </button>
                    </div>

                    {/* attempts + status */}
                    <div className="min-w-0 text-xs font-extrabold text-white/60 sm:text-right">
                      <span className="whitespace-normal">
                        Attempts: {ps.attempts}/
                        {Number.isFinite(ps.maxAttempts) ? ps.maxAttempts : "∞"}
                      </span>
                      {ps.ok === true ? (
                        <span className="ml-2 whitespace-nowrap text-emerald-300/80">
                          ✓ Correct
                        </span>
                      ) : ps.ok === false && ps.item?.result ? (
                        <span className="ml-2 whitespace-nowrap text-rose-300/80">
                          ✕ Not correct
                        </span>
                      ) : null}
                    </div>
                    {/* {unlocked && !isCompleted && !locked && !ps?.busy && !outOfAttempts && !hasInput ? (
  <div className="mt-2 text-xs font-extrabold text-white/50">
    Add an answer to enable “Check”.
  </div>
) : null} */}

                  </div>
       {ps.item?.revealed && ps.item?.result ? (
  <RevealAnswerCard
    exercise={ps.exercise}
    current={ps.item}
    result={ps.item.result}
    updateCurrent={(patch) => {
      if (!unlocked || isCompleted || locked) return;

      // update saved inputs
      updatePracticeItem(q.id, patch);

      // IMPORTANT: if patch includes vectors, also sync the pad ref
      const pr = getPadRef(q.id);
      if (pr.current) {
        if ((patch as any).dragA) pr.current.a = cloneVec((patch as any).dragA) as any;
        if ((patch as any).dragB) pr.current.b = cloneVec((patch as any).dragB) as any;
      }
    }}
  />
) : null}


                </div>
              ) : (
                <div className="mt-2 text-xs text-white/60">No exercise.</div>
              )}
            </div>
          );
        }

        const localChecked = Boolean(checkedById[q.id]);
        const ok = getQuestionOk(q);

        return (
          <div
            key={q.id}
            className={[
              "rounded-xl border border-white/10 bg-white/[0.03] p-3",
              !unlocked ? "opacity-70" : "",
            ].join(" ")}
          >
            <MathMarkdown
              className="
                text-sm text-white/80
                [&_.katex]:text-white/90
                [&_.katex-display]:overflow-x-auto
                [&_.katex-display]:py-2
              "
              content={normalizeMath(String((q as any).prompt ?? ""))}
            />

            {!unlocked ? (
              <div className="mt-2 text-xs font-extrabold text-white/50">
                Answer the previous question correctly to unlock this one.
              </div>
            ) : null}
            {q.kind === "mcq" ? (
              <div className="mt-2 grid gap-2">
                {q.choices.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    disabled={!unlocked || isCompleted || locked}
                    onClick={() =>
                      unlocked &&
                      !isCompleted &&
                      !locked &&
                      setAnswers((a) => ({ ...a, [q.id]: c.id }))
                    }
                    className={[
                      "text-left rounded-lg border px-3 py-2 text-xs font-extrabold transition",
                      answers[q.id] === c.id
                        ? "border-sky-300/30 bg-sky-300/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10",
                      !unlocked || isCompleted || locked
                        ? "cursor-not-allowed opacity-60 hover:bg-white/5"
                        : "",
                    ].join(" ")}
                  >
                    <MathMarkdown
                      inline
                      className="text-xs font-extrabold text-white/90 [&_.katex]:text-white/90"
                      content={normalizeMath(c.label)}
                    />
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <input
                  disabled={!unlocked || isCompleted || locked}
                  className={[
                    "w-40 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/90 outline-none",
                    !unlocked || isCompleted || locked
                      ? "cursor-not-allowed opacity-60"
                      : "",
                  ].join(" ")}
                  placeholder="Enter a number"
                  value={answers[q.id] ?? ""}
                  onChange={(e) =>
                    unlocked &&
                    !isCompleted &&
                    !locked &&
                    setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                  }
                />
                {q.tolerance ? (
                  <div className="text-xs text-white/50">± {q.tolerance}</div>
                ) : null}
              </div>
            )}

            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <button
                type="button"
                disabled={!unlocked || isCompleted || locked}
                onClick={() =>
                  unlocked &&
                  !isCompleted &&
                  !locked &&
                  checkLocalQuestion(q.id)
                }
                className={[
                  "shrink-0 rounded-xl border px-3 py-2 text-xs font-extrabold transition",
                  !unlocked || isCompleted || locked
                    ? "cursor-not-allowed border-white/10 bg-white/5 text-white/40"
                    : "border-white/10 bg-white/10 text-white/80 hover:bg-white/15",
                ].join(" ")}
              >
                Check this question
              </button>

              <div className="text-xs font-extrabold text-white/60 sm:text-right">
                {localChecked ? (
                  ok === true ? (
                    <span className="text-emerald-300/80">✓ Correct</span>
                  ) : (
                    <span className="text-rose-300/80">✕ Not correct</span>
                  )
                ) : (
                  <span className="text-white/50">Not checked yet</span>
                )}
              </div>
            </div>

            {localChecked && (q as any).explain ? (
              <div className="mt-2 rounded-lg border border-white/10 bg-black/30 p-2">
                <MathMarkdown
                  className="text-xs text-white/70 [&_.katex]:text-white/90"
                  content={normalizeMath(String((q as any).explain))}
                />
              </div>
            ) : null}
          </div>
        );
      })}

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
        <div className="text-xs font-extrabold text-white/70">
          Checked: {summary.checkedCount}/{summary.total} • Correct:{" "}
          {summary.correctCount}/{summary.total} • Score:{" "}
          {Math.round(summary.score * 100)}%
        </div>

        <div className="flex items-center gap-2">
          {!isCompleted ? (
            <button
              type="button"
              onClick={() => setConfirmResetQuiz(true)}
              className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-extrabold hover:bg-white/15"
            >
              Reset quiz
            </button>
          ) : null}

          {isCompleted ? (
            <span className="text-xs font-extrabold text-emerald-300/80">
              ✓ Completed
            </span>
          ) : summary.passed ? (
            <span className="text-xs font-extrabold text-emerald-300/80">
              ✓ Passed
            </span>
          ) : (
            <span className="text-xs font-extrabold text-white/50">
              {sequential
                ? "Check each question in order to pass"
                : "Check all questions to pass"}
            </span>
          )}
        </div>
      </div>

      {isCompleted ? (
        <div className="rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 text-xs font-extrabold text-emerald-200/90">
          ✓ Completed
        </div>
      ) : prereqsMet && allChecked && allOk ? (
        <button
          type="button"
          onClick={onPass}
          className="rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 text-xs font-extrabold hover:bg-emerald-300/15"
        >
          Mark complete
        </button>
      ) : null}

      {!isCompleted && allChecked && allOk && !prereqsMet ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-extrabold text-white/60">
          Finish “Mark as read” / “Mark explored” items in this topic first.
        </div>
      ) : null}
      {/* <ConfirmDialog
        open={confirmRevealQid != null}
        onOpenChange={(open) => !open && setConfirmRevealQid(null)}
        danger
        title="Reveal the answer?"
        confirmLabel="Reveal"
        description={
          <div className="grid gap-2">
            <div>
              This will show the solution/expected answer for this question.
            </div>
            <div className="text-white/60 text-xs font-extrabold">
              You can still try again unless attempts are limited and your
              server finalizes on reveal.
            </div>
          </div>
        }
        onConfirm={async () => {
          const qid = confirmRevealQid;
          setConfirmRevealQid(null);
          const qObj = questions.find((x) => x.id === qid);
          if (qObj && qObj.kind === "practice") {
            await revealPractice(qObj);
          }
        }}
      /> */}

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
            <div className="text-white/60 text-xs font-extrabold">
              This can’t be undone.
            </div>
          </div>
        }
        onConfirm={async () => {
          await resetThisQuiz();
        }}
      />
    </div>
  );
}
