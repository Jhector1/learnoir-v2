"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { RunResult } from "@/lib/code/runCode";
import CodeRunner from "@/components/code/CodeRunner";

import { useIdeWorkspace } from "./useIdeWorkspace";
import { cn } from "./utils";
import { exportProjectFiles, pathOf } from "./fsTree";

import ExplorerTree from "./ExplorerTree";
import TabsBar from "./TabsBar";
import DeleteModal from "./DeleteModal";
import { CodeLanguage } from "@/lib/practice/types";
import { runViaApi } from "@/lib/code/runClient";

type FullIDEProps = {
    title?: string;
    height?: number;
    className?: string;
    fullHeight?: boolean;
    storageKey?: string;
    language?: CodeLanguage;
    onChangeLanguage?: (l: CodeLanguage) => void;
    resetOnForcedLanguageChange?: boolean;
    showTopLanguageButtons?: boolean;
};

export default function FullIDE(props: FullIDEProps) {
    const {
        title = "IDE",
        height = 720,
        className,
        fullHeight = false,
        storageKey = `${process.env.NEXT_PUBLIC_APP_NAME}.ide.workspace.v2`,
        language: forcedLanguage,
        onChangeLanguage,
        resetOnForcedLanguageChange = false,
        showTopLanguageButtons = true,
    } = props;

    const splitRef = useRef<HTMLDivElement | null>(null);
    const editorHostRef = useRef<HTMLDivElement | null>(null);

    const [isDesktop, setIsDesktop] = useState(false);
    const [showMobileExplorer, setShowMobileExplorer] = useState(false);
    const [editorHeight, setEditorHeight] = useState(height);

    const { state, derived, actions } = useIdeWorkspace({
        storageKey,
        forcedLanguage,
        resetOnForcedLanguageChange,
    });

    const {
        language,
        nodes,
        activeFileId,
        entryFileId,
        stdin,
        expanded,
        leftPct,
        filter,
        inlineEdit,
        pendingDeleteId,
        toast,
    } = state;

    const { activeFile, entryFile, tabFiles, rootSrc } = derived;

    useEffect(() => {
        const mq = window.matchMedia("(min-width: 1024px)");
        const apply = () => setIsDesktop(mq.matches);

        apply();

        if (mq.addEventListener) {
            mq.addEventListener("change", apply);
            return () => mq.removeEventListener("change", apply);
        }

        mq.addListener(apply);
        return () => mq.removeListener(apply);
    }, []);

    useEffect(() => {
        const el = editorHostRef.current;
        if (!el) return;

        const measure = () => {
            const next = Math.floor(el.getBoundingClientRect().height);
            setEditorHeight(next > 0 ? next : height);
        };

        measure();

        const ro = new ResizeObserver(measure);
        ro.observe(el);
        window.addEventListener("resize", measure);

        return () => {
            ro.disconnect();
            window.removeEventListener("resize", measure);
        };
    }, [height, isDesktop, showMobileExplorer, activeFileId]);

    const onRunProject = async (args: {
        language: CodeLanguage;
        code: string;
        stdin: string;
        signal?: AbortSignal;
    }): Promise<RunResult> => {
        const files = exportProjectFiles(nodes);
        const entryId = entryFileId || activeFileId;
        const entry = pathOf(nodes, entryId);

        return runViaApi(
            {
                language,
                entry,
                files,
                stdin: args.stdin,
            },
            args.signal,
        );
    };

    const languages = useMemo(
        () => ["python", "java", "javascript", "c", "cpp"] as CodeLanguage[],
        [],
    );

    const setLangUI = (l: CodeLanguage) => {
        if (onChangeLanguage) onChangeLanguage(l);
        else actions.switchLanguage(l);
    };

    const runnerHeight = Math.max(isDesktop ? 360 : 280, editorHeight || height);

    const actionBtn =
        "border border-neutral-200 bg-white px-3 py-2 text-xs font-extrabold text-neutral-800 hover:bg-neutral-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/85 dark:hover:bg-white/[0.10] rounded-none";

    const explorerPanel = (
        <div className="flex h-full min-h-0 flex-col bg-neutral-50 dark:bg-black/20">
            <div className="flex items-center justify-between gap-2 border-b border-neutral-200 px-3 py-3 dark:border-white/10">
                <div className="text-[11px] font-extrabold text-neutral-600 dark:text-white/60">
                    Explorer
                </div>

                <div className="min-w-0 text-[11px] font-extrabold text-neutral-500 dark:text-white/50">
                    <span className="hidden sm:inline">entry: </span>
                    <span className="truncate text-neutral-800 dark:text-white/80">
                        {entryFile ? pathOf(nodes, entryFile.id) : "—"}
                    </span>
                </div>
            </div>

            <div className="border-b border-neutral-200 p-3 dark:border-white/10">
                <input
                    value={filter}
                    onChange={(e) => actions.setFilter(e.target.value)}
                    placeholder="Filter files…"
                    className="h-10 w-full border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-900 outline-none dark:border-white/10 dark:bg-black/30 dark:text-white/80 rounded-none"
                />
            </div>

            <div className="min-h-0 flex-1 overflow-auto px-3 py-3">
                <ExplorerTree
                    nodes={nodes}
                    expanded={expanded}
                    activeFileId={activeFileId}
                    entryFileId={entryFileId}
                    filter={filter}
                    inlineEdit={inlineEdit}
                    setInlineEdit={actions.setInlineEdit}
                    openFile={actions.openFile}
                    toggleFolder={actions.toggleFolder}
                    startNewFile={actions.startNewFile}
                    startNewFolder={actions.startNewFolder}
                    startRename={actions.startRename}
                    setEntry={actions.setEntry}
                    requestDelete={actions.requestDelete}
                    commitInlineEdit={actions.commitInlineEdit}
                    cancelInlineEdit={actions.cancelInlineEdit}
                />
            </div>

            <div className="border-t border-neutral-200 p-3 dark:border-white/10">
                <div className="text-[11px] font-extrabold text-neutral-600 dark:text-white/60">
                    stdin
                </div>
                <textarea
                    value={stdin}
                    onChange={(e) => actions.setStdin(e.target.value)}
                    placeholder="Shared input…"
                    className="mt-2 h-28 w-full resize-none border border-neutral-200 bg-white p-2 text-xs text-neutral-900 outline-none dark:border-white/10 dark:bg-black/30 dark:text-white/80 rounded-none"
                />
            </div>
        </div>
    );

    const editorPanel = (
        <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden p-3">
            <TabsBar
                nodes={nodes}
                tabFiles={tabFiles}
                activeFileId={activeFileId}
                setActiveFileId={actions.setActiveFileId}
                closeTab={actions.closeTab}
            />

            <div ref={editorHostRef} className="mt-3 min-h-0 min-w-0 flex-1 overflow-hidden">
                {activeFile ? (
                    <CodeRunner
                        frame="plain"
                        title={pathOf(nodes, activeFile.id)}
                        height={runnerHeight}
                        language={language}
                        onChangeLanguage={actions.switchLanguage}
                        code={activeFile.content}
                        onChangeCode={actions.onChangeCode}
                        showLanguagePicker={false}
                        allowReset={false}
                        allowRun
                        resetTerminalOnRun
                        onRun={onRunProject}
                    />
                ) : (
                    <div className="flex h-full min-h-[280px] items-center justify-center border border-neutral-200 bg-white p-6 text-sm font-extrabold text-neutral-600 dark:border-white/10 dark:bg-black/30 dark:text-white/70 rounded-none">
                        No file selected.
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div
            className={cn(
                "relative flex h-full min-h-0 w-full flex-col overflow-hidden border border-neutral-200 bg-white dark:border-white/10 dark:bg-white/[0.04]",
                "rounded-none",
                className,
            )}
            style={fullHeight ? { height: "100%" } : { minHeight: height }}
        >
            {toast ? (
                <div
                    className={cn(
                        "border-b px-3 py-2 text-xs font-extrabold",
                        toast.kind === "error"
                            ? "border-rose-300/25 bg-rose-300/10 text-rose-900 dark:text-rose-100"
                            : "border-neutral-200 bg-neutral-50 text-neutral-700 dark:border-white/10 dark:bg-white/5 dark:text-white/80",
                    )}
                >
                    {toast.text}
                </div>
            ) : null}

            <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-neutral-200 px-3 py-2 dark:border-white/10">
                {!isDesktop ? (
                    <button
                        type="button"
                        onClick={() => setShowMobileExplorer(true)}
                        className={actionBtn}
                    >
                        Files
                    </button>
                ) : null}

                <div className="min-w-0 flex-1 text-sm font-black text-neutral-900 dark:text-white/90">
                    {title}
                </div>

                {showTopLanguageButtons ? (
                    <div className="flex max-w-full items-center gap-2 overflow-x-auto">
                        {languages.map((l) => (
                            <button
                                key={l}
                                type="button"
                                onClick={() => setLangUI(l)}
                                className={cn(
                                    "shrink-0 border px-3 py-1 text-xs font-extrabold transition rounded-none",
                                    language === l
                                        ? "border-emerald-600/25 bg-emerald-500/10 text-emerald-950 dark:border-emerald-300/30 dark:bg-emerald-300/10 dark:text-white/90"
                                        : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/75 dark:hover:bg-white/[0.10]",
                                )}
                            >
                                {l}
                            </button>
                        ))}
                    </div>
                ) : null}

                <button
                    type="button"
                    onClick={() => actions.startNewFile(rootSrc?.id ?? null)}
                    className={actionBtn}
                >
                    + File
                </button>

                <button
                    type="button"
                    onClick={() => actions.startNewFolder(rootSrc?.id ?? null)}
                    className={actionBtn}
                >
                    + Folder
                </button>
            </div>

            <div className="min-h-0 flex-1">
                {isDesktop ? (
                    <div
                        ref={splitRef}
                        className="grid h-full min-h-0 w-full"
                        style={{
                            gridTemplateColumns: `minmax(240px, ${leftPct}%) 8px minmax(0, 1fr)`,
                        }}
                    >
                        <div className="min-h-0 border-r border-neutral-200 dark:border-white/10">
                            {explorerPanel}
                        </div>

                        <div
                            onMouseDown={(e) => actions.onMouseDownDivider(e, splitRef.current)}
                            className="cursor-col-resize bg-neutral-200/70 hover:bg-neutral-300 dark:bg-white/5 dark:hover:bg-white/10"
                            title="Drag to resize"
                        />

                        <div className="min-h-0 min-w-0 overflow-hidden">{editorPanel}</div>
                    </div>
                ) : (
                    <div className="relative h-full min-h-0">
                        {showMobileExplorer ? (
                            <div className="absolute inset-0 z-30 flex bg-black/50 lg:hidden">
                                <div className="flex h-full w-[88vw] max-w-[360px] flex-col border-r border-neutral-200 bg-white dark:border-white/10 dark:bg-neutral-950">
                                    <div className="flex items-center justify-between border-b border-neutral-200 px-3 py-2 dark:border-white/10">
                                        <div className="text-sm font-black text-neutral-900 dark:text-white/90">
                                            Files
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowMobileExplorer(false)}
                                            className={actionBtn}
                                        >
                                            Close
                                        </button>
                                    </div>
                                    <div className="min-h-0 flex-1">{explorerPanel}</div>
                                </div>
                                <button
                                    type="button"
                                    className="flex-1"
                                    onClick={() => setShowMobileExplorer(false)}
                                    aria-label="Close files panel"
                                />
                            </div>
                        ) : null}

                        <div className="h-full min-h-0">{editorPanel}</div>
                    </div>
                )}
            </div>

            {pendingDeleteId ? (
                <DeleteModal
                    nodes={nodes}
                    pendingDeleteId={pendingDeleteId}
                    onCancel={() => actions.setPendingDeleteId(null)}
                    onDelete={() => actions.performDelete(pendingDeleteId)}
                />
            ) : null}
        </div>
    );
}