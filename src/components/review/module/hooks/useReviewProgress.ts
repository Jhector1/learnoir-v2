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

  const putProgressNow = useCallback(
    async (state: ReviewProgressState) => {
      if (!subjectSlug || !moduleId) return;

      const payload = {
        subjectSlug,
        moduleId,
        locale,
        state: { ...state, activeTopicId: activeTopicIdRef.current },
      };

      const body = JSON.stringify(payload);

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

      fetch("/api/review/progress", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
        cache: "no-store",
      }).catch(() => {});
    },
    [subjectSlug, moduleId, locale],
  );

  // load progress
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
    } catch {
      setProgress(emptyReviewProgress());
      setActiveTopicId(firstTopicId);
      setViewTopicId(firstTopicId);
    } finally {
      setHydrated(true);
    }
  })();

  return () => ctrl.abort();
}, [subjectSlug, moduleId, locale, firstTopicId]);

  // save progress (debounced)
  useEffect(() => {
    if (!subjectSlug || !moduleId) return;
    if (!hydrated) return;

    const t = setTimeout(() => {
      fetch("/api/review/progress", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectSlug,
          moduleId,
          locale,
          state: { ...progress, activeTopicId },
        }),
        keepalive: true,
        cache: "no-store",
      }).catch(() => {});
    }, 600);

    return () => clearTimeout(t);
  }, [progress, activeTopicId, subjectSlug, moduleId, locale, hydrated]);

  // flush on refresh/tab-close/navigation-away
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
