"use client";

import React, { useMemo, useRef } from "react";
import type { Lang, RunResult } from "@/lib/code/runCode";
import CodeRunner from "@/components/code/CodeRunner";

import { useIdeWorkspace } from "./useIdeWorkspace";
import { cn } from "./utils";
import { exportProjectFiles, pathOf } from "./fsTree";

import ExplorerTree from "./ExplorerTree";
import TabsBar from "./TabsBar";
import DeleteModal from "./DeleteModal";

type FullIDEProps = {
    title?: string;
    /** Editor base height passed into CodeRunner (terminal may add on top of this internally). */
    height?: number;
    className?: string;

    /**
     * If true, the IDE tries to fill the viewport height (minus header area).
     * If false, the IDE uses a reasonable fixed minimum height.
     */
    fullHeight?: boolean;

    /** Storage key for local persistence (use per-language keys if you want separate workspaces). */
    storageKey?: string;

    /** Controlled language from parent (optional). */
    language?: Lang;
    onChangeLanguage?: (l: Lang) => void;

    /** When controlled language changes, reset the whole workspace instead of soft-switching. */
    resetOnForcedLanguageChange?: boolean;

    /** Show the top language buttons. */
    showTopLanguageButtons?: boolean;
};

export default function FullIDE(props: FullIDEProps) {
    const {
        title = "IDE",
        height = 420,
        className,
        fullHeight = false,
        storageKey = "learnoir.ide.workspace.v2",

        language: forcedLanguage,
        onChangeLanguage,

        resetOnForcedLanguageChange = false,
        showTopLanguageButtons = true,
    } = props;

    // ref used for split measurements (IMPORTANT: pass this to divider drag)
    const splitRef = useRef<HTMLDivElement | null>(null);

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

    const onRunProject = async (args: {
        language: Lang;
        code: string;
        stdin: string;
    }): Promise<RunResult> => {
        const files = exportProjectFiles(nodes);
        const entryId = entryFileId || activeFileId;
        const entry = pathOf(nodes, entryId);

        const res = await fetch("/api/run", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ language, entry, files, stdin: args.stdin }),
        });

        const text = await res.text();
        try {
            return JSON.parse(text) as RunResult;
        } catch {
            return {
                ok: false,
                error: `Non-JSON response (${res.status}): ${text.slice(0, 300)}`,
            };
        }
    };

    const languages = useMemo(
        () => ["python", "java", "javascript", "c", "cpp"] as Lang[],
        [],
    );

    // If parent controls language, prefer calling parent setter (and let parent decide storageKey strategy).
    const setLangUI = (l: Lang) => {
        if (onChangeLanguage) onChangeLanguage(l);
        else actions.switchLanguage(l);
    };

    // Layout height for the split region.
    // You can tweak the -offset based on where FullIDE sits in your page.
    const splitHeightStyle: React.CSSProperties = fullHeight
        ? { height: "calc(100vh - 200px)" }
        : { minHeight: 560 };

    return (
        <div
            className={cn(
                "w-full border border-neutral-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]",
                fullHeight ? "rounded-none" : "rounded-2xl",
                "flex flex-col min-h-0", // ✅ allow inner grid to shrink
                className,
            )}
        >
            {toast ? (
                <div
                    className={cn(
                        "mb-3 rounded-xl border px-3 py-2 text-xs font-extrabold",
                        toast.kind === "error"
                            ? "border-rose-300/25 bg-rose-300/10 text-rose-900 dark:text-rose-100"
                            : "border-neutral-200 bg-neutral-50 text-neutral-700 dark:border-white/10 dark:bg-white/5 dark:text-white/80",
                    )}
                >
                    {toast.text}
                </div>
            ) : null}

            {/* Top bar */}
            {/*<div className="flex flex-wrap items-center justify-between gap-2">*/}
            {/*    <div className="text-sm font-black text-neutral-900 dark:text-white/90">*/}
            {/*        {title}*/}
            {/*    </div>*/}

            {/*    <div className="flex flex-wrap items-center gap-2">*/}
            {/*        {showTopLanguageButtons ? (*/}
            {/*            <>*/}
            {/*                <div className="text-xs font-extrabold text-neutral-600 dark:text-white/60">*/}
            {/*                    Language*/}
            {/*                </div>*/}

            {/*                {languages.map((l) => (*/}
            {/*                    <button*/}
            {/*                        key={l}*/}
            {/*                        type="button"*/}
            {/*                        onClick={() => setLangUI(l)}*/}
            {/*                        className={cn(*/}
            {/*                            "rounded-xl border px-3 py-1 text-xs font-extrabold transition",*/}
            {/*                            language === l*/}
            {/*                                ? "border-emerald-600/25 bg-emerald-500/10 text-emerald-950 dark:border-emerald-300/30 dark:bg-emerald-300/10 dark:text-white/90"*/}
            {/*                                : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/75 dark:hover:bg-white/[0.10]",*/}
            {/*                        )}*/}
            {/*                    >*/}
            {/*                        {l}*/}
            {/*                    </button>*/}
            {/*                ))}*/}

            {/*                <div className="mx-2 hidden h-6 w-px bg-neutral-200 dark:bg-white/10 md:block" />*/}
            {/*            </>*/}
            {/*        ) : null}*/}

            {/*        <button*/}
            {/*            type="button"*/}
            {/*            onClick={() => actions.startNewFile(rootSrc?.id ?? null)}*/}
            {/*            className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-extrabold text-neutral-800 hover:bg-neutral-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/85 dark:hover:bg-white/[0.10]"*/}
            {/*        >*/}
            {/*            + New file*/}
            {/*        </button>*/}

            {/*        <button*/}
            {/*            type="button"*/}
            {/*            onClick={() => actions.startNewFolder(rootSrc?.id ?? null)}*/}
            {/*            className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-extrabold text-neutral-800 hover:bg-neutral-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/85 dark:hover:bg-white/[0.10]"*/}
            {/*        >*/}
            {/*            + New folder*/}
            {/*        </button>*/}
            {/*    </div>*/}
            {/*</div>*/}

            {/* Split region */}
            <div className="mt-4 min-h-0  flex-1">
                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 dark:border-white/10 dark:bg-black/20">
                    <div
                        ref={splitRef}
                        className="grid min-h-0 w-full"
                        style={{
                            // ✅ KEY FIX: editor column is minmax(0,1fr) so it shrinks instead of pushing
                            gridTemplateColumns: `${leftPct}% 8px minmax(0, 1fr)`,
                            ...splitHeightStyle,
                        }}
                    >
                        {/* Left */}
                        <div className="min-h-0 min-w-0 flex flex-col p-3">
                            <div className="flex items-center justify-between gap-2">
                                <div className="text-[11px] font-extrabold text-neutral-600 dark:text-white/60">
                                    Explorer
                                </div>
                                <div className="text-[11px] font-extrabold text-neutral-500 dark:text-white/50">
                                    entry:{" "}
                                    <span className="text-neutral-800 dark:text-white/80">
                    {entryFile ? pathOf(nodes, entryFile.id) : "—"}
                  </span>
                                </div>
                            </div>

                            <input
                                value={filter}
                                onChange={(e) => actions.setFilter(e.target.value)}
                                placeholder="Filter…"
                                className="mt-2 h-9 w-full rounded-xl border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-900 outline-none dark:border-white/10 dark:bg-black/30 dark:text-white/80"
                            />

                            {/* Tree (scrollable) */}
                            <div className="mt-2 min-h-0 flex-1 overflow-auto pr-1">
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

                            {/* Stdin */}
                            <div className="mt-3 rounded-xl border border-neutral-200 bg-white p-3 dark:border-white/10 dark:bg-black/30">
                                <div className="text-[11px] font-extrabold text-neutral-600 dark:text-white/60">
                                    stdin (workspace)
                                </div>
                                <textarea
                                    value={stdin}
                                    onChange={(e) => actions.setStdin(e.target.value)}
                                    placeholder="Shared input…"
                                    className="mt-2 h-24 w-full resize-none rounded-xl border border-neutral-200 bg-white p-2 text-xs text-neutral-900 outline-none dark:border-white/10 dark:bg-black/30 dark:text-white/80"
                                />
                            </div>
                        </div>

                        {/* Divider */}
                        <div
                            onMouseDown={(e) => actions.onMouseDownDivider(e, splitRef.current)}
                            className="cursor-col-resize bg-neutral-200/60 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10"
                            title="Drag to resize"
                        />

                        {/* Right */}
                        <div className="min-h-0 min-w-0 flex flex-col p-3 overflow-hidden">
                            <TabsBar
                                nodes={nodes}
                                tabFiles={tabFiles}
                                activeFileId={activeFileId}
                                setActiveFileId={actions.setActiveFileId}
                                closeTab={actions.closeTab}
                            />

                            <div className="mt-3 min-w-0 flex-1 overflow-hidden">
                                {activeFile ? (
                                    <CodeRunner
                                        title={pathOf(nodes, activeFile.id)}
                                        height={height}
                                        language={language}
                                        onChangeLanguage={actions.switchLanguage}
                                        code={activeFile.content}
                                        onChangeCode={actions.onChangeCode}
                                        stdin={stdin}
                                        onChangeStdin={actions.setStdin}
                                        showLanguagePicker={false}
                                        allowReset={false}
                                        allowRun
                                        resetTerminalOnRun
                                        resetStdinOnRun={false}
                                        onRun={onRunProject}
                                    />
                                ) : (
                                    <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm font-extrabold text-neutral-600 dark:border-white/10 dark:bg-black/30 dark:text-white/70">
                                        No file selected.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
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
