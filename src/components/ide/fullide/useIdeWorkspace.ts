"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type {
    FileNode,
    FolderNode,
    FSNode,
    InlineEdit,
    NodeId,
    Toast,
    WorkspaceStateV2,
} from "./types";

import { clamp, uid } from "./utils";
import { defaultExt } from "./languageDefaults";
import { ensureUniqueSiblingName, findFile, subtreeIds } from "./fsTree";
import {
    buildDefaultWorkspace,
    loadV2,
    saveV2,
    storageKeyForLanguage,
    tryMigrateV1,
    STORAGE_KEY_V2,
} from "./storage";
import type { CodeLanguage } from "@/lib/practice/types";

export type IdeWorkspaceAccess = {
    hasUser: boolean;
    canUseMultiFile: boolean;
    canSaveCloud: boolean;
    canCreateProjects: boolean;
};

export type UseIdeWorkspaceOpts = {
    storageKey?: string;
    forcedLanguage?: CodeLanguage;
    resetOnForcedLanguageChange?: boolean;

    access?: IdeWorkspaceAccess;
    draftStorageMode?: "off" | "local";
    initialWorkspace?: WorkspaceStateV2 | null;
};

const ALL_LANGUAGES: CodeLanguage[] = [
    "python",
    "java",
    "javascript",
    "c",
    "cpp",
    "sql",
];

const SAVE_DEBOUNCE_MS = 300;

const SPLIT_PX = 8;
const MIN_LEFT_PX = 240;
const MIN_RIGHT_PX = 520;

type WorkspaceMeta = {
    lastLanguage: CodeLanguage;
};

const DEFAULT_ACCESS: IdeWorkspaceAccess = {
    hasUser: true,
    canUseMultiFile: true,
    canSaveCloud: false,
    canCreateProjects: false,
};

function isCodeLanguage(v: unknown): v is CodeLanguage {
    return (
        v === "python" ||
        v === "java" ||
        v === "javascript" ||
        v === "c" ||
        v === "cpp" ||
        v === "sql"
    );
}

function metaKeyFor(baseKey: string) {
    return `${baseKey}:meta`;
}

function readWorkspaceMeta(baseKey: string): WorkspaceMeta | null {
    try {
        const raw = localStorage.getItem(metaKeyFor(baseKey));
        if (!raw) return null;

        const parsed = JSON.parse(raw) as Partial<WorkspaceMeta>;
        if (!parsed || !isCodeLanguage(parsed.lastLanguage)) return null;

        return {
            lastLanguage: parsed.lastLanguage,
        };
    } catch {
        return null;
    }
}

function saveWorkspaceMeta(baseKey: string, meta: WorkspaceMeta) {
    try {
        localStorage.setItem(metaKeyFor(baseKey), JSON.stringify(meta));
    } catch {}
}

function createDefaultStateForLanguage(lang: CodeLanguage): WorkspaceStateV2 {
    return buildDefaultWorkspace(lang);
}

function buildSingleFileWorkspace(
    lang: CodeLanguage,
    source?: WorkspaceStateV2 | null,
): WorkspaceStateV2 {
    const seed = buildDefaultWorkspace(lang);

    const seedMain =
        seed.nodes.find((n): n is FileNode => n.kind === "file") ??
        ({
            id: uid(),
            kind: "file",
            name: `main${defaultExt(lang)}`,
            parentId: null,
            content: "",
            createdAt: Date.now(),
            updatedAt: Date.now(),
        } satisfies FileNode);

    const sourceFile =
        source?.nodes.find((n): n is FileNode => n.kind === "file" && n.id === source.activeFileId) ??
        source?.nodes.find((n): n is FileNode => n.kind === "file" && n.id === source.entryFileId) ??
        source?.nodes.find((n): n is FileNode => n.kind === "file") ??
        null;

    const file: FileNode = {
        id: seedMain.id,
        kind: "file",
        name: seedMain.name,
        parentId: null,
        content: sourceFile?.content ?? seedMain.content ?? "",
        createdAt: seedMain.createdAt ?? Date.now(),
        updatedAt: Date.now(),
    };

    return {
        version: 2,
        language: lang,
        nodes: [file],
        openTabs: [file.id],
        activeFileId: file.id,
        entryFileId: file.id,
        stdin: source?.stdin ?? "",
        expanded: [],
        leftPct: source?.leftPct ?? 26,
    };
}

