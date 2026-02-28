// src/components/review/module/hooks/useAssignmentStatus.ts
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type AssignmentStatus =
    | { phase: "idle" }
    | {
  phase: "in_progress";
  pct: number;
  answeredCount: number;
  targetCount: number;
  history: any[];
}
    | {
  phase: "complete";
  pct: number;
  answeredCount: number;
  targetCount: number;
  history: any[];
};

export function useAssignmentStatus(args: {
  sessionId: string | null;
  enabled: boolean;
  subject?: string | null;
  module?: string | null;
}) {
  const { sessionId, enabled, subject, module } = args;

  const [status, setStatus] = useState<AssignmentStatus>({ phase: "idle" });

  const phaseRef = useRef<AssignmentStatus["phase"]>("idle");
  useEffect(() => {
    phaseRef.current = status.phase;
  }, [status.phase]);

  // ✅ stops interval + focus refetch once paywalled
  const paywalledRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const sid = sessionId ? String(sessionId) : "";
    if (!sid) {
      setStatus({ phase: "idle" });
      return;
    }

    paywalledRef.current = false;
    let alive = true;

    async function loadStatus() {
      if (!alive) return;
      if (paywalledRef.current) return;

      try {
        const qs = new URLSearchParams();
        qs.set("sessionId", sid); // ✅ do NOT encodeURIComponent here
        qs.set("statusOnly", "true");
        qs.set("includeHistory", "true");

        if (subject) qs.set("subject", subject);
        if (module) qs.set("module", module);

        const r = await fetch(`/api/practice?${qs.toString()}`, { cache: "no-store" });

        // ✅ paywall: stop all future polling until sessionId changes
        if (r.status === 402) {
          paywalledRef.current = true;
          setStatus({ phase: "idle" });
          return;
        }

        if (!r.ok) return;

        const d = await r.json().catch(() => null);
        if (!alive || !d) return;

        const targetCount = Number(d?.targetCount ?? 0);
        const history = Array.isArray(d?.history) ? d.history : [];
        const answeredFromServer = Number(d?.answeredCount ?? 0);
        const answeredCount = Math.max(answeredFromServer, history.length);

        const pct = targetCount > 0 ? Math.min(1, answeredCount / targetCount) : 0;

        const complete =
            Boolean(d?.complete) ||
            Boolean(d?.sessionComplete) ||
            d?.status === "completed" ||
            (targetCount > 0 && answeredCount >= targetCount);

        setStatus(
            complete
                ? { phase: "complete", pct: 1, answeredCount, targetCount, history }
                : { phase: "in_progress", pct, answeredCount, targetCount, history },
        );
      } catch {
        // ignore
      }
    }

    loadStatus();

    const onFocus = () => {
      if (paywalledRef.current) return; // ✅ stop focus spam too
      loadStatus();
    };
    window.addEventListener("focus", onFocus);

    const t = setInterval(() => {
      if (!alive) return;
      if (paywalledRef.current) return; // ✅ stop interval spam
      if (phaseRef.current === "complete") return;
      loadStatus();
    }, 4000);

    return () => {
      alive = false;
      clearInterval(t);
      window.removeEventListener("focus", onFocus);
    };
  }, [enabled, sessionId, subject, module]); // ✅ include deps

  const complete = useMemo(() => status.phase === "complete", [status.phase]);

  const pct = useMemo(() => {
    if (status.phase === "idle") return 0;
    return status.pct;
  }, [status]);

  return { status, complete, pct, paywalled: paywalledRef.current };
}