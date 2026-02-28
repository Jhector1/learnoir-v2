// src/features/practice/client/usePracticeEngine.ts
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import type {
  Exercise,
  SubmitAnswer,
  Difficulty,
  TopicSlug,
} from "@/lib/practice/types";
import type { QItem, MissedItem } from "@/components/practice/practiceType";
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
import { isExcusedPracticeItem } from "@/lib/flow/excuse";
import { usePracticeExcuseActions } from "@/lib/flow/usePracticeExcuseActions";
import { getSessionStatus, SessionStatus } from "./sessionStatus";
import { SESSION_DEFAULT } from "./constants";
import type { RunMeta, TopicValue } from "./usePracticeRunMeta";
import type { VectorPadState } from "@/components/vectorpad/types";
import { getEffectiveSid } from "./storage";
import type { SessionHistoryRow } from "./sessionStatus";
import { PurposeMode, PurposePolicy } from "@/lib/subjects/types";

export type Phase = "practice" | "summary";

/* -------------------------------- helpers -------------------------------- */

function applyAnswerPayloadToItem(item: QItem, payload: any) {
  if (!payload || typeof payload !== "object") return;

  switch (payload.kind) {
    case "single_choice":
      (item as any).single = payload.optionId ?? null;
      break;
    case "multi_choice":
      (item as any).multi = Array.isArray(payload.optionIds) ? payload.optionIds : [];
      break;
    case "numeric":
      (item as any).num =
          payload.value === null || payload.value === undefined ? "" : String(payload.value);
      break;
    case "matrix_input":
      if (Array.isArray(payload.raw)) (item as any).mat = payload.raw;
      break;

    case "code_input": {
      const code =
          typeof payload.code === "string"
              ? payload.code
              : typeof payload.source === "string"
                  ? payload.source
                  : "";

      const stdin =
          typeof payload.stdin === "string"
              ? payload.stdin
              : typeof payload.codeStdin === "string"
                  ? payload.codeStdin
                  : "";

      const lang =
          typeof payload.language === "string"
              ? payload.language
              : typeof payload.codeLang === "string"
                  ? payload.codeLang
                  : null;

      if (lang) (item as any).codeLang = lang;
      (item as any).code = code;
      (item as any).codeStdin = stdin;
      break;
    }

    case "vector_drag_dot":
      (item as any).dragA = payload.a ?? (item as any).dragA;
      break;
    case "vector_drag_target":
      (item as any).dragA = payload.a ?? (item as any).dragA;
      (item as any).dragB = payload.b ?? (item as any).dragB;
      break;
  }
}

export function buildCorrectItemFromExpected(q: QItem, expectedPayload: any): QItem | null {
  const exercise = q.exercise as Exercise | undefined;
  if (!exercise || !expectedPayload) return null;

  const payload =
      typeof expectedPayload === "object" && expectedPayload?.kind
          ? expectedPayload
          : {
            kind: String(exercise.kind),
            ...(typeof expectedPayload === "object" ? expectedPayload : {}),
          };

  const item = initItemFromExercise(exercise, `expected:${q.key}`);
  applyAnswerPayloadToItem(item, payload);

  (item as any).submitted = true;
  (item as any).revealed = true;
  (item as any).result = { ok: true, finalized: true };

  return item;
}

export function historyRowToQItem(h: SessionHistoryRow): QItem {
  const ex: Exercise = {
    topic: String(h.topic ?? "all"),
    kind: String(h.kind),
    title: String(h.title ?? ""),
    prompt: String(h.prompt ?? ""),
    ...(h.publicPayload ?? {}),
  } as any;

  const key = `history:${String(h.instanceId)}`;
  const item = initItemFromExercise(ex, key);

  (item as any).attempts = Number(h.attempts ?? 0);
  (item as any).revealed = Boolean(h.lastRevealUsed);

  const finalized = Boolean(h.answeredAt) || Number(h.attempts ?? 0) > 0;
  (item as any).submitted = finalized;

  (item as any).result = {
    ok: h.lastOk === null ? undefined : Boolean(h.lastOk),
    finalized,
    expected: h.expectedAnswerPayload ?? null,
    explanation: h.explanation ?? null,
  };

  applyAnswerPayloadToItem(item, h.lastAnswerPayload);
  return item;
}

function exerciseSignature(ex: Exercise | null | undefined): string {
  if (!ex) return "";
  return [
    String(ex.topic ?? ""),
    String(ex.kind ?? ""),
    String(ex.title ?? ""),
    String(ex.prompt ?? ""),
  ].join("||");
}

