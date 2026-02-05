
// src/features/practice/client/PracticeClient.tsx
"use client";

import React from "react";
import PracticeShell from "@/components/practice/PracticeShell";
import { usePracticeController } from "@/features/practice/client/usePracticeController";
import { useTranslations } from "next-intl";
// import { usePracticeController } from "./usePracticeController";

export default function PracticeClient({
  subjectSlug,
  moduleSlug,
}: {
  subjectSlug: string;
  moduleSlug: string;
}) {
    const t = useTranslations("Practice");

  const { shellProps } = usePracticeController({ subjectSlug, moduleSlug });
  
  return <PracticeShell {...shellProps} t={t} />;
}

// // src/app/(whatever)/PracticeClient.tsx
// "use client";

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { usePathname, useRouter, useSearchParams } from "next/navigation";
// import { useTranslations } from "next-intl";

// import type {
//   Exercise,
//   SubmitAnswer,
//   Difficulty,
//   TopicSlug,
// } from "@/lib/practice/types";
// import {
//   difficultyOptions,
//   type VectorPadState,
// } from "@/components/vectorpad/types";

// import {
//   fetchPracticeExercise,
//   submitPracticeAnswer,
//   type PracticeGetResponse,
// } from "@/lib/practice/clientApi";

// import PracticeShell from "@/components/practice/PracticeShell";
// import type { MissedItem, QItem } from "@/components/practice/practiceType";

// import {
//   buildSubmitAnswerFromItem,
//   cloneVec,
//   initItemFromExercise,
//   normalizeTopicValue,
// } from "@/lib/practice/uiHelpers";

// const SESSION_DEFAULT = 10;

// type Phase = "practice" | "summary";
// type TopicValue = TopicSlug | "all";

// type PendingChange =
//   | { kind: "topic"; value: TopicValue }
//   | { kind: "difficulty"; value: Difficulty | "all" }
//   | null;

// type TopicOption = {
//   id: "all" | TopicSlug;
//   label: string;
//   meta?: any;
// };

// function scorePct(correct: number, attempts: number) {
//   if (!attempts) return 0;
//   return Math.round((correct / attempts) * 100);
// }

// function base64UrlToJson(part: string) {
//   const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
//   const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : "";
//   const txt = atob(b64 + pad);
//   return JSON.parse(txt);
// }

// function isExpiredKey(k: unknown) {
//   if (typeof k !== "string") return false; // don't delete unknown formats

//   const parts = k.split(".");
//   // supports:
//   // - "payload.sig" (your old style) → payload in [0]
//   // - "header.payload.sig" (JWT-style) → payload in [1]
//   const payloadPart = parts.length >= 3 ? parts[1] : parts.length >= 2 ? parts[0] : null;
//   if (!payloadPart) return false; // no exp info → don't expire

//   try {
//     const json = base64UrlToJson(payloadPart);
//     const exp = Number(json?.exp);
//     if (!Number.isFinite(exp)) return false; // no exp → don't expire

//     const now = Math.floor(Date.now() / 1000);
//     return exp <= now;
//   } catch {
//     return false; // parse failed → don't expire
//   }
// }


// function storageKeyV6(args: {
//   subjectSlug: string;
//   moduleSlug: string;
//   section: string | null;
//   topic: TopicValue;
//   difficulty: Difficulty | "all";
//   n: number;
// }) {
//   const { subjectSlug, moduleSlug, section, topic, difficulty, n } = args;
//   return `practice:v6:${subjectSlug}:${moduleSlug}:${section ?? "no-section"}:${topic}:${difficulty}:n=${n}`;
// }

// function storageKeyForState(args: {
//   subjectSlug: string;
//   moduleSlug: string;
//   section: string | null;
//   topic: TopicValue;
//   difficulty: Difficulty | "all";
//   n: number;
//   sessionId: string | null;
// }) {
//   if (args.sessionId) return `practice:v6:session:${args.sessionId}`;
//   return storageKeyV6({
//     subjectSlug: args.subjectSlug,
//     moduleSlug: args.moduleSlug,
//     section: args.section,
//     topic: args.topic,
//     difficulty: args.difficulty,
//     n: args.n,
//   });
// }

