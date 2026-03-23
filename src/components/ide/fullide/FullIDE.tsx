"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { RunResult } from "@/lib/code/types";
import CodeRunner from "@/components/code/CodeRunner";

import { useIdeWorkspace } from "./useIdeWorkspace";
import { cn } from "./utils";
import { exportProjectFiles, pathOf } from "./fsTree";

import ExplorerTree from "./ExplorerTree";
import TabsBar from "./TabsBar";
import DeleteModal from "./DeleteModal";
import type { CodeLanguage, SqlDialect } from "@/lib/practice/types";
import { runViaApi } from "@/lib/code/runClient";
import { DEFAULT_SQL_DIALECT } from "@/components/code/runner/constants";
import {useRouter} from "next/navigation";

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

const SQL_DIALECT_LABEL: Record<SqlDialect, string> = {
    postgres: "PostgreSQL",
    mysql: "MySQL",
    sqlite: "SQLite",
    mssql: "SQL Server",
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
    const [sqlDialect, setSqlDialect] = useState<SqlDialect>(DEFAULT_SQL_DIALECT);

    const { state, derived, actions } = useIdeWorkspace({
        storageKey,
        forcedLanguage,
        resetOnForcedLanguageChange,
    });
    const router = useRouter();

    const goBack = () => {
        if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
            return;
        }
        router.push("/");
    };
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

    const isSql = language === "sql";

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
        if (isDesktop) setShowMobileExplorer(false);
    }, [isDesktop]);

    useEffect(() => {
        if (!showMobileExplorer || isDesktop) return;

        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = prev;
        };
    }, [showMobileExplorer, isDesktop]);

    useEffect(() => {
        if (!showMobileExplorer) return;

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setShowMobileExplorer(false);
        };

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [showMobileExplorer]);

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

    const onRunProject = async (args: any): Promise<RunResult> => {
        if (args.language === "sql") {
            const files = exportProjectFiles(nodes);

            const schemaFile = files.find((f) =>
                f.path.toLowerCase().endsWith("schema.sql"),
            );
            const seedFile = files.find((f) =>
                f.path.toLowerCase().endsWith("seed.sql"),
            );

            const activeQuery =
                activeFile?.content ??
                files.find((f) => f.path.toLowerCase().endsWith("query.sql"))
                    ?.content ??
                args.code ??
                "";

            return runViaApi(
                {
                    kind: "sql",
                    language: "sql",
                    dialect: args.sqlDialect ?? sqlDialect,
                    code: activeQuery,
                    schemaSql: schemaFile?.content ?? "",
                    seedSql: seedFile?.content ?? "",
                },
                args.signal,
            );
        }

        const files = exportProjectFiles(nodes);
        const entryId = entryFileId || activeFileId;
        const entry = pathOf(nodes, entryId);

        return runViaApi(
            {
                kind: "code",
                language: args.language,
                entry,
                files,
                stdin: args.stdin,
            },
            args.signal,
        );
    };

    const languages = useMemo(
        () => ["python", "java", "javascript", "c", "cpp", "sql"] as CodeLanguage[],
        [],
    );

    const setLangUI = (l: CodeLanguage) => {
        if (onChangeLanguage) onChangeLanguage(l);
        else actions.switchLanguage(l);
    };

    const runnerHeight = Math.max(isDesktop ? 360 : 320, editorHeight || height);

    const actionBtn ="ui-btn ui-btn-secondary"
        // "inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-extrabold text-neutral-800 shadow-sm transition hover:bg-neutral-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/85 dark:hover:bg-white/[0.10]";

    const chipBtn =
        "shrink-0 rounded-lg border px-3 py-1.5 text-xs font-extrabold transition";

    const panelCard =
        "rounded-none border border-neutral-200 bg-white shadow-sm sm:rounded-xl dark:border-white/10 dark:bg-white/[0.04]";

    const runnerTitle = activeFile
        ? isDesktop
            ? pathOf(nodes, activeFile.id)
            : activeFile.name
        : title;

    const explorerPanel = (
        <div className="flex h-full min-h-0 flex-col bg-neutral-50/70 dark:bg-black/20">
            <div className="flex items-center justify-between gap-2 border-b border-neutral-200 px-3 py-3 dark:border-white/10">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-neutral-600 dark:text-white/60">
                    {isSql ? "SQL Workspace" : "Explorer"}
                </div>

                <div className="min-w-0 text-[11px] font-extrabold text-neutral-500 dark:text-white/50">
                    {isSql ? (
                        <span className="truncate text-neutral-800 dark:text-white/80">
                            {SQL_DIALECT_LABEL[sqlDialect]}
                        </span>
                    ) : (
                        <>
                            <span className="hidden sm:inline">entry: </span>
                            <span className="truncate text-neutral-800 dark:text-white/80">
                                {entryFile ? pathOf(nodes, entryFile.id) : "—"}
                            </span>
                        </>
                    )}
                </div>
            </div>

            <div className="border-b border-neutral-200 p-3 dark:border-white/10">
                <input
                    value={filter}
                    onChange={(e) => actions.setFilter(e.target.value)}
                    placeholder={isSql ? "Filter SQL files…" : "Filter files…"}
                    className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-emerald-400 dark:border-white/10 dark:bg-black/30 dark:text-white/80"
                />
            </div>

            <div className="min-h-0 flex-1 overflow-auto px-3 py-3">
                <ExplorerTree
                    nodes={nodes}
                    expanded={expanded}
                    activeFileId={activeFileId}
                    entryFileId={entryFileId}
                    isSql={language === "sql"}
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

            {isSql ? (
                <div className="border-t border-neutral-200 p-3 dark:border-white/10">
                    <div className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-neutral-600 dark:text-white/60">
                        SQL Mode
                    </div>

                    <div className="mt-2 space-y-2 text-xs font-semibold text-neutral-600 dark:text-white/60">
                        <div className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-white/10 dark:bg-black/30">
                            Active dialect:{" "}
                            <span className="font-black text-neutral-900 dark:text-white/85">
                                {SQL_DIALECT_LABEL[sqlDialect]}
                            </span>
                        </div>

                        <div className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-white/10 dark:bg-black/30">
                            SQL runs use the current editor file as the query source and show
                            structured query results in the output pane.
                        </div>
                    </div>
                </div>
            ) : (
                <div className="border-t border-neutral-200 p-3 dark:border-white/10">
                    <div className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-neutral-600 dark:text-white/60">
                        Shared stdin
                    </div>

                    <textarea
                        value={stdin}
                        onChange={(e) => actions.setStdin(e.target.value)}
                        placeholder="Shared input…"
                        className="mt-2 h-28 w-full resize-none rounded-lg border border-neutral-200 bg-white p-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-emerald-400 dark:border-white/10 dark:bg-black/30 dark:text-white/80"
                    />
                </div>
            )}
        </div>
    );

    const languageScroller = showTopLanguageButtons ? (
        <div className="min-w-0 flex-1 overflow-x-auto">
            <div className="flex min-w-max items-center gap-2 pr-1">
                {languages.map((l) => (
                    <button
                        key={l}
                        type="button"
                        onClick={() => setLangUI(l)}
                        className={cn(
                            chipBtn,
                            language === l
                                ? "border-emerald-600/25 bg-emerald-500/10 text-emerald-950 dark:border-emerald-300/30 dark:bg-emerald-300/10 dark:text-white/90"
                                : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/75 dark:hover:bg-white/[0.10]",
                        )}
                    >
                        {l}
                    </button>
                ))}

                {isSql ? (
                    <select
                        value={sqlDialect}
                        onChange={(e) => setSqlDialect(e.target.value as SqlDialect)}
                        className="shrink-0 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-extrabold text-neutral-700 outline-none dark:border-white/10 dark:bg-white/[0.06] dark:text-white/75"
                        aria-label="SQL dialect"
                    >
                        <option value="postgres">PostgreSQL</option>
                        <option value="mysql">MySQL</option>
                        <option value="sqlite">SQLite</option>
                        <option value="mssql">SQL Server</option>
                    </select>
                ) : null}
            </div>
        </div>
    ) : (
        <div className="flex-1" />
    );

    const editorPanel = (
        <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden p-2 sm:p-3">
            <div className={cn("mb-2 sm:mb-3", panelCard)}>
                <TabsBar
                    nodes={nodes}
                    tabFiles={tabFiles}
                    activeFileId={activeFileId}
                    setActiveFileId={actions.setActiveFileId}
                    closeTab={actions.closeTab}
                />
            </div>

            <div ref={editorHostRef} className="min-h-0 min-w-0 flex-1 overflow-hidden">
                {activeFile ? (
                    <div className={cn("h-full px-2 pt-2 overflow-hidden", panelCard)}>
                        <CodeRunner
                            frame="plain"
                            title={isSql ? `SQL · ${runnerTitle}` : runnerTitle}
                            height={runnerHeight}
                            language={language}
                            onChangeLanguage={actions.switchLanguage}
                            code={activeFile.content}
                            onChangeCode={actions.onChangeCode}
                            sqlDialect={sqlDialect}
                            onChangeSqlDialect={setSqlDialect}
                            showLanguagePicker={false}
                            showSqlDialectPicker
                            allowReset={isDesktop}
                            allowRun
                            showEditorThemeToggle={false}
                            showTerminalDockToggle={isDesktop}
                            resetTerminalOnRun
                            onRun={onRunProject}
                            editorModelKey={activeFileId}
                        />
                    </div>
                ) : (
                    <div className="flex h-full min-h-[280px] items-center justify-center rounded-none border border-dashed border-neutral-300 bg-white p-6 text-sm font-extrabold text-neutral-600 sm:rounded-xl dark:border-white/10 dark:bg-black/30 dark:text-white/70">
                        {isSql ? "No SQL file selected." : "No file selected."}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div
            className={cn(
                "relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-none border border-neutral-200 bg-white sm:rounded-xl dark:border-white/10 dark:bg-white/[0.04]",
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

            <div className="border-b border-neutral-200 bg-white/95 backdrop-blur dark:border-white/10 dark:bg-neutral-950/95">
                <div className="flex items-center gap-2 px-3 py-2">
                    <button
                        type="button"
                        onClick={goBack}
                        className={actionBtn}
                        aria-label="Go back"
                        title="Go back"
                    >
                        <span aria-hidden="true" className="text-sm leading-none">←</span>
                        <span className="ml-1 hidden sm:inline">Back</span>
                    </button>

                    {!isDesktop ? (
                        <button
                            type="button"
                            onClick={() => setShowMobileExplorer(true)}
                            className={actionBtn}
                        >
                            Files
                        </button>
                    ) : null}

                    <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-black text-neutral-900 dark:text-white/90">
                            {isSql ? `${title} · SQL` : title}
                        </div>

                        <div className="truncate text-[11px] font-semibold text-neutral-500 dark:text-white/50">
                            {activeFile ? pathOf(nodes, activeFile.id) : "No file selected"}
                        </div>
                    </div>
                </div>

                {(showTopLanguageButtons || !isDesktop) ? (
                    <div className="border-t border-neutral-200 px-2 py-2 dark:border-white/10">
                        {languageScroller}
                    </div>
                ) : null}
            </div>
            <div className="min-h-0 flex-1">
                {isDesktop ? (
                    <div
                        ref={splitRef}
                        className="grid h-full min-h-0 w-full"
                        style={{
                            gridTemplateColumns: `minmax(260px, ${leftPct}%) 8px minmax(0, 1fr)`,
                        }}
                    >
                        <div className="min-h-0 border-r border-neutral-200 dark:border-white/10">
                            {explorerPanel}
                        </div>

                        <div
                            role="separator"
                            tabIndex={0}
                            aria-orientation="vertical"
                            aria-label="Resize explorer"
                            aria-valuemin={16}
                            aria-valuemax={40}
                            aria-valuenow={Math.round(state.leftPct)}
                            onMouseDown={(e) => actions.onMouseDownDivider(e, splitRef.current)}
                            onPointerDown={(e) => actions.onPointerDownDivider(e, splitRef.current)}
                            onKeyDown={(e) => actions.onKeyDownDivider(e, splitRef.current)}
                            className={[
                                "w-2 shrink-0 cursor-col-resize bg-neutral-200/60 outline-none",
                                "hover:bg-neutral-300/70 focus:bg-neutral-300/70",
                                "dark:bg-white/5 dark:hover:bg-white/10 dark:focus:bg-white/10",
                            ].join(" ")}
                            title="Drag or use arrow keys to resize explorer"
                        />

                        <div className="min-h-0 min-w-0 overflow-hidden">{editorPanel}</div>
                    </div>
                ) : (
                    <div className="relative h-full min-h-0">
                        {showMobileExplorer ? (
                            <div
                                className="absolute inset-0 z-30 flex bg-black/45 backdrop-blur-[2px] lg:hidden"
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="ide-mobile-files-title"
                            >
                                <div className="flex h-full w-[92vw] max-w-[400px] flex-col border-r border-neutral-200 bg-white shadow-2xl dark:border-white/10 dark:bg-neutral-950">
                                    <div className="border-b border-neutral-200 px-3 py-3 dark:border-white/10">
                                        <div className="flex items-center justify-between gap-2">
                                            <div
                                                id="ide-mobile-files-title"
                                                className="text-sm font-black text-neutral-900 dark:text-white/90"
                                            >
                                                {isSql ? "SQL Workspace" : "Files"}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setShowMobileExplorer(false)}
                                                className={actionBtn}
                                            >
                                                Close
                                            </button>
                                        </div>

                                        <div className="mt-3 flex items-center gap-2">
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