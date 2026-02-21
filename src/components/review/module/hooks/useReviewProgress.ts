// src/components/review/module/hooks/useReviewProgress.ts
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { ReviewProgressState } from "@/lib/subjects/progressTypes";
import { emptyReviewProgress, fetchReviewProgressGET } from "@/lib/subjects/progressClient";

function emptyProgress(): ReviewProgressState {
  return {
    topics: {},
    quizVersion: 0,
    moduleCompleted: false,
    moduleCompletedAt: undefined,
  };
}

function stableJson(x: unknown) {
  return JSON.stringify(x);
}

export function useReviewProgress(args: {
  subjectSlug: string;
  moduleId: string;
  locale: string;
  firstTopicId: string;
}) {
  const { subjectSlug, moduleId, locale, firstTopicId } = args;

  const [progress, setProgress] = useState<ReviewProgressState>(emptyProgress());
  const [hydrated, setHydrated] = useState(false);

  // const [activeTopicId, setActiveTopicId] = useState(firstTopicId);
  const [viewTopicId, setViewTopicId] = useState(firstTopicId);

  const [activeTopicId, _setActiveTopicId] = useState(firstTopicId);
  // const activeTopicIdRef = useRef(activeTopicId);


  const progressRef = useRef(progress);
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  // const [activeTopicId, _setActiveTopicId] = useState(firstTopicId);
  const activeTopicIdRef = useRef(firstTopicId);

  const setActiveTopicId = useCallback((id: string) => {
    activeTopicIdRef.current = id;
    _setActiveTopicId(id);
  }, []);
  // ---- dedupe + debounce + abort ----
  const lastSentHashRef = useRef<string>("");
  const putAbortRef = useRef<AbortController | null>(null);
  const putTimerRef = useRef<number | null>(null);

  const cancelPendingPut = useCallback(() => {
    if (putTimerRef.current) window.clearTimeout(putTimerRef.current);
    putTimerRef.current = null;
    putAbortRef.current?.abort();
    putAbortRef.current = null;
  }, []);
  const setProgressSafe = useCallback((updater: any) => {
    setProgress((prev: any) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      progressRef.current = next; // ✅ keep ref in sync immediately
      return next;
    });
  }, []);
  const putProgressNow = useCallback(
      async (state: ReviewProgressState) => {
        if (!subjectSlug || !moduleId) return;

        const payload = {
          subjectSlug,
          moduleId,
          locale,
          state: { ...state, activeTopicId: activeTopicIdRef.current },
        };

        const body = stableJson(payload);

        // ✅ hard dedupe (prevents multiple exit signals spamming)
        if (body === lastSentHashRef.current) return;
        lastSentHashRef.current = body;

        // try beacon first
        if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
          try {
            if (body.length < 60000) {
              const blob = new Blob([body], { type: "application/json" });
              const ok = (navigator as any).sendBeacon("/api/review/progress", blob);
              if (ok) return; // ✅ only return if it succeeded
            }
          } catch {
            // fall through
          }
        }

        // abort any previous in-flight PUT
        putAbortRef.current?.abort();
        const ctrl = new AbortController();
        putAbortRef.current = ctrl;

        fetch("/api/review/progress", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
          cache: "no-store",
          signal: ctrl.signal,
        }).catch((e) => {
          if (e?.name !== "AbortError") {
            // optional: allow retry later
            // lastSentHashRef.current = "";
          }
        });
      },
      [subjectSlug, moduleId, locale],
  );

  // ---- load progress ----
  useEffect(() => {
    if (!subjectSlug || !moduleId) return;

    const ctrl = new AbortController();
    setHydrated(false);

    (async () => {
      try {
        const p = await fetchReviewProgressGET({
          subjectSlug,
          moduleId,
          locale,
          signal: ctrl.signal,
        });

        setProgressSafe(p);

        const nextActive = (p as any).activeTopicId || firstTopicId;
        setActiveTopicId(nextActive);
        setViewTopicId(nextActive);

        // seed hash to avoid immediate PUT of loaded state
        lastSentHashRef.current = stableJson({
          subjectSlug,
          moduleId,
          locale,
          state: { ...p, activeTopicId: nextActive },
        });
      } catch {
        const ep = emptyReviewProgress();
        setProgressSafe(ep);                // ✅ not setProgress

        setActiveTopicId(firstTopicId);
        setViewTopicId(firstTopicId);

        lastSentHashRef.current = stableJson({
          subjectSlug,
          moduleId,
          locale,
          state: { ...ep, activeTopicId: firstTopicId },
        });
      } finally {
        setHydrated(true);
      }
    })();

    return () => ctrl.abort();
  }, [subjectSlug, moduleId, locale, firstTopicId]);

  // ---- save progress (debounced + deduped) ----
  useEffect(() => {
    if (!subjectSlug || !moduleId) return;
    if (!hydrated) return;

    const payload = {
      subjectSlug,
      moduleId,
      locale,
      state: { ...progress, activeTopicId },
    };

    const nextHash = stableJson(payload);

    // ✅ no change => no network
    if (nextHash === lastSentHashRef.current) return;

    // debounce
    if (putTimerRef.current) window.clearTimeout(putTimerRef.current);

    putTimerRef.current = window.setTimeout(() => {
      // abort previous in-flight
      putAbortRef.current?.abort();
      const ctrl = new AbortController();
      putAbortRef.current = ctrl;

      // mark latest to dedupe
      lastSentHashRef.current = nextHash;

      fetch("/api/review/progress", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: nextHash,
        keepalive: true,
        cache: "no-store",
        signal: ctrl.signal,
      }).catch((e) => {
        if (e?.name !== "AbortError") {
          // optional: allow retry by clearing hash
          // lastSentHashRef.current = "";
        }
      });
    }, 900);

    return () => {
      if (putTimerRef.current) window.clearTimeout(putTimerRef.current);
    };
  }, [progress, activeTopicId, subjectSlug, moduleId, locale, hydrated]);

  // ---- flush on exit (ONLY ONCE) ----
  useEffect(() => {
    if (!hydrated) return;

    const flushedRef = { current: false };

    const flushOnce = () => {
      if (flushedRef.current) return;
      flushedRef.current = true;

      // prevent trailing debounced PUT
      cancelPendingPut();

      void putProgressNow(progressRef.current);
    };

    const onVis = () => {
      if (document.visibilityState === "hidden") flushOnce();
    };

    window.addEventListener("pagehide", flushOnce);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      window.removeEventListener("pagehide", flushOnce);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [hydrated, putProgressNow, cancelPendingPut]);

  // cleanup
  useEffect(() => {
    return () => {
      cancelPendingPut();
    };
  }, [cancelPendingPut]);

  return {
    hydrated,

    progress,
    setProgress: setProgressSafe,

    activeTopicId,
    setActiveTopicId,

    viewTopicId,
    setViewTopicId,

    flushNow: putProgressNow,
  };
}