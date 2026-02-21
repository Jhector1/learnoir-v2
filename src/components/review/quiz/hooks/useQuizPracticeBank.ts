// src/components/review/quiz/hooks/useQuizPracticeBank.ts
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import type { ReviewQuestion, ReviewQuizSpec } from "@/lib/subjects/types";

import type { Exercise } from "@/lib/practice/types";
import type { QItem } from "@/components/practice/practiceType";
import type { VectorPadState } from "@/components/vectorpad/types";

import { defaultVectorPadState } from "@/components/vectorpad/defaultState";
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
import type { SavedQuizState } from "@/lib/subjects/progressTypes";

export type PracticeState = {
  loading: boolean;
  error: string | null;
  busy: boolean;
  exercise: Exercise | null;
  item: QItem | null;
  attempts: number;
  maxAttempts: number; // Infinity allowed
  ok: boolean | null;
};

/**
 * Extract the code-like fields from either:
 * - a saved patch (practiceItemPatch[qid]) OR
 * - a live item (practice[qid].item)
 */
function extractCodeLike(p: any) {
  const code =
      typeof p?.code === "string"
          ? p.code
          : typeof p?.source === "string"
              ? p.source
              : null;

  const stdin =
      typeof p?.codeStdin === "string"
          ? p.codeStdin
          : typeof p?.stdin === "string"
              ? p.stdin
              : null;

  const language =
      typeof p?.codeLang === "string"
          ? p.codeLang
          : typeof p?.language === "string"
              ? p.language
              : null;

  return { code, stdin, language };
}

/**
 * If ex is "empty" given the current item/pad.
 * Used to disable submit / validation in UI.
 */
export function isEmptyPracticeAnswer(
    ex: Exercise,
    item: QItem,
    pad?: VectorPadState | null,
) {
  if (ex.kind === "vector_drag_dot") {
    const a = pad?.a ?? (item as any).dragA;
    return !a || (![a.x, a.y, a.z].some((v) => Number.isFinite(v)));
  }

  if (ex.kind === "vector_drag_target") {
    const a = pad?.a ?? (item as any).dragA;
    const b = pad?.b ?? (item as any).dragB;
    const hasA = a && ([a.x, a.y, a.z].some((v) => Number.isFinite(v)));
    const hasB = b && ([b.x, b.y, b.z].some((v) => Number.isFinite(v)));
    return !(hasA && hasB);
  }

  if (ex.kind === "drag_reorder") {
    const tokens = Array.isArray((ex as any).tokens) ? (ex as any).tokens : [];
    const order =
        Array.isArray((item as any).reorder)
            ? (item as any).reorder
            : Array.isArray((item as any).reorderIds)
                ? (item as any).reorderIds
                : [];
    return !(tokens.length > 0 && order.length === tokens.length);
  }

  if (ex.kind === "code_input") {
    const code = (item as any).code ?? (item as any).source;
    return !(code && String(code).trim().length > 0);
  }

  if (ex.kind === "text_input") {
    const v = (item as any).text;
    return !(v && String(v).trim().length > 0);
  }

  if (ex.kind === "voice_input") {
    const t = (item as any).voiceTranscript;
    return !(t && String(t).trim().length > 0);
  }

  const built = buildSubmitAnswerFromItem(item);
  return !built;
}