// async function fetchTopicOptions(
//   subjectSlug: string,
//   moduleSlug: string,
//   signal?: AbortSignal,
// ) {
//   const qs = new URLSearchParams({ subject: subjectSlug, module: moduleSlug });
//   const res = await fetch(`/api/catalog/topics?${qs}`, {
//     signal,
//     cache: "no-store",
//   });
//   if (!res.ok) throw new Error(`Failed to load topics (${res.status})`);
//   const data = await res.json();

//   const topics = Array.isArray(data?.topics) ? data.topics : [];

//   return [
//     { id: "all" as const, label: "All topics" },
//     ...topics.map((t: any) => ({
//       id: String(t.slug),
//       label: String(t.label ?? t.slug),
//       meta: t.meta,
//     })),
//   ];
// }

// export default function PracticeClient({
//   subjectSlug,
//   moduleSlug,
// }: {
//   subjectSlug: string;
//   moduleSlug: string;
// }) {
//   const t = useTranslations("Practice");

//   const router = useRouter();
//   const pathname = usePathname();
//   const sp = useSearchParams();

//   type RunMetaBase = {
//     allowReveal: boolean;
//     showDebug: boolean;
//     maxAttempts: number;
//     targetCount: number;
//     returnUrl?: string | null;
//   };

//   type RunMeta =
//     | (RunMetaBase & {
//         mode: "assignment";
//         lockDifficulty: Difficulty;
//         lockTopic: "all" | TopicSlug;
//       })
//     | (RunMetaBase & {
//         mode: "session";
//         lockDifficulty: Difficulty;
//         lockTopic: "all" | TopicSlug;
//       })
//     | (RunMetaBase & {
//         mode: "practice";
//         lockDifficulty: null;
//         lockTopic: null;
//       });

//   const [run, setRun] = useState<RunMeta | null>(null);

//   const isAssignmentRun = run?.mode === "assignment";
//   const isSessionRun = run?.mode === "session";
//   const isLockedRun = isAssignmentRun || isSessionRun;

//   // ✅ treat any locked run as locked UX
//   const topicLocked = isLockedRun || run?.lockTopic != null;
//   const difficultyLocked = isLockedRun || run?.lockDifficulty != null;

//   // Safer default: reveal OFF until run is known if any session exists in URL
//   const hasSessionInUrl = Boolean(sp.get("sessionId"));
//   const allowReveal = run ? run.allowReveal : hasSessionInUrl ? false : true;

//   const maxAttempts = run ? run.maxAttempts : 5;
//   const showDebug = run ? run.showDebug : false;

//   const [topic, setTopic] = useState<TopicValue>("all");
//   const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
//   const [section, setSection] = useState<string | null>(null);

//   const [topicOptionsFixed, setTopicOptionsFixed] = useState<TopicOption[]>([
//     { id: "all", label: "All topics" },
//   ]);

//   const [sessionId, setSessionId] = useState<string | null>(null);

//   // ✅ prevents refresh race: resolved once during hydrate
//   const resolvedSessionIdRef = useRef<string | null>(null);

//   const [phase, setPhase] = useState<Phase>("practice");
//   const [showMissed, setShowMissed] = useState(true);

//   const [busy, setBusy] = useState(false);
//   const [loadErr, setLoadErr] = useState<string | null>(null);
//   const [actionErr, setActionErr] = useState<string | null>(null);

//   const [stack, setStack] = useState<QItem[]>([]);
//   const [idx, setIdx] = useState(0);

//   const [hydrated, setHydrated] = useState(false);
//   const restoredRef = useRef(false);
//   const firstFiltersEffectRef = useRef(true);
//   const skipUrlSyncRef = useRef(true);

//   const abortRef = useRef<AbortController | null>(null);
//   const submitLockRef = useRef(false);
//   const loadLockRef = useRef(false);
//   const bootCompleteRef = useRef(false);

//   type SessionStatus = {
//     complete: boolean;
//     answeredCount: number;
//     targetCount: number;
//     pct?: number;
//     returnUrl?: string | null;
//     run?: any;
//   };

//   async function getSessionStatus(sid: string): Promise<SessionStatus | null> {
//     const r = await fetch(
//       `/api/practice?sessionId=${encodeURIComponent(sid)}&statusOnly=true`,
//       { cache: "no-store" },
//     );
//     if (!r.ok) return null;

