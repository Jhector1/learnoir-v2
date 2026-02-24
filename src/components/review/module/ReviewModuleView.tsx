"use client";

import React, {useMemo, useEffect, useState, useRef, useCallback} from "react";
import {useParams} from "next/navigation";
import {useRouter} from "@/i18n/navigation";

import type {ReviewModule, ReviewCard} from "@/lib/subjects/types";
import type {SavedQuizState, ReviewProgressState} from "@/lib/subjects/progressTypes";
import type {Lang} from "@/lib/code/runCode";

import {useReviewProgress} from "@/components/review/module/hooks/useReviewProgress";
import {useAssignmentStatus} from "@/components/review/module/hooks/useAssignmentStatus";
import {useModuleNav} from "@/components/review/module/hooks/useModuleNav";

// import ConfirmResetModal from "../practice/ConfirmResetModal";
import {ROUTES} from "@/utils";
import {cn} from "@/lib/cn";

import TopicShell from "./components/TopicShell";
// import TopicIntro from "./components/TopicIntro";
import TopicOutro from "./components/TopicOutro";
import ModuleSidebar from "./components/ModuleSidebar";
// import ToolsPanel from "./components/ToolsPanel";
import ToolsPanel  from "@/components/tools/ToolsPanel";

import CardRenderer from "@/components/review/module/CardRenderer";

import {countAnswered, isTopicComplete, clamp01, prereqsMetForAnyQuizOrProject} from "./utils";
import {useResizablePanels} from "./hooks/useResizablePanels";
import {useDebouncedSketchState} from "./hooks/useDebouncedSketchState";
import {useToolCodeRunnerState} from "./hooks/useToolCodeRunnerState";
import ConfirmResetModal from "@/components/practice/ConfirmResetModal";
import {ReviewToolsProvider} from "@/components/review/module/context/ReviewToolsContext";
import {toolsPolicyForSubject} from "@/lib/tools/policy";