export function useQuizPracticeBank(args: {
  questions: ReviewQuestion[];
  spec: ReviewQuizSpec;
  unlimitedAttempts: boolean;
  initialState: SavedQuizState | null;
  resetKey: string;
  isCompleted: boolean;
  locked: boolean;
}) {
  const {
    questions,
    spec,
    unlimitedAttempts,
    initialState,
    resetKey,
    isCompleted,
    locked,
  } = args;

  const specMaxAttempts = (spec as any).maxAttempts;

  const [practice, setPractice] = useState<Record<string, PracticeState>>({});
  const practiceRef = useRef(practice);
  useEffect(() => {
    practiceRef.current = practice;
  }, [practice]);

  const padRefs = useRef<Record<string, React.MutableRefObject<VectorPadState>>>(
      {},
  );

  function getPadRef(id: string) {
    if (!padRefs.current[id]) {
      padRefs.current[id] = { current: defaultVectorPadState() };
    }
    return padRefs.current[id];
  }

  // reset bank when quiz changes
  useEffect(() => {
    setPractice({});
    padRefs.current = {};
  }, [resetKey]);

  // fetch practice exercises
  useEffect(() => {
    if (!questions.length) return;

    let cancelled = false;

    async function ensurePracticeQuestion(q: ReviewQuestion) {
      if (q.kind !== "practice") return;

      // ✅ hard guard: if already loaded/in-flight, do not refetch
      const existing = (practiceRef.current as any)?.[q.id] as PracticeState | undefined;
      if (existing && (existing.loading || existing.exercise || existing.item)) {
        return;
      }

      setPractice((prev) => {
        if (prev[q.id]) return prev;

        const initMeta = initialState?.practiceMeta?.[q.id];

        return {
          ...prev,
          [q.id]: {
            loading: true,
            error: null,
            busy: false,
            exercise: null,
            item: null,

            // ✅ seed from initialState so summary/unlock doesn't "drop"
            attempts: initMeta?.attempts ?? 0,
            ok: initMeta?.ok ?? null,

            maxAttempts: unlimitedAttempts
                ? Number.POSITIVE_INFINITY
                : Math.max(1, Math.floor(q.maxAttempts ?? specMaxAttempts ?? 1)),
          },
        };
      });

      try {
        const res: PracticeGetResponse = await fetchPracticeExercise({
          subject: (q as any).fetch.subject,
          module: (q as any).fetch.module,
          section: (q as any).fetch.section,
          topic: (q as any).fetch.topic ? String((q as any).fetch.topic) : "",
          difficulty: (q as any).fetch.difficulty,
          allowReveal: (q as any).fetch.allowReveal ? true : undefined,
          preferKind: (q as any).fetch.preferKind ?? undefined,
          salt: (q as any).fetch.salt ?? undefined,

          // ✅ determinism controls (optional)
          exerciseKey: (q as any).fetch.exerciseKey ?? undefined,
          seedPolicy: (q as any).fetch.seedPolicy ?? undefined,
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

        // Base item from exercise
        let item: any = initItemFromExercise(ex as Exercise, key);

        // ----------------------------
        // ✅ Carry code from previous step (project mode)
        // ----------------------------
        const mode = (spec as any).mode ?? "quiz";
        const carryFromPrev =
            mode === "project" && Boolean((q as any).carryFromPrev);

        if (carryFromPrev && (ex as any).kind === "code_input") {
          const idx = questions.findIndex((qq) => qq.id === q.id);
          const prevQ = idx > 0 ? questions[idx - 1] : null;

          // if current already has saved code, don't override
          const currentPatch = initialState?.practiceItemPatch?.[q.id];
          const current = extractCodeLike(currentPatch);

          // Prefer live previous item (if already loaded), else saved patch
          let prevSource: any = null;
          if (prevQ) {
            const livePrevItem = (practiceRef.current as any)?.[prevQ.id]?.item;
            prevSource = livePrevItem ?? initialState?.practiceItemPatch?.[prevQ.id] ?? null;
          }

          const prev = extractCodeLike(prevSource);

          // Only carry if user hasn't saved code for current step yet
          if (!current.code && prev.code) {
            item = {
              ...item,

              // ✅ actual fields your app uses
              code: prev.code,
              codeStdin: prev.stdin ?? item.codeStdin ?? "",
              codeLang: (prev.language as any) ?? item.codeLang,

              // ✅ optional alias (safe if you keep it in QItem)
              stdin: prev.stdin ?? (item as any).stdin ?? "",
            };
          }
        }

        if (cancelled) return;

        // Apply saved patch LAST so user-saved state always wins
        const patch = initialState?.practiceItemPatch?.[q.id];
        const patchedItem = patch ? { ...item, ...patch } : item;

        setPractice((prev) => ({
          ...prev,
          [q.id]: {
            ...prev[q.id],
            loading: false,
            error: null,
            exercise: ex as Exercise,
            item: patchedItem,
            attempts:
                initialState?.practiceMeta?.[q.id]?.attempts ??
                prev[q.id]?.attempts ??
                0,
            ok: initialState?.practiceMeta?.[q.id]?.ok ?? prev[q.id]?.ok ?? null,
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
  }, [
    questions,
    unlimitedAttempts,
    specMaxAttempts,
    resetKey,
    // NOTE: we intentionally don't depend on whole initialState/spec objects to avoid refetch storms
    (spec as any).mode,
  ]);

  const updatePracticeItem = useCallback((qid: string, patch: Partial<QItem>) => {
    // ✅ sync pad when patch includes vectors
    const pr = padRefs.current[qid];
    if (pr?.current) {
      if ((patch as any).dragA) pr.current.a = cloneVec((patch as any).dragA) as any;
      if ((patch as any).dragB) pr.current.b = cloneVec((patch as any).dragB) as any;
    }

    setPractice((prev) => {
      const ps = prev[qid];
      if (!ps?.item) return prev;

      const nextItem = { ...ps.item, ...patch };

      // ✅ if the UI reset check status, also reset meta ok
      const isReset =
          ("submitted" in patch && (patch as any).submitted === false) ||
          ("result" in patch && (patch as any).result == null);

      return {
        ...prev,
        [qid]: {
          ...ps,
          item: nextItem,
          ok: isReset ? null : ps.ok,
        },
      };
    });
  }, []);

  const submitPractice = useCallback(
      async (q: Extract<ReviewQuestion, { kind: "practice" }>) => {
        if (isCompleted || locked) return;

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
            updatePracticeItem(q.id, { dragA: cloneVec(a), dragB: cloneVec(b) } as any);
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
            const nextAttempts = (prev[q.id]?.attempts ?? 0) + 1;
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
      },
      [practice, unlimitedAttempts, isCompleted, locked, updatePracticeItem],
  );

  const revealPractice = useCallback(
      async (q: Extract<ReviewQuestion, { kind: "practice" }>) => {
        if (isCompleted || locked) return;

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
              ok: false,
              item: {
                ...prev[q.id].item!,
                result: data as any,
                revealed: true,
                submitted: true,
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
      },
      [practice, isCompleted, locked, updatePracticeItem],
  );

  function isPracticeChecked(q: Extract<ReviewQuestion, { kind: "practice" }>) {
    const ps = practice[q.id];
    return Boolean(ps && ps.attempts > 0);
  }

  return {
    practice,
    setPractice,
    getPadRef,
    updatePracticeItem,
    submitPractice,
    revealPractice,
    isPracticeChecked,
  };
}