//     const d = await r.json().catch(() => null);
//     if (!d) return null;

//     const answeredCount = Number(d?.answeredCount ?? 0);
//     const targetCount = Number(d?.targetCount ?? 0);
//     const complete =
//       Boolean(d?.complete) || (targetCount > 0 && answeredCount >= targetCount);

//     return {
//       complete,
//       answeredCount,
//       targetCount,
//       pct: Number(d?.pct ?? 0),
//       returnUrl:
//         (typeof d?.returnUrl === "string" ? d.returnUrl : null) ??
//         (typeof d?.run?.returnUrl === "string" ? d.run.returnUrl : null) ??
//         null,
//       run: d?.run ?? null,
//     };
//   }

//   // read callback/returnUrl from URL (works for assignment/session links)
//   const returnUrlFromQuery = useMemo(() => {
//     const v =
//       sp.get("returnTo") ||
//       sp.get("callback") ||
//       sp.get("callbackUrl") ||
//       sp.get("returnUrl") ||
//       null;

//     return v ? decodeURIComponent(v) : null;
//   }, [sp]);

//   const [confirmOpen, setConfirmOpen] = useState(false);
//   const [pendingChange, setPendingChange] = useState<PendingChange>(null);

//   const current = stack[idx] ?? null;
//   const exercise = current?.exercise ?? null;

//   const [sessionSize, setSessionSize] = useState<number>(SESSION_DEFAULT);
//   const [autoSummarized, setAutoSummarized] = useState(false);
//   const [completionReturnUrl, setCompletionReturnUrl] = useState<string | null>(
//     null,
//   );

//   // ✅ apply run.targetCount only once (if user didn’t customize)
//   const appliedRunCountRef = useRef(false);

//   const effectiveTopicOptions = useMemo(() => {
//     if (run?.mode === "assignment" || run?.mode === "session") {
//       if (run.lockTopic === "all") {
//         return [{ id: "all" as const, label: "All topics (locked)" }];
//       }
//       const only = topicOptionsFixed.find(
//         (x) => String(x.id) === String(run.lockTopic),
//       );
//       return only
//         ? [only]
//         : [{ id: run.lockTopic, label: String(run.lockTopic) }];
//     }
//     return topicOptionsFixed;
//   }, [run, topicOptionsFixed]);

//   const effectiveDifficultyOptions = useMemo(() => {
//     if (run?.mode === "assignment" || run?.mode === "session") {
//       return [
//         { id: run.lockDifficulty, label: `${run.lockDifficulty} (locked)` },
//       ];
//     }
//     return difficultyOptions;
//   }, [run]);

//   // VectorPad ref (shared)
//   const zHeldRef = useRef(false);
//   const padRef = useRef<VectorPadState>({
//     mode: "2d",
//     scale: 40,
//     gridStep: 1,
//     snapToGrid: true,
//     showGrid: true,
//     showComponents: true,
//     showAngle: false,
//     showProjection: false,
//     showUnitB: false,
//     showPerp: false,
//     depthMode: false,
//     a: { x: 0, y: 0, z: 0 } as any,
//     b: { x: 2, y: 1, z: 0 } as any,
//   });

//   // fetch topic options from DB for this subject+module
//   useEffect(() => {
//     const ctrl = new AbortController();
//     fetchTopicOptions(subjectSlug, moduleSlug, ctrl.signal)
//       .then(setTopicOptionsFixed)
//       .catch(() => setTopicOptionsFixed([{ id: "all", label: "All topics" }]));
//     return () => ctrl.abort();
//   }, [subjectSlug, moduleSlug]);

//   const answeredCount = useMemo(
//     () => stack.filter((q) => q.submitted).length,
//     [stack],
//   );

//   const correctCount = useMemo(
//     () => stack.filter((q) => q.submitted && q.result?.ok).length,
//     [stack],
//   );

//   const missed: MissedItem[] = useMemo(() => {
//     const out: MissedItem[] = [];
//     for (const q of stack) {
//       if (!q.submitted) continue;
//       if (q.result?.ok) continue;

//       const ans = buildSubmitAnswerFromItem(q);
//       if (!ans) continue;

