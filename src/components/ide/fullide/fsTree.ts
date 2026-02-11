import type { FSNode, FileNode, NodeId } from "./types";

export function ensureUniqueSiblingName(nodes: FSNode[], parentId: NodeId | null, desired: string) {
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

export function childrenOf(nodes: FSNode[], parentId: NodeId | null) {
    return nodes
        .filter((n) => n.parentId === parentId)
        .slice()
        .sort((a, b) => {
            if (a.kind !== b.kind) return a.kind === "folder" ? -1 : 1;
            return a.name.localeCompare(b.name);
        });
}

export function findFile(nodes: FSNode[], id: NodeId) {
    const n = nodes.find((x) => x.id === id);
    return n && n.kind === "file" ? (n as FileNode) : null;
}

export function subtreeIds(nodes: FSNode[], rootId: NodeId) {
    const out = new Set<NodeId>();
    const stack = [rootId];
    while (stack.length) {
        const cur = stack.pop()!;
        out.add(cur);
        for (const child of nodes.filter((x) => x.parentId === cur)) stack.push(child.id);
    }
    return out;
}

export function isSafeRelPath(p: string) {
    return p && !p.startsWith("/") && !p.includes("..");
}

export function pathOf(nodes: FSNode[], id: NodeId): string {
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

export function exportProjectFiles(nodes: FSNode[]): Array<{ path: string; content: string }> {
    const files = nodes.filter((n): n is FileNode => n.kind === "file");
    const out = files.map((f) => ({ path: pathOf(nodes, f.id), content: f.content ?? "" }));
    for (const f of out) {
        if (!isSafeRelPath(f.path)) throw new Error(`Unsafe file path: ${f.path}`);
    }
    return out;
}
