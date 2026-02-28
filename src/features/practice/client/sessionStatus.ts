
import type { Difficulty } from "@/lib/practice/types";
import type { MissedItem } from "@/components/practice/practiceType";
import type { RunMeta } from "./usePracticeRunMeta";
import { configSpring } from "recharts/types/animation/easing";

export type SessionHistoryRow = {
  instanceId: string;
  createdAt?: string | null;
  answeredAt?: string | null;
expectedAnswerPayload?: any;
explanation?: string | null;

  topic?: string | null;
  kind: string;
  difficulty?: Difficulty | string | null;
  title?: string | null;
  prompt?: string | null;

  publicPayload?: any;

  attempts?: number | null;
  lastOk?: boolean | null;
  lastRevealUsed?: boolean | null;
  lastAnswerPayload?: any;
  lastAttemptAt?: string | null;
};

export type SessionStatus = {
  sessionId: string;
  complete: boolean;

  answeredCount?: number;
  totalCount?: number;
  correctCount?: number;
  targetCount?: number;

  missed?: MissedItem[];
  history?: SessionHistoryRow[];

  run?: RunMeta;
  returnUrl?: string | null;
};

// wherever getSessionStatus is defined
export async function getSessionStatus(
    sessionId: string,
    opts?: { includeMissed?: boolean; includeHistory?: boolean; subject?: string; module?: string },
): Promise<SessionStatus | null> {
  const qs = new URLSearchParams();
  qs.set("sessionId", sessionId);
  qs.set("statusOnly", "true");

  if (opts?.subject) qs.set("subject", opts.subject);
  if (opts?.module) qs.set("module", opts.module);

  if (opts?.includeMissed) qs.set("includeMissed", "true");
  if (opts?.includeHistory) qs.set("includeHistory", "true");

  const res = await fetch(`/api/practice?${qs.toString()}`, { cache: "no-store" });

  if (res.status === 402) return null;
  if (!res.ok) return null;

  const data = await res.json().catch(() => null);
  return data ? (data as SessionStatus) : null;
}