//       out.push({
//         id: `${q.key}-missed`,
//         at: Date.now(),
//         topic: String(q.exercise.topic) as TopicSlug,
//         kind: q.exercise.kind,
//         title: q.exercise.title,
//         prompt: q.exercise.prompt,
//         userAnswer: ans,
//         expected: (q.result as any)?.expected,
//         explanation: (q.result as any)?.explanation ?? null,
//       });
//     }
//     return out;
//   }, [stack]);

//   const hasProgress =
//     phase === "practice" &&
//     (answeredCount > 0 ||
//       !!sessionId ||
//       !!current?.result ||
//       (current?.single?.trim()?.length ?? 0) > 0 ||
//       (current?.multi?.length ?? 0) > 0 ||
//       (current?.num?.trim()?.length ?? 0) > 0 ||
//       (current?.code?.trim()?.length ?? 0) > 0 ||
//       (current?.codeStdin?.trim()?.length ?? 0) > 0);

//   function requestChange(next: PendingChange) {
//     if (!next) return;
//     if (isLockedRun) return; // ✅ session + assignment cannot change filters

//     if (!hasProgress) {
//       if (next.kind === "topic") setTopic(next.value);
//       if (next.kind === "difficulty") setDifficulty(next.value);
//       return;
//     }
//     setPendingChange(next);
//     setConfirmOpen(true);
//   }

//   function applyPendingChange() {
//     if (!pendingChange) return;
//     if (pendingChange.kind === "topic") setTopic(pendingChange.value);
//     if (pendingChange.kind === "difficulty") setDifficulty(pendingChange.value);
//     setConfirmOpen(false);
//     setPendingChange(null);
//   }

//   function cancelPendingChange() {
//     setConfirmOpen(false);
//     setPendingChange(null);
//   }

//   // ✅ hydrate (restore)
//   useEffect(() => {
//     if (hydrated) return;

//     const sectionParam = sp.get("section");
//     const difficultyParam = sp.get("difficulty");
//     const topicParam = sp.get("topic");

//     // ✅ resolve sessionId from URL OR "lastSession" pointer (localStorage)
//     let sidParam = sp.get("sessionId");
//     if (!sidParam) {
//       try {
//         sidParam =
//           localStorage.getItem(
//             `practice:v6:lastSession:${subjectSlug}:${moduleSlug}`,
//           ) || null;
//       } catch {}
//     }

//     resolvedSessionIdRef.current = sidParam ?? null;
//     if (sidParam) setSessionId(sidParam);

//     const questionCountParam = sp.get("questionCount");
//     const qcParsed = questionCountParam
//       ? parseInt(questionCountParam, 10)
//       : NaN;
//     const sizeFromParam =
//       Number.isFinite(qcParsed) && qcParsed > 0 ? qcParsed : null;

//     const nextSection = sectionParam ?? null;

//     const nextDifficulty: Difficulty | "all" =
//       difficultyParam === "easy" ||
//       difficultyParam === "medium" ||
//       difficultyParam === "hard" ||
//       difficultyParam === "all"
//         ? (difficultyParam as any)
//         : "all";

//     const nextTopic: TopicValue = normalizeTopicValue(topicParam);

//     // ✅ IMPORTANT: don’t use run.targetCount here (run isn’t known during hydrate)
//     const initialSize = sizeFromParam ?? SESSION_DEFAULT;
//     setSessionSize(initialSize);

//     try {
//       const key = storageKeyForState({
//         subjectSlug,
//         moduleSlug,
//         section: nextSection,
//         topic: nextTopic,
//         difficulty: nextDifficulty,
//         n: initialSize,
//         sessionId: sidParam ?? null,
//       });

//       const raw = sessionStorage.getItem(key);
//       if (raw) {
//         const saved = JSON.parse(raw);
//         if (saved?.v === 6) {
//           setSection(saved.section ?? nextSection);
//           setTopic(saved.topic ?? nextTopic);
//           setDifficulty(saved.difficulty ?? nextDifficulty);

//           if (saved.run?.mode) setRun(saved.run);

//           setSessionId(saved.sessionId ?? sidParam ?? null);
//           setPhase(saved.phase ?? "practice");
//           setShowMissed(saved.showMissed ?? true);
//           setAutoSummarized(
//             Boolean(saved.autoSummarized ?? saved.phase === "summary"),
//           );

//           const restoredStack = Array.isArray(saved.stack) ? saved.stack : [];
//           const cleaned = restoredStack.filter(
//             (q: any) => !isExpiredKey(q.key),
//           );

//           setStack(cleaned);
//           setIdx(
//             typeof saved.idx === "number"
//               ? Math.max(
//                   0,
//                   Math.min(saved.idx, Math.max(0, cleaned.length - 1)),
//                 )
//               : 0,
//           );

//           if (cleaned.length === 0) {
//             setSessionId(saved.sessionId ?? sidParam ?? null);
//             setPhase("practice");
//           }

//           setSessionSize(
//             typeof saved.sessionSize === "number" && saved.sessionSize > 0
//               ? saved.sessionSize
//               : initialSize,
//           );

//           setLoadErr(null);
//           restoredRef.current = true;
//           firstFiltersEffectRef.current = true;
//           skipUrlSyncRef.current = true;
//           setHydrated(true);
//           return;
//         }
//       }
//     } catch {
//       // ignore
//     }

//     setSection(nextSection);
//     setTopic(nextTopic);
//     setDifficulty(nextDifficulty);
//     setPhase("practice");
//     setAutoSummarized(false);
//     setShowMissed(true);
//     setStack([]);
//     setIdx(0);
//     setLoadErr(null);

//     restoredRef.current = false;
//     firstFiltersEffectRef.current = true;
//     skipUrlSyncRef.current = true;
//     setHydrated(true);
//   }, [sp, hydrated, subjectSlug, moduleSlug]);

//   // ✅ If server run sends targetCount, apply once (only if user didn’t customize)
//   useEffect(() => {
//     if (!hydrated) return;
//     if (!run?.targetCount) return;
//     if (appliedRunCountRef.current) return;

//     setSessionSize((cur) => (cur === SESSION_DEFAULT ? run.targetCount : cur));
//     appliedRunCountRef.current = true;
//   }, [hydrated, run]);

//   // ✅ persist
//   useEffect(() => {
//     if (!hydrated) return;

//     const payload = {
//       v: 6,
//       savedAt: Date.now(),
//       section,
//       topic,
//       difficulty,
//       sessionId,
//       run,
//       phase,
//       autoSummarized,
//       showMissed,
//       stack,
//       idx,
//       sessionSize,
//     };

//     try {
//       sessionStorage.setItem(
//         storageKeyForState({
//           subjectSlug,
//           moduleSlug,
//           section,
//           topic,
//           difficulty,
//           n: sessionSize,
//           sessionId,
//         }),
//         JSON.stringify(payload),
//       );
//     } catch {}
//   }, [
//     hydrated,
//     subjectSlug,
//     moduleSlug,
//     section,
//     topic,
//     difficulty,
//     sessionId,
//     run,
//     phase,
//     autoSummarized,
//     showMissed,
//     stack,
//     idx,
//     sessionSize,
//   ]);

//   // ✅ remember "last session" pointer (cross refresh / tab close)
//   useEffect(() => {
//     if (!hydrated) return;
//     if (!sessionId) return;
//     try {
//       localStorage.setItem(
//         `practice:v6:lastSession:${subjectSlug}:${moduleSlug}`,
//         sessionId,
//       );
//     } catch {}
//   }, [hydrated, sessionId, subjectSlug, moduleSlug]);

//   // ✅ URL sync (don’t fight assignment/session URLs)
//   useEffect(() => {
//     if (!hydrated) return;
//     if (isLockedRun) return; // ✅ session should not rewrite URLs either

//     if (skipUrlSyncRef.current) {
//       skipUrlSyncRef.current = false;
//       return;
//     }

//     const qs = new URLSearchParams(sp.toString());

//     // ✅ keep sessionId in URL once it exists
//     if (sessionId) qs.set("sessionId", sessionId);
//     else qs.delete("sessionId");

//     if (section) qs.set("section", section);
//     else qs.delete("section");

//     qs.set("topic", String(topic));
//     qs.set("difficulty", String(difficulty));

//     if (sessionSize && sessionSize !== SESSION_DEFAULT)
//       qs.set("questionCount", String(sessionSize));
//     else qs.delete("questionCount");