function stableAt(q: QItem): number {
  const anyQ = q as any;
  const v = anyQ.at ?? anyQ.createdAt ?? anyQ.loadedAt ?? 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/* -------------------------------- hook -------------------------------- */

export function usePracticeEngine(args: {
  subjectSlug: string;
  moduleSlug: string;
  t: any;

  run: RunMeta | null;
  setRun: (r: RunMeta | null) => void;
  isLockedRun: boolean;
  allowReveal: boolean;
  maxAttempts: number;
  returnUrlFromQuery: string | null;

  preferPurpose?: PurposeMode;
  purposePolicy?: PurposePolicy;

  hydrated: boolean;
  resolvedSessionIdRef: MutableRefObject<string | null>;

  topic: TopicValue;
  difficulty: Difficulty | "all";
  section: string | null;

  sessionSize: number;
  setSessionSize: (n: number | ((p: number) => number)) => void;

  sessionId: string | null;
  setSessionId: (v: string | null) => void;

  phase: Phase;
  setPhase: (p: Phase) => void;

  autoSummarized: boolean;
  setAutoSummarized: (v: boolean) => void;

  completed: boolean;
  setCompleted: (v: boolean) => void;

  busy: boolean;
  setBusy: (v: boolean) => void;
  setLoadErr: (v: string | null) => void;
  setActionErr: (v: string | null) => void;

  completionReturnUrl: string | null;
  setCompletionReturnUrl: (v: string | null) => void;

  stack: QItem[];
  setStack: (v: QItem[] | ((p: QItem[]) => QItem[])) => void;

  idx: number;
  setIdx: (v: number | ((p: number) => number)) => void;

  padRef: MutableRefObject<VectorPadState>;
}) {
  const {
    subjectSlug,
    moduleSlug,
    t,
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
    preferPurpose,
    purposePolicy,
    phase,
    setPhase,
    autoSummarized,
    setAutoSummarized,
    completed,
    setCompleted,
    busy,
    setBusy,
    setLoadErr,
    setActionErr,
    setCompletionReturnUrl,
    stack,
    setStack,
    idx,
    setIdx,
    padRef,
  } = args;

  const abortRef = useRef<AbortController | null>(null);
  const submitLockRef = useRef(false);
  const loadLockRef = useRef(false);
  const bootCompleteRef = useRef(false);
  const [serverStatus, setServerStatus] = useState<SessionStatus | null>(null);

  const [serverMissed, setServerMissed] = useState<MissedItem[]>([]);
  const [serverHistoryStack, setServerHistoryStack] = useState<QItem[]>([]);

  const appliedRunCountRef = useRef(false);

  const current = stack[idx] ?? null;
  const exercise = current?.exercise ?? null;

  // ✅ kill old action errors when navigating between questions
  useEffect(() => {
    setActionErr(null);
  }, [idx, setActionErr]);

  // ---------------- Missed (local from stack) ----------------
  const localMissed: MissedItem[] = useMemo(() => {
    const unresolved = new Map<string, { idx: number; q: QItem; ans: SubmitAnswer }>();

    for (let i = 0; i < stack.length; i++) {
      const q = stack[i];
      if (!q?.submitted) continue;

      // ✅ excused should NOT show as missed
      if (isExcusedPracticeItem(q)) continue;

      const ex = q.exercise;
      if (!ex) continue;

      const sig = exerciseSignature(ex);
      if (!sig) continue;

      const ok = Boolean(q.result?.ok);
      if (ok) {
        unresolved.delete(sig);
        continue;
      }

      const ans = buildSubmitAnswerFromItem(q);
      if (!ans) continue;

      unresolved.set(sig, { idx: i, q, ans });
    }

    const tmp: Array<{ idx: number; item: MissedItem }> = [];
    for (const { idx: missIdx, q, ans } of unresolved.values()) {
      const ex = q.exercise!;
      tmp.push({
        idx: missIdx,
        item: {
          id: `${q.key}-missed`,
          at: stableAt(q),
          topic: String(ex.topic) as TopicSlug,
          kind: ex.kind,
          title: ex.title,
          prompt: ex.prompt,
          userAnswer: ans,
          expected: (q.result as any)?.expected,
          explanation: (q.result as any)?.explanation ?? null,
        },
      });
    }

    tmp.sort((a, b) => a.idx - b.idx);
    return tmp.map((x) => x.item);
  }, [stack]);

  const missed = useMemo(() => {
    return localMissed.length ? localMissed : serverMissed;
  }, [localMissed, serverMissed]);

  // ---------------- Summary lock ----------------
  useEffect(() => {
    if (!hydrated) return;
    if (!completed) return;
    if (!autoSummarized) setAutoSummarized(true);
    if (phase !== "summary") setPhase("summary");
  }, [hydrated, completed, autoSummarized, phase, setAutoSummarized, setPhase]);

  // apply run.targetCount only once
  useEffect(() => {
    if (!hydrated) return;
    if (!run?.targetCount) return;
    if (appliedRunCountRef.current) return;

    setSessionSize((cur) => (cur === SESSION_DEFAULT ? run.targetCount : cur));
    appliedRunCountRef.current = true;
  }, [hydrated, run, setSessionSize]);

  function updateCurrent(patch: Partial<QItem>) {
    setStack((prev) => {
      if (idx < 0 || idx >= prev.length) return prev;
      const next = prev.slice();
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  }

  function isFinalized(q: QItem | null, maxAttempts_: number, isLockedRun_: boolean) {
    if (!q) return false;
    if (q.submitted) return true;
    if (q.revealed) return true;

    const r: any = (q as any).result;
    if (!r) return false;

    if (r.ok === true) return true;
    if (r.finalized === true) return true;

    const left = r.attempts?.left;
    if (typeof left === "number") return left <= 0;

    if (isLockedRun_ && typeof q.attempts === "number") {
      return q.attempts >= maxAttempts_;
    }

    return false;
  }

  const localAnswered = useMemo(
      () => stack.filter((q) => isFinalized(q, maxAttempts, isLockedRun)).length,
      [stack, maxAttempts, isLockedRun],
  );

  const localCorrect = useMemo(
      () =>
          stack.filter((q) => isFinalized(q, maxAttempts, isLockedRun) && q.result?.ok).length,
      [stack, maxAttempts, isLockedRun],
  );

  const reviewStack = useMemo(() => {
    return stack.length ? stack : serverHistoryStack;
  }, [stack, serverHistoryStack]);

  const serverAnswered = Math.max(serverStatus?.totalCount ?? 0, serverStatus?.answeredCount ?? 0);
  const serverCorrect = serverStatus?.correctCount ?? 0;

  const answeredCount = Math.max(localAnswered, serverAnswered);
  const correctCount = Math.max(localCorrect, serverCorrect);

  // ✅ ignore excused in pct denom (quiz-like)
  const localExcusedAnswered = useMemo(() => {
    return stack.filter(
        (q) => isFinalized(q, maxAttempts, isLockedRun) && isExcusedPracticeItem(q),
    ).length;
  }, [stack, maxAttempts, isLockedRun]);

  const denomForPct = Math.max(0, answeredCount - localExcusedAnswered);
  const pct = denomForPct > 0 ? Math.round((correctCount / denomForPct) * 100) : 0;

  async function loadNextExercise(opts?: { forceNew?: boolean }) {
    if (phase === "summary" && !opts?.forceNew) return;
    if (completed && !opts?.forceNew) return;

    if (loadLockRef.current) return;
    if (answeredCount >= sessionSize && !opts?.forceNew) return;

    loadLockRef.current = true;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setBusy(true);
    setLoadErr(null);

    try {
      const effectiveSid = getEffectiveSid({ sessionId, resolvedSessionIdRef });
      const sid = opts?.forceNew ? null : effectiveSid;
      const useSession = Boolean(sid);

      const pp = preferPurpose ?? "quiz";
      const pol = purposePolicy ?? "fallback";

      const res: PracticeGetResponse = await fetchPracticeExercise({
        sessionId: useSession ? (sid ?? undefined) : undefined,
        allowReveal: allowReveal ? true : undefined,
        signal: controller.signal,

        subject: useSession ? undefined : subjectSlug,
        module: useSession ? undefined : moduleSlug,
        topic: useSession ? undefined : String(topic === "all" ? "" : topic),
        difficulty: useSession ? undefined : difficulty === "all" ? undefined : difficulty,
        section: useSession ? undefined : (section ?? undefined),

        preferPurpose: pp,
        purposePolicy: pol,
      } as any);

      const runFromApi = (res as any)?.run;
      if (runFromApi?.mode) setRun(runFromApi);

      if ((res as any)?.complete) {
        const sid2 = (res as any)?.sessionId;
        if (sid2) setSessionId(String(sid2));

        try {
          const st = await getSessionStatus(String(sid2 ?? sid), {
            includeMissed: true,
            includeHistory: true,
            subject:subjectSlug,
            module:moduleSlug,
          });

          if (st) {
            if (st?.history?.length) setServerHistoryStack(st.history.map(historyRowToQItem));
            setServerStatus(st);
            if (st?.missed) setServerMissed(st.missed);
            if (st?.run?.mode) setRun(st.run);
            setCompletionReturnUrl(st.returnUrl || returnUrlFromQuery);
          } else {
            const serverReturn =
                (res as any)?.returnUrl || (res as any)?.run?.returnUrl || null;
            setCompletionReturnUrl(serverReturn || returnUrlFromQuery);
          }
        } catch {
          const serverReturn =
              (res as any)?.returnUrl || (res as any)?.run?.returnUrl || null;
          setCompletionReturnUrl(serverReturn || returnUrlFromQuery);
        }

        setCompleted(true);
        setAutoSummarized(true);
        setPhase("summary");
        return;
      }

      const ex = (res as any)?.exercise;
      const key = (res as any)?.key;

      if (!ex || typeof ex?.kind !== "string" || typeof key !== "string") {
        throw new Error("Malformed response from /api/practice (missing exercise/key).");
      }

      if ((res as any).sessionId) setSessionId(String((res as any).sessionId));

      const item = initItemFromExercise(ex as Exercise, key);
      setStack((prev) => {
        const next = [...prev, item];
        setIdx(next.length - 1);
        return next;
      });
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      setLoadErr(e?.message ?? t("errors.failedToLoad"));
    } finally {
      if (abortRef.current === controller) setBusy(false);
      loadLockRef.current = false;
    }
  }

  // boot
  useEffect(() => {
    if (!hydrated) return;
    if (bootCompleteRef.current) return;
    if (phase === "summary") return;
    if (completed) return;

    const effectiveSid = getEffectiveSid({ sessionId, resolvedSessionIdRef });
    let alive = true;

    (async () => {
      if (effectiveSid) {
        const st = await getSessionStatus(String(effectiveSid), { includeMissed: true , module:moduleSlug, subject:subjectSlug});
        if (!alive) return;

        if (st) {
          setServerStatus(st);
          if (st?.missed) setServerMissed(st.missed);
          if (st?.run?.mode) setRun(st.run);

          const tc = st?.targetCount;
          if (typeof tc === "number" && tc > 0) {
            setSessionSize((cur) => (cur === SESSION_DEFAULT ? tc : cur));
          }

          if (st?.complete) {
            bootCompleteRef.current = true;
            setCompleted(true);
            setAutoSummarized(true);
            setPhase("summary");
            setCompletionReturnUrl(st.returnUrl || returnUrlFromQuery);
            return;
          }
        }
      }

      if (stack.length > 0) return;
      await loadNextExercise({ forceNew: !effectiveSid });
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, phase, sessionId, stack.length, returnUrlFromQuery, completed]);

  // if land in summary, still fetch missed/history once
  useEffect(() => {
    if (!hydrated) return;
    if (phase !== "summary") return;

    const effectiveSid = getEffectiveSid({ sessionId, resolvedSessionIdRef });
    if (!effectiveSid) return;

    if (serverMissed.length > 0 && serverHistoryStack.length > 0) return;

    let alive = true;

    (async () => {
      const st = await getSessionStatus(String(effectiveSid), {
        includeMissed: true,
        includeHistory: true,
        subject:subjectSlug,
        module:moduleSlug
      });
      if (!alive) return;

      if (st) {
        setServerStatus(st);
        if (st?.missed) setServerMissed(st.missed);
        if (st?.run?.mode) setRun(st.run);
        if (st?.complete) setCompletionReturnUrl(st.returnUrl || returnUrlFromQuery);

        if (Array.isArray(st.history) && st.history.length) {
          setServerHistoryStack(st.history.map((h: SessionHistoryRow) => historyRowToQItem(h)));
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [
    hydrated,
    phase,
    sessionId,
    resolvedSessionIdRef,
    serverMissed.length,
    returnUrlFromQuery,
    setRun,
    serverHistoryStack.length,
    setCompletionReturnUrl,
  ]);

  // stateless completion → locks summary
  useEffect(() => {
    if (!hydrated) return;
    if (completed) return;

    if (!autoSummarized && answeredCount >= sessionSize) {
      setCompleted(true);
      setAutoSummarized(true);
      setPhase("summary");
    }
  }, [
    hydrated,
    answeredCount,
    sessionSize,
    autoSummarized,
    completed,
    setCompleted,
    setAutoSummarized,
    setPhase,
  ]);

  function canGoPrev() {
    return idx > 0;
  }

  function canGoNext() {
    if (!current) return true;
    if (idx < stack.length - 1) return true;

    const attempts = current.attempts ?? 0;
    const outOfAttempts = attempts >= maxAttempts;

    if (!current.submitted && !outOfAttempts) return false;
    return answeredCount < sessionSize;
  }

  async function goNext() {
    if (!canGoNext()) return;

    if (!current) {
      await loadNextExercise();
      return;
    }

    if (idx < stack.length - 1) {
      setIdx((i) => Math.min(stack.length - 1, i + 1));
      return;
    }

    await loadNextExercise();
  }

  function goPrev() {
    if (!canGoPrev()) return;
    setIdx((i) => Math.max(0, i - 1));
  }

  async function submit() {
    if (completed) return;
    if (submitLockRef.current) return;
    if (!current || !exercise) return;
    if (busy) return;

    if (current.submitted) return;
    if (isLockedRun && (current.attempts ?? 0) >= maxAttempts) return;

    submitLockRef.current = true;
    setActionErr(null);

    try {
      let answer: SubmitAnswer | undefined;

      if (exercise.kind === "vector_drag_dot") {
        answer = { kind: "vector_drag_dot", a: cloneVec(padRef.current.a) };
        updateCurrent({ dragA: cloneVec(padRef.current.a) });
      } else if (exercise.kind === "vector_drag_target") {
        answer = {
          kind: "vector_drag_target",
          a: cloneVec(padRef.current.a),
          b: cloneVec(padRef.current.b),
        };
        updateCurrent({
          dragA: cloneVec(padRef.current.a),
          dragB: cloneVec(padRef.current.b),
        });
      } else {
        answer = buildSubmitAnswerFromItem(current);
      }

      if (!answer) {
        setActionErr(t("errors.incompleteAnswer"));
        return;
      }

      setBusy(true);

      const data = await submitPracticeAnswer({ key: current.key, answer } as any);

      const ok = Boolean((data as any)?.ok);
      const serverFinalized = Boolean((data as any)?.finalized);
      const serverUsed = Number((data as any)?.attempts?.used);

      const used = Number.isFinite(serverUsed) ? serverUsed : (current.attempts ?? 0) + 1;
      const finalized = ok || serverFinalized || (isLockedRun && used >= maxAttempts);

      updateCurrent({
        result: data as any,
        attempts: used,
        submitted: finalized,
        revealed: false,
      });

      if ((data as any)?.sessionComplete) {
        setCompleted(true);
        setAutoSummarized(true);
        setPhase("summary");

        const serverReturn =
            (data as any)?.returnUrl || (data as any)?.run?.returnUrl || null;
        setCompletionReturnUrl(serverReturn || returnUrlFromQuery);
        return;
      }
    } catch (e: any) {
      setActionErr(e?.message ?? t("errors.failedToSubmit"));
    } finally {
      setBusy(false);
      submitLockRef.current = false;
    }
  }

  async function reveal() {
    if (completed) return;
    if (!current || busy) return;
    if (!allowReveal) return;

    setBusy(true);
    setActionErr(null);

    try {
      const data = await submitPracticeAnswer({ key: current.key, reveal: true } as any);

      const solA = (data as any)?.reveal?.solutionA;
      const bExp = (data as any)?.reveal?.b;
      const finalized = Boolean((data as any)?.finalized);

      updateCurrent({
        result: data as any,
        revealed: true,
        submitted: finalized,
        ...(solA ? { dragA: cloneVec(solA) } : {}),
        ...(bExp ? { dragB: cloneVec(bExp) } : {}),
      });

      if (solA) padRef.current.a = cloneVec(solA) as any;
      if (bExp) padRef.current.b = cloneVec(bExp) as any;
    } catch (e: any) {
      setActionErr(e?.message ?? t("errors.failedToSubmit"));
    } finally {
      setBusy(false);
    }
  }

  // ✅ modular excuse actions (shared pattern)
  const { excuseAndNext, skipLoadError } = usePracticeExcuseActions({
    current,
    idx,
    setStack: (u) => setStack((p) => u(p)),
    goNext,
    loadNextExercise,
    actionErr: (args as any).actionErr ?? null, // not required; we pass through below
    setActionErr,
    sessionId,
    resolvedSessionIdRef,
  });

  const badge = useMemo(() => {
    if (!exercise) return "";
    return `${String(exercise.topic).toUpperCase()} • ${exercise.kind.replaceAll("_", " ")}`;
  }, [exercise]);

  return {
    current,
    exercise,
    answeredCount,
    correctCount,
    missed,
    badge,
    pct,
    reviewStack,

    updateCurrent,
    loadNextExercise,
    retryLoad: () => loadNextExercise({ forceNew: false }),

    canGoPrev: canGoPrev(),
    canGoNext: canGoNext(),
    goPrev,
    goNext,
    submit,
    reveal,

    // ✅ NEW
    excuseAndNext,
    skipLoadError,
  };
}