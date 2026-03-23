"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { RunResult } from "@/lib/code/types";
import { runViaApi } from "@/lib/code/runClient";

import CodeRunner from "@/components/code/CodeRunner";
import ExplorerTree from "./ExplorerTree";
import TabsBar from "./TabsBar";
import DeleteModal from "./DeleteModal";

import { useIdeWorkspace } from "./useIdeWorkspace";
import { cn } from "./utils";
import { exportProjectFiles, pathOf } from "./fsTree";

import { DEFAULT_SQL_DIALECT } from "@/components/code/runner/constants";
import type { CodeLanguage, SqlDialect } from "@/lib/practice/types";
import type { IdeCapabilities } from "@/lib/access/ideCapabilities";
import type {
    ProjectResponse,
    ProjectScopeInput,
    ProjectSummary,
    SaveProjectRequest,
} from "@/lib/projects/projectApiTypes";

import ProjectSwitcherButton from "@/components/code/projects/ProjectSwitcherButton";
import ProjectsDrawer from "@/components/code/projects/ProjectsDrawer";
import SaveBeforeSwitchModal from "@/components/code/projects/SaveBeforeSwitchModal";
import ProjectNameModal from "@/components/code/projects/ProjectNameModal";
import { useProjectsList } from "@/components/code/projects/hooks/useProjectsList";
import { useProjectDirtyState } from "@/components/code/projects/hooks/useProjectDirtyState";

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
    lessonHref?: string;
    lessonLabel?: string;

    access: Pick<
        IdeCapabilities,
        "hasUser" | "canUseMultiFile" | "canSaveCloud" | "canCreateProjects"
    >;

    loginHref?: string;
    billingHref?: string;

    initialProjectId?: string | null;
    projectTitle?: string;
    projectDescription?: string | null;
    projectScope?: ProjectScopeInput;

    draftStorageMode?: "off" | "local";
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
        lessonHref,
        lessonLabel = "Lesson",
        access,
        loginHref = "/authenticate",
        billingHref = "/billing",
        initialProjectId = null,
        projectTitle,
        projectDescription = null,
        projectScope,
        draftStorageMode = "off",
    } = props;

    const router = useRouter();
    const splitRef = useRef<HTMLDivElement | null>(null);
    const editorHostRef = useRef<HTMLDivElement | null>(null);
    const loadedProjectIdRef = useRef<string | null>(null);

    const [isDesktop, setIsDesktop] = useState(false);
    const [showMobileExplorer, setShowMobileExplorer] = useState(false);
    const [editorHeight, setEditorHeight] = useState(height);
    const [sqlDialect, setSqlDialect] = useState<SqlDialect>(DEFAULT_SQL_DIALECT);

    const [projectId, setProjectId] = useState<string | null>(initialProjectId);
    const [currentProjectName, setCurrentProjectName] = useState(projectTitle ?? title);
    const [loadingProject, setLoadingProject] = useState(false);
    const [isSavingProject, setIsSavingProject] = useState(false);
    const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);

    const [projectsOpen, setProjectsOpen] = useState(false);
    const [confirmSwitchOpen, setConfirmSwitchOpen] = useState(false);
    const [pendingProjectId, setPendingProjectId] = useState<string | null>(null);

    const [renameOpen, setRenameOpen] = useState(false);
    const [saveAsOpen, setSaveAsOpen] = useState(false);
    const [renamingProject, setRenamingProject] = useState<ProjectSummary | null>(null);
    const [projectModalBusy, setProjectModalBusy] = useState(false);

    const { state, derived, actions } = useIdeWorkspace({
        storageKey,
        forcedLanguage,
        resetOnForcedLanguageChange,
        access,
        draftStorageMode,
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

    const { activeFile, entryFile, tabFiles, rootSrc, currentWorkspace } = derived;
    const { replaceWorkspace } = actions;
    const setToast = actions.setToast;

    const isSql = language === "sql";

    const {
        projects,
        loading: loadingProjects,
        error: projectsError,
        refresh: refreshProjects,
    } = useProjectsList({
        enabled: access.canSaveCloud && projectsOpen,
    });

    const {
        isDirty,
        markSaved,
        markLoaded,
        clearSavedBaseline,
    } = useProjectDirtyState(currentWorkspace);

    const goBack = useCallback(() => {
        // if (typeof window !== "undefined" && window.history.length > 1) {
        //     router.back();
        //     return;
        // }
        router.push("/sandbox");
    }, [router]);

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

    const goToUpgrade = useCallback(() => {
        router.push(access.hasUser ? billingHref : loginHref);
    }, [router, access.hasUser, billingHref, loginHref]);

    const handleProjectApiFailure = useCallback(
        async (res: Response) => {
            let data: any = null;
            try {
                data = await res.json();
            } catch {}

            const message =
                data?.error ??
                data?.message ??
                (res.status === 401
                    ? "Sign in required."
                    : res.status === 402
                        ? "Subscription required."
                        : "Project request failed.");

            setSaveError(message);
            setToast({ kind: "error", text: message });

            if (res.status === 401 || res.status === 402) {
                goToUpgrade();
            }

            return null;
        },
        [setToast, goToUpgrade],
    );

    useEffect(() => {
        if (!projectId) return;
        if (!access.canSaveCloud) return;
        if (loadedProjectIdRef.current === projectId) return;

        let cancelled = false;

        (async () => {
            try {
                setLoadingProject(true);
                setSaveError(null);

                const res = await fetch(`/api/ide/projects/${encodeURIComponent(projectId)}`, {
                    method: "GET",
                    cache: "no-store",
                });

                if (!res.ok) {
                    await handleProjectApiFailure(res);
                    return;
                }

                const data = (await res.json()) as ProjectResponse;
                if (cancelled) return;

                replaceWorkspace(data.project.workspace);
                markLoaded(data.project.workspace);
                loadedProjectIdRef.current = data.project.id;
                setProjectId(data.project.id);
                setCurrentProjectName(data.project.title);
                setLastSavedAt(data.project.updatedAt);
            } catch (e: any) {
                if (!cancelled) {
                    const message = e?.message ?? "Failed to load project.";
                    setSaveError(message);
                    setToast({ kind: "error", text: message });
                }
            } finally {
                if (!cancelled) setLoadingProject(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [
        projectId,
        access.canSaveCloud,
        replaceWorkspace,
        handleProjectApiFailure,
        setToast,
        markLoaded,
    ]);

    const persistProject = useCallback(
        async (args?: {
            targetProjectId?: string | null;
            forcedTitle?: string | null;
            createRevision?: boolean;
        }): Promise<{ ok: true; data: any } | { ok: false }> => {
            if (!currentWorkspace) {
                setToast({ kind: "error", text: "Nothing to save yet." });
                return { ok: false };
            }

            if (!access.canSaveCloud) {
                goToUpgrade();
                return { ok: false };
            }

            const targetProjectId = args?.targetProjectId ?? projectId;
            const titleToUse =
                args?.forcedTitle?.trim() || currentProjectName || projectTitle || title;

            try {
                setIsSavingProject(true);
                setSaveError(null);

                const body: SaveProjectRequest = {
                    title: titleToUse,
                    description: projectDescription,
                    language,
                    workspace: currentWorkspace,
                    entryPath: entryFile ? pathOf(nodes, entryFile.id) : null,
                    activePath: activeFile ? pathOf(nodes, activeFile.id) : null,
                    visibility: "private",
                    scope: projectScope,
                    createRevision: args?.createRevision ?? true,
                    revisionNote: targetProjectId ? "Manual save" : "Created from Save As",
                    settings: {
                        sqlDialect,
                    },
                    meta: {
                        source: "full-ide",
                    },
                };

                const res = await fetch(
                    targetProjectId
                        ? `/api/ide/projects/${encodeURIComponent(targetProjectId)}`
                        : `/api/ide/projects`,
                    {
                        method: targetProjectId ? "PATCH" : "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(body),
                    },
                );

                if (!res.ok) {
                    await handleProjectApiFailure(res);
                    return { ok: false };
                }

                const data = await res.json();
                return { ok: true, data };
            } catch (e: any) {
                const message = e?.message ?? "Failed to save project.";
                setSaveError(message);
                setToast({ kind: "error", text: message });
                return { ok: false };
            } finally {
                setIsSavingProject(false);
            }
        },
        [
            currentWorkspace,
            access.canSaveCloud,
            goToUpgrade,
            projectId,
            currentProjectName,
            projectTitle,
            title,
            projectDescription,
            language,
            entryFile,
            activeFile,
            nodes,
            projectScope,
            sqlDialect,
            handleProjectApiFailure,
            setToast,
        ],
    );

    const saveProject = useCallback(async (): Promise<boolean> => {
        const result = await persistProject({
            targetProjectId: projectId,
            forcedTitle: currentProjectName,
            createRevision: true,
        });

        if (!result.ok) return false;

        const data = result.data;
        loadedProjectIdRef.current = data.project.id;
        setProjectId(data.project.id);
        setCurrentProjectName(
            data.project.title ?? currentProjectName ?? projectTitle ?? title
        );        setLastSavedAt(data.project.updatedAt);
        markSaved(currentWorkspace);
        setToast({ kind: "success", text: "Project saved." });
        void refreshProjects();
        return true;
    }, [
        persistProject,
        projectId,
        currentProjectName,
        projectTitle,
        title,
        currentWorkspace,
        markSaved,
        refreshProjects,
        setToast,
    ]);

    const saveAsProject = useCallback(
        async (nextTitle: string) => {
            const result = await persistProject({
                targetProjectId: null,
                forcedTitle: nextTitle,
                createRevision: true,
            });

            if (!result.ok) return false;

            const data = result.data;
            loadedProjectIdRef.current = data.project.id;
            setProjectId(data.project.id);
            setCurrentProjectName(data.project.title ?? nextTitle);
            setLastSavedAt(data.project.updatedAt);
            markSaved(currentWorkspace);
            setToast({ kind: "success", text: "Project saved as a new project." });
            setSaveAsOpen(false);
            void refreshProjects();
            return true;
        },
        [persistProject, currentWorkspace, markSaved, refreshProjects, setToast],
    );

    const renameProject = useCallback(
        async (nextTitle: string) => {
            if (!renamingProject) return false;

            try {
                setProjectModalBusy(true);

                const res = await fetch(
                    `/api/ide/projects/${encodeURIComponent(renamingProject.id)}/meta`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            title: nextTitle,
                        }),
                    },
                );

                const data = await res.json().catch(() => null);

                if (!res.ok) {
                    throw new Error(data?.error ?? "Failed to rename project.");
                }

                if (projectId === renamingProject.id) {
                    setCurrentProjectName(data?.project?.title ?? nextTitle);
                    if (data?.project?.updatedAt) {
                        setLastSavedAt(data.project.updatedAt);
                    }
                }

                setRenameOpen(false);
                setRenamingProject(null);
                setToast({ kind: "success", text: "Project renamed." });
                void refreshProjects();
                return true;
            } catch (e: any) {
                setToast({
                    kind: "error",
                    text: e?.message ?? "Failed to rename project.",
                });
                return false;
            } finally {
                setProjectModalBusy(false);
            }
        },
        [renamingProject, projectId, refreshProjects, setToast],
    );

    const startBlankProject = useCallback(() => {
        actions.resetWorkspaceForLanguage(language);
        loadedProjectIdRef.current = null;
        setProjectId(null);
        setCurrentProjectName(projectTitle ?? title);
        setLastSavedAt(null);
        setSaveError(null);
        clearSavedBaseline();
        setProjectsOpen(false);
        setToast({ kind: "success", text: "Started a new local project." });
    }, [actions, language, projectTitle, title, clearSavedBaseline, setToast]);

    const requestOpenProject = useCallback(
        (nextProjectId: string) => {
            if (nextProjectId === projectId) {
                loadedProjectIdRef.current = null;
                setProjectsOpen(false);
                setProjectId(null);
                window.setTimeout(() => setProjectId(nextProjectId), 0);
                return;
            }

            if (isDirty) {
                setPendingProjectId(nextProjectId);
                setConfirmSwitchOpen(true);
                return;
            }

            loadedProjectIdRef.current = null;
            setProjectId(nextProjectId);
            setProjectsOpen(false);
        },
        [isDirty, projectId],
    );

    const continueOpenPendingProject = useCallback(() => {
        if (!pendingProjectId) return;

        loadedProjectIdRef.current = null;
        setProjectId(pendingProjectId);
        setPendingProjectId(null);
        setConfirmSwitchOpen(false);
        setProjectsOpen(false);
    }, [pendingProjectId]);

    const handleSaveAndContinue = useCallback(async () => {
        const ok = await saveProject();
        if (!ok) return;
        continueOpenPendingProject();
    }, [saveProject, continueOpenPendingProject]);

    const handleDiscardAndContinue = useCallback(() => {
        continueOpenPendingProject();
    }, [continueOpenPendingProject]);

    const archiveProject = useCallback(
        async (targetProjectId: string) => {
            try {
                const res = await fetch(`/api/ide/projects/${encodeURIComponent(targetProjectId)}`, {
                    method: "DELETE",
                    cache: "no-store",
                });

                const data = await res.json().catch(() => null);

                if (!res.ok) {
                    throw new Error(data?.error ?? "Failed to archive project.");
                }

                if (projectId === targetProjectId) {
                    loadedProjectIdRef.current = null;
                    setProjectId(null);
                    setCurrentProjectName(projectTitle ?? title);
                    setLastSavedAt(null);
                    clearSavedBaseline();
                }

                setToast({ kind: "success", text: "Project archived." });
                void refreshProjects();
            } catch (e: any) {
                setToast({
                    kind: "error",
                    text: e?.message ?? "Failed to archive project.",
                });
            }
        },
        [projectId, projectTitle, title, clearSavedBaseline, refreshProjects, setToast],
    );

    const onRunProject = useCallback(
        async (args: any): Promise<RunResult> => {
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
                    files.find((f) => f.path.toLowerCase().endsWith("query.sql"))?.content ??
                    args.code ??
                    "";

                return runViaApi(
                    {
                        kind: "sql",
                        language: "sql",
                        dialect: args.sqlDialect ?? sqlDialect,
                        code: activeQuery,
                        schemaSql: access.canUseMultiFile ? (schemaFile?.content ?? "") : "",
                        seedSql: access.canUseMultiFile ? (seedFile?.content ?? "") : "",
                    },
                    args.signal,
                );
            }

            const files = exportProjectFiles(nodes);
            const shouldUseMultiFile = access.canUseMultiFile && files.length > 1;

            if (!shouldUseMultiFile) {
                const singleSource =
                    activeFile?.content ??
                    entryFile?.content ??
                    args.code ??
                    "";

                return runViaApi(
                    {
                        kind: "code",
                        language: args.language,
                        code: singleSource,
                        stdin: args.stdin,
                    },
                    args.signal,
                );
            }

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
        },
        [
            nodes,
            activeFile,
            entryFile,
            entryFileId,
            activeFileId,
            sqlDialect,
            access.canUseMultiFile,
        ],
    );

    const languages = useMemo(
        () => ["python", "java", "javascript", "c", "cpp", "sql"] as CodeLanguage[],
        [],
    );

    const setLangUI = (l: CodeLanguage) => {
        if (onChangeLanguage) onChangeLanguage(l);
        else actions.switchLanguage(l);
    };

    const runnerHeight = Math.max(isDesktop ? 360 : 320, editorHeight || height);

    const actionBtn =
        "ui-btn ui-btn-secondary";

    const chipBtn =
        "shrink-0 rounded-lg border px-3 py-1.5 text-xs font-extrabold transition";

    const panelCard =
        "rounded-none border border-neutral-200 bg-white shadow-sm sm:rounded-xl dark:border-white/10 dark:bg-white/[0.04]";

    const upgradeText = !access.hasUser
        ? "Log in to unlock multiple files and cloud save."
        : !access.canSaveCloud
            ? "Subscribe to save projects to your account."
            : null;

    const runnerTitle = activeFile
        ? isDesktop
            ? pathOf(nodes, activeFile.id)
            : activeFile.name
        : title;

    const headerProjectTitle = currentProjectName || projectTitle || title;

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

            {upgradeText ? (
                <div className="border-b border-neutral-200 px-3 py-3 dark:border-white/10">
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-xs font-semibold text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">
                        {upgradeText}
                        <div className="mt-2">
                            <button
                                type="button"
                                onClick={goToUpgrade}
                                className="ui-btn ui-btn-secondary"
                            >
                                {access.hasUser ? "Upgrade" : "Log in"}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

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
                            SQL runs use the current editor file as the query source and show structured
                            query results in the output pane.
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
        <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden p-1">
            <div className={cn("", panelCard)}>
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
                            resetTerminalOnRun={false}
                            onRun={onRunProject}
                            editorModelKey={activeFileId}
                        />

                        {/*<CodeRunner*/}
                        {/*    frame="plain"*/}
                        {/*    title={isSql ? `SQL · ${runnerTitle}` : runnerTitle}*/}
                        {/*    height={runnerHeight}*/}
                        {/*    language={language}*/}
                        {/*    onChangeLanguage={actions.switchLanguage}*/}
                        {/*    code={activeFile.content}*/}
                        {/*    onChangeCode={actions.onChangeCode}*/}
                        {/*    sqlDialect={sqlDialect}*/}
                        {/*    onChangeSqlDialect={setSqlDialect}*/}
                        {/*    showLanguagePicker={false}*/}
                        {/*    showSqlDialectPicker*/}
                        {/*    allowReset={isDesktop}*/}
                        {/*    allowRun*/}
                        {/*    showEditorThemeToggle={false}*/}
                        {/*    showTerminalDockToggle={isDesktop}*/}
                        {/*    resetTerminalOnRun*/}
                        {/*    onRun={onRunProject}*/}
                        {/*    editorModelKey={activeFileId}*/}
                        {/*/>*/}
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
                "relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-none border border-neutral-200 bg-white dark:border-white/10 dark:bg-white/[0.04]",
                className,
            )}
            style={fullHeight ? { height: "100%" } : { minHeight: height }}
        >
            {toast ? (
                <div className="pointer-events-none fixed inset-x-0 top-4 z-[90] flex justify-center px-4">
                    <div
                        className={cn(
                            "rounded-full px-4 py-2 text-xs font-black shadow-lg backdrop-blur",
                            toast.kind === "error"
                                ? "bg-red-600 text-white"
                                : "bg-emerald-600 text-white",
                        )}
                    >
                        {toast.text}
                    </div>
                </div>
            ) : null}

            {loadingProject ? (
                <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70">
                    Loading saved project…
                </div>
            ) : null}

            {saveError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-200">
                    {saveError}
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

                    <ProjectSwitcherButton
                        title={headerProjectTitle}
                        dirty={isDirty}
                        onClick={() => setProjectsOpen(true)}
                    />

                    <div className="min-w-0 flex-1">
                        <div className="truncate text-[11px] font-semibold text-neutral-500 dark:text-white/50">
                            {activeFile ? pathOf(nodes, activeFile.id) : "No file selected"}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden text-[11px] font-bold text-neutral-500 dark:text-white/50 sm:block">
                            {isDirty
                                ? "Unsaved changes"
                                : lastSavedAt
                                    ? `Saved ${new Date(lastSavedAt).toLocaleString()}`
                                    : "Not saved yet"}
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                if (!access.canSaveCloud) {
                                    goToUpgrade();
                                    return;
                                }
                                setSaveAsOpen(true);
                            }}
                            disabled={loadingProject || !currentWorkspace}
                            className={actionBtn}
                        >
                            Save As
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                if (!access.canSaveCloud) {
                                    goToUpgrade();
                                    return;
                                }
                                void saveProject();
                            }}
                            disabled={isSavingProject || loadingProject || !currentWorkspace}
                            className={cn(
                                chipBtn,
                                access.canSaveCloud
                                    ? "border-emerald-600/25 bg-emerald-500/10 text-emerald-950 dark:border-emerald-300/30 dark:bg-emerald-300/10 dark:text-white/90"
                                    : "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-100",
                            )}
                        >
                            {isSavingProject
                                ? "Saving…"
                                : access.canSaveCloud
                                    ? "Save Project"
                                    : access.hasUser
                                        ? "Upgrade to Save"
                                        : "Log in to Save"}
                        </button>
                    </div>

                    {lessonHref ? (
                        <Link
                            href={lessonHref}
                            className={actionBtn}
                            aria-label={lessonLabel}
                            title={lessonLabel}
                        >
                            <span aria-hidden="true" className="text-sm leading-none">📘</span>
                            <span className="ml-1 hidden sm:inline">{lessonLabel}</span>
                        </Link>
                    ) : null}
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
                                                onClick={() => {
                                                    if (!access.canUseMultiFile) {
                                                        goToUpgrade();
                                                        return;
                                                    }
                                                    actions.startNewFile(rootSrc?.id ?? null);
                                                }}
                                                className={actionBtn}
                                            >
                                                + File
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (!access.canUseMultiFile) {
                                                        goToUpgrade();
                                                        return;
                                                    }
                                                    actions.startNewFolder(rootSrc?.id ?? null);
                                                }}
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

            <ProjectsDrawer
                open={projectsOpen}
                onOpenChange={setProjectsOpen}
                currentProjectId={projectId}
                currentProjectTitle={headerProjectTitle}
                currentLanguage={language}
                canCreateProjects={access.canCreateProjects}
                loading={loadingProjects}
                error={projectsError}
                projects={projects}
                onRefresh={refreshProjects}
                onSelectProject={requestOpenProject}
                onCreateBlankProject={startBlankProject}
                onSaveAsProject={() => {
                    if (!access.canSaveCloud) {
                        goToUpgrade();
                        return;
                    }
                    setSaveAsOpen(true);
                }}
                onRenameProject={(project) => {
                    setRenamingProject(project);
                    setRenameOpen(true);
                }}
                onArchiveProject={archiveProject}
            />

            <SaveBeforeSwitchModal
                open={confirmSwitchOpen}
                busy={isSavingProject}
                onSaveAndContinue={() => {
                    void handleSaveAndContinue();
                }}
                onDiscardAndContinue={handleDiscardAndContinue}
                onCancel={() => {
                    setConfirmSwitchOpen(false);
                    setPendingProjectId(null);
                }}
            />

            <ProjectNameModal
                open={saveAsOpen}
                busy={isSavingProject}
                title="Save as new project"
                description="Create a new saved project from your current local workspace."
                confirmLabel="Save As"
                initialValue={`${headerProjectTitle} Copy`}
                onConfirm={(value) => {
                    void saveAsProject(value);
                }}
                onCancel={() => setSaveAsOpen(false)}
            />

            <ProjectNameModal
                open={renameOpen}
                busy={projectModalBusy}
                title="Rename project"
                description="Update the saved project name."
                confirmLabel="Rename"
                initialValue={renamingProject?.title ?? ""}
                onConfirm={(value) => {
                    void renameProject(value);
                }}
                onCancel={() => {
                    setRenameOpen(false);
                    setRenamingProject(null);
                }}
            />
        </div>
    );
}