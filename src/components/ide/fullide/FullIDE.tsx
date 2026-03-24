"use client";

import React, { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { DEFAULT_SQL_DIALECT } from "@/components/code/runner/constants";
import { useProjectDirtyState } from "@/components/code/projects/hooks/useProjectDirtyState";
import { useProjectsList } from "@/components/code/projects/hooks/useProjectsList";

import { pathOf } from "../fsTree";
import { useIdeWorkspace } from "../workspaceHook/useIdeWorkspace";
import { cn } from "../utils";
import IdeDesktopLayout from "@/components/ide/fullide/chrome/IdeDesktopLayout";
import IdeHeader from "@/components/ide/fullide/chrome/IdeHeader";
import IdeMobileLayout from "@/components/ide/fullide/chrome/IdeMobileLayout";
import IdeStatusBanners from "@/components/ide/fullide/chrome/IdeStatusBanners";
import IdeToastHost from "@/components/ide/fullide/chrome/IdeToastHost";
import { useIdeProjectSession } from "@/components/ide/fullide/hooks/useIdeProjectSession";
import { useIdeRunner } from "@/components/ide/fullide/hooks/useIdeRunner";
import { useIdeViewport } from "@/components/ide/fullide/hooks/useIdeViewport";
import IdeProjectModals from "@/components/ide/fullide/modals/IdeProjectModals";
import IdeEditorPane from "@/components/ide/fullide/panes/IdeEditorPane";
import IdeExplorerPane from "@/components/ide/fullide/panes/IdeExplorerPane";
import type { FullIDEProps } from "../types";

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

    const [showMobileExplorer, setShowMobileExplorer] = useState(false);
    const [sqlDialect, setSqlDialect] = useState(DEFAULT_SQL_DIALECT);

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

    const { activeFile, entryFile, tabFiles, currentWorkspace } = derived;

    const dirty = useProjectDirtyState(currentWorkspace);

    const projects = useProjectsList({
        enabled: access.canSaveCloud,
    });

    const projectSession = useIdeProjectSession({
        title,
        projectTitle,
        projectDescription,
        projectScope,
        initialProjectId,
        access,
        loginHref,
        billingHref,
        routerPush: router.push,
        language,
        sqlDialect,
        currentWorkspace,
        nodes,
        activeFile,
        entryFile,
        replaceWorkspace: actions.replaceWorkspace,
        resetWorkspaceForLanguage: actions.resetWorkspaceForLanguage,
        markLoaded: dirty.markLoaded,
        markSaved: dirty.markSaved,
        clearSavedBaseline: dirty.clearSavedBaseline,
        isDirty: dirty.isDirty,
        setToast: actions.setToast,
        refreshProjects: projects.refresh,
    });

    const viewport = useIdeViewport({
        height,
        activeFileId,
        showMobileExplorer,
        editorHostRef,
        onCloseMobileExplorer: () => setShowMobileExplorer(false),
    });

    const runner = useIdeRunner({
        nodes,
        activeFile,
        entryFile,
        activeFileId,
        entryFileId,
        sqlDialect,
        canUseMultiFile: access.canUseMultiFile,
    });

    const isSql = language === "sql";
    const runnerHeight = Math.max(viewport.isDesktop ? 360 : 320, viewport.editorHeight || height);
    const upgradeText = !access.hasUser
        ? "Log in to unlock multiple files and cloud save."
        : !access.canSaveCloud
            ? "Subscribe to save projects to your account."
            : null;
    const runnerTitle = activeFile
        ? viewport.isDesktop
            ? pathOf(nodes, activeFile.id)
            : activeFile.name
        : title;
    const headerProjectTitle = projectSession.currentProjectName || projectTitle || title;

    const setLangUI = useCallback(
        (nextLanguage: any) => {
            if (onChangeLanguage) onChangeLanguage(nextLanguage);
            else actions.switchLanguage(nextLanguage);
        },
        [onChangeLanguage, actions],
    );

    const goBack = useCallback(() => {
        router.push("/sandbox");
    }, [router]);

    const explorerPane = (
        <IdeExplorerPane
            isSql={isSql}
            sqlDialect={sqlDialect}
            entryPath={entryFile ? pathOf(nodes, entryFile.id) : "—"}
            upgradeText={upgradeText}
            filter={filter}
            nodes={nodes}
            expanded={expanded}
            activeFileId={activeFileId}
            entryFileId={entryFileId}
            language={language}
            inlineEdit={inlineEdit}
            stdin={stdin}
            onUpgrade={() => router.push(access.hasUser ? billingHref : loginHref)}
            onChangeFilter={actions.setFilter}
            onChangeStdin={actions.setStdin}
            actions={{
                setInlineEdit: actions.setInlineEdit,
                openFile: actions.openFile,
                toggleFolder: actions.toggleFolder,
                startNewFile: actions.startNewFile,
                startNewFolder: actions.startNewFolder,
                startRename: actions.startRename,
                setEntry: actions.setEntry,
                requestDelete: actions.requestDelete,
                commitInlineEdit: actions.commitInlineEdit,
                cancelInlineEdit: actions.cancelInlineEdit,
            }}
        />
    );

    const editorPane = (
    // const editorPane = (
        <IdeEditorPane
            panelRef={editorHostRef}
            nodes={nodes}
            tabFiles={tabFiles}
            activeFileId={activeFileId}
            activeFile={activeFile}
            runnerHeight={runnerHeight}
            title={runnerTitle}
            isSql={isSql}
            language={language}
            sqlDialect={sqlDialect}
            onChangeLanguage={actions.switchLanguage}
            onChangeCode={actions.onChangeCode}
            onChangeSqlDialect={setSqlDialect}
            onRun={runner.onRunProject}
            setActiveFileId={(id) => actions.setActiveFileId(id ?? "")}
            closeTab={actions.closeTab}
            isDesktop={viewport.isDesktop}
        />
    // );
    );
    const handleConfirmDelete = () => {
        if (!pendingDeleteId) return;
        actions.performDelete(pendingDeleteId);
    };
    return (
        <div
            className={cn(
                "relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-none border border-neutral-200 bg-white dark:border-white/10 dark:bg-white/[0.04]",
                className,
            )}
            style={fullHeight ? { height: "100%" } : { minHeight: height }}
        >
            <IdeToastHost toast={toast} />
            <IdeStatusBanners
                loadingProject={projectSession.loadingProject}
                saveError={projectSession.saveError}
            />

            <IdeHeader
                isDesktop={viewport.isDesktop}
                showTopLanguageButtons={showTopLanguageButtons}
                language={language}
                sqlDialect={sqlDialect}
                onChangeSqlDialect={setSqlDialect}
                onChangeLanguage={setLangUI}
                onBack={goBack}
                onOpenFiles={() => setShowMobileExplorer(true)}
                onOpenProjects={() => projectSession.setProjectsOpen(true)}
                activePath={activeFile ? pathOf(nodes, activeFile.id) : "No file selected"}
                projectTitle={headerProjectTitle}
                dirty={dirty.isDirty}
                lastSavedAt={projectSession.lastSavedAt}
                lessonHref={lessonHref}
                lessonLabel={lessonLabel}
                saveDisabled={projectSession.isSavingProject || projectSession.loadingProject || !currentWorkspace}
                saveBusy={projectSession.isSavingProject}
                saveAsDisabled={projectSession.loadingProject || !currentWorkspace}
                canSaveCloud={access.canSaveCloud}
                hasUser={access.hasUser}
                onSave={() => {
                    if (!access.canSaveCloud) {
                        router.push(access.hasUser ? billingHref : loginHref);
                        return;
                    }
                    void projectSession.saveProject();
                }}
                onSaveAs={() => {
                    if (!access.canSaveCloud) {
                        router.push(access.hasUser ? billingHref : loginHref);
                        return;
                    }
                    projectSession.setSaveAsOpen(true);
                }}
            />

            <div className="min-h-0 flex-1">
                {viewport.isDesktop ? (
                    <IdeDesktopLayout
                        splitRef={splitRef}
                        leftPct={leftPct}
                        dividerValue={leftPct}
                        onMouseDownDivider={(e) => actions.onMouseDownDivider(e, splitRef.current)}
                        onPointerDownDivider={(e) => actions.onPointerDownDivider(e, splitRef.current)}
                        onKeyDownDivider={(e) => actions.onKeyDownDivider(e, splitRef.current)}
                        explorer={explorerPane}
                        editor={editorPane}
                    />
                ) : (
                    <IdeMobileLayout
                        open={showMobileExplorer}
                        onClose={() => setShowMobileExplorer(false)}
                        explorer={explorerPane}
                        editor={editorPane}
                    />
                )}
            </div>

            <IdeProjectModals
                nodes={nodes}
                pendingDeleteId={pendingDeleteId}
                onCancelDelete={() => actions.setPendingDeleteId(null)}
                onConfirmDelete={handleConfirmDelete}
                projectsOpen={projectSession.projectsOpen}
                onProjectsOpenChange={projectSession.setProjectsOpen}
                projectId={projectSession.projectId}
                headerProjectTitle={headerProjectTitle}
                language={language}
                canCreateProjects={access.canCreateProjects}
                loadingProjects={projects.loading}
                projectsError={projects.error}
                projects={projects.projects}
                onRefreshProjects={projects.refresh}
                onSelectProject={projectSession.requestOpenProject}
                onCreateBlankProject={projectSession.startBlankProject}
                onSaveAsIntent={() => {
                    if (!access.canSaveCloud) {
                        router.push(access.hasUser ? billingHref : loginHref);
                        return;
                    }
                    projectSession.setSaveAsOpen(true);
                }}
                onRenameIntent={(project: any) => {
                    projectSession.setRenamingProject(project);
                    projectSession.setRenameOpen(true);
                }}
                onArchiveProject={projectSession.archiveProject}
                confirmSwitchOpen={projectSession.confirmSwitchOpen}
                isSavingProject={projectSession.isSavingProject}
                onSaveAndContinue={() => void projectSession.handleSaveAndContinue()}
                onDiscardAndContinue={projectSession.handleDiscardAndContinue}
                onCancelSwitch={projectSession.cancelPendingSwitch}
                saveAsOpen={projectSession.saveAsOpen}
                saveAsInitialValue={`${headerProjectTitle} Copy`}
                onSaveAsConfirm={(value: string) => void projectSession.saveAsProject(value)}
                onSaveAsCancel={() => projectSession.setSaveAsOpen(false)}
                renameOpen={projectSession.renameOpen}
                projectModalBusy={projectSession.projectModalBusy}
                renameInitialValue={projectSession.renamingProject?.title ?? ""}
                onRenameConfirm={(value: string) => void projectSession.renameProject(value)}
                onRenameCancel={() => {
                    projectSession.setRenameOpen(false);
                    projectSession.setRenamingProject(null);
                }}
            />
        </div>
    );
}
