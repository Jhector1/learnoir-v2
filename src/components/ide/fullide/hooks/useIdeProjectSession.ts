"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type {ProjectScopeInput, SaveProjectRequest} from "@/lib/projects/projectApiTypes";

import { pathOf } from "../../fsTree";
import type {
  PersistProjectResult,
  ProjectSessionApi,
  UseIdeProjectSessionArgs,
} from "../../types";

type LocalProjectSessionMeta = {
  projectId: string | null;
  currentProjectName: string;
  lastSavedAt: string | null;
};

function projectSessionStorageKey( language: string, projectScope?: ProjectScopeInput,) {
  return `full-ide:project-session:v1:${projectScope}:${language}`;
}

function readProjectSessionMeta(key: string): LocalProjectSessionMeta | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<LocalProjectSessionMeta>;

    return {
      projectId: typeof parsed.projectId === "string" ? parsed.projectId : null,
      currentProjectName:
          typeof parsed.currentProjectName === "string"
              ? parsed.currentProjectName
              : "",
      lastSavedAt:
          typeof parsed.lastSavedAt === "string" ? parsed.lastSavedAt : null,
    };
  } catch {
    return null;
  }
}

function writeProjectSessionMeta(key: string, meta: LocalProjectSessionMeta) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(meta));
  } catch {}
}

function clearProjectSessionMeta(key: string) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(key);
  } catch {}
}