//     const desired = qs.toString();
//     const currentSearch = sp.toString();
//     if (desired === currentSearch) return;

//     router.replace(`${pathname}?${desired}`, { scroll: false });
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [
//     hydrated,
//     section,
//     topic,
//     difficulty,
//     sessionSize,
//     sessionId,
//     pathname,
//     router,
//     sp,
//     isLockedRun,
//   ]);

//   function updateCurrent(patch: Partial<QItem>) {
//     setStack((prev) => {
//       if (idx < 0 || idx >= prev.length) return prev;
//       const next = prev.slice();
//       next[idx] = { ...next[idx], ...patch };
//       return next;
//     });
//   }

//   async function loadNextExercise(opts?: { forceNew?: boolean }) {
//     if (phase === "summary" && !opts?.forceNew) return;
//     if (loadLockRef.current) return;
//     if (answeredCount >= sessionSize && !opts?.forceNew) return;

//     loadLockRef.current = true;

//     abortRef.current?.abort();
//     const controller = new AbortController();
//     abortRef.current = controller;

//     setBusy(true);
//     setLoadErr(null);

//     try {
//       const sidFromUrl = sp.get("sessionId");
//       const effectiveSid =
//         sidFromUrl ?? sessionId ?? resolvedSessionIdRef.current;

//       const sid = opts?.forceNew ? null : effectiveSid;
//       const useSession = Boolean(sid);

//       const res: PracticeGetResponse = await fetchPracticeExercise({
//         sessionId: useSession ? (sid ?? undefined) : undefined,
//         allowReveal: allowReveal ? true : undefined,
//         signal: controller.signal,

//         // stateless filters (DB-driven)
//         subject: useSession ? undefined : subjectSlug,
//         module: useSession ? undefined : moduleSlug,
//         topic: useSession ? undefined : String(topic === "all" ? "" : topic),
//         difficulty: useSession
//           ? undefined
//           : difficulty === "all"
//             ? undefined
//             : difficulty,
//         section: useSession ? undefined : (section ?? undefined),
//       } as any);

//       const runFromApi = (res as any)?.run;
//       if (runFromApi?.mode) setRun(runFromApi);

//       if ((res as any)?.complete) {
//         const sid2 = (res as any)?.sessionId;
//         if (sid2) setSessionId(String(sid2));

//         setAutoSummarized(true);
//         setPhase("summary");

//         const serverReturn =
//           (res as any)?.returnUrl || (res as any)?.run?.returnUrl || null;

//         setCompletionReturnUrl(serverReturn || returnUrlFromQuery);
//         return;
//       }

//       const ex = (res as any)?.exercise;
//       const key = (res as any)?.key;

//       if (!ex || typeof ex?.kind !== "string" || typeof key !== "string") {
//         throw new Error(
//           "Malformed response from /api/practice (missing exercise/key).",
//         );
//       }

//       if ((res as any).sessionId) setSessionId(String((res as any).sessionId));

//       const item = initItemFromExercise(ex as Exercise, key);

//       setStack((prev) => {
//         const next = [...prev, item];
//         setIdx(next.length - 1);
//         return next;
//       });
//     } catch (e: any) {
//       if (e?.name === "AbortError") return;
//       setLoadErr(e?.message ?? t("errors.failedToLoad"));
//     } finally {
//       if (abortRef.current === controller) setBusy(false);
//       loadLockRef.current = false;
//     }
//   }

//   // lock selected values when run says so
//   useEffect(() => {
//     if (!run) return;
//     if (run.mode === "assignment" || run.mode === "session") {
//       setDifficulty(run.lockDifficulty);
//       setTopic(run.lockTopic);
//     }
//   }, [run]);

//   // when filters change (unlocked only)
//   useEffect(() => {
//     if (!hydrated) return;
//     if (isLockedRun) return; // ✅ critical: session must not reset itself

//     if (firstFiltersEffectRef.current) {
//       firstFiltersEffectRef.current = false;
//       return;
//     }

//     setLoadErr(null);
//     setPhase("practice");
//     setAutoSummarized(false);

//     setShowMissed(true);
//     setSessionId(null);
//     setStack([]);
//     setIdx(0);

//     void loadNextExercise({ forceNew: true });
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [topic, difficulty, section, hydrated, isLockedRun]);

//   // initial load
// useEffect(() => {
//   if (!hydrated) return;
//   if (bootCompleteRef.current) return;
//   if (phase === "summary") return;

//   const sidFromUrl = sp.get("sessionId");
//   const effectiveSid = sidFromUrl ?? sessionId ?? resolvedSessionIdRef.current;

//   let alive = true;

//   (async () => {
//     // ✅ ALWAYS check server completion if there's a sessionId (even if stack restored)
//     if (effectiveSid) {
//       const st = await getSessionStatus(String(effectiveSid));
//       if (!alive) return;

//       if (st?.run?.mode) setRun(st.run);

//       if (st?.targetCount && st.targetCount > 0) {
//         setSessionSize((cur) => (cur === SESSION_DEFAULT ? st.targetCount : cur));
//       }

//       if (st?.complete) {
//         bootCompleteRef.current = true;
//         setAutoSummarized(true);
//         setPhase("summary");
//         setCompletionReturnUrl(st.returnUrl || returnUrlFromQuery);
//         return;
//       }
//     }

//     // ✅ If we already restored questions, don't auto-load a new one
//     if (stack.length > 0) return;

//     // otherwise load the first question
//     await loadNextExercise({ forceNew: !effectiveSid });
//   })();

//   return () => {
//     alive = false;
//   };
//   // eslint-disable-next-line react-hooks/exhaustive-deps
// }, [hydrated, sp, sessionId, phase, stack.length, returnUrlFromQuery]);

//   useEffect(() => {
//     if (!hydrated) return;
//     if (!autoSummarized && answeredCount >= sessionSize) {
//       setAutoSummarized(true);
//       setPhase("summary");
//     }
//   }, [hydrated, answeredCount, sessionSize, autoSummarized]);

//   function canGoPrev() {
//     return idx > 0;
//   }

// function canGoNext() {
//   // ✅ allow "Next" to start when nothing loaded yet
//   if (!current) return true;

//   if (idx < stack.length - 1) return true;

//   const attempts = current.attempts ?? 0;
//   const outOfAttempts = attempts >= maxAttempts;

//   if (!current.submitted && !outOfAttempts) return false;

//   return answeredCount < sessionSize;
// }

// async function goNext() {
//   if (!canGoNext()) return;

//   // ✅ start
//   if (!current) {
//     await loadNextExercise();
//     return;
//   }

//   if (idx < stack.length - 1) {
//     setIdx((i) => Math.min(stack.length - 1, i + 1));
//     return;
//   }

//   await loadNextExercise();
// }

//   function goPrev() {
//     if (!canGoPrev()) return;
//     setIdx((i) => Math.max(0, i - 1));
//   }


//   async function submit() {
//     if (submitLockRef.current) return;
//     if (!current || !exercise) return;
//     if (busy) return;

//     if (current.submitted) return;
//     if (isLockedRun && (current.attempts ?? 0) >= maxAttempts) return; // ✅ session too

//     submitLockRef.current = true;
//     setActionErr(null);

//     try {
//       let answer: SubmitAnswer | undefined;

//       // vector answers come from padRef (authoritative)
//       if (exercise.kind === "vector_drag_dot") {
//         answer = { kind: "vector_drag_dot", a: cloneVec(padRef.current.a) };
//         updateCurrent({ dragA: cloneVec(padRef.current.a) });
//       } else if (exercise.kind === "vector_drag_target") {
//         answer = {
//           kind: "vector_drag_target",
//           a: cloneVec(padRef.current.a),
//           b: cloneVec(padRef.current.b),
//         };
//         updateCurrent({
//           dragA: cloneVec(padRef.current.a),
//           dragB: cloneVec(padRef.current.b),
//         });
//       } else {
//         answer = buildSubmitAnswerFromItem(current);
//       }

//       if (!answer) {
//         setActionErr(t("errors.incompleteAnswer"));
//         return;
//       }

//       setBusy(true);

//       const data = await submitPracticeAnswer({
//         key: current.key,
//         answer,
//       } as any);

//       const nextAttempts = (current.attempts ?? 0) + 1;
//       const ok = !!(data as any).ok;
//       const finalize = ok || nextAttempts >= maxAttempts;

//       updateCurrent({
//         result: data as any,
//         attempts: nextAttempts,
//         submitted: finalize,
//         revealed: false,
//       });

