export * from "./module/ReviewModuleView";



// // src/components/review/module/ReviewModuleView.tsx
// "use client";
//
// import React, { useMemo, useEffect, useState, useRef, useCallback } from "react";
// import { useParams } from "next/navigation";
// import { useRouter } from "@/i18n/navigation";
//
// import type { ReviewModule, ReviewCard } from "@/lib/review/types";
// import type { SavedQuizState, ReviewProgressState } from "@/lib/review/progressTypes";
// import type { Lang } from "@/lib/code/runCode";
//
// import CardRenderer from "@/components/review/module/CardRenderer";
// import RingButton from "@/components/review/module/RingButton";
// import { useReviewProgress } from "@/components/review/module/hooks/useReviewProgress";
// import { useAssignmentStatus } from "@/components/review/module/hooks/useAssignmentStatus";
// import { useModuleNav } from "@/components/review/module/hooks/useModuleNav";
//
// import { cn } from "@/lib/cn";
// import ConfirmResetModal from "../practice/ConfirmResetModal";
// import { ROUTES } from "@/utils";
// import CodeRunner from "@/components/code/runner/CodeRunner";
//
// // -----------------------------
// // tiny helpers
// // -----------------------------
// function clamp(n: number, min: number, max: number) {
//   return Math.max(min, Math.min(max, n));
// }
//
// function clamp01(n: number) {
//   return Math.max(0, Math.min(1, n));
// }
//
// function isTopicComplete(topicCards: ReviewCard[], tstate: any) {
//   const cardsDone = tstate?.cardsDone ?? {};
//   const quizzesDone = tstate?.quizzesDone ?? {};
//   for (const c of topicCards) {
//     if (c.type === "quiz") {
//       if (!quizzesDone[c.id]) return false;
//     } else {
//       if (!cardsDone[c.id]) return false;
//     }
//   }
//   return true;
// }
//
// function prereqsMetForQuiz(cards: ReviewCard[], tp: any, quizCardId: string) {
//   const idx = cards.findIndex((c) => c.id === quizCardId);
//   const prereqCards = idx >= 0 ? cards.slice(0, idx).filter((c) => c.type !== "quiz") : [];
//   return prereqCards.every((c) => Boolean(tp?.cardsDone?.[c.id]));
// }
//
// function countAnswered(cards: ReviewCard[], tstate: any) {
//   let answered = 0;
//   for (const c of cards) {
//     const done = c.type === "quiz" ? Boolean(tstate?.quizzesDone?.[c.id]) : Boolean(tstate?.cardsDone?.[c.id]);
//     if (done) answered++;
//   }
//   return { answeredCount: answered, sessionSize: cards.length };
// }
//
// // -----------------------------
// // UI shells
// // -----------------------------
// function TopicShell({
//                       title,
//                       subtitle,
//                       right,
//                       children,
//                     }: {
//   title: string;
//   subtitle?: string | null;
//   right?: React.ReactNode;
//   children: React.ReactNode;
// }) {
//   return (
//       <div className="ui-card p-4 md:p-5">
//         <div className="flex items-end justify-between gap-3">
//           <div className="min-w-0">
//             <div className="text-sm font-black text-neutral-600 dark:text-white/60">Topic</div>
//             <div className="text-xl font-black text-neutral-900 dark:text-white truncate">{title}</div>
//             {subtitle ? <div className="mt-1 text-sm text-neutral-600 dark:text-white/60">{subtitle}</div> : null}
//           </div>
//           {right ? <div className="shrink-0 flex items-center gap-2">{right}</div> : null}
//         </div>
//
//         <div className="mt-4 grid gap-3">{children}</div>
//       </div>
//   );
// }
//
// function BannerCard({
//                       title,
//                       body,
//                       tone = "neutral",
//                       actions,
//                     }: {
//   title: string;
//   body?: React.ReactNode;
//   tone?: "neutral" | "good";
//   actions?: React.ReactNode;
// }) {
//   const toneCls =
//       tone === "good"
//           ? "border-emerald-600/25 bg-emerald-500/10 dark:border-emerald-300/30 dark:bg-emerald-300/10"
//           : "border-neutral-200 bg-white dark:border-white/10 dark:bg-white/[0.04]";
//
//   return (
//       <div className={cn("rounded-2xl border p-4 md:p-5", toneCls)}>
//         <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
//           <div className="min-w-0">
//             <div className="text-sm font-black text-neutral-900 dark:text-white">{title}</div>
//             {body ? <div className="mt-1 text-sm text-neutral-700 dark:text-white/70">{body}</div> : null}
//           </div>
//           {actions ? <div className="shrink-0">{actions}</div> : null}
//         </div>
//       </div>
//   );
// }
//
// function TopicIntro({ topic }: { topic: any }) {
//   const intro = topic?.intro ?? null;
//   const bullets: string[] = intro?.bullets ?? [];
//   return (
//       <BannerCard
//           title={intro?.title ?? "Quick intro"}
//           body={
//             <div className="grid gap-2">
//               <div>{intro?.body ?? "Here’s what to focus on before you start."}</div>
//               {bullets.length ? (
//                   <ul className="mt-1 grid gap-1 text-sm">
//                     {bullets.map((b) => (
//                         <li key={b} className="flex gap-2">
//                           <span className="mt-[2px]">✓</span>
//                           <span>{b}</span>
//                         </li>
//                     ))}
//                   </ul>
//               ) : null}
//             </div>
//           }
//       />
//   );
// }
//
// function TopicOutro({ topic, onContinue }: { topic: any; onContinue?: () => void }) {
//   const outro = topic?.outro ?? null;
//   const bullets: string[] = outro?.bullets ?? [];
//
//   return (
//       <BannerCard
//           tone="good"
//           title={outro?.title ?? "Nice — topic complete"}
//           body={
//             <div className="grid gap-2">
//               <div>{outro?.body ?? "You finished everything in this topic. You can move on or review anything you want."}</div>
//               {bullets.length ? (
//                   <ul className="mt-1 grid gap-1 text-sm">
//                     {bullets.map((b) => (
//                         <li key={b} className="flex gap-2">
//                           <span className="mt-[2px]">•</span>
//                           <span>{b}</span>
//                         </li>
//                     ))}
//                   </ul>
//               ) : null}
//             </div>
//           }
//           actions={
//             onContinue ? (
//                 <button
//                     type="button"
//                     onClick={onContinue}
//                     className={cn("ui-btn ui-btn-primary", "px-4 py-2 text-sm font-extrabold")}
//                 >
//                   Next topic →
//                 </button>
//             ) : null
//           }
//       />
//   );
// }
//
// // -----------------------------
// // main component
// // -----------------------------
// export default function ReviewModuleView({
//                                            mod,
//                                            onModuleCompleteChange,
//                                            canUnlockAll = false,
//                                          }: {
//   mod: ReviewModule;
//   onModuleCompleteChange?: (done: boolean) => void;
//   canUnlockAll?: boolean;
// }) {
//   const params = useParams<{ locale: string; subjectSlug: string; moduleSlug: string }>();
//   const router = useRouter();
//
//   const locale = params?.locale ?? "en";
//   const subjectSlug = params?.subjectSlug ?? "";
//   const moduleId = params?.moduleSlug ?? "";
//
//   const unlockAll = Boolean(canUnlockAll);
//
//   const topics = Array.isArray(mod?.topics) ? mod.topics : [];
//   const firstTopicId = topics[0]?.id ?? "";
//
//   const {
//     hydrated: progressHydrated,
//     progress,
//     setProgress,
//     activeTopicId,
//     setActiveTopicId,
//     viewTopicId,
//     setViewTopicId,
//     flushNow,
//   } = useReviewProgress({ subjectSlug, moduleId, locale, firstTopicId });
//
//   const viewTopic = useMemo(
//       () => topics.find((t) => t.id === viewTopicId) ?? topics[0] ?? null,
//       [topics, viewTopicId],
//   );
//
//   const viewCards = Array.isArray(viewTopic?.cards) ? viewTopic!.cards : [];
//   const viewTid = viewTopic?.id ?? firstTopicId ?? "";
//
//   // -----------------------------
//   // FULLSCREEN layout: side widths + collapse
//   // -----------------------------
//   const [leftCollapsed, setLeftCollapsed] = useState(false);
//   const [rightCollapsed, setRightCollapsed] = useState(false);
//
//   const [leftW, setLeftW] = useState(300);
//   const [rightW, setRightW] = useState(520);
//
//   const leftMin = 220;
//   const leftMax = 520;
//   const rightMin = 320;
//   const rightMax = 760;
//
//   const draggingRef = useRef<null | { kind: "left" | "right"; startX: number; startW: number }>(null);
//
//   useEffect(() => {
//     function onMove(e: MouseEvent) {
//       const d = draggingRef.current;
//       if (!d) return;
//
//       if (d.kind === "left") {
//         const next = d.startW + (e.clientX - d.startX);
//         setLeftW(clamp(next, leftMin, leftMax));
//       } else {
//         const next = d.startW + (d.startX - e.clientX); // drag left => bigger right panel
//         setRightW(clamp(next, rightMin, rightMax));
//       }
//     }
//     function onUp() {
//       draggingRef.current = null;
//     }
//
//     window.addEventListener("mousemove", onMove);
//     window.addEventListener("mouseup", onUp);
//     return () => {
//       window.removeEventListener("mousemove", onMove);
//       window.removeEventListener("mouseup", onUp);
//     };
//   }, []);
//
//   // -----------------------------
//   // ✅ Debounced sketch persistence (as you had)
//   // -----------------------------
//   const sketchTimersRef = useRef<Map<string, number>>(new Map());
//   const sketchLastHashRef = useRef<Map<string, string>>(new Map());
//   const sketchLatestStateRef = useRef<Map<string, any>>(new Map());
//
//   const commitSketchNow = useCallback(
//       (topicId: string, sketchCardId: string) => {
//         const key = `${topicId}:${sketchCardId}`;
//         const s = sketchLatestStateRef.current.get(key);
//
//         setProgress((p: any) => {
//           const tp0: any = p.topics?.[topicId] ?? {};
//           return {
//             ...p,
//             topics: {
//               ...(p.topics ?? {}),
//               [topicId]: {
//                 ...tp0,
//                 sketchState: {
//                   ...(tp0.sketchState ?? {}),
//                   [sketchCardId]: s,
//                 },
//               },
//             },
//           };
//         });
//       },
//       [setProgress],
//   );
//
//   const saveSketchDebounced = useCallback(
//       (topicId: string, sketchCardId: string, s: any) => {
//         const key = `${topicId}:${sketchCardId}`;
//         const nextHash = JSON.stringify(s ?? null);
//
//         if (sketchLastHashRef.current.get(key) === nextHash) return;
//         sketchLastHashRef.current.set(key, nextHash);
//
//         sketchLatestStateRef.current.set(key, s);
//
//         const prev = sketchTimersRef.current.get(key);
//         if (prev) window.clearTimeout(prev);
//
//         const t = window.setTimeout(() => commitSketchNow(topicId, sketchCardId), 900);
//         sketchTimersRef.current.set(key, t);
//       },
//       [commitSketchNow],
//   );
//
//   // flush pending sketch commits when switching topics
//   useEffect(() => {
//     for (const [key, t] of sketchTimersRef.current.entries()) {
//       window.clearTimeout(t);
//       const parts = key.split(":");
//       const topicId = parts[0];
//       const sketchCardId = parts.slice(1).join(":");
//       if (topicId && sketchCardId) commitSketchNow(topicId, sketchCardId);
//     }
//     sketchTimersRef.current.clear();
//   }, [viewTid, commitSketchNow]);
//
//   // -----------------------------
//   // topic version keying (yours)
//   // -----------------------------
//   const viewProg: any = (progress as any)?.topics?.[viewTid] ?? {};
//   const moduleV = (progress as any)?.quizVersion ?? 0;
//   const topicV = (viewProg as any)?.quizVersion ?? 0;
//   const versionStr = `${moduleV}.${topicV}`;
//   const topicRenderKey = `${viewTid}:${versionStr}`;
//
//   const activeIdx = useMemo(() => topics.findIndex((t) => t.id === activeTopicId), [topics, activeTopicId]);
//
//   const topicUnlocked = useMemo(() => {
//     return (tid: string) => {
//       if (unlockAll) return true;
//       const idx = topics.findIndex((x) => x.id === tid);
//       if (idx <= 0) return true;
//       const prev = topics[idx - 1];
//       const prevState = (progress as any)?.topics?.[prev.id];
//       return isTopicComplete(prev.cards ?? [], prevState);
//     };
//   }, [topics, progress, unlockAll]);
//
//   const moduleComplete = useMemo(() => {
//     if (!topics.length) return false;
//     return topics.every((t) => {
//       const cards = Array.isArray(t.cards) ? t.cards : [];
//       const tstate = (progress as any)?.topics?.[t.id];
//       return isTopicComplete(cards, tstate);
//     });
//   }, [topics, progress]);
//
//   useEffect(() => {
//     onModuleCompleteChange?.(moduleComplete || Boolean((progress as any)?.moduleCompleted));
//   }, [moduleComplete, progress, onModuleCompleteChange]);
//
//   // ✅ mark module complete once
//   useEffect(() => {
//     if (!progressHydrated) return;
//     if (!moduleComplete) return;
//     if ((progress as any)?.moduleCompleted) return;
//
//     const nowIso = new Date().toISOString();
//     const next: ReviewProgressState = {
//       ...(progress as any),
//       moduleCompleted: true,
//       moduleCompletedAt: nowIso,
//     };
//
//     setProgress(next);
//     flushNow(next);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [moduleComplete, progressHydrated]);
//
//   // ✅ mark topic complete once
//   useEffect(() => {
//     if (!progressHydrated) return;
//     if (!viewTid) return;
//
//     const doneNow = isTopicComplete(viewCards, (progress as any)?.topics?.[viewTid]);
//     if (!doneNow) return;
//
//     const tp: any = (progress as any)?.topics?.[viewTid] ?? {};
//     if (tp.completed) return;
//
//     const nowIso = new Date().toISOString();
//
//     setProgress((p: any) => {
//       const cur = p?.topics?.[viewTid] ?? {};
//       if (cur.completed) return p;
//       return {
//         ...p,
//         topics: {
//           ...(p.topics ?? {}),
//           [viewTid]: {
//             ...cur,
//             completed: true,
//             completedAt: cur.completedAt ?? nowIso,
//           },
//         },
//       };
//     });
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [progressHydrated, viewTid, viewCards, progress]);
//
//   // ---------------- Assignment (yours)
//   const assignmentSessionId = (progress as any)?.assignmentSessionId ? String((progress as any).assignmentSessionId) : null;
//
//   const { status: assignmentStatus, complete: assignmentDone, pct: assignmentPct } = useAssignmentStatus({
//     sessionId: assignmentSessionId,
//     enabled: progressHydrated,
//   });
//
//   const assignmentLabel =
//       assignmentStatus.phase === "complete"
//           ? "✓ Assignment complete"
//           : assignmentStatus.phase === "in_progress"
//               ? "Assignment in progress"
//               : "Start module assignment";
//
//   const assignmentSublabel =
//       assignmentStatus.phase === "in_progress"
//           ? `${assignmentStatus.answeredCount}/${assignmentStatus.targetCount} questions`
//           : assignmentStatus.phase === "complete"
//               ? `${assignmentStatus.answeredCount}/${assignmentStatus.targetCount} questions`
//               : undefined;
//
//   const nav = useModuleNav({ subjectSlug, moduleId });
//   const canGoNextModule = unlockAll || ((moduleComplete || Boolean((progress as any)?.moduleCompleted)) && assignmentDone);
//   const isLastModule = !nav?.nextModuleId;
//   const canGetCertificate =
//       isLastModule && (unlockAll || ((moduleComplete || Boolean((progress as any)?.moduleCompleted)) && assignmentDone));
//
//   async function handleAssignmentClick() {
//     const returnToCurrentModule = `/${ROUTES.learningPath(encodeURIComponent(subjectSlug), encodeURIComponent(moduleId))}`;
//
//     if (assignmentSessionId && assignmentStatus.phase !== "idle") {
//       router.push(
//           `/${ROUTES.practicePath(encodeURIComponent(subjectSlug), encodeURIComponent(moduleId))}` +
//           `?sessionId=${encodeURIComponent(assignmentSessionId)}` +
//           `&returnTo=${encodeURIComponent(returnToCurrentModule)}`,
//       );
//       return;
//     }
//
//     const moduleSlug = (mod as any).practiceSectionSlug ?? moduleId;
//
//     const r = await fetch(`/api/modules/${encodeURIComponent(moduleSlug)}/practice/start`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ returnUrl: returnToCurrentModule }),
//     });
//
//     const data = await r.json().catch(() => null);
//
//     if (!r.ok) {
//       alert(data?.message ?? "Unable to start.");
//       return;
//     }
//
//     const newSid = String(data.sessionId);
//
//     const next: ReviewProgressState = {
//       ...(progress as any),
//       assignmentSessionId: newSid as any,
//     };
//     setProgress(next);
//     flushNow(next);
//
//     router.push(
//         `/${encodeURIComponent(locale)}/${ROUTES.practicePath(encodeURIComponent(subjectSlug), encodeURIComponent(moduleId))}` +
//         `?sessionId=${encodeURIComponent(newSid)}` +
//         `&returnTo=${encodeURIComponent(returnToCurrentModule)}`,
//     );
//   }
//
//   // ---------------- Confirm modal (yours)
//   const [confirmOpen, setConfirmOpen] = useState(false);
//   const [pending, setPending] = useState<null | { kind: "module" | "topic"; tid?: string }>(null);
//
//   const pendingStats = useMemo(() => {
//     if (!pending) return { answeredCount: 0, sessionSize: 0, title: "", description: "" };
//
//     if (pending.kind === "topic") {
//       const tid = pending.tid ?? "";
//       const cards = (topics.find((t) => t.id === tid)?.cards ?? []) as ReviewCard[];
//       const tp = (progress as any)?.topics?.[tid] ?? {};
//       const { answeredCount, sessionSize } = countAnswered(cards, tp);
//       return {
//         answeredCount,
//         sessionSize,
//         title: "Reset this topic?",
//         description: `You’ve completed ${answeredCount}/${sessionSize} items in this topic. This will clear them and cannot be undone.`,
//       };
//     }
//
//     let answeredCount = 0;
//     let sessionSize = 0;
//     for (const t of topics) {
//       const cards = (t.cards ?? []) as ReviewCard[];
//       const tp = (progress as any)?.topics?.[t.id] ?? {};
//       const r = countAnswered(cards, tp);
//       answeredCount += r.answeredCount;
//       sessionSize += r.sessionSize;
//     }
//
//     return {
//       answeredCount,
//       sessionSize,
//       title: "Reset the entire module?",
//       description: `You’ve completed ${answeredCount}/${sessionSize} items in this module. This will clear everything and cannot be undone.`,
//     };
//   }, [pending, progress, topics]);
//
//   function cancelPendingChange() {
//     setConfirmOpen(false);
//     setPending(null);
//   }
//
//   function applyPendingChange() {
//     if (!pending) return;
//
//     if (pending.kind === "module") {
//       const fallback = firstTopicId || "";
//       const nextModuleV = ((progress as any)?.quizVersion ?? 0) + 1;
//
//       const next: ReviewProgressState = {
//         quizVersion: nextModuleV,
//         topics: {},
//         activeTopicId: fallback as any,
//         moduleCompleted: false,
//         moduleCompletedAt: undefined,
//       } as any;
//
//       setProgress(next);
//       setActiveTopicId(fallback);
//       setViewTopicId(fallback);
//       flushNow(next);
//
//       cancelPendingChange();
//       return;
//     }
//
//     const tid = pending.tid ?? "";
//     if (!tid) return cancelPendingChange();
//
//     setProgress((p: any) => {
//       const nextTopics = { ...(p.topics ?? {}) };
//       const cur = nextTopics[tid] ?? {};
//       const nextTopicV = (cur.quizVersion ?? 0) + 1;
//
//       nextTopics[tid] = {
//         quizVersion: nextTopicV,
//         cardsDone: {},
//         quizzesDone: {},
//         quizState: {},
//         sketchState: {},
//         toolState: {}, // ✅ clear tool state too
//         completed: false,
//         completedAt: undefined,
//       };
//
//       const next = { ...p, topics: nextTopics };
//       flushNow(next);
//       return next;
//     });
//
//     cancelPendingChange();
//   }
//
//   function requestResetModule() {
//     setPending({ kind: "module" });
//     setConfirmOpen(true);
//   }
//
//   function requestResetTopic(tid: string) {
//     if (!tid) return;
//     setPending({ kind: "topic", tid });
//     setConfirmOpen(true);
//   }
//
//   if (!topics.length) {
//     return <div className="h-full w-full p-6 text-sm text-neutral-600 dark:text-white/70">This module has no topics yet.</div>;
//   }
//
//   // -----------------------------
//   // topic completion + next target
//   // -----------------------------
//   const viewIsComplete = isTopicComplete(viewCards, (progress as any)?.topics?.[viewTid]);
//   const viewIdx = topics.findIndex((t) => t.id === viewTid);
//
//   const prevTopic = viewIdx > 0 ? topics[viewIdx - 1] : null;
//   const nextTopic = viewIdx >= 0 ? topics[viewIdx + 1] : null;
//
//   function goToTopic(tid: string) {
//     if (!tid) return;
//     const idx = topics.findIndex((x) => x.id === tid);
//     if (idx < 0) return;
//
//     if (!unlockAll) {
//       const isEarlierOrActive = idx <= activeIdx;
//       const canGoForward = topicUnlocked(tid);
//       if (!isEarlierOrActive && !canGoForward) return;
//     }
//
//     if (idx > activeIdx) setActiveTopicId(tid);
//     setViewTopicId(tid);
//   }
//
//   function goPrevTopic() {
//     if (!prevTopic?.id) return;
//     goToTopic(prevTopic.id);
//   }
//
//   function goNextTopic() {
//     if (!nextTopic?.id) return;
//     goToTopic(nextTopic.id);
//   }
//
//   // sidebar stats
//   const moduleProgress = useMemo(() => {
//     const total = topics.length;
//     const done = topics.reduce((acc, t) => {
//       const tstate = (progress as any)?.topics?.[t.id];
//       const cards = (t.cards ?? []) as ReviewCard[];
//       return acc + (isTopicComplete(cards, tstate) ? 1 : 0);
//     }, 0);
//     return { total, done, pct: total ? clamp01(done / total) : 0 };
//   }, [topics, progress]);
//
//   // -----------------------------
//   // ✅ Right panel: CodeRunner state saved per-topic
//   // -----------------------------
//   const toolKey = "codeRunner";
//   const toolSaved = (progress as any)?.topics?.[viewTid]?.toolState?.[toolKey] ?? null;
//
//   const [toolLang, setToolLang] = useState<Lang>((toolSaved?.lang as Lang) ?? "python");
//   const [toolCode, setToolCode] = useState<string>(
//       typeof toolSaved?.code === "string" && toolSaved.code.trim().length ? toolSaved.code : `print("hello world")`,
//   );
//
//   // load tool state when topic changes (after hydration)
//   useEffect(() => {
//     if (!progressHydrated) return;
//     const saved = (progress as any)?.topics?.[viewTid]?.toolState?.[toolKey] ?? null;
//     const nextLang = (saved?.lang as Lang) ?? "python";
//     const nextCode =
//         typeof saved?.code === "string" && saved.code.trim().length ? saved.code : `print("hello world")`;
//
//     setToolLang(nextLang);
//     setToolCode(nextCode);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [viewTid, progressHydrated, versionStr]);
//
//   const toolSaveTimerRef = useRef<number | null>(null);
//
//   const saveToolDebounced = useCallback(
//       (nextLang: Lang, nextCode: string) => {
//         if (!progressHydrated) return;
//
//         if (toolSaveTimerRef.current) window.clearTimeout(toolSaveTimerRef.current);
//
//         toolSaveTimerRef.current = window.setTimeout(() => {
//           setProgress((p: any) => {
//             const tp0: any = p.topics?.[viewTid] ?? {};
//             const toolState = { ...(tp0.toolState ?? {}) };
//
//             toolState[toolKey] = { lang: nextLang, code: nextCode };
//
//             return {
//               ...p,
//               topics: {
//                 ...(p.topics ?? {}),
//                 [viewTid]: {
//                   ...tp0,
//                   toolState,
//                 },
//               },
//             };
//           });
//         }, 600);
//       },
//       [progressHydrated, setProgress, viewTid],
//   );
//
//   // flush tool save when switching topics
//   useEffect(() => {
//     return () => {
//       if (toolSaveTimerRef.current) window.clearTimeout(toolSaveTimerRef.current);
//       toolSaveTimerRef.current = null;
//     };
//   }, [viewTid]);
//
//   // -----------------------------
//   // RENDER
//   // -----------------------------
//   return (
//       <div className="h-full w-full overflow-hidden bg-[radial-gradient(1200px_700px_at_20%_0%,#eafff5_0%,#ffffff_55%,#f6f7ff_100%)] dark:bg-[radial-gradient(1200px_700px_at_20%_0%,#151a2c_0%,#0b0d12_50%)] text-neutral-900 dark:text-white/90">
//         {confirmOpen ? (
//             <ConfirmResetModal
//                 open={confirmOpen}
//                 title={pendingStats.title}
//                 description={pendingStats.description}
//                 confirmText="Reset"
//                 cancelText="Cancel"
//                 danger={true}
//                 onConfirm={applyPendingChange}
//                 onClose={cancelPendingChange}
//             />
//         ) : null}
//
//         {/* FULLSCREEN WORKSPACE */}
//         <div className="h-full w-full p-3 md:p-4">
//           <div className="h-full flex gap-3">
//             {/* LEFT: Topics sidebar (collapsible + resizable) */}
//             <aside
//                 className={cn(
//                     "h-full transition-[width] duration-300 ease-out overflow-hidden",
//                     leftCollapsed ? "w-0" : "",
//                 )}
//                 style={{ width: leftCollapsed ? 0 : leftW }}
//             >
//               <div className="h-full ui-card p-3 overflow-auto">
//                 <div className="flex items-start justify-between gap-2">
//                   <div className="min-w-0">
//                     <div className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">
//                       {mod.title}
//                     </div>
//                     {mod.subtitle ? (
//                         <div className="mt-1 text-sm text-neutral-600 dark:text-white/60">{mod.subtitle}</div>
//                     ) : null}
//
//                     <div className="mt-3 flex items-center gap-2">
//                       <span className="text-[11px] font-extrabold text-neutral-500 dark:text-white/45">Topics</span>
//                       <span className="text-[11px] font-black tabular-nums text-neutral-700 dark:text-white/70">
//                       {moduleProgress.done}/{moduleProgress.total}
//                     </span>
//                     </div>
//
//                     <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-200/70 dark:bg-white/10">
//                       <div
//                           className="h-full rounded-full bg-gradient-to-r from-emerald-500/70 via-emerald-500/60 to-teal-400/60 dark:from-emerald-200/30 dark:via-emerald-200/25 dark:to-teal-200/25"
//                           style={{ width: `${Math.round(moduleProgress.pct * 100)}%` }}
//                       />
//                     </div>
//
//                     {unlockAll ? (
//                         <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-400/10 px-3 py-2 text-xs font-black text-amber-800 dark:border-amber-300/25 dark:bg-amber-200/10 dark:text-amber-200">
//                           UNLOCK ENABLED
//                         </div>
//                     ) : null}
//                   </div>
//
//                   <div className="flex flex-col gap-2">
//                     <button
//                         type="button"
//                         onClick={() => setLeftCollapsed(true)}
//                         className="ui-btn ui-btn-secondary px-3 py-2 text-[11px] font-extrabold"
//                         title="Collapse sidebar"
//                     >
//                       ◀
//                     </button>
//
//                     <button
//                         type="button"
//                         onClick={requestResetModule}
//                         className={cn(
//                             "ui-btn ui-btn-secondary",
//                             "px-3 py-2 text-[11px] font-extrabold",
//                             "text-rose-700 dark:text-rose-200",
//                         )}
//                         title="Reset all progress in this module"
//                     >
//                       Reset
//                     </button>
//                   </div>
//                 </div>
//
//                 <div className="mt-4 grid gap-2">
//                   {topics.map((t) => {
//                     const idx = topics.findIndex((x) => x.id === t.id);
//                     const isEarlierOrActive = idx <= activeIdx;
//                     const canGoForward = topicUnlocked(t.id);
//                     const disabled = unlockAll ? false : !isEarlierOrActive && !canGoForward;
//
//                     const doneTopic = isTopicComplete(t.cards ?? [], (progress as any)?.topics?.[t.id]);
//                     const isViewing = viewTopicId === t.id;
//                     const isActive = activeTopicId === t.id;
//
//                     return (
//                         <button
//                             key={t.id}
//                             disabled={disabled}
//                             onClick={() => goToTopic(t.id)}
//                             className={cn(
//                                 "w-full text-left rounded-xl border px-3 py-2 transition",
//                                 disabled && "opacity-60 cursor-not-allowed",
//                                 isViewing
//                                     ? "border-emerald-600/25 bg-emerald-500/10 dark:border-emerald-300/30 dark:bg-emerald-300/10"
//                                     : "border-neutral-200 bg-white hover:bg-neutral-50 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]",
//                             )}
//                         >
//                           <div className="flex items-center justify-between gap-2">
//                             <div className="text-sm font-extrabold">{t.label}</div>
//                             <div className="flex items-center gap-2">
//                               {isActive ? <span className="ui-pill ui-pill--neutral">CURRENT</span> : null}
//                               {doneTopic ? (
//                                   <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-300/80">✓</span>
//                               ) : null}
//                             </div>
//                           </div>
//
//                           {t.summary ? (
//                               <div className="mt-1 text-xs text-neutral-600 dark:text-white/55">{t.summary}</div>
//                           ) : null}
//                         </button>
//                     );
//                   })}
//                 </div>
//
//                 <div className="mt-3">
//                   <RingButton
//                       pct={assignmentPct}
//                       label={assignmentLabel}
//                       sublabel={assignmentSublabel}
//                       onClick={handleAssignmentClick}
//                       disabled={false}
//                   />
//                 </div>
//
//                 {nav?.nextModuleId ? (
//                     <div className="mt-3 rounded-xl border border-neutral-200 bg-white p-3 text-xs dark:border-white/10 dark:bg-white/[0.04]">
//                       <div className="font-extrabold text-neutral-700 dark:text-white/70">Next module</div>
//                       <div className="mt-1 text-neutral-600 dark:text-white/55">
//                         {canGoNextModule ? (unlockAll ? "Unlocked." : "Unlocked after assignment.") : "Finish topics + assignment to unlock."}
//                       </div>
//                     </div>
//                 ) : null}
//               </div>
//             </aside>
//
//             {/* LEFT RESIZE HANDLE */}
//             {!leftCollapsed ? (
//                 <div
//                     onMouseDown={(e) => {
//                       e.preventDefault();
//                       draggingRef.current = { kind: "left", startX: e.clientX, startW: leftW };
//                     }}
//                     className="w-2 cursor-col-resize rounded-xl bg-neutral-200/60 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10"
//                     title="Drag to resize sidebar"
//                 />
//             ) : null}
//
//             {/* MAIN */}
//             <main className="flex-1 min-w-0 h-full overflow-auto">
//               {/* When sidebar is collapsed, show a small restore button */}
//               {leftCollapsed ? (
//                   <div className="mb-3">
//                     <button
//                         type="button"
//                         onClick={() => setLeftCollapsed(false)}
//                         className="ui-btn ui-btn-secondary text-xs font-extrabold"
//                     >
//                       Topics ▶
//                     </button>
//                   </div>
//               ) : null}
//
//               <TopicShell
//                   title={viewTopic?.label ?? ""}
//                   subtitle={viewTopic?.summary ?? null}
//                   right={
//                     <>
//                       <button
//                           type="button"
//                           onClick={() => setRightCollapsed((v) => !v)}
//                           className="ui-btn ui-btn-secondary text-xs font-extrabold"
//                           title={rightCollapsed ? "Show tools" : "Hide tools"}
//                       >
//                         {rightCollapsed ? "Tools ▶" : "Tools ◀"}
//                       </button>
//
//                       <button
//                           type="button"
//                           onClick={() => requestResetTopic(viewTid)}
//                           className="ui-btn ui-btn-secondary text-xs font-extrabold"
//                       >
//                         Reset topic
//                       </button>
//
//                       <button
//                           type="button"
//                           onClick={goPrevTopic}
//                           className="ui-btn ui-btn-secondary text-xs font-extrabold"
//                           disabled={!prevTopic?.id}
//                           title={!prevTopic?.id ? "No previous topic" : "Previous topic"}
//                       >
//                         ←
//                       </button>
//
//                       <button
//                           type="button"
//                           onClick={goNextTopic}
//                           className="ui-btn ui-btn-secondary text-xs font-extrabold"
//                           disabled={!nextTopic?.id || (!unlockAll && !viewIsComplete)}
//                           title={
//                             !nextTopic?.id
//                                 ? "No next topic"
//                                 : !unlockAll && !viewIsComplete
//                                     ? "Complete the topic to continue"
//                                     : "Next topic"
//                           }
//                       >
//                         →
//                       </button>
//                     </>
//                   }
//               >
//                 <TopicIntro topic={viewTopic} />
//
//                 <div key={topicRenderKey} className="grid gap-3">
//                   {viewCards.map((card) => {
//                     const tp: any = (progress as any)?.topics?.[viewTid] ?? {};
//                     const done =
//                         card.type === "quiz" ? Boolean(tp?.quizzesDone?.[card.id]) : Boolean(tp?.cardsDone?.[card.id]);
//
//                     const savedQuiz = (tp?.quizState?.[card.id] ?? null) as SavedQuizState | null;
//                     const savedSketch = tp?.sketchState?.[card.id] ?? null;
//
//                     const prereqsMet = unlockAll
//                         ? true
//                         : card.type === "quiz"
//                             ? prereqsMetForQuiz(viewCards, tp, card.id)
//                             : true;
//
//                     return (
//                         <CardRenderer
//                             key={card.id}
//                             card={card}
//                             done={done}
//                             prereqsMet={prereqsMet}
//                             progressHydrated={progressHydrated}
//                             savedQuiz={progressHydrated ? savedQuiz : null}
//                             versionStr={versionStr}
//                             savedSketch={progressHydrated ? savedSketch : null}
//                             onSketchStateChange={(sketchCardId, s) => saveSketchDebounced(viewTid, sketchCardId, s)}
//                             onMarkDone={() => {
//                               setProgress((p: any) => {
//                                 const tid = viewTid;
//                                 const tp0: any = p.topics?.[tid] ?? {};
//                                 const cardsDone = { ...(tp0.cardsDone ?? {}), [card.id]: true };
//                                 return { ...p, topics: { ...(p.topics ?? {}), [tid]: { ...tp0, cardsDone } } };
//                               });
//                             }}
//                             onQuizPass={(quizId) => {
//                               setProgress((p: any) => {
//                                 const tid = viewTid;
//                                 const tp0: any = p.topics?.[tid] ?? {};
//                                 const quizzesDone = { ...(tp0.quizzesDone ?? {}), [quizId]: true };
//                                 return { ...p, topics: { ...(p.topics ?? {}), [tid]: { ...tp0, quizzesDone } } };
//                               });
//                             }}
//                             onQuizStateChange={(quizCardId, s) => {
//                               setProgress((p: any) => {
//                                 const tid = viewTid;
//                                 const tp0: any = p.topics?.[tid] ?? {};
//                                 const quizState = { ...(tp0.quizState ?? {}), [quizCardId]: s };
//                                 return { ...p, topics: { ...(p.topics ?? {}), [tid]: { ...tp0, quizState } } };
//                               });
//                             }}
//                             onQuizReset={(quizCardId) => {
//                               setProgress((p: any) => {
//                                 const tid = viewTid;
//                                 const tp0: any = p.topics?.[tid] ?? {};
//
//                                 const nextQuizState = { ...(tp0.quizState ?? {}) };
//                                 delete nextQuizState[quizCardId];
//
//                                 const nextQuizzesDone = { ...(tp0.quizzesDone ?? {}) };
//                                 delete nextQuizzesDone[quizCardId];
//
//                                 return {
//                                   ...p,
//                                   topics: {
//                                     ...(p.topics ?? {}),
//                                     [tid]: { ...tp0, quizState: nextQuizState, quizzesDone: nextQuizzesDone },
//                                   },
//                                 };
//                               });
//                             }}
//                         />
//                     );
//                   })}
//                 </div>
//
//                 {viewIsComplete ? <TopicOutro topic={viewTopic} onContinue={nextTopic?.id ? goNextTopic : undefined} /> : null}
//
//                 {isLastModule ? (
//                     <div className="mt-3 rounded-xl border border-emerald-600/25 bg-emerald-500/10 p-3 text-xs dark:border-emerald-300/30 dark:bg-emerald-300/10">
//                       <div className="font-black text-emerald-900 dark:text-emerald-100">Course complete</div>
//                       <div className="mt-1 text-emerald-900/80 dark:text-emerald-100/80">Download your certificate when ready.</div>
//
//                       <button
//                           className={cn(
//                               "mt-3 ui-btn ui-btn-primary w-full",
//                               !canGetCertificate && "opacity-60 cursor-not-allowed",
//                           )}
//                           disabled={!canGetCertificate}
//                           onClick={() => router.push(`/subjects/${encodeURIComponent(subjectSlug)}/certificate`)}
//                       >
//                         Get certificate →
//                       </button>
//                     </div>
//                 ) : null}
//               </TopicShell>
//             </main>
//
//             {/* RIGHT RESIZE HANDLE */}
//             {!rightCollapsed ? (
//                 <div
//                     onMouseDown={(e) => {
//                       e.preventDefault();
//                       draggingRef.current = { kind: "right", startX: e.clientX, startW: rightW };
//                     }}
//                     className="w-2 cursor-col-resize rounded-xl bg-neutral-200/60 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10"
//                     title="Drag to resize tools panel"
//                 />
//             ) : null}
//
//             {/* RIGHT: Tool panel (collapsible + resizable) */}
//             <aside
//                 className={cn(
//                     "h-full transition-[width] duration-300 ease-out overflow-hidden",
//                     rightCollapsed ? "w-0" : "",
//                 )}
//                 style={{ width: rightCollapsed ? 0 : rightW }}
//             >
//               <div className="h-full overflow-auto ui-card p-3">
//                 <div className="flex items-center justify-between gap-2">
//                   <div className="text-sm font-black text-neutral-800 dark:text-white/80">Tools</div>
//                   <button
//                       type="button"
//                       className="ui-btn ui-btn-secondary px-3 py-2 text-[11px] font-extrabold"
//                       onClick={() => setRightCollapsed(true)}
//                       title="Collapse tools"
//                   >
//                     ▶
//                   </button>
//                 </div>
//
//                 <div className="mt-3">
//                   <CodeRunner
//                       title="Run code"
//                       height={520}
//                       showHint={false}
//                       showTerminalDockToggle
//                       showEditorThemeToggle
//                       showLanguagePicker
//                       // allowedLanguages={["python", "javascript", "java"] as any}
//                       fixedLanguage={toolLang as any}
//                       code={toolCode}
//                       // onChangeLanguage={(l: Lang) => {
//                       //   setToolLang(l);
//                       //   saveToolDebounced(l, toolCode);
//                       // }}
//                       onChangeCode={(c: string) => {
//                         setToolCode(c);
//                         saveToolDebounced(toolLang, c);
//                       }}
//                   />
//                 </div>
//
//                 <div className="mt-3 text-[11px] text-neutral-500 dark:text-white/50">
//                   This code is saved per-topic.
//                 </div>
//               </div>
//             </aside>
//           </div>
//         </div>
//       </div>
//   );
// }