export default function ReviewModuleView({
                                             mod,
                                             onModuleCompleteChange,
                                             canUnlockAll = false,
                                         }: {
    mod: ReviewModule;
    onModuleCompleteChange?: (done: boolean) => void;
    canUnlockAll?: boolean;
}) {
    const params = useParams<{ locale: string; subjectSlug: string; moduleSlug: string }>();
    const router = useRouter();

    const locale = params?.locale ?? "en";
    const subjectSlug = params?.subjectSlug ?? "";
    const moduleId = params?.moduleSlug ?? "";

    const unlockAll = Boolean(canUnlockAll);

    const topics = Array.isArray(mod?.topics) ? mod.topics : [];
    const firstTopicId = topics[0]?.id ?? "";
    const { codeEnabled } = useMemo(() => {
        // optional: if your ReviewModule has meta, it can override per subject later
        const meta = (mod as any)?.meta;
        return toolsPolicyForSubject(subjectSlug, meta);
    }, [subjectSlug, mod]);
    const {
        hydrated: progressHydrated,
        progress,
        setProgress,
        activeTopicId,
        setActiveTopicId,
        viewTopicId,
        setViewTopicId,
        flushNow,
    } = useReviewProgress({subjectSlug, moduleId, locale, firstTopicId});

    const viewTopic = useMemo(
        () => topics.find((t) => t.id === viewTopicId) ?? topics[0] ?? null,
        [topics, viewTopicId],
    );

    const viewCards = Array.isArray(viewTopic?.cards) ? viewTopic!.cards : [];
    const viewTid = viewTopic?.id ?? firstTopicId ?? "";

    // panels (collapse + resize)
    const panels = useResizablePanels();

    // sketch debounce
    const sketch = useDebouncedSketchState({setProgress, viewTid});

    // tool (CodeRunner) state
    const tool = useToolCodeRunnerState({
        progress,
        progressHydrated,
        setProgress,
        viewTid,
        rightCollapsed: panels.rightCollapsed,
        rightW: panels.rightW,
        // defaultLang: subjectLang
    });



    // versions (for forcing rerender on reset)
    const viewProg: any = (progress as any)?.topics?.[viewTid] ?? {};
    const moduleV = (progress as any)?.quizVersion ?? 0;
    const topicV = (viewProg as any)?.quizVersion ?? 0;
    const versionStr = `${moduleV}.${topicV}`;
    const topicRenderKey = `${viewTid}:${versionStr}`;

    const activeIdx = useMemo(() => {
        const i = topics.findIndex((t) => t.id === activeTopicId);
        return i < 0 ? 0 : i;
    }, [topics, activeTopicId]);
    const topicUnlocked = useMemo(() => {
        return (tid: string) => {
            if (unlockAll) return true;
            const idx = topics.findIndex((x) => x.id === tid);
            if (idx <= 0) return true;
            const prev = topics[idx - 1];
            const prevState = (progress as any)?.topics?.[prev.id];
            return isTopicComplete(prev.cards ?? [], prevState);
        };
    }, [topics, progress, unlockAll]);

    const moduleComplete = useMemo(() => {
        if (!topics.length) return false;
        return topics.every((t) => {
            const cards = Array.isArray(t.cards) ? t.cards : [];
            const tstate = (progress as any)?.topics?.[t.id];
            return isTopicComplete(cards, tstate);
        });
    }, [topics, progress]);




    // after reduceMotion effect (or anywhere near your scroll helpers)
    useEffect(() => {
        const down = () => ((window as any).__flowPointerDown = true);
        const up = () => ((window as any).__flowPointerDown = false);

        window.addEventListener("pointerdown", down, true);
        window.addEventListener("pointerup", up, true);
        window.addEventListener("pointercancel", up, true);

        return () => {
            window.removeEventListener("pointerdown", down, true);
            window.removeEventListener("pointerup", up, true);
            window.removeEventListener("pointercancel", up, true);
        };
    }, []);



    useEffect(() => {
        onModuleCompleteChange?.(moduleComplete || Boolean((progress as any)?.moduleCompleted));
    }, [moduleComplete, progress, onModuleCompleteChange]);

    // mark module complete once
    useEffect(() => {
        if (!progressHydrated) return;
        if (!moduleComplete) return;
        if ((progress as any)?.moduleCompleted) return;

        const nowIso = new Date().toISOString();
        const next: ReviewProgressState = {
            ...(progress as any),
            moduleCompleted: true,
            moduleCompletedAt: nowIso,
        };

        setProgress(next);
        flushNow(next);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [moduleComplete, progressHydrated]);

    // mark topic complete once
    useEffect(() => {
        if (!progressHydrated) return;
        if (!viewTid) return;

        const doneNow = isTopicComplete(viewCards, (progress as any)?.topics?.[viewTid]);
        if (!doneNow) return;

        const tp: any = (progress as any)?.topics?.[viewTid] ?? {};
        if (tp.completed) return;

        const nowIso = new Date().toISOString();

        setProgress((p: any) => {
            const cur = p?.topics?.[viewTid] ?? {};
            if (cur.completed) return p;
            return {
                ...p,
                topics: {
                    ...(p.topics ?? {}),
                    [viewTid]: {
                        ...cur,
                        completed: true,
                        completedAt: cur.completedAt ?? nowIso,
                    },
                },
            };
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [progressHydrated, viewTid, viewCards, progress]);

    // assignment
    const assignmentSessionId = (progress as any)?.assignmentSessionId ? String((progress as any).assignmentSessionId) : null;
    const {status: assignmentStatus, complete: assignmentDone, pct: assignmentPct} = useAssignmentStatus({
        sessionId: assignmentSessionId,
        enabled: progressHydrated,
    });

    const assignmentLabel =
        assignmentStatus.phase === "complete"
            ? "✓ Assignment complete"
            : assignmentStatus.phase === "in_progress"
                ? "Assignment in progress"
                : "Start module assignment";

    const assignmentSublabel =
        assignmentStatus.phase === "in_progress"
            ? `${assignmentStatus.answeredCount}/${assignmentStatus.targetCount} questions`
            : assignmentStatus.phase === "complete"
                ? `${assignmentStatus.answeredCount}/${assignmentStatus.targetCount} questions`
                : undefined;

    // nav
    const nav = useModuleNav({subjectSlug, moduleId});
    const canGoNextModule = unlockAll || ((moduleComplete || Boolean((progress as any)?.moduleCompleted)) && assignmentDone);
    // const navReady = Boolean(nav);
    // const isLastModule = navReady && !nav?.nextModuleId;


    // const nav = useModuleNav({ subjectSlug, moduleId });

    const navLoading = nav === undefined; // initial load
    const navError = nav === null;        // fetch failed
    const isLastModule = !!nav && !nav.nextModuleId;
    const hasNextModule = !!nav && !!nav.nextModuleId;
    // const hasNextModule = navReady && Boolean(nav?.nextModuleId);
    // const canGetCertificate =
    //     isLastModule && (unlockAll || ((moduleComplete || Boolean((progress as any)?.moduleCompleted)) && assignmentDone));
    //
    const moduleDone = moduleComplete || Boolean((progress as any)?.moduleCompleted);
    const canGetCertificate = isLastModule && (unlockAll || moduleDone);
    async function handleAssignmentClick() {
        const returnToCurrentModule = `/${ROUTES.learningPath(encodeURIComponent(subjectSlug), encodeURIComponent(moduleId))}`;

        if (assignmentSessionId && assignmentStatus.phase !== "idle") {
            router.push(
                `/${ROUTES.practicePath(encodeURIComponent(subjectSlug), encodeURIComponent(moduleId))}` +
                `?sessionId=${encodeURIComponent(assignmentSessionId)}` +
                `&returnTo=${encodeURIComponent(returnToCurrentModule)}`,
            );
            return;
        }

        const moduleSlug = (mod as any).practiceSectionSlug ?? moduleId;

        const r = await fetch(`/api/modules/${encodeURIComponent(moduleSlug)}/practice/start`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({returnUrl: returnToCurrentModule}),
        });

        const data = await r.json().catch(() => null);
        if (!r.ok) {
            alert(data?.message ?? "Unable to start.");
            return;
        }

        const newSid = String(data.sessionId);

        const next: ReviewProgressState = {...(progress as any), assignmentSessionId: newSid as any};
        setProgress(next);
        flushNow(next);

        router.push(
            `/${ROUTES.practicePath(encodeURIComponent(subjectSlug), encodeURIComponent(moduleId))}` +
            `?sessionId=${encodeURIComponent(newSid)}` +
            `&returnTo=${encodeURIComponent(returnToCurrentModule)}`,
        );
    }

    // confirm modal
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pending, setPending] = useState<null | { kind: "module" | "topic"; tid?: string }>(null);

    const pendingStats = useMemo(() => {
        if (!pending) return {answeredCount: 0, sessionSize: 0, title: "", description: ""};

        if (pending.kind === "topic") {
            const tid = pending.tid ?? "";
            const cards = (topics.find((t) => t.id === tid)?.cards ?? []) as ReviewCard[];
            const tp = (progress as any)?.topics?.[tid] ?? {};
            const {answeredCount, sessionSize} = countAnswered(cards, tp);
            return {
                answeredCount,
                sessionSize,
                title: "Reset this topic?",
                description: `You’ve completed ${answeredCount}/${sessionSize} items in this topic. This will clear them and cannot be undone.`,
            };
        }

        let answeredCount = 0;
        let sessionSize = 0;
        for (const t of topics) {
            const cards = (t.cards ?? []) as ReviewCard[];
            const tp = (progress as any)?.topics?.[t.id] ?? {};
            const r = countAnswered(cards, tp);
            answeredCount += r.answeredCount;
            sessionSize += r.sessionSize;
        }

        return {
            answeredCount,
            sessionSize,
            title: "Reset the entire module?",
            description: `You’ve completed ${answeredCount}/${sessionSize} items in this module. This will clear everything and cannot be undone.`,
        };
    }, [pending, progress, topics]);

    function cancelPendingChange() {
        setConfirmOpen(false);
        setPending(null);
    }

    function applyPendingChange() {
        if (!pending) return;

        // ✅ IMPORTANT: reset must unbind tools, otherwise Tools stays bound to stale code_input
        tool.unbindCodeInput();

        if (pending.kind === "module") {
            const fallback = firstTopicId || "";
            const nextModuleV = ((progress as any)?.quizVersion ?? 0) + 1;

            const next: ReviewProgressState = {
                quizVersion: nextModuleV,
                topics: {},
                activeTopicId: fallback as any,
                moduleCompleted: false,
                moduleCompletedAt: undefined,
            } as any;

            setProgress(next);
            setActiveTopicId(fallback);
            setViewTopicId(fallback);
            flushNow(next);

            cancelPendingChange();
            return;
        }

        const tid = pending.tid ?? "";
        if (!tid) return cancelPendingChange();

        setProgress((p: any) => {
            const nextTopics = {...(p.topics ?? {})};
            const cur = nextTopics[tid] ?? {};
            const nextTopicV = (cur.quizVersion ?? 0) + 1;

            nextTopics[tid] = {
                quizVersion: nextTopicV,
                cardsDone: {},
                quizzesDone: {},
                quizState: {},
                sketchState: {},
                toolState: {},
                completed: false,
                completedAt: undefined,
            };

            const next = {...p, topics: nextTopics};
            flushNow(next);
            return next;
        });

        cancelPendingChange();
    }

    function requestResetModule() {
        setPending({kind: "module"});
        setConfirmOpen(true);
    }












    const mainScrollRef = useRef<HTMLElement | null>(null);



    const [reduceMotion, setReduceMotion] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined" || !window.matchMedia) return;
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const apply = () => setReduceMotion(Boolean(mq.matches));
        apply();

        if (mq.addEventListener) mq.addEventListener("change", apply);
        else (mq as any).addListener?.(apply);

        return () => {
            if (mq.removeEventListener) mq.removeEventListener("change", apply);
            else (mq as any).removeListener?.(apply);
        };
    }, []);

    const cardElRef = useRef(new Map<string, HTMLElement | null>());

    const setCardEl = useCallback(
        (id: string) => (el: HTMLElement | null) => {
            cardElRef.current.set(id, el);
        },
        [],
    );

    // const scrollToCardId = useCallback(
    //     (id: string) => {
    //         const el = cardElRef.current.get(id);
    //         if (!el) return;
    //         el.scrollIntoView({
    //             behavior: reduceMotion ? "auto" : "smooth",
    //             block: "start",
    //         });
    //     },
    //     [reduceMotion],
    // );

    useEffect(() => {
        cardElRef.current.clear();
    }, [viewTid, topicRenderKey]);


    function isQuizLikeCard(c: ReviewCard) {
        return c.type === "quiz" || c.type === "project";
    }

    function isCardDone(c: ReviewCard, tp: any) {
        if (isQuizLikeCard(c)) return Boolean(tp?.quizzesDone?.[c.id]);
        return Boolean(tp?.cardsDone?.[c.id]);
    }

    function scrollToNextActionable(fromIndex: number, nextProgress: any) {
        const tp = nextProgress?.topics?.[viewTid] ?? {};
        const prereqsAllQuizzes = unlockAll ? true : prereqsMetForAnyQuizOrProject(viewCards, tp);

        for (let i = fromIndex + 1; i < viewCards.length; i++) {
            const c = viewCards[i];
            if (isCardDone(c, tp)) continue;

            // quizzes/projects only actionable when prereqs met
            if (isQuizLikeCard(c) && !prereqsAllQuizzes) continue;

            // wait one frame so layout reflects the “done” state
            requestAnimationFrame(() => scrollToCardId(c.id));
            return;
        }
    }







    function userIsInteracting() {
        if (typeof window !== "undefined" && (window as any).__flowPointerDown) return true;

        // text selection (mouse drag / highlight)
        const sel = typeof window !== "undefined" ? window.getSelection?.() : null;
        if (sel && !sel.isCollapsed) return true;

        // typing / selecting inside inputs
        const ae = typeof document !== "undefined" ? (document.activeElement as HTMLElement | null) : null;
        if (!ae) return false;

        const tag = ae.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
        if (ae.isContentEditable) return true;

        return false;
    }

    function visibleRatio(el: HTMLElement, container: HTMLElement) {
        const r = el.getBoundingClientRect();
        const c = container.getBoundingClientRect();

        const top = Math.max(r.top, c.top);
        const bot = Math.min(r.bottom, c.bottom);
        const visPx = Math.max(0, bot - top);
        const h = Math.max(1, r.height);

        return visPx / h;
    }

    function focusPrimaryAction(root: HTMLElement) {
        const preferred =
            // ✅ your explicit flow target (and not disabled)
            root.querySelector<HTMLElement>(
                'button[data-flow-focus]:not([disabled]),' +
                'input[data-flow-focus]:not([disabled]),' +
                'textarea[data-flow-focus]:not([disabled]),' +
                'select[data-flow-focus]:not([disabled]),' +
                '[tabindex][data-flow-focus]:not([tabindex="-1"])'
            ) ??
            // ✅ quiz “primary” action if you ever forget data-flow-focus
            root.querySelector<HTMLElement>('button.ui-quiz-action--primary:not([disabled])') ??
            // ✅ standard primary button style
            root.querySelector<HTMLElement>('button.ui-btn-primary:not([disabled])') ??
            // ✅ last resort: first focusable control
            root.querySelector<HTMLElement>(
                'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );

        preferred?.focus({ preventScroll: true } as any);
    }

    const scrollToCardId = useCallback(
        (id: string) => {
            const el = cardElRef.current.get(id);
            if (!el) return;

            if (userIsInteracting()) return;

            const container = mainScrollRef.current;
            if (!container) {
                // fallback: just scroll normally or do nothing
                el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
                return;
            }const ratio = visibleRatio(el, container);

            // ✅ only scroll if not already “visible enough”
            const needsScroll = ratio < 0.6;

            if (needsScroll) {
                el.scrollIntoView({
                    behavior: reduceMotion ? "auto" : "smooth",
                    block: "start",
                });
            }

            // ✅ focus primary action after scroll (or immediately if no scroll)
            const focusLater = () => focusPrimaryAction(el);

            if (reduceMotion || !needsScroll) {
                requestAnimationFrame(focusLater);
            } else {
                window.setTimeout(focusLater, 250); // smooth scroll has started
            }
        },
        [reduceMotion],
    );










    function requestResetTopic(tid: string) {
        if (!tid) return;
        setPending({kind: "topic", tid});
        setConfirmOpen(true);
    }

    if (!topics.length) {
        return <div className="h-full w-full p-6 text-sm text-neutral-600 dark:text-white/70">This module has no topics
            yet.</div>;
    }

    const viewIsComplete = isTopicComplete(viewCards, (progress as any)?.topics?.[viewTid]);
    const viewIdx = topics.findIndex((t) => t.id === viewTid);
    const prevTopic = viewIdx > 0 ? topics[viewIdx - 1] : null;
    const nextTopic = viewIdx >= 0 ? topics[viewIdx + 1] : null;

    function goToTopic(tid: string) {
        if (!tid) return;
        const idx = topics.findIndex((x) => x.id === tid);
        if (idx < 0) return;

        if (!unlockAll) {
            const isEarlierOrActive = idx <= activeIdx;
            const canGoForward = topicUnlocked(tid);
            if (!isEarlierOrActive && !canGoForward) return;
        }

        if (idx > activeIdx) setActiveTopicId(tid);
        setViewTopicId(tid);
    }

    function goPrevTopic() {
        if (!prevTopic?.id) return;
        goToTopic(prevTopic.id);
    }

    function goNextTopic() {
        if (!nextTopic?.id) return;
        goToTopic(nextTopic.id);
    }
    const commitProgress = React.useCallback((updater: (p: any) => any) => {
        setProgress((p: any) => {
            const next = updater(p);
            queueMicrotask(() => flushNow(next));
            return next;
        });
    }, [setProgress, flushNow]);
    const toolsValue = useMemo(() => {
        return {
            bindCodeInput: tool.bindCodeInput,
            unbindCodeInput: tool.unbindCodeInput,
            boundId: tool.boundId,
            isBound: tool.isBound,
            ensureVisible: () => {
                if (panels.rightCollapsed) panels.setRightCollapsed(false);
            },
        };
    }, [tool, panels.rightCollapsed, panels.setRightCollapsed]);

    const moduleProgress = useMemo(() => {
        const total = topics.length;
        const done = topics.reduce((acc, t) => {
            const tstate = (progress as any)?.topics?.[t.id];
            const cards = (t.cards ?? []) as ReviewCard[];
            return acc + (isTopicComplete(cards, tstate) ? 1 : 0);
        }, 0);
        return {total, done, pct: total ? clamp01(done / total) : 0};
    }, [topics, progress]);
    const tp: any = (progress as any)?.topics?.[viewTid] ?? {};

    const prereqsForAllQuizzes = unlockAll ? true : prereqsMetForAnyQuizOrProject(viewCards, tp);

    return (
        <ReviewToolsProvider
            autoBindFirst
            mode="first_unanswered"          // ✅ IMPORTANT

            resetKey={`${viewTid}:${versionStr}`}   // ✅ NEW

            externalBoundId={tool.boundId}
            ensureVisible={() => {
                if (panels.rightCollapsed) panels.setRightCollapsed(false);
            }}
            onBindToToolsPanel={({id, lang, code, stdin, onPatch}) => {
                tool.bindCodeInput({id, lang, code, stdin, onPatch});
            }}
            onUnbindFromToolsPanel={() => tool.unbindCodeInput()}
        >

            <div
                className="h-full w-full overflow-hidden bg-[radial-gradient(1200px_700px_at_20%_0%,#eafff5_0%,#ffffff_55%,#f6f7ff_100%)] dark:bg-[radial-gradient(1200px_700px_at_20%_0%,#151a2c_0%,#0b0d12_50%)] text-neutral-900 dark:text-white/90">
                {confirmOpen ? (
                    <ConfirmResetModal
                        open={confirmOpen}
                        title={pendingStats.title}
                        description={pendingStats.description}
                        confirmText="Reset"
                        cancelText="Cancel"
                        danger={true}
                        onConfirm={applyPendingChange}
                        onClose={cancelPendingChange}
                    />
                ) : null}

                <div className="h-full w-full p-3 md:p-4">
                    <div className="h-full flex gap-3">
                        {/* LEFT */}
                        <aside
                            className={cn("h-full transition-[width] duration-300 ease-out overflow-hidden", panels.leftCollapsed && "w-0")}
                            style={{width: panels.leftCollapsed ? 0 : panels.leftW}}
                        >
                            <ModuleSidebar
                                progressHydrated={progressHydrated}
                                mod={mod}
                                topics={topics}
                                progress={progress}
                                activeIdx={activeIdx}
                                activeTopicId={activeTopicId}
                                viewTopicId={viewTopicId}
                                unlockAll={unlockAll}
                                moduleProgress={moduleProgress}
                                topicUnlocked={topicUnlocked}
                                onGoToTopic={goToTopic}
                                onResetModule={requestResetModule}
                                onCollapse={() => panels.setLeftCollapsed(true)}
                                assignmentPct={assignmentPct}
                                assignmentLabel={assignmentLabel}
                                assignmentSublabel={assignmentSublabel}
                                onAssignmentClick={handleAssignmentClick}
                                hasNextModule={hasNextModule}
                                // navError3={navError}
                                navLoading={navLoading}
                                navError={navError}
                                canGoNextModule={canGoNextModule}
                            />
                        </aside>

                        {!panels.leftCollapsed ? (
                            <div
                                onMouseDown={panels.onMouseDownLeftHandle}
                                className="w-2 cursor-col-resize rounded-xl bg-neutral-200/60 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10"
                                title="Drag to resize sidebar"
                            />
                        ) : null}

                        {/* MAIN */}
                        <main ref={mainScrollRef} className="flex-1 min-w-0 h-full overflow-auto">
                            {panels.leftCollapsed ? (
                                <div className="mb-3">
                                    <button
                                        type="button"
                                        onClick={() => panels.setLeftCollapsed(false)}
                                        className="ui-btn ui-btn-secondary text-xs font-extrabold"
                                    >
                                        Topics ▶
                                    </button>
                                </div>
                            ) : null}

                            <TopicShell
                                title={viewTopic?.label ?? ""}
                                subtitle={viewTopic?.summary ?? null}
                                right={
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => panels.setRightCollapsed((v) => !v)}
                                            className="ui-btn ui-btn-secondary text-xs font-extrabold whitespace-nowrap"
                                            title={panels.rightCollapsed ? "Show tools" : "Hide tools"}
                                        >
                                            {panels.rightCollapsed ? "Tools ▶" : "Tools ◀"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => requestResetTopic(viewTid)}
                                            className="ui-btn ui-btn-secondary text-xs font-extrabold whitespace-nowrap"
                                        >
                                            Reset topic
                                        </button>

                                        <button
                                            type="button"
                                            onClick={goPrevTopic}
                                            className="ui-btn ui-btn-secondary text-xs font-extrabold whitespace-nowrap"
                                            disabled={!prevTopic?.id}
                                            title={!prevTopic?.id ? "No previous topic" : "Previous topic"}
                                        >
                                            ←
                                        </button>

                                        <button
                                            type="button"
                                            onClick={goNextTopic}
                                            className="ui-btn ui-btn-secondary text-xs font-extrabold whitespace-nowrap"
                                            disabled={!nextTopic?.id || (!unlockAll && !viewIsComplete)}
                                            title={
                                                !nextTopic?.id
                                                    ? "No next topic"
                                                    : !unlockAll && !viewIsComplete
                                                        ? "Complete the topic to continue"
                                                        : "Next topic"
                                            }
                                        >
                                            →
                                        </button>
                                    </>
                                }
                            >
                                {/*<TopicIntro topic={viewTopic}/>*/}

                                <div key={topicRenderKey} className="grid gap-3">
                                    {viewCards.map((card, cardIndex) => {
                                        // const done =
                                        //     card.type === "quiz" ? Boolean(tp?.quizzesDone?.[card.id]) : Boolean(tp?.cardsDone?.[card.id]);

                                        const savedQuiz = (tp?.quizState?.[card.id] ?? null) as SavedQuizState | null;
                                        const savedSketch = tp?.sketchState?.[card.id] ?? null;





                                        // const prereqsMet = unlockAll
                                        //     ? true
                                        //     : card.type === "quiz"
                                        //         ? prereqsMetForQuiz(viewCards, tp, card.id)
                                        //
                                        //
                                        //         : true;



                                        const isQuizLike = card.type === "quiz" || card.type === "project";

                                        const done = isQuizLike
                                            ? Boolean(tp?.quizzesDone?.[card.id])
                                            : Boolean(tp?.cardsDone?.[card.id]);

                                        // const prereqsMet = unlockAll
                                        //     ? true
                                        //     : isQuizLike
                                        //         ? prereqsMetForAnyQuizOrProject(viewCards, tp)
                                        //         : true;

                                        // const tp: any = (progress as any)?.topics?.[viewTid] ?? {};

                                        const prereqsMet = isQuizLike ? prereqsForAllQuizzes : true;



                                        return (
                                            <div key={card.id} ref={setCardEl(card.id)}>

                                            <CardRenderer
                                                // key={card.id}
                                                card={card}
                                                done={done}
                                                cardIndex={cardIndex} // ✅ NEW

                                                prereqsMet={prereqsMet}
                                                progressHydrated={progressHydrated}
                                                savedQuiz={progressHydrated ? savedQuiz : null}
                                                versionStr={versionStr}
                                                savedSketch={progressHydrated ? savedSketch : null}
                                                onSketchStateChange={(sketchCardId, s) => sketch.saveSketchDebounced(viewTid, sketchCardId, s)}
                                                onMarkDone={() => {
                                                    setProgress((p: any) => {
                                                        const tp0: any = p.topics?.[viewTid] ?? {};
                                                        const cardsDone = { ...(tp0.cardsDone ?? {}), [card.id]: true };
                                                        const next = {
                                                            ...p,
                                                            topics: { ...(p.topics ?? {}), [viewTid]: { ...tp0, cardsDone } },
                                                        };

                                                        queueMicrotask(() => {
                                                            flushNow(next);
                                                            scrollToNextActionable(cardIndex, next); // ✅ smooth flow
                                                        });

                                                        return next;
                                                    });
                                                }}
                                                onQuizPass={(quizId) => {
                                                    setProgress((p: any) => {
                                                        const tp0: any = p.topics?.[viewTid] ?? {};
                                                        const quizzesDone = { ...(tp0.quizzesDone ?? {}), [quizId]: true };
                                                        const next = {
                                                            ...p,
                                                            topics: { ...(p.topics ?? {}), [viewTid]: { ...tp0, quizzesDone } },
                                                        };

                                                        queueMicrotask(() => {
                                                            flushNow(next);
                                                            scrollToNextActionable(cardIndex, next); // ✅ also scroll after quiz/project completes
                                                        });

                                                        return next;
                                                    });
                                                }}
                                                onQuizStateChange={(quizCardId, s) => {
                                                    setProgress((p: any) => {
                                                        const tp0: any = p.topics?.[viewTid] ?? {};
                                                        const quizState = {...(tp0.quizState ?? {}), [quizCardId]: s};
                                                        return {
                                                            ...p,
                                                            topics: {
                                                                ...(p.topics ?? {}),
                                                                [viewTid]: {...tp0, quizState}
                                                            },
                                                        };
                                                    });
                                                }}
                                                onQuizReset={(quizCardId) => {
                                                    commitProgress((p) => {
                                                        const tp0: any = p.topics?.[viewTid] ?? {};
                                                        const nextQuizState = { ...(tp0.quizState ?? {}) };
                                                        delete nextQuizState[quizCardId];

                                                        const nextQuizzesDone = { ...(tp0.quizzesDone ?? {}) };
                                                        delete nextQuizzesDone[quizCardId];

                                                        return {
                                                            ...p,
                                                            topics: {
                                                                ...(p.topics ?? {}),
                                                                [viewTid]: { ...tp0, quizState: nextQuizState, quizzesDone: nextQuizzesDone },
                                                            },
                                                        };
                                                    });
                                                }}
                                            />
                                            </div>
                                        );
                                    })}
                                </div>

                                {viewIsComplete ? (
                                    <div   className={"mt-3"}>
                                        <TopicOutro topic={viewTopic}
                                                    onContinue={nextTopic?.id ? goNextTopic : undefined}/>
                                    </div>) : null}
                            </TopicShell>

                            {isLastModule ? (
                                <div
                                    className="mt-3 rounded-xl border border-emerald-600/25 bg-emerald-500/10 p-3 text-xs dark:border-emerald-300/30 dark:bg-emerald-300/10">
                                    <div className="font-black text-emerald-900 dark:text-emerald-100">Course complete
                                    </div>
                                    <div className="mt-1 text-emerald-900/80 dark:text-emerald-100/80">
                                        Download your certificate when ready.
                                    </div>

                                    <button
                                        type="button"

                                        className={cn("mt-3 ui-btn ui-btn-primary w-full", !canGetCertificate && "opacity-60 cursor-not-allowed")}
                                        disabled={!canGetCertificate}
                                        onClick={() => router.push(`/subjects/${encodeURIComponent(subjectSlug)}/certificate`)}
                                    >
                                        Get certificate →
                                    </button>
                                </div>
                            ) : null}
                        </main>

                        {!panels.rightCollapsed ? (
                            <div
                                onMouseDown={panels.onMouseDownRightHandle}
                                className="w-2 cursor-col-resize rounded-xl bg-neutral-200/60 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10"
                                title="Drag to resize tools panel"
                            />
                        ) : null}

                        {/* RIGHT */}
                        <aside
                            className={cn("h-full transition-[width] duration-300 ease-out overflow-hidden", panels.rightCollapsed && "w-0")}
                            style={{width: panels.rightCollapsed ? 0 : panels.rightW}}
                        >
                            {/* RIGHT panel */}
                            <ToolsPanel
                                onCollapse={() => panels.setRightCollapsed(true)}
                                onUnbind={tool.unbindCodeInput}
                                boundId={tool.boundId}

                                rightBodyRef={tool.rightBodyRef}
                                codeRunnerRegionH={tool.codeRunnerRegionH}

                                toolLang={tool.toolLang as Lang}
                                toolCode={tool.toolCode}
                                toolStdin={tool.toolStdin}

                                onChangeLang={(l: Lang) => {
                                    tool.setToolLang(l);
                                    tool.saveDebounced(l, tool.toolCode, tool.toolStdin);
                                }}
                                onChangeCode={(c: string) => {
                                    tool.setToolCode(c);
                                    tool.saveDebounced(tool.toolLang, c, tool.toolStdin);
                                }}
                                onChangeStdin={(s: string) => {
                                    tool.setToolStdin(s);
                                    tool.saveDebounced(tool.toolLang, tool.toolCode, s);
                                }}

                                /* ✅ NEW: needed for Prisma-backed notes + tool defaults */
                                subjectSlug={subjectSlug}
                                moduleId={moduleId}
                                locale={locale}
                                codeEnabled={codeEnabled}
                            />


                        </aside>
                    </div>
                </div>
            </div>
        </ReviewToolsProvider>);
}