//       if ((data as any)?.sessionComplete) {
//         setAutoSummarized(true);
//         setPhase("summary");

//         const serverReturn =
//           (data as any)?.returnUrl || (data as any)?.run?.returnUrl || null;

//         setCompletionReturnUrl(serverReturn || returnUrlFromQuery);
//         return;
//       }
//     } catch (e: any) {
//       setActionErr(e?.message ?? t("errors.failedToSubmit"));
//     } finally {
//       setBusy(false);
//       submitLockRef.current = false;
//     }
//   }

//   async function reveal() {
//     if (!current || busy) return;
//     if (!allowReveal) return;

//     setBusy(true);
//     setActionErr(null);

//     try {
//       const data = await submitPracticeAnswer({
//         key: current.key,
//         reveal: true,
//       } as any);

//       const solA = (data as any)?.reveal?.solutionA;
//       const bExp = (data as any)?.reveal?.b;
//       const finalized = Boolean((data as any)?.finalized);

//       updateCurrent({
//         result: data as any,
//         revealed: true,
//         submitted: finalized,
//         ...(solA ? { dragA: cloneVec(solA) } : {}),
//         ...(bExp ? { dragB: cloneVec(bExp) } : {}),
//       });

//       if (solA) padRef.current.a = cloneVec(solA) as any;
//       if (bExp) padRef.current.b = cloneVec(bExp) as any;
//     } catch (e: any) {
//       setActionErr(e?.message ?? t("errors.failedToSubmit"));
//     } finally {
//       setBusy(false);
//     }
//   }

//   // keep padRef synced to current
//   useEffect(() => {
//     if (!current) return;
//     padRef.current.mode = "2d";
//     padRef.current.a = { ...current.dragA } as any;
//     padRef.current.b = { ...current.dragB } as any;
//   }, [current]);

//   const badge = useMemo(() => {
//     if (!exercise) return "";
//     return `${String(exercise.topic).toUpperCase()} • ${exercise.kind.replaceAll("_", " ")}`;
//   }, [exercise]);

//   const pct = scorePct(correctCount, answeredCount);

//   return (
//     <PracticeShell
//       returnUrl={completionReturnUrl}
//       onReturn={() => {
//         if (!completionReturnUrl) return;
//         router.replace(completionReturnUrl);
//       }}
//       t={t}
//       isAssignmentRun={isAssignmentRun}
//       isSessionRun={isSessionRun}
//       isLockedRun={isLockedRun}
//       topicLocked={topicLocked}
//       difficultyLocked={difficultyLocked}
//       allowReveal={allowReveal}
//       showDebug={showDebug}
//       maxAttempts={maxAttempts}
//       sessionSize={sessionSize}
//       setSessionSize={setSessionSize}
//       topic={topic}
//       setTopic={(v) => requestChange({ kind: "topic", value: v })}
//       difficulty={difficulty}
//       setDifficulty={(v) => requestChange({ kind: "difficulty", value: v })}
//       section={section}
//       setSection={setSection}
//       topicOptionsFixed={effectiveTopicOptions}
//       difficultyOptions={effectiveDifficultyOptions}
//       badge={badge}
//       busy={busy}
//       loadErr={loadErr}
//       actionErr={actionErr}
//       phase={phase}
//       setPhase={setPhase}
//       showMissed={showMissed}
//       setShowMissed={setShowMissed}
//       pct={pct}
//       answeredCount={answeredCount}
//       correctCount={correctCount}
//       stack={stack}
//       idx={idx}
//       setIdx={setIdx}
//       current={current}
//       exercise={exercise}
//       missed={missed}
//       confirmOpen={confirmOpen}
//       applyPendingChange={applyPendingChange}
//       cancelPendingChange={cancelPendingChange}
//       canGoPrev={canGoPrev()}
//       canGoNext={canGoNext()}
//       goPrev={goPrev}
//       goNext={goNext}
//       submit={submit}
//       reveal={reveal}
//       retryLoad={() => void loadNextExercise({ forceNew: false })}
//       padRef={padRef}
//       zHeldRef={zHeldRef}
//       updateCurrent={(patch: any) => updateCurrent(patch)}
//     />
//   );
// }
