import type { FSNode, NodeId } from "./types";
import { childrenOf as _childrenOf, pathOf as _pathOf } from "./fsTree";

export const childrenOf = _childrenOf;
export const pathOf = _pathOf;

export function nodeMatchesFilterFactory(nodes: FSNode[], filterLower: string) {
    return (id: NodeId) => {
        if (!filterLower) return true;
        const p = _pathOf(nodes, id).toLowerCase();
        return p.includes(filterLower);
    };
}

export function folderHasMatchFactory(nodes: FSNode[], nodeMatchesFilter: (id: NodeId) => boolean) {
    return (folderId: NodeId): boolean => {
        const kids = _childrenOf(nodes, folderId);
        for (const k of kids) {
            if (nodeMatchesFilter(k.id)) return true;
            if (k.kind === "folder" && folderHasMatchFactory(nodes, nodeMatchesFilter)(k.id)) return true;
        }
        return false;
    };
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