function normalizeWorkspaceForAccess(
    ws: WorkspaceStateV2,
    access: IdeWorkspaceAccess,
): WorkspaceStateV2 {
    if (access.canUseMultiFile) return ws;

    const fileCount = ws.nodes.filter((n): n is FileNode => n.kind === "file").length;
    if (fileCount <= 1) return ws;

    return buildSingleFileWorkspace(ws.language, ws);
}

function fileIdsOf(nodes: FSNode[]) {
    return new Set(
        nodes.filter((n): n is FileNode => n.kind === "file").map((n) => n.id),
    );
}

function pickFirstRemainingFileId(nodes: FSNode[]) {
    return (nodes.find((n): n is FileNode => n.kind === "file")?.id ?? "");
}

function clampLeftPctFromWidth(nextPctRaw: number, width: number) {
    const minPct = (MIN_LEFT_PX / width) * 100;
    const maxPct = ((width - SPLIT_PX - MIN_RIGHT_PX) / width) * 100;

    const safeMin = Math.max(0, minPct);
    const safeMax = Math.max(safeMin, maxPct);

    return clamp(nextPctRaw, safeMin, safeMax);
}

export function useIdeWorkspace(opts?: UseIdeWorkspaceOpts) {
    const baseStorageKey = opts?.storageKey ?? STORAGE_KEY_V2;
    const forcedLanguage = opts?.forcedLanguage;
    const resetOnForcedLanguageChange = !!opts?.resetOnForcedLanguageChange;
    const access = opts?.access ?? DEFAULT_ACCESS;
    const draftStorageMode = opts?.draftStorageMode ?? "local";
    const initialWorkspace = opts?.initialWorkspace ?? null;

    const [language, setLanguageState] = useState<CodeLanguage>("python");
    const [nodes, setNodes] = useState<FSNode[]>([]);
    const [openTabs, setOpenTabs] = useState<NodeId[]>([]);
    const [activeFileId, setActiveFileId] = useState<NodeId>("");
    const [entryFileId, setEntryFileId] = useState<NodeId>("");
    const [stdin, setStdin] = useState("");

    const [expanded, setExpanded] = useState<Set<NodeId>>(new Set());
    const [leftPct, setLeftPct] = useState(26);
    const dragRef = useRef<{ startX: number; startPct: number } | null>(null);

    const [filter, setFilter] = useState("");
    const [inlineEdit, setInlineEdit] = useState<InlineEdit>(null);
    const [pendingDeleteId, setPendingDeleteId] = useState<NodeId | null>(null);
    const [toast, setToast] = useState<Toast>(null);

    const hydratedRef = useRef(false);
    const prevForcedRef = useRef<CodeLanguage | null>(null);

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 2600);
        return () => clearTimeout(t);
    }, [toast]);

    const clearTransientUi = useCallback(() => {
        setFilter("");
        setInlineEdit(null);
        setPendingDeleteId(null);
    }, []);

    const hydrateWorkspace = useCallback((ws: WorkspaceStateV2) => {
        const normalized = normalizeWorkspaceForAccess(ws, access);

        setLanguageState(normalized.language);
        setNodes(normalized.nodes);
        setOpenTabs(normalized.openTabs?.length ? normalized.openTabs : [normalized.activeFileId]);
        setActiveFileId(normalized.activeFileId);
        setEntryFileId(normalized.entryFileId);
        setStdin(normalized.stdin ?? "");
        setExpanded(new Set(normalized.expanded ?? []));
        setLeftPct(normalized.leftPct ?? 26);
    }, [access]);

    const replaceWorkspace = useCallback((ws: WorkspaceStateV2) => {
        hydrateWorkspace(ws);
        clearTransientUi();
        setToast(null);
    }, [hydrateWorkspace, clearTransientUi]);

    const resetWorkspaceForLanguage = useCallback((next: CodeLanguage) => {
        const base = createDefaultStateForLanguage(next);
        hydrateWorkspace(
            access.canUseMultiFile ? base : buildSingleFileWorkspace(next, base),
        );
        clearTransientUi();
    }, [hydrateWorkspace, clearTransientUi, access.canUseMultiFile]);

    const currentWorkspace = useMemo<WorkspaceStateV2 | null>(() => {
        if (!nodes.length || !activeFileId || !entryFileId) return null;

        return {
            version: 2,
            language,
            nodes,
            openTabs: openTabs.length ? openTabs : [activeFileId],
            activeFileId,
            entryFileId,
            stdin,
            expanded: Array.from(expanded),
            leftPct,
        };
    }, [language, nodes, openTabs, activeFileId, entryFileId, stdin, expanded, leftPct]);

    const currentWorkspaceRef = useRef<WorkspaceStateV2 | null>(null);
    useEffect(() => {
        currentWorkspaceRef.current = currentWorkspace;
    }, [currentWorkspace]);

    const loadWorkspaceForLanguage = useCallback((next: CodeLanguage) => {
        if (draftStorageMode !== "local") return null;
        const key = storageKeyForLanguage(baseStorageKey, next);
        return loadV2(key as any, next as any);
    }, [baseStorageKey, draftStorageMode]);

    const saveWorkspaceForLanguage = useCallback((ws: WorkspaceStateV2 | null) => {
        if (!ws) return;
        if (draftStorageMode !== "local") return;

        const key = storageKeyForLanguage(baseStorageKey, ws.language);
        saveV2(key, ws);
        saveWorkspaceMeta(baseStorageKey, { lastLanguage: ws.language });
    }, [baseStorageKey, draftStorageMode]);

    const switchLanguage = useCallback((next: CodeLanguage) => {
        if (!isCodeLanguage(next)) return;
        if (next === language) return;

        saveWorkspaceForLanguage(currentWorkspaceRef.current);

        const loaded = loadWorkspaceForLanguage(next);
        if (loaded) {
            hydrateWorkspace(loaded);
        } else {
            const base = createDefaultStateForLanguage(next);
            hydrateWorkspace(
                access.canUseMultiFile ? base : buildSingleFileWorkspace(next, base),
            );
        }

        clearTransientUi();
        setToast(null);
    }, [
        language,
        saveWorkspaceForLanguage,
        loadWorkspaceForLanguage,
        hydrateWorkspace,
        clearTransientUi,
        access.canUseMultiFile,
    ]);

    useEffect(() => {
        if (initialWorkspace) {
            hydrateWorkspace(initialWorkspace);
            hydratedRef.current = true;
            prevForcedRef.current = forcedLanguage ?? null;
            return;
        }

        const wanted =
            forcedLanguage ??
            (draftStorageMode === "local" ? readWorkspaceMeta(baseStorageKey)?.lastLanguage : null) ??
            "python";

        const initialLanguage = isCodeLanguage(wanted) ? wanted : "python";

        if (forcedLanguage && resetOnForcedLanguageChange) {
            resetWorkspaceForLanguage(forcedLanguage);
            hydratedRef.current = true;
            prevForcedRef.current = forcedLanguage;
            return;
        }

        let ws = loadWorkspaceForLanguage(initialLanguage);

        if (!ws && draftStorageMode === "local" && baseStorageKey === STORAGE_KEY_V2) {
            const migrated = tryMigrateV1(initialLanguage);
            if (migrated) {
                saveWorkspaceForLanguage(migrated);
                ws = forcedLanguage && migrated.language !== forcedLanguage
                    ? null
                    : migrated;
            }
        }

        if (ws) {
            hydrateWorkspace(ws);
        } else {
            const base = createDefaultStateForLanguage(initialLanguage);
            hydrateWorkspace(
                access.canUseMultiFile ? base : buildSingleFileWorkspace(initialLanguage, base),
            );
        }

        hydratedRef.current = true;
        prevForcedRef.current = forcedLanguage ?? null;
    }, [
        initialWorkspace,
        baseStorageKey,
        forcedLanguage,
        resetOnForcedLanguageChange,
        loadWorkspaceForLanguage,
        saveWorkspaceForLanguage,
        hydrateWorkspace,
        resetWorkspaceForLanguage,
        access.canUseMultiFile,
        draftStorageMode,
    ]);

    useEffect(() => {
        if (!hydratedRef.current || !forcedLanguage) return;
        if (prevForcedRef.current === forcedLanguage) return;

        prevForcedRef.current = forcedLanguage;

        if (resetOnForcedLanguageChange) {
            resetWorkspaceForLanguage(forcedLanguage);
        } else {
            switchLanguage(forcedLanguage);
        }
    }, [
        forcedLanguage,
        resetOnForcedLanguageChange,
        resetWorkspaceForLanguage,
        switchLanguage,
    ]);

    useEffect(() => {
        if (!hydratedRef.current || !currentWorkspace) return;
        if (draftStorageMode !== "local") return;

        const id = window.setTimeout(() => {
            saveWorkspaceForLanguage(currentWorkspace);
        }, SAVE_DEBOUNCE_MS);

        return () => window.clearTimeout(id);
    }, [currentWorkspace, saveWorkspaceForLanguage, draftStorageMode]);

    useEffect(() => {
        if (!hydratedRef.current) return;
        if (draftStorageMode !== "local") return;

        const flush = () => {
            saveWorkspaceForLanguage(currentWorkspaceRef.current);
        };

        window.addEventListener("pagehide", flush);
        window.addEventListener("beforeunload", flush);

        return () => {
            window.removeEventListener("pagehide", flush);
            window.removeEventListener("beforeunload", flush);
        };
    }, [saveWorkspaceForLanguage, draftStorageMode]);

    useEffect(() => {
        if (!hydratedRef.current) return;
        if (access.canUseMultiFile) return;

        const ws = currentWorkspaceRef.current;
        if (!ws) return;

        const fileCount = ws.nodes.filter((n): n is FileNode => n.kind === "file").length;
        if (fileCount <= 1) return;

        hydrateWorkspace(normalizeWorkspaceForAccess(ws, access));
        clearTransientUi();
        setToast({
            kind: "error",
            text: access.hasUser
                ? "This workspace was reduced to one file because multi-file is locked."
                : "Log in to unlock multiple files.",
        });
    }, [access, hydrateWorkspace, clearTransientUi]);

    const activeFile = useMemo(
        () => findFile(nodes, activeFileId),
        [nodes, activeFileId],
    );

    const entryFile = useMemo(
        () => findFile(nodes, entryFileId),
        [nodes, entryFileId],
    );

    const tabFiles = useMemo(() => {
        const map = new Map(
            nodes
                .filter((n): n is FileNode => n.kind === "file")
                .map((f) => [f.id, f] as const),
        );

        return openTabs.map((id) => map.get(id)).filter(Boolean) as FileNode[];
    }, [nodes, openTabs]);

    const rootSrc = useMemo(() => {
        return nodes.find(
            (n) => n.kind === "folder" && n.name === "src" && n.parentId === null,
        ) as FolderNode | undefined;
    }, [nodes]);

    const canManageFiles = access.canUseMultiFile;

    function denyMultiFile(message?: string) {
        setToast({
            kind: "error",
            text:
                message ??
                (access.hasUser
                    ? "Multiple files are not available for this user."
                    : "Log in to unlock multiple files."),
        });
    }

    function openFile(id: NodeId) {
        const f = findFile(nodes, id);
        if (!f) return;

        setActiveFileId(id);
        setOpenTabs((prev) => (prev.includes(id) ? prev : [...prev, id]));
    }

    function closeTab(id: NodeId) {
        setOpenTabs((prev) => {
            const nextTabs = prev.filter((x) => x !== id);

            if (id === activeFileId) {
                const pick = nextTabs[nextTabs.length - 1] ?? "";
                setActiveFileId(pick);
            }

            return nextTabs;
        });
    }

    function onChangeCode(code: string) {
        if (!activeFile) return;

        setNodes((prev) =>
            prev.map((n) =>
                n.id === activeFile.id && n.kind === "file"
                    ? { ...n, content: code, updatedAt: Date.now() }
                    : n,
            ),
        );
    }

    function toggleFolder(id: NodeId) {
        setInlineEdit(null);
        setExpanded((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    function startNewFile(parentId: NodeId | null) {
        if (!canManageFiles) {
            denyMultiFile();
            return;
        }

        const desired = ensureUniqueSiblingName(
            nodes,
            parentId,
            `untitled${defaultExt(language)}`,
        );

        if (parentId) {
            setExpanded((s) => new Set(s).add(parentId));
        }

        setInlineEdit({
            mode: "new-file",
            parentId,
            value: desired,
        });
    }

    function startNewFolder(parentId: NodeId | null) {
        if (!canManageFiles) {
            denyMultiFile();
            return;
        }

        const desired = ensureUniqueSiblingName(nodes, parentId, "folder");

        if (parentId) {
            setExpanded((s) => new Set(s).add(parentId));
        }

        setInlineEdit({
            mode: "new-folder",
            parentId,
            value: desired,
        });
    }

    function startRename(nodeId: NodeId) {
        if (!canManageFiles) {
            denyMultiFile();
            return;
        }

        const n = nodes.find((x) => x.id === nodeId);
        if (!n) return;

        setInlineEdit({
            mode: "rename",
            parentId: n.parentId,
            targetId: n.id,
            value: n.name,
        });
    }

    function commitInlineEdit() {
        if (!inlineEdit) return;

        const raw = inlineEdit.value.trim();
        if (!raw) {
            setToast({ kind: "error", text: "Name can’t be empty." });
            return;
        }

        if (!canManageFiles) {
            denyMultiFile();
            setInlineEdit(null);
            return;
        }

        if (inlineEdit.mode === "rename") {
            const id = inlineEdit.targetId!;

            setNodes((prev) => {
                const cur = prev.find((x) => x.id === id);
                if (!cur) return prev;

                const safe = ensureUniqueSiblingName(
                    prev.filter((x) => x.id !== id),
                    cur.parentId,
                    raw,
                );

                return prev.map((x) =>
                    x.id === id
                        ? { ...x, name: safe, updatedAt: Date.now() }
                        : x,
                );
            });

            setInlineEdit(null);
            return;
        }

        if (inlineEdit.mode === "new-folder") {
            const newId = uid();

            setNodes((prev) => {
                const safe = ensureUniqueSiblingName(prev, inlineEdit.parentId, raw);

                const folder: FolderNode = {
                    id: newId,
                    kind: "folder",
                    name: safe,
                    parentId: inlineEdit.parentId,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                };

                return [...prev, folder];
            });

            setExpanded((s) => new Set(s).add(newId));
            setInlineEdit(null);
            return;
        }

        if (inlineEdit.mode === "new-file") {
            const newId = uid();

            setNodes((prev) => {
                const safe = ensureUniqueSiblingName(prev, inlineEdit.parentId, raw);

                const file: FileNode = {
                    id: newId,
                    kind: "file",
                    name: safe,
                    parentId: inlineEdit.parentId,
                    content: "",
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                };

                return [...prev, file];
            });

            setActiveFileId(newId);
            setOpenTabs((tabs) => (tabs.includes(newId) ? tabs : [...tabs, newId]));
            setInlineEdit(null);
        }
    }

    function cancelInlineEdit() {
        setInlineEdit(null);
    }

    function setEntry(id: NodeId) {
        setEntryFileId(id);
    }

    function requestDelete(id: NodeId) {
        if (!canManageFiles) {
            denyMultiFile();
            return;
        }

        const n = nodes.find((x) => x.id === id);
        if (!n) return;

        if (language !== "sql") {
            if (n.kind === "file" && n.id === entryFileId) {
                setToast({
                    kind: "error",
                    text: "Entry file can’t be deleted. Set another Entry first.",
                });
                return;
            }

            if (n.kind === "folder") {
                const ids = subtreeIds(nodes, n.id);
                if (ids.has(entryFileId)) {
                    setToast({
                        kind: "error",
                        text: "This folder contains the Entry file. Change Entry first.",
                    });
                    return;
                }
            }
        }

        setPendingDeleteId(id);
    }

    function performDelete(id: NodeId) {
        setNodes((prevNodes) => {
            const target = prevNodes.find((x) => x.id === id);
            if (!target) return prevNodes;

            const toDelete =
                target.kind === "folder"
                    ? subtreeIds(prevNodes, target.id)
                    : new Set<NodeId>([target.id]);

            if (language !== "sql" && toDelete.has(entryFileId)) {
                setToast({
                    kind: "error",
                    text: "Delete blocked: contains Entry file.",
                });
                setPendingDeleteId(null);
                return prevNodes;
            }

            const nextNodes = prevNodes.filter((x) => !toDelete.has(x.id));
            const nextFileIds = fileIdsOf(nextNodes);

            setOpenTabs((prevTabs) => {
                const nextTabs = prevTabs.filter((t) => !toDelete.has(t));

                setActiveFileId((prevActive) => {
                    if (!toDelete.has(prevActive)) return prevActive;

                    const preferredOpen = nextTabs[nextTabs.length - 1];
                    if (preferredOpen && nextFileIds.has(preferredOpen)) {
                        return preferredOpen;
                    }

                    return pickFirstRemainingFileId(nextNodes);
                });

                return nextTabs;
            });

            setExpanded((prevExpanded) => {
                const next = new Set(prevExpanded);
                for (const did of toDelete) next.delete(did);
                return next;
            });

            setPendingDeleteId(null);
            return nextNodes;
        });
    }

    const startDividerDrag = useCallback((clientX: number, rootEl: HTMLElement | null) => {
        if (!rootEl) return;

        dragRef.current = { startX: clientX, startPct: leftPct };

        const prevSelect = document.body.style.userSelect;
        const prevCursor = document.body.style.cursor;

        document.body.style.userSelect = "none";
        document.body.style.cursor = "col-resize";

        const onMove = (ev: PointerEvent | MouseEvent) => {
            const d = dragRef.current;
            if (!d) return;

            const rect = rootEl.getBoundingClientRect();
            if (!rect.width) return;

            const dx = ev.clientX - d.startX;
            const pctDelta = (dx / rect.width) * 100;
            setLeftPct(clampLeftPctFromWidth(d.startPct + pctDelta, rect.width));
        };

        const onUp = () => {
            dragRef.current = null;
            document.body.style.userSelect = prevSelect;
            document.body.style.cursor = prevCursor;
            window.removeEventListener("pointermove", onMove as EventListener);
            window.removeEventListener("pointerup", onUp);
            window.removeEventListener("mousemove", onMove as EventListener);
            window.removeEventListener("mouseup", onUp);
        };

        window.addEventListener("pointermove", onMove as EventListener);
        window.addEventListener("pointerup", onUp);
        window.addEventListener("mousemove", onMove as EventListener);
        window.addEventListener("mouseup", onUp);
    }, [leftPct]);

    function onMouseDownDivider(e: React.MouseEvent, rootEl: HTMLElement | null) {
        e.preventDefault();
        startDividerDrag(e.clientX, rootEl);
    }

    function onPointerDownDivider(e: React.PointerEvent, rootEl: HTMLElement | null) {
        e.preventDefault();
        startDividerDrag(e.clientX, rootEl);
    }

    function onKeyDownDivider(e: React.KeyboardEvent, rootEl: HTMLElement | null) {
        if (!rootEl) return;

        const rect = rootEl.getBoundingClientRect();
        if (!rect.width) return;

        const smallStepPct = (24 / rect.width) * 100;
        const bigStepPct = (96 / rect.width) * 100;

        if (e.key === "ArrowLeft") {
            e.preventDefault();
            setLeftPct((prev) => clampLeftPctFromWidth(prev - smallStepPct, rect.width));
            return;
        }

        if (e.key === "ArrowRight") {
            e.preventDefault();
            setLeftPct((prev) => clampLeftPctFromWidth(prev + smallStepPct, rect.width));
            return;
        }

        if (e.key === "Home") {
            e.preventDefault();
            setLeftPct(clampLeftPctFromWidth((MIN_LEFT_PX / rect.width) * 100, rect.width));
            return;
        }

        if (e.key === "End") {
            e.preventDefault();
            setLeftPct(
                clampLeftPctFromWidth(
                    ((rect.width - SPLIT_PX - MIN_RIGHT_PX) / rect.width) * 100,
                    rect.width,
                ),
            );
            return;
        }

        if (e.key === "PageUp") {
            e.preventDefault();
            setLeftPct((prev) => clampLeftPctFromWidth(prev - bigStepPct, rect.width));
            return;
        }

        if (e.key === "PageDown") {
            e.preventDefault();
            setLeftPct((prev) => clampLeftPctFromWidth(prev + bigStepPct, rect.width));
        }
    }

    return {
        state: {
            language,
            nodes,
            openTabs,
            activeFileId,
            entryFileId,
            stdin,
            expanded,
            leftPct,
            filter,
            inlineEdit,
            pendingDeleteId,
            toast,
            access,
        },
        derived: {
            activeFile,
            entryFile,
            tabFiles,
            rootSrc,
            currentWorkspace,
            isSingleFileMode: !access.canUseMultiFile,
        },
        actions: {
            setLanguage: switchLanguage,
            setNodes,
            setOpenTabs,
            setActiveFileId,
            setEntryFileId,
            setStdin,
            setExpanded,
            setLeftPct,
            setFilter,
            setInlineEdit,
            setPendingDeleteId,
            setToast,

            replaceWorkspace,
            resetWorkspaceForLanguage,
            switchLanguage,

            openFile,
            closeTab,
            onChangeCode,
            toggleFolder,

            startNewFile,
            startNewFolder,
            startRename,
            commitInlineEdit,
            cancelInlineEdit,

            setEntry,
            requestDelete,
            performDelete,

            onMouseDownDivider,
            onPointerDownDivider,
            onKeyDownDivider,
        },
        constants: {
            allLanguages: ALL_LANGUAGES,
        },
    };
}