// src/components/review/module/hooks/useAssignmentStatus.ts
"use client";

import { useEffect, useMemo, useState } from "react";

export type AssignmentStatus =
  | { phase: "idle" }
  | {
      phase: "in_progress";
      pct: number; // 0..1
      answeredCount: number;
      targetCount: number;
      history: any[];
    }
  | {
      phase: "complete";
      pct: number; // 1
      answeredCount: number;
      targetCount: number;
      history: any[];
    };

export function useAssignmentStatus(args: {
  sessionId: string | null;
  enabled: boolean;
}) {
  const { sessionId, enabled } = args;

  const [status, setStatus] = useState<AssignmentStatus>({ phase: "idle" });

  useEffect(() => {
    if (!enabled) return;

    const sid = sessionId ? String(sessionId) : "";
    if (!sid) {
      setStatus({ phase: "idle" });
      return;
    }

    let alive = true;

    async function loadStatus() {
      try {
        const r = await fetch(
          `/api/practice?sessionId=${encodeURIComponent(sid)}&statusOnly=true&includeHistory=true`,
          { cache: "no-store" },
        );
        const d = r.ok ? await r.json() : null;
        if (!alive) return;

        const targetCount = Number(d?.targetCount ?? 0);

        const history = Array.isArray(d?.history) ? d.history : [];
        const answeredFromServer = Number(d?.answeredCount ?? 0);
        const answeredCount = Math.max(answeredFromServer, history.length);

        const pct =
          targetCount > 0 ? Math.min(1, answeredCount / targetCount) : 0;

        const complete =
          Boolean(d?.complete) ||
          Boolean(d?.sessionComplete) ||
          d?.status === "completed" ||
          (targetCount > 0 && answeredCount >= targetCount);

        if (complete) {
          setStatus({
            phase: "complete",
            pct: 1,
            answeredCount,
            targetCount,
            history,
          });
        } else {
          setStatus({
            phase: "in_progress",
            pct,
            answeredCount,
            targetCount,
            history,
          });
        }
      } catch {
        // ignore
      }
    }

    loadStatus();

    const onFocus = () => loadStatus();
    window.addEventListener("focus", onFocus);

    // poll until complete
    const t = setInterval(() => {
      if (!alive) return;
      if (status.phase === "complete") return;
      loadStatus();
    }, 4000);

    return () => {
      alive = false;
      clearInterval(t);
      window.removeEventListener("focus", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, sessionId]);

  const complete = useMemo(
    () => status.phase === "complete",
    [status.phase],
  );

  const pct = useMemo(() => {
    if (status.phase === "idle") return 0;
    return status.pct;
  }, [status]);

  return { status, complete, pct };
}
