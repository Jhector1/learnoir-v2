// src/lib/practice/usePracticeInstance.ts
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Exercise } from "@/lib/practice/types";
import type { VectorPadState } from "@/components/vectorpad/types";
import type { QItem } from "@/components/practice/practiceType";

import {
  fetchPracticeExercise,
  submitPracticeAnswer,
  type PracticeGetResponse,
} from "@/lib/practice/clientApi";

import { buildSubmitAnswerFromItem, cloneVec, initItemFromExercise } from "@/lib/practice/uiHelpers";

type LoadArgs = {
  subject?: string;
  module?: string;
  section?: string;
  topic?: string; // "" or "all" allowed
  difficulty?: "easy" | "medium" | "hard";
  allowReveal?: boolean;
  sessionId?: string;
  preferKind?: string;
  salt?: string;
};

function stableJson(x: any) {
  try {
    return JSON.stringify(x ?? {});
  } catch {
    return "{}";
  }
}

export function usePracticeInstance(args: {
  load: LoadArgs;
  maxAttempts: number;
  padRef?: React.MutableRefObject<VectorPadState | null>;
}) {
  const { load, maxAttempts, padRef } = args;

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [item, setItem] = useState<QItem | null>(null);
  const [exercise, setExercise] = useState<Exercise | null>(null);

  const lockRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  // ✅ IMPORTANT: stable signature (prevents infinite reload loop)
  const loadSig = useMemo(() => stableJson(load), [load]);

  const update = useCallback((patch: Partial<QItem>) => {
    setItem((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const loadNew = useCallback(async () => {
    if (lockRef.current) return;
    lockRef.current = true;

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setBusy(true);
    setError(null);

    try {
      const res: PracticeGetResponse = await fetchPracticeExercise({
        ...(load as any),
        signal: ctrl.signal,
      } as any);

      const ex = (res as any)?.exercise;
      const key = (res as any)?.key;

      if (!ex || typeof ex?.kind !== "string" || typeof key !== "string") {
        throw new Error("Malformed response from /api/practice (missing exercise/key).");
      }

      const q = initItemFromExercise(ex as Exercise, key);
      setExercise(ex as Exercise);
      setItem(q);

      // sync pad initial state if needed
      if (padRef?.current) {
        padRef.current.a = cloneVec((q as any).dragA) as any;
        padRef.current.b = cloneVec((q as any).dragB) as any;
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") setError(e?.message ?? "Failed to load.");
    } finally {
      setBusy(false);
      lockRef.current = false;
    }
  }, [loadSig, padRef]);

  useEffect(() => {
    void loadNew();
    return () => abortRef.current?.abort();
  }, [loadNew]);

  const submit = useCallback(async () => {
    if (!item || !exercise) return;
    if (busy) return;

    // ✅ if already finalized, do nothing
    if (item.submitted) return;

    // ✅ hard cap
    if ((item.attempts ?? 0) >= maxAttempts) return;

    setBusy(true);
    setError(null);

    try {
      let answer = buildSubmitAnswerFromItem(item);

      // vector kinds: prefer padRef values
      if (padRef?.current && exercise.kind === "vector_drag_dot") {
        answer = { kind: "vector_drag_dot", a: cloneVec(padRef.current.a) } as any;
        update({ dragA: cloneVec(padRef.current.a) } as any);
      }
      if (padRef?.current && exercise.kind === "vector_drag_target") {
        answer = {
          kind: "vector_drag_target",
          a: cloneVec(padRef.current.a),
          b: cloneVec(padRef.current.b),
        } as any;
        update({ dragA: cloneVec(padRef.current.a), dragB: cloneVec(padRef.current.b) } as any);
      }

      if (!answer) {
        setError("Incomplete answer.");
        return;
      }

      const data = await submitPracticeAnswer({ key: item.key, answer } as any);

      const nextAttempts = (item.attempts ?? 0) + 1;
      const ok = Boolean((data as any)?.ok);

      // ✅ SOURCE OF TRUTH (your line)
      const finalize =
        Boolean((data as any)?.finalized) || ok || nextAttempts >= maxAttempts;

      update({
        result: data as any,
        attempts: nextAttempts,
        submitted: finalize,
        revealed: false,
      });
    } catch (e: any) {
      // If server says already finalized, treat it as finalized in UI too
      const msg = String(e?.message ?? "");
      if (msg.toLowerCase().includes("already finalized")) {
        update({ submitted: true });
        return;
      }
      setError(e?.message ?? "Failed to submit.");
    } finally {
      setBusy(false);
    }
  }, [item, exercise, busy, maxAttempts, padRef, update]);

  const reveal = useCallback(async () => {
    if (!item) return;
    if (busy) return;

    setBusy(true);
    setError(null);

    try {
      const data = await submitPracticeAnswer({ key: item.key, reveal: true } as any);

      const solA = (data as any)?.expected?.solutionA;
      const bExp = (data as any)?.expected?.b;
      const finalized = Boolean((data as any)?.finalized);

      update({
        result: data as any,
        revealed: true,
        submitted: finalized,
        ...(solA ? { dragA: cloneVec(solA) } : {}),
        ...(bExp ? { dragB: cloneVec(bExp) } : {}),
      });

      if (padRef?.current) {
        if (solA) padRef.current.a = cloneVec(solA) as any;
        if (bExp) padRef.current.b = cloneVec(bExp) as any;
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to reveal.");
    } finally {
      setBusy(false);
    }
  }, [item, busy, padRef, update]);

  return {
    busy,
    error,
    exercise,
    item,
    update,
    loadNew,
    submit,
    reveal,
  };
}
