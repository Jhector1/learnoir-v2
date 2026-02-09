"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Lang, RunResult } from "@/lib/code/runCode";
import CodeRunner from "@/components/code/CodeRunner";

type NodeId = string;

type FolderNode = {
  id: NodeId;
  kind: "folder";
  name: string;
  parentId: NodeId | null;
  createdAt: number;
  updatedAt: number;
};

type FileNode = {
  id: NodeId;
  kind: "file";
  name: string;
  parentId: NodeId | null;
  content: string;
  createdAt: number;
  updatedAt: number;
};

type FSNode = FolderNode | FileNode;

type WorkspaceStateV2 = {
  version: 2;
  language: Lang;
  nodes: FSNode[];
  openTabs: NodeId[];
  activeFileId: NodeId;
  entryFileId: NodeId;
  stdin: string;
  expanded: NodeId[];
  leftPct: number;
};

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const STORAGE_KEY_V2 = "learnoir.ide.workspace.v2";
const STORAGE_KEY_V1 = "learnoir.ide.workspace.v1";

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function cn(...cls: Array<string | false | undefined | null>) {
  return cls.filter(Boolean).join(" ");
}

function ensureUniqueSiblingName(nodes: FSNode[], parentId: NodeId | null, desired: string) {
  const base = (desired ?? "").trim() || "untitled";
  const exists = (n: string) =>
    nodes.some((x) => x.parentId === parentId && x.name.toLowerCase() === n.toLowerCase());

  if (!exists(base)) return base;

  const dot = base.lastIndexOf(".");
  const hasExt = dot > 0;
  const stem = hasExt ? base.slice(0, dot) : base;
  const ext = hasExt ? base.slice(dot) : "";

  let i = 2;
  while (exists(`${stem}-${i}${ext}`)) i++;
  return `${stem}-${i}${ext}`;
}

function defaultExt(lang: Lang) {
  switch (lang) {
    case "python":
      return ".py";
    case "java":
      return ".java";
    case "javascript":
      return ".js";
    case "c":
      return ".c";
    case "cpp":
      return ".cpp";
  }
}

function defaultMainFile(lang: Lang) {
  switch (lang) {
    case "python":
      return "main.py";
    case "java":
      return "Main.java";
    case "javascript":
      return "main.js";
    case "c":
      return "main.c";
    case "cpp":
      return "main.cpp";
  }
}

function defaultMainCode(lang: Lang) {
  switch (lang) {
    case "python":
      return `print("Hello from Python!")\n`;
    case "java":
      return `public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello from Java!");\n  }\n}\n`;
    case "javascript":
      return `console.log("Hello from JavaScript!");\n`;
    case "c":
      return `#include <stdio.h>\n\nint main() {\n  printf("Hello from C!\\n");\n  return 0;\n}\n`;
    case "cpp":
      return `#include <iostream>\n\nint main() {\n  std::cout << "Hello from C++!" << std::endl;\n  return 0;\n}\n`;
  }
}

function isSafeRelPath(p: string) {
  return p && !p.startsWith("/") && !p.includes("..");
}

function pathOf(nodes: FSNode[], id: NodeId): string {
  const byId = new Map(nodes.map((n) => [n.id, n] as const));
  const parts: string[] = [];
  let cur = byId.get(id);

  while (cur) {
    parts.push(cur.name);
    if (!cur.parentId) break;
    cur = byId.get(cur.parentId);
  }

  parts.reverse();
  return parts.join("/");
}

function exportProjectFiles(nodes: FSNode[]): Array<{ path: string; content: string }> {
  const files = nodes.filter((n): n is FileNode => n.kind === "file");
  const out = files.map((f) => ({ path: pathOf(nodes, f.id), content: f.content ?? "" }));
  for (const f of out) {
    if (!isSafeRelPath(f.path)) throw new Error(`Unsafe file path: ${f.path}`);
  }
  return out;
}

function loadV2(): WorkspaceStateV2 | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_V2);
    if (!raw) return null;
    const ws = JSON.parse(raw) as WorkspaceStateV2;
    if (!ws || ws.version !== 2) return null;
    if (!Array.isArray(ws.nodes) || ws.nodes.length === 0) return null;
    if (!ws.activeFileId || !ws.entryFileId) return null;
    return ws;
  } catch {
    return null;
  }
}

function saveV2(ws: WorkspaceStateV2) {
  try {
    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(ws));
  } catch {
    // ignore
  }
}

function tryMigrateV1(): WorkspaceStateV2 | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_V1);
    if (!raw) return null;
    const v1 = JSON.parse(raw) as any;
    if (!v1?.files?.length) return null;

    const language: Lang = v1.language ?? "python";
    const rootSrcId = uid();

    const nodes: FSNode[] = [
      {
        id: rootSrcId,
        kind: "folder",
        name: "src",
        parentId: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      ...v1.files.map((f: any) => ({
        id: uid(),
        kind: "file",
        name: String(f.name ?? defaultMainFile(language)),
        parentId: rootSrcId,
        content: String(f.content ?? ""),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })),
    ];

    const fileIds = nodes.filter((n): n is FileNode => n.kind === "file").map((f) => f.id);
    const activeFileId = fileIds[0];
    const entryFileId = activeFileId;

    return {
      version: 2,
      language,
      nodes,
      openTabs: [activeFileId],
      activeFileId,
      entryFileId,
      stdin: v1.stdin ?? "",
      expanded: [rootSrcId],
      leftPct: 26,
    };
  } catch {
    return null;
  }
}

function childrenOf(nodes: FSNode[], parentId: NodeId | null) {
  return nodes
    .filter((n) => n.parentId === parentId)
    .slice()
    .sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === "folder" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}

function findFile(nodes: FSNode[], id: NodeId) {
  const n = nodes.find((x) => x.id === id);
  return n && n.kind === "file" ? (n as FileNode) : null;
}

function subtreeIds(nodes: FSNode[], rootId: NodeId) {
  const out = new Set<NodeId>();
  const stack = [rootId];
  while (stack.length) {
    const cur = stack.pop()!;
    out.add(cur);
    for (const child of nodes.filter((x) => x.parentId === cur)) stack.push(child.id);
  }
  return out;
}

function IconChevronRight(props: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={props.className} fill="none">
      <path d="M8 5l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconChevronDown(props: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={props.className} fill="none">
      <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconFolder(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={props.className} fill="none">
      <path
        d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-16a2 2 0 0 1-2-2v-11Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconFile(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={props.className} fill="none">
      <path
        d="M7 3.5h7l3 3V20.5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5.5a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M14 3.5v4h4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
function IconPlus(props: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={props.className} fill="none">
      <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function IconTrash(props: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={props.className} fill="none">
      <path d="M6 6h8l-.6 11H6.6L6 6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M8 6V4.8A1.8 1.8 0 0 1 9.8 3h.4A1.8 1.8 0 0 1 12 4.8V6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 6h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function IconPencil(props: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={props.className} fill="none">
      <path
        d="M4 13.8V16h2.2l8.4-8.4-2.2-2.2L4 13.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M11.6 5.4l2.2 2.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function IconPlay(props: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={props.className} fill="none">
      <path d="M7 5.5v9l8-4.5-8-4.5Z" fill="currentColor" />
    </svg>
  );
}

type InlineEdit =
  | {
      mode: "new-file" | "new-folder" | "rename";
      parentId: NodeId | null;
      targetId?: NodeId; // for rename
      value: string;
    }
  | null;

type Toast = { kind: "info" | "error"; text: string } | null;

export default function FullIDE({
  title = "IDE",
  height = 420,
}: {
  title?: string;
  height?: number;
}) {
  const [language, setLanguage] = useState<Lang>("python");
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

  // init
  useEffect(() => {
    const v2 = loadV2();
    if (v2) {
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

    const migrated = tryMigrateV1();
    if (migrated) {
      setLanguage(migrated.language);
      setNodes(migrated.nodes);
      setOpenTabs(migrated.openTabs);
      setActiveFileId(migrated.activeFileId);
      setEntryFileId(migrated.entryFileId);
      setStdin(migrated.stdin);
      setExpanded(new Set(migrated.expanded ?? []));
      setLeftPct(migrated.leftPct ?? 26);
      return;
    }

    // fresh workspace
    const lang: Lang = "python";
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
        name: defaultMainFile(lang),
        parentId: srcId,
        content: defaultMainCode(lang),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    setLanguage(lang);
    setNodes(fresh);
    setOpenTabs([mainId]);
    setActiveFileId(mainId);
    setEntryFileId(mainId);
    setStdin("");
    setExpanded(new Set([srcId]));
    setLeftPct(26);
  }, []);

  // persist
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
    saveV2(ws);
  }, [language, nodes, openTabs, activeFileId, entryFileId, stdin, expanded, leftPct]);

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

  function switchLanguage(next: Lang) {
    setLanguage(next);

    // Replace default-ish workspace only.
    const files = nodes.filter((n): n is FileNode => n.kind === "file");
    const folders = nodes.filter((n): n is FolderNode => n.kind === "folder");
    const looksFresh = folders.length === 1 && folders[0].name === "src" && files.length === 1;

    if (looksFresh) {
      const f = files[0];
      setNodes((prev) =>
        prev.map((n) => {
          if (n.id === f.id && n.kind === "file") {
            return {
              ...(n as FileNode),
              name: defaultMainFile(next),
              content: defaultMainCode(next),
              updatedAt: Date.now(),
            };
          }
          return n;
        }),
      );
    }
  }

  // ---- inline create/rename (NO prompt) ----
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

        const safe = ensureUniqueSiblingName(
          prev.filter((x) => x.id !== id),
          cur.parentId,
          raw,
        );

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

  // ---- delete (NO confirm()) + protect entry ----
  function requestDelete(id: NodeId) {
    const n = nodes.find((x) => x.id === id);
    if (!n) return;

    // block deleting entry file
    if (n.kind === "file" && n.id === entryFileId) {
      setToast({ kind: "error", text: "Entry file can’t be deleted. Set another Entry first." });
      return;
    }

    // block deleting folder that contains entry
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

    if (n.kind === "file" && n.id === entryFileId) {
      setToast({ kind: "error", text: "Entry file can’t be deleted. Set another Entry first." });
      return;
    }

    const toDelete =
      n.kind === "folder" ? subtreeIds(nodes, n.id) : new Set<NodeId>([n.id]);

    if (toDelete.has(entryFileId)) {
      setToast({ kind: "error", text: "Delete blocked: contains Entry file." });
      return;
    }

    setNodes((prev) => prev.filter((x) => !toDelete.has(x.id)));
    setOpenTabs((tabs) => tabs.filter((t) => !toDelete.has(t)));
    setExpanded((exp) => {
      const next = new Set(exp);
      for (const id of toDelete) next.delete(id);
      return next;
    });

    // fix active
    if (toDelete.has(activeFileId)) {
      const remaining = nodes.filter((x) => !toDelete.has(x.id) && x.kind === "file") as FileNode[];
      const pick = remaining[0]?.id ?? "";
      setActiveFileId(pick);
      if (pick) setOpenTabs((tabs) => (tabs.includes(pick) ? tabs : [...tabs, pick]));
    }

    setPendingDeleteId(null);
  }

  // resizable divider
  function onMouseDownDivider(e: React.MouseEvent) {
    dragRef.current = { startX: e.clientX, startPct: leftPct };
    window.addEventListener("mousemove", onMouseMoveDivider);
    window.addEventListener("mouseup", onMouseUpDivider);
  }
  function onMouseMoveDivider(e: MouseEvent) {
    const d = dragRef.current;
    if (!d) return;
    const root = document.getElementById("ide-root");
    if (!root) return;
    const rect = root.getBoundingClientRect();
    const dx = e.clientX - d.startX;
    const pctDelta = (dx / rect.width) * 100;
    setLeftPct(clamp(d.startPct + pctDelta, 16, 45));
  }
  function onMouseUpDivider() {
    dragRef.current = null;
    window.removeEventListener("mousemove", onMouseMoveDivider);
    window.removeEventListener("mouseup", onMouseUpDivider);
  }

  // ---- multi-file runner ----
  const onRunProject = async (args: { language: Lang; code: string; stdin: string }): Promise<RunResult> => {
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
      return { ok: false, error: `Non-JSON response (${res.status}): ${text.slice(0, 300)}` };
    }
  };

  // ---- filtering ----
  const filterLower = filter.trim().toLowerCase();

  function nodeMatchesFilter(id: NodeId) {
    if (!filterLower) return true;
    const p = pathOf(nodes, id).toLowerCase();
    return p.includes(filterLower);
  }

  function folderHasMatch(folderId: NodeId): boolean {
    const kids = childrenOf(nodes, folderId);
    for (const k of kids) {
      if (nodeMatchesFilter(k.id)) return true;
      if (k.kind === "folder" && folderHasMatch(k.id)) return true;
    }
    return false;
  }

  function IndentGuides({ depth }: { depth: number }) {
    if (depth <= 0) return null;
    return (
      <div className="flex">
        {Array.from({ length: depth }).map((_, i) => (
          <div key={i} className="relative h-8 w-[14px]">
            <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/10" />
          </div>
        ))}
      </div>
    );
  }

  function InlineNameRow({
    depth,
    kind,
    parentId,
    initialFocus,
  }: {
    depth: number;
    kind: "file" | "folder";
    parentId: NodeId | null;
    initialFocus?: boolean;
  }) {
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
      if (initialFocus) setTimeout(() => inputRef.current?.focus(), 0);
    }, [initialFocus]);

    return (
      <div
        className={cn(
          "group flex h-8 items-center rounded-md px-2",
          "border border-transparent",
          "bg-white/[0.06] border-white/10",
        )}
      >
        <IndentGuides depth={depth} />
        <div className="grid h-6 w-6 place-items-center text-white/55">
          {/* placeholder for caret */}
        </div>
        <div className="grid h-6 w-6 place-items-center text-white/75">
          {kind === "folder" ? <IconFolder className="h-4 w-4" /> : <IconFile className="h-4 w-4" />}
        </div>

        <input
          ref={inputRef}
          value={inlineEdit?.value ?? ""}
          onChange={(e) => setInlineEdit((s) => (s ? { ...s, value: e.target.value } : s))}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitInlineEdit();
            if (e.key === "Escape") cancelInlineEdit();
          }}
          className={cn(
            "h-7 w-full rounded-md border border-white/10 bg-black/30 px-2",
            "text-[12px] font-semibold text-white/85 outline-none",
          )}
        />

        <div className="ml-2 flex items-center gap-1">
          <button
            type="button"
            onClick={commitInlineEdit}
            className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-extrabold text-white/75 hover:bg-white/10"
          >
            Save
          </button>
          <button
            type="button"
            onClick={cancelInlineEdit}
            className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-extrabold text-white/65 hover:bg-white/10"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  function Tree({ parentId, depth }: { parentId: NodeId | null; depth: number }) {
    const kids = childrenOf(nodes, parentId).filter((n) => {
      if (!filterLower) return true;
      if (n.kind === "file") return nodeMatchesFilter(n.id);
      return nodeMatchesFilter(n.id) || folderHasMatch(n.id);
    });

    const showInlineNewHere =
      inlineEdit &&
      (inlineEdit.mode === "new-file" || inlineEdit.mode === "new-folder") &&
      inlineEdit.parentId === parentId;

    return (
      <div className="space-y-[2px]">
        {showInlineNewHere ? (
          <InlineNameRow
            depth={depth}
            kind={inlineEdit!.mode === "new-folder" ? "folder" : "file"}
            parentId={parentId}
            initialFocus
          />
        ) : null}

        {kids.map((n) => {
          const isFolder = n.kind === "folder";
          const isOpen = isFolder && expanded.has(n.id);
          const isActive = n.kind === "file" && n.id === activeFileId;
          const isEntry = n.kind === "file" && n.id === entryFileId;

          const hasChildren = isFolder && childrenOf(nodes, n.id).length > 0;

          const isRenaming = inlineEdit?.mode === "rename" && inlineEdit?.targetId === n.id;

          if (isRenaming) {
            return (
              <div key={n.id}>
                <div className={cn("flex h-8 items-center rounded-md px-2", "bg-white/[0.06] border border-white/10")}>
                  <IndentGuides depth={depth} />
                  <div className="grid h-6 w-6 place-items-center text-white/55">
                    {isFolder ? (isOpen ? <IconChevronDown className="h-4 w-4" /> : <IconChevronRight className="h-4 w-4" />) : null}
                  </div>
                  <div className="grid h-6 w-6 place-items-center text-white/75">
                    {isFolder ? <IconFolder className="h-4 w-4" /> : <IconFile className="h-4 w-4" />}
                  </div>

                  <input
                    autoFocus
                    value={inlineEdit?.value ?? ""}
                    onChange={(e) => setInlineEdit((s) => (s ? { ...s, value: e.target.value } : s))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitInlineEdit();
                      if (e.key === "Escape") cancelInlineEdit();
                    }}
                    className={cn(
                      "h-7 w-full rounded-md border border-white/10 bg-black/30 px-2",
                      "text-[12px] font-semibold text-white/85 outline-none",
                    )}
                  />

                  <div className="ml-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={commitInlineEdit}
                      className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-extrabold text-white/75 hover:bg-white/10"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={cancelInlineEdit}
                      className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-extrabold text-white/65 hover:bg-white/10"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                {isFolder && isOpen ? (
                  <div className="mt-[2px]">
                    <Tree parentId={n.id} depth={depth + 1} />
                  </div>
                ) : null}
              </div>
            );
          }

          const disableDelete =
            (n.kind === "file" && n.id === entryFileId) ||
            (n.kind === "folder" && subtreeIds(nodes, n.id).has(entryFileId));

          return (
            <div key={n.id}>
              <div
                className={cn(
                  "group flex h-8 items-center rounded-md px-2",
                  "border border-transparent",
                  "hover:bg-white/[0.06] hover:border-white/10",
                  isActive && "bg-white/[0.08] border-white/10",
                )}
                title={pathOf(nodes, n.id)}
              >
                <IndentGuides depth={depth} />

                {/* caret */}
                <button
                  type="button"
                  onClick={() => {
                    if (isFolder) toggleFolder(n.id);
                    else openFile(n.id);
                  }}
                  className={cn(
                    "grid h-6 w-6 place-items-center rounded-md",
                    "text-white/55 hover:text-white/85 hover:bg-white/[0.06]",
                    !isFolder && "opacity-0 pointer-events-none",
                    isFolder && !hasChildren && "opacity-40",
                  )}
                  title={isFolder ? (isOpen ? "Collapse" : "Expand") : ""}
                >
                  {isFolder ? (
                    isOpen ? (
                      <IconChevronDown className="h-4 w-4" />
                    ) : (
                      <IconChevronRight className="h-4 w-4" />
                    )
                  ) : null}
                </button>

                {/* icon */}
                <div className="grid h-6 w-6 place-items-center text-white/75">
                  {isFolder ? <IconFolder className="h-4 w-4" /> : <IconFile className="h-4 w-4" />}
                </div>

                {/* name */}
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => {
                    if (isFolder) toggleFolder(n.id);
                    else openFile(n.id);
                  }}
                >
                  <div className="truncate text-[12px] font-semibold text-white/85">{n.name}</div>
                </button>

                {/* entry badge */}
                {n.kind === "file" && isEntry ? (
                  <div
                    className="mr-1 flex items-center gap-1 rounded-md border border-emerald-300/25 bg-emerald-300/10 px-2 py-[2px] text-[10px] font-black text-white/85"
                    title="This file runs when you click Run"
                  >
                    <IconPlay className="h-3 w-3 text-emerald-200" />
                    ENTRY
                  </div>
                ) : null}

                {/* hover actions */}
                <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                  {isFolder ? (
                    <>
                      <button
                        type="button"
                        onClick={() => startNewFile(n.id)}
                        className="rounded-md border border-white/10 bg-white/5 p-1 text-white/70 hover:bg-white/10 hover:text-white/90"
                        title="New file"
                      >
                        <IconPlus className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => startNewFolder(n.id)}
                        className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-extrabold text-white/70 hover:bg-white/10"
                        title="New folder"
                      >
                        +Folder
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEntryFileId(n.id)}
                      className="rounded-md border border-emerald-300/20 bg-emerald-300/10 p-1 text-white/80 hover:bg-emerald-300/15"
                      title="Set as Entry"
                    >
                      <IconPlay className="h-4 w-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => startRename(n.id)}
                    className="rounded-md border border-white/10 bg-white/5 p-1 text-white/70 hover:bg-white/10 hover:text-white/90"
                    title="Rename"
                  >
                    <IconPencil className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => requestDelete(n.id)}
                    disabled={disableDelete}
                    className={cn(
                      "rounded-md border p-1",
                      disableDelete
                        ? "border-white/10 bg-white/5 text-white/35 cursor-not-allowed"
                        : "border-rose-300/20 bg-rose-300/10 text-white/85 hover:bg-rose-300/15",
                    )}
                    title={disableDelete ? "Can’t delete Entry / contains Entry" : "Delete"}
                  >
                    <IconTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {isFolder && isOpen ? (
                <div className="mt-[2px]">
                  <Tree parentId={n.id} depth={depth + 1} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    );
  }

  // top bar create at src by default
  const rootSrc = useMemo(() => {
    return nodes.find((n) => n.kind === "folder" && n.name === "src" && n.parentId === null) as FolderNode | undefined;
  }, [nodes]);

  return (
    <div id="ide-root" className="w-full rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      {/* toast */}
      {toast ? (
        <div
          className={cn(
            "mb-3 rounded-xl border px-3 py-2 text-xs font-extrabold",
            toast.kind === "error"
              ? "border-rose-300/25 bg-rose-300/10 text-rose-100"
              : "border-white/10 bg-white/5 text-white/80",
          )}
        >
          {toast.text}
        </div>
      ) : null}

      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-black text-white/90">{title}</div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="text-xs font-extrabold text-white/60">Language</div>
          {(["python", "java", "javascript", "c", "cpp"] as Lang[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => switchLanguage(l)}
              className={cn(
                "rounded-xl border px-3 py-1 text-xs font-extrabold transition",
                language === l
                  ? "border-emerald-300/30 bg-emerald-300/10 text-white/90"
                  : "border-white/10 bg-white/5 text-white/75 hover:bg-white/10",
              )}
            >
              {l}
            </button>
          ))}

          <div className="mx-2 hidden h-6 w-px bg-white/10 md:block" />

          <button
            type="button"
            onClick={() => startNewFile(rootSrc?.id ?? null)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs font-extrabold text-white/80 hover:bg-white/10"
          >
            + New file
          </button>

          <button
            type="button"
            onClick={() => startNewFolder(null)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs font-extrabold text-white/80 hover:bg-white/10"
          >
            + New folder
          </button>
        </div>
      </div>

      {/* Layout */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
        <div className="grid" style={{ gridTemplateColumns: `${leftPct}% 10px ${100 - leftPct}%` }}>
          {/* Left */}
          <div className="min-h-[560px] p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[11px] font-extrabold text-white/60">Explorer</div>
              <div className="text-[11px] font-extrabold text-white/50">
                entry:{" "}
                <span className="text-white/80">{entryFile ? pathOf(nodes, entryFile.id) : "—"}</span>
              </div>
            </div>

            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter…"
              className="mt-2 h-9 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-xs font-semibold text-white/80 outline-none"
            />

            <div className="mt-2">
              <Tree parentId={null} depth={0} />
            </div>

            <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3">
              <div className="text-[11px] font-extrabold text-white/60">stdin (workspace)</div>
              <textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder="Shared input (fed before interactive typed lines)…"
                className="mt-2 h-24 w-full resize-none rounded-xl border border-white/10 bg-black/30 p-2 text-xs text-white/80 outline-none"
              />
            </div>
          </div>

          {/* Divider */}
          <div
            onMouseDown={onMouseDownDivider}
            className="cursor-col-resize bg-white/5 hover:bg-white/10"
            title="Drag to resize"
          />

          {/* Right */}
          <div className="p-3">
            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {tabFiles.map((f) => {
                const active = f.id === activeFileId;
                return (
                  <div
                    key={f.id}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border px-3 py-1 text-xs font-extrabold",
                      active
                        ? "border-emerald-300/30 bg-emerald-300/10 text-white/90"
                        : "border-white/10 bg-white/5 text-white/75 hover:bg-white/10",
                    )}
                  >
                    <button type="button" onClick={() => setActiveFileId(f.id)} title={pathOf(nodes, f.id)}>
                      {f.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => closeTab(f.id)}
                      className="rounded-lg border border-white/10 bg-white/5 px-2 py-[2px] text-[10px] font-black text-white/70 hover:bg-white/10"
                      title="Close"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-3">
              {activeFile ? (
                <CodeRunner
                  title={pathOf(nodes, activeFile.id)}
                  height={height}
                  language={language}
                  onChangeLanguage={switchLanguage}
                  code={activeFile.content}
                  onChangeCode={onChangeCode}
                  stdin={stdin}
                  onChangeStdin={setStdin}
                  showLanguagePicker={false}
                  allowReset={false}
                  allowRun={true}
                  resetTerminalOnRun={true}
                  resetStdinOnRun={false}
                  onRun={onRunProject}
                />
              ) : (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-6 text-sm font-extrabold text-white/70">
                  No file selected.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete modal */}
      {pendingDeleteId ? (
        <div className="fixed inset-0 z-[999] grid place-items-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0f14] p-4">
            <div className="text-sm font-black text-white/90">Delete</div>
            <div className="mt-2 text-xs font-semibold text-white/70">
              Delete{" "}
              <span className="font-extrabold text-white/85">
                {nodes.find((x) => x.id === pendingDeleteId)?.name ?? "this item"}
              </span>
              ?
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingDeleteId(null)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/70 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => performDelete(pendingDeleteId)}
                className="rounded-xl border border-rose-300/25 bg-rose-300/10 px-3 py-2 text-xs font-extrabold text-white/85 hover:bg-rose-300/15"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
