import type { Lang } from "@/lib/code/runCode";

export type NodeId = string;

export type FolderNode = {
    id: NodeId;
    kind: "folder";
    name: string;
    parentId: NodeId | null;
    createdAt: number;
    updatedAt: number;
};

export type FileNode = {
    id: NodeId;
    kind: "file";
    name: string;
    parentId: NodeId | null;
    content: string;
    createdAt: number;
    updatedAt: number;
};

export type FSNode = FolderNode | FileNode;

export type WorkspaceStateV2 = {
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

export type InlineEdit =
    | {
    mode: "new-file" | "new-folder" | "rename";
    parentId: NodeId | null;
    targetId?: NodeId;
    value: string;
}
    | null;

export type Toast = { kind: "info" | "error"; text: string } | null;
