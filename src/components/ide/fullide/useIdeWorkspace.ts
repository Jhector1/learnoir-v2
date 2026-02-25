// src/components/ide/fullide/useIdeWorkspace.ts
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
import { defaultExt, defaultMainCode, defaultMainFile } from "./languageDefaults";
import { ensureUniqueSiblingName, findFile, subtreeIds } from "./fsTree";
import { loadV2, saveV2, tryMigrateV1, STORAGE_KEY_V2 } from "./storage";
import {CodeLanguage} from "@/lib/practice/types";

export type UseIdeWorkspaceOpts = {
    storageKey?: string; // ✅ NEW
    forcedLanguage?: CodeLanguage;
    resetOnForcedLanguageChange?: boolean;
};

export function useIdeWorkspace(opts?: UseIdeWorkspaceOpts) {
    const storageKey = opts?.storageKey ?? STORAGE_KEY_V2; // ✅ NEW
    const forcedLanguage = opts?.forcedLanguage;
    const resetOnForcedLanguageChange = !!opts?.resetOnForcedLanguageChange;

    const [language, setLanguage] = useState<CodeLanguage>("python");
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

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 2600);
        return () => clearTimeout(t);
    }, [toast]);

    const resetWorkspaceForLanguage = useCallback((next: CodeLanguage) => {
        const srcId = uid();
        const mainId = uid();

        const fresh: FSNode[] = [
            {
                id: srcId,
                kind: "folder",
                name: "src",
                parentId: null,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            },
            {
                id: mainId,
                kind: "file",
                name: defaultMainFile(next),
                parentId: srcId,
                content: defaultMainCode(next),
                createdAt: Date.now(),
                updatedAt: Date.now(),
            },
        ];

        setLanguage(next);
        setNodes(fresh);
        setOpenTabs([mainId]);
        setActiveFileId(mainId);
        setEntryFileId(mainId);
        setStdin("");
        setExpanded(new Set([srcId]));
        setLeftPct(26);

        setFilter("");
        setInlineEdit(null);
        setPendingDeleteId(null);
    }, []);

    // ✅ init / re-init when storageKey changes
    const prevStorageKeyRef = useRef<string | null>(null);
    useEffect(() => {
        const wanted = forcedLanguage ?? "python";

        // If storageKey changes, reload workspace from that key
        const keyChanged =
            prevStorageKeyRef.current !== null && prevStorageKeyRef.current !== storageKey;
        prevStorageKeyRef.current = storageKey;

        // 1) load v2 for this key
        const v2 = loadV2(storageKey);
        if (v2) {
            if (forcedLanguage && resetOnForcedLanguageChange && v2.language !== forcedLanguage) {
                resetWorkspaceForLanguage(forcedLanguage);
                return;
            }

            setLanguage(v2.language);
            setNodes(v2.nodes);
            setOpenTabs(v2.openTabs?.length ? v2.openTabs : [v2.activeFileId]);
            setActiveFileId(v2.activeFileId);
            setEntryFileId(v2.entryFileId);
            setStdin(v2.stdin ?? "");
            setExpanded(new Set(v2.expanded ?? []));
            setLeftPct(v2.leftPct ?? 26);
            return;
        }

        // 2) Only migrate v1 when using the default v2 key and only on first init
        // (If you use per-language keys, you generally don’t want to migrate v1 into every key.)
        if (!keyChanged && storageKey === STORAGE_KEY_V2) {
            const migrated = tryMigrateV1();
            if (migrated) {
                // ✅ write migrated into the current key (your tryMigrateV1 doesn't do that)
                saveV2(storageKey, migrated);

                if (forcedLanguage && resetOnForcedLanguageChange && migrated.language !== forcedLanguage) {
                    resetWorkspaceForLanguage(forcedLanguage);
                    return;
                }

                setLanguage(migrated.language);
                setNodes(migrated.nodes);
                setOpenTabs(migrated.openTabs);
                setActiveFileId(migrated.activeFileId);
                setEntryFileId(migrated.entryFileId);
                setStdin(migrated.stdin ?? "");
                setExpanded(new Set(migrated.expanded ?? []));
                setLeftPct(migrated.leftPct ?? 26);
                return;
            }
        }

        // 3) fresh
        resetWorkspaceForLanguage(wanted);
    }, [storageKey, forcedLanguage, resetOnForcedLanguageChange, resetWorkspaceForLanguage]);

    // ✅ soft switch: if workspace is still basically fresh, update main file name+template
    function switchLanguage(next: CodeLanguage) {
        setLanguage(next);

        setNodes((prev) => {
            const files = prev.filter((n): n is FileNode => n.kind === "file");
            const folders = prev.filter((n): n is FolderNode => n.kind === "folder");

            const looksFresh =
                folders.length === 1 &&
                folders[0].name === "src" &&
                folders[0].parentId === null &&
                files.length === 1 &&
                files[0].parentId === folders[0].id;

            if (!looksFresh) return prev;

            const f = files[0];

            const isEmpty = !(f.content ?? "").trim().length;
            const isOldDefault = (f.content ?? "") === defaultMainCode(language);

            if (!isEmpty && !isOldDefault) return prev;

            return prev.map((n) => {
                if (n.id !== f.id || n.kind !== "file") return n;
                return {
                    ...(n as FileNode),
                    name: defaultMainFile(next),
                    content: defaultMainCode(next),
                    updatedAt: Date.now(),
                };
            });
        });
    }

    // ✅ react to forced language changes (ONLY ONE effect — removed duplicates)
    const prevForcedRef = useRef<CodeLanguage | null>(null);
    useEffect(() => {
        if (!forcedLanguage) return;

        if (prevForcedRef.current === null) {
            prevForcedRef.current = forcedLanguage;
            return;
        }

        if (forcedLanguage !== prevForcedRef.current) {
            prevForcedRef.current = forcedLanguage;

            if (resetOnForcedLanguageChange) resetWorkspaceForLanguage(forcedLanguage);
            else switchLanguage(forcedLanguage);
        }
    }, [forcedLanguage, resetOnForcedLanguageChange, resetWorkspaceForLanguage]);

    // ✅ persist using the provided key
    useEffect(() => {
        if (!nodes.length || !activeFileId || !entryFileId) return;

        const ws: WorkspaceStateV2 = {
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

        saveV2(storageKey, ws); // ✅ matches your storage.ts signature
    }, [storageKey, language, nodes, openTabs, activeFileId, entryFileId, stdin, expanded, leftPct]);

    const activeFile = useMemo(() => findFile(nodes, activeFileId), [nodes, activeFileId]);
    const entryFile = useMemo(() => findFile(nodes, entryFileId), [nodes, entryFileId]);

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

    function openFile(id: NodeId) {
        setInlineEdit(null);
        setActiveFileId(id);
        setOpenTabs((prev) => (prev.includes(id) ? prev : [...prev, id]));
    }

    function closeTab(id: NodeId) {
        setOpenTabs((prev) => prev.filter((x) => x !== id));
        if (id === activeFileId) {
            setOpenTabs((prev) => {
                const next = prev.filter((x) => x !== id);
                const pick = next[next.length - 1] || "";
                if (pick) setActiveFileId(pick);
                return next;
            });
        }
    }

    function onChangeCode(code: string) {
        if (!activeFile) return;
        setNodes((prev) =>
            prev.map((n) =>
                n.id === activeFile.id && n.kind === "file"
                    ? { ...(n as FileNode), content: code, updatedAt: Date.now() }
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

    // inline create/rename
    function startNewFile(parentId: NodeId | null) {
        const desired = ensureUniqueSiblingName(nodes, parentId, `untitled${defaultExt(language)}`);
        if (parentId) setExpanded((s) => new Set(s).add(parentId));
        setInlineEdit({ mode: "new-file", parentId, value: desired });
    }

    function startNewFolder(parentId: NodeId | null) {
        const desired = ensureUniqueSiblingName(nodes, parentId, "folder");
        if (parentId) setExpanded((s) => new Set(s).add(parentId));
        setInlineEdit({ mode: "new-folder", parentId, value: desired });
    }

    function startRename(nodeId: NodeId) {
        const n = nodes.find((x) => x.id === nodeId);
        if (!n) return;
        setInlineEdit({ mode: "rename", parentId: n.parentId, targetId: n.id, value: n.name });
    }

    function commitInlineEdit() {
        if (!inlineEdit) return;

        const raw = inlineEdit.value.trim();
        if (!raw) {
            setToast({ kind: "error", text: "Name can’t be empty." });
            return;
        }

        if (inlineEdit.mode === "rename") {
            const id = inlineEdit.targetId!;
            setNodes((prev) => {
                const cur = prev.find((x) => x.id === id);
                if (!cur) return prev;

                const safe = ensureUniqueSiblingName(prev.filter((x) => x.id !== id), cur.parentId, raw);

                return prev.map((x) => (x.id === id ? { ...(x as any), name: safe, updatedAt: Date.now() } : x));
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
            setInlineEdit(null);
            setActiveFileId(newId);
            setOpenTabs((t) => (t.includes(newId) ? t : [...t, newId]));
            return;
        }
    }

    function cancelInlineEdit() {
        setInlineEdit(null);
    }

    // delete (no confirm() + protect entry)
    function requestDelete(id: NodeId) {
        const n = nodes.find((x) => x.id === id);
        if (!n) return;

        if (n.kind === "file" && n.id === entryFileId) {
            setToast({ kind: "error", text: "Entry file can’t be deleted. Set another Entry first." });
            return;
        }

        if (n.kind === "folder") {
            const ids = subtreeIds(nodes, n.id);
            if (ids.has(entryFileId)) {
                setToast({ kind: "error", text: "This folder contains the Entry file. Change Entry first." });
                return;
            }
        }

        setPendingDeleteId(id);
    }

    function performDelete(id: NodeId) {
        const n = nodes.find((x) => x.id === id);
        if (!n) return;

        const toDelete = n.kind === "folder" ? subtreeIds(nodes, n.id) : new Set<NodeId>([n.id]);
        if (toDelete.has(entryFileId)) {
            setToast({ kind: "error", text: "Delete blocked: contains Entry file." });
            return;
        }

        setNodes((prev) => prev.filter((x) => !toDelete.has(x.id)));
        setOpenTabs((tabs) => tabs.filter((t) => !toDelete.has(t)));
        setExpanded((exp) => {
            const next = new Set(exp);
            for (const did of toDelete) next.delete(did);
            return next;
        });

        if (toDelete.has(activeFileId)) {
            const remaining = nodes.filter((x) => !toDelete.has(x.id) && x.kind === "file") as FileNode[];
            const pick = remaining[0]?.id ?? "";
            setActiveFileId(pick);
            if (pick) setOpenTabs((tabs) => (tabs.includes(pick) ? tabs : [...tabs, pick]));
        }

        setPendingDeleteId(null);
    }

    // divider drag
    const SPLIT_PX = 8;
    const MIN_LEFT_PX = 240;
    const MIN_RIGHT_PX = 520;

    function onMouseDownDivider(e: React.MouseEvent, rootEl: HTMLElement | null) {
        if (!rootEl) return;
        e.preventDefault();

        dragRef.current = { startX: e.clientX, startPct: leftPct };

        const prevSelect = document.body.style.userSelect;
        const prevCursor = document.body.style.cursor;
        document.body.style.userSelect = "none";
        document.body.style.cursor = "col-resize";

        const onMove = (ev: MouseEvent) => {
            const d = dragRef.current;
            if (!d) return;

            const rect = rootEl.getBoundingClientRect();
            const dx = ev.clientX - d.startX;

            const nextPctRaw = d.startPct + (dx / rect.width) * 100;

            const minPct = (MIN_LEFT_PX / rect.width) * 100;
            const maxPct = ((rect.width - SPLIT_PX - MIN_RIGHT_PX) / rect.width) * 100;

            const safeMin = Math.max(0, minPct);
            const safeMax = Math.max(safeMin, maxPct);

            setLeftPct(clamp(nextPctRaw, safeMin, safeMax));
            requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
        };

        const onUp = () => {
            dragRef.current = null;
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);

            document.body.style.userSelect = prevSelect;
            document.body.style.cursor = prevCursor;

            requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
        };

        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
    }

    const setEntry = (id: NodeId) => setEntryFileId(id);

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
        },
        derived: { activeFile, entryFile, tabFiles, rootSrc },
        actions: {
            setLanguage,
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

            resetWorkspaceForLanguage,
            openFile,
            closeTab,
            onChangeCode,
            toggleFolder,
            switchLanguage,

            startNewFile,
            startNewFolder,
            startRename,
            commitInlineEdit,
            cancelInlineEdit,

            requestDelete,
            performDelete,

            onMouseDownDivider,
            setEntry,
        },
    };
}