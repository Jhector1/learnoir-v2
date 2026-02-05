// import type { MissedItem } from "@/components/practice/practiceType";

// export type SessionStatus = {
//   complete: boolean;
//   sessionId: string;
//   status?: string;

//   answeredCount: number;
//   targetCount: number;
//   pct: number;

//   correctCount: number;
//   totalCount: number;

//   // ✅ NEW
//   missed?: MissedItem[];

//   returnUrl?: string | null;
//   run?: any;
// };

// export async function getSessionStatus(
//   sid: string,
//   opts?: { includeMissed?: boolean },
// ): Promise<SessionStatus | null> {
//   const r = await fetch(
//     `/api/practice?sessionId=${encodeURIComponent(sid)}&statusOnly=true${
//       opts?.includeMissed ? `&includeMissed=true` : ""
//     }`,
//     { cache: "no-store" },
//   );
//   if (!r.ok) return null;

//   const d = await r.json().catch(() => null);
//   if (!d) return null;

//   const answeredCount = Number(d?.answeredCount ?? 0);
//   const targetCount = Number(d?.targetCount ?? 0);
//   const complete =
//     Boolean(d?.complete) || (targetCount > 0 && answeredCount >= targetCount);

//   const correctCount = Number(d?.correct ?? 0);
//   const totalCount = Number(d?.total ?? answeredCount);

//   const missed = Array.isArray(d?.missed) ? (d.missed as MissedItem[]) : [];

//   return {
//     complete,
//     sessionId: String(d?.sessionId ?? sid),
//     status: typeof d?.status === "string" ? d.status : undefined,

//     answeredCount,
//     targetCount,
//     pct: Number(d?.pct ?? 0),

//     correctCount,
//     totalCount,

//     missed,

//     returnUrl:
//       (typeof d?.returnUrl === "string" ? d.returnUrl : null) ??
//       (typeof d?.run?.returnUrl === "string" ? d.run.returnUrl : null) ??
//       null,

//     run: d?.run ?? null,
//   };
// }
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

export async function getSessionStatus(
  sessionId: string,
  opts?: { includeMissed?: boolean; includeHistory?: boolean },
): Promise<SessionStatus | null> {
  const qs = new URLSearchParams();
  qs.set("sessionId", sessionId);
  qs.set("statusOnly", "true");
  console.log("Fetching session status for sessionId:", sessionId, "with options:", opts);

  if (opts?.includeMissed) qs.set("includeMissed", "true");
  if (opts?.includeHistory) qs.set("includeHistory", "true");

  const res = await fetch(`/api/practice?${qs.toString()}`, { cache: "no-store" });
  console.log("Fetched session status response:", res);
  if (!res.ok) return null;

  const data = await res.json().catch(() => null);
  console.log("Fetched session status data:", data);
  if (!data) return null;

  return data as SessionStatus;
}