export function useIdeProjectSession({
                                       title,
                                       projectTitle,
                                       projectDescription = null,
                                       projectScope,
                                       initialProjectId = null,
                                       access,
                                       loginHref,
                                       billingHref,
                                       routerPush,
                                       language,
                                       sqlDialect,
                                       currentWorkspace,
                                       nodes,
                                       activeFile,
                                       entryFile,
                                       replaceWorkspace,
                                       resetWorkspaceForLanguage,
                                       markLoaded,
                                       markSaved,
                                       clearSavedBaseline,
                                       isDirty,
                                       setToast,
                                       refreshProjects,
                                     }: UseIdeProjectSessionArgs): ProjectSessionApi {
  const loadedProjectIdRef = useRef<string | null>(null);

  const [projectId, setProjectId] = useState<string | null>(initialProjectId);
  const [currentProjectName, setCurrentProjectName] = useState(
      projectTitle ?? title,
  );
  const [loadingProject, setLoadingProject] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [projectsOpen, setProjectsOpen] = useState(false);
  const [confirmSwitchOpen, setConfirmSwitchOpen] = useState(false);
  const [pendingProjectId, setPendingProjectId] = useState<string | null>(null);

  const [renameOpen, setRenameOpen] = useState(false);
  const [saveAsOpen, setSaveAsOpen] = useState(false);
  const [renamingProject, setRenamingProject] = useState<any | null>(null);
  const [projectModalBusy, setProjectModalBusy] = useState(false);

  const [projectMetaReady, setProjectMetaReady] = useState(false);

  const projectSessionKey = projectSessionStorageKey(language,projectScope);

  const goToUpgrade = useCallback(() => {
    routerPush(access.hasUser ? billingHref : loginHref);
  }, [routerPush, access.hasUser, billingHref, loginHref]);

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
    if (typeof window === "undefined") return;

    if (!initialProjectId) {
      const meta = readProjectSessionMeta(projectSessionKey);

      if (meta?.projectId) {
        setProjectId(meta.projectId);

        // Prevent an immediate cloud fetch from overwriting
        // the already-restored local workspace draft.
        loadedProjectIdRef.current = meta.projectId;
      }

      if (meta?.currentProjectName) {
        setCurrentProjectName(meta.currentProjectName);
      }

      setLastSavedAt(meta?.lastSavedAt ?? null);
    }

    setProjectMetaReady(true);
  }, [initialProjectId, projectSessionKey]);

  useEffect(() => {
    if (!projectMetaReady) return;

    writeProjectSessionMeta(projectSessionKey, {
      projectId,
      currentProjectName,
      lastSavedAt,
    });
  }, [
    projectMetaReady,
    projectSessionKey,
    projectId,
    currentProjectName,
    lastSavedAt,
  ]);

  useEffect(() => {
    if (!projectId) return;
    if (!access.canSaveCloud) return;
    if (loadedProjectIdRef.current === projectId) return;

    let cancelled = false;

    void (async () => {
      try {
        setLoadingProject(true);
        setSaveError(null);

        const res = await fetch(
            `/api/ide/projects/${encodeURIComponent(projectId)}`,
            { method: "GET", cache: "no-store" },
        );

        if (!res.ok) {
          await handleProjectApiFailure(res);
          return;
        }

        const data = await res.json();
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
      }): Promise<PersistProjectResult> => {
        if (!currentWorkspace) {
          setToast({ kind: "error", text: "Nothing to save yet." });
          return { ok: false };
        }

        if (!access.canSaveCloud) {
          goToUpgrade();
          return { ok: false };
        }

        const localMeta = readProjectSessionMeta(projectSessionKey);

        const targetProjectId =
            args?.targetProjectId ?? projectId ?? localMeta?.projectId ?? null;

        const titleToUse =
            args?.forcedTitle?.trim() ||
            currentProjectName ||
            localMeta?.currentProjectName ||
            projectTitle ||
            title;

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
            settings: { sqlDialect },
            meta: { source: "full-ide" },
          };

          const res = await fetch(
              targetProjectId
                  ? `/api/ide/projects/${encodeURIComponent(targetProjectId)}`
                  : "/api/ide/projects",
              {
                method: targetProjectId ? "PATCH" : "POST",
                headers: { "Content-Type": "application/json" },
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
        projectSessionKey,
      ],
  );

  const saveProject = useCallback(async (): Promise<boolean> => {
    const workspaceToSave = currentWorkspace;
    if (!workspaceToSave) {
      setToast({ kind: "error", text: "Nothing to save yet." });
      return false;
    }

    const localMeta = readProjectSessionMeta(projectSessionKey);
    const effectiveProjectId = projectId ?? localMeta?.projectId ?? null;
    const effectiveProjectName =
        currentProjectName ||
        localMeta?.currentProjectName ||
        projectTitle ||
        title;

    const result = await persistProject({
      targetProjectId: effectiveProjectId,
      forcedTitle: effectiveProjectName,
      createRevision: true,
    });

    if (!result.ok) return false;

    const data = result.data;
    const nextName =
        data.project.title ?? effectiveProjectName ?? projectTitle ?? title;

    loadedProjectIdRef.current = data.project.id;
    setProjectId(data.project.id);
    setCurrentProjectName(nextName);
    setLastSavedAt(data.project.updatedAt);

    writeProjectSessionMeta(projectSessionKey, {
      projectId: data.project.id,
      currentProjectName: nextName,
      lastSavedAt: data.project.updatedAt ?? null,
    });

    markSaved(workspaceToSave);
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
    projectSessionKey,
  ]);

  const saveAsProject = useCallback(
      async (nextTitle: string) => {
        const workspaceToSave = currentWorkspace;
        if (!workspaceToSave) {
          setToast({ kind: "error", text: "Nothing to save yet." });
          return false;
        }

        const result = await persistProject({
          targetProjectId: null,
          forcedTitle: nextTitle,
          createRevision: true,
        });

        if (!result.ok) return false;

        const data = result.data;
        const nextName = data.project.title ?? nextTitle;

        loadedProjectIdRef.current = data.project.id;
        setProjectId(data.project.id);
        setCurrentProjectName(nextName);
        setLastSavedAt(data.project.updatedAt);

        writeProjectSessionMeta(projectSessionKey, {
          projectId: data.project.id,
          currentProjectName: nextName,
          lastSavedAt: data.project.updatedAt ?? null,
        });

        markSaved(workspaceToSave);
        setToast({ kind: "success", text: "Project saved as a new project." });
        setSaveAsOpen(false);
        void refreshProjects();
        return true;
      },
      [
        persistProject,
        currentWorkspace,
        markSaved,
        refreshProjects,
        setToast,
        projectSessionKey,
      ],
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
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: nextTitle }),
              },
          );

          const data = await res.json().catch(() => null);

          if (!res.ok) {
            throw new Error(data?.error ?? "Failed to rename project.");
          }

          if (projectId === renamingProject.id) {
            const nextName = data?.project?.title ?? nextTitle;
            const nextSavedAt = data?.project?.updatedAt ?? lastSavedAt ?? null;

            setCurrentProjectName(nextName);
            if (data?.project?.updatedAt) {
              setLastSavedAt(data.project.updatedAt);
            }

            writeProjectSessionMeta(projectSessionKey, {
              projectId,
              currentProjectName: nextName,
              lastSavedAt: nextSavedAt,
            });
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
      [
        renamingProject,
        projectId,
        lastSavedAt,
        refreshProjects,
        setToast,
        projectSessionKey,
      ],
  );

  const startBlankProject = useCallback(() => {
    resetWorkspaceForLanguage(language);
    loadedProjectIdRef.current = null;
    setProjectId(null);
    setCurrentProjectName(projectTitle ?? title);
    setLastSavedAt(null);
    setSaveError(null);
    clearSavedBaseline();
    clearProjectSessionMeta(projectSessionKey);
    setProjectsOpen(false);
    setToast({ kind: "success", text: "Started a new local project." });
  }, [
    resetWorkspaceForLanguage,
    language,
    projectTitle,
    title,
    clearSavedBaseline,
    setToast,
    projectSessionKey,
  ]);

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

  const cancelPendingSwitch = useCallback(() => {
    setConfirmSwitchOpen(false);
    setPendingProjectId(null);
  }, []);

  const archiveProject = useCallback(
      async (targetProjectId: string) => {
        try {
          const res = await fetch(
              `/api/ide/projects/${encodeURIComponent(targetProjectId)}`,
              {
                method: "DELETE",
                cache: "no-store",
              },
          );

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
            clearProjectSessionMeta(projectSessionKey);
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
      [
        projectId,
        projectTitle,
        title,
        clearSavedBaseline,
        refreshProjects,
        setToast,
        projectSessionKey,
      ],
  );

  return {
    projectId,
    currentProjectName,
    loadingProject,
    isSavingProject,
    lastSavedAt,
    saveError,
    projectsOpen,
    setProjectsOpen,
    confirmSwitchOpen,
    saveAsOpen,
    renameOpen,
    renamingProject,
    projectModalBusy,
    setSaveAsOpen,
    setRenameOpen,
    setRenamingProject,
    saveProject,
    saveAsProject,
    renameProject,
    archiveProject,
    startBlankProject,
    requestOpenProject,
    handleSaveAndContinue,
    handleDiscardAndContinue,
    cancelPendingSwitch,
  };
}