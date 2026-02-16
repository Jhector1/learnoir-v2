// src/components/review/module/hooks/useReviewProgress.ts
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { ReviewProgressState } from "@/lib/review/progressTypes";
import { emptyReviewProgress, fetchReviewProgressGET } from "@/lib/review/progressClient";

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

  const [activeTopicId, setActiveTopicId] = useState(firstTopicId);
  const [viewTopicId, setViewTopicId] = useState(firstTopicId);

  const progressRef = useRef(progress);
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const activeTopicIdRef = useRef(activeTopicId);
  useEffect(() => {
    activeTopicIdRef.current = activeTopicId;
  }, [activeTopicId]);

  // ---- dedupe + debounce + abort ----
  const lastSentHashRef = useRef<string>("");
  const putAbortRef = useRef<AbortController | null>(null);
  const putTimerRef = useRef<number | null>(null);

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

        // mark as latest (prevents immediate duplicate sends)
        lastSentHashRef.current = body;

        // best-effort reliable on refresh/navigation
        if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
          try {
            const blob = new Blob([body], { type: "application/json" });
            (navigator as any).sendBeacon("/api/review/progress", blob);
            return;
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

        setProgress(p);

        const nextActive = (p as any).activeTopicId || firstTopicId;
        setActiveTopicId(nextActive);
        setViewTopicId(nextActive);

        // seed hash so we don't immediately PUT what we just loaded
        lastSentHashRef.current = stableJson({
          subjectSlug,
          moduleId,
          locale,
          state: { ...p, activeTopicId: nextActive },
        });
      } catch {
        const ep = emptyReviewProgress();
        setProgress(ep);
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

  // ---- flush on refresh/tab-close/navigation-away ----
  useEffect(() => {
    if (!hydrated) return;

    const flush = () => putProgressNow(progressRef.current);

    const onVis = () => {
      if (document.visibilityState === "hidden") flush();
    };

    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", flush);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [hydrated, putProgressNow]);

  // cleanup
  useEffect(() => {
    return () => {
      if (putTimerRef.current) window.clearTimeout(putTimerRef.current);
      putAbortRef.current?.abort();
    };
  }, []);

  return {
    hydrated,

    progress,
    setProgress,

    activeTopicId,
    setActiveTopicId,

    viewTopicId,
    setViewTopicId,

    flushNow: putProgressNow,
  };
}
