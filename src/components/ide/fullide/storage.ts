import type { Lang } from "@/lib/code/runCode";
import type { FSNode, WorkspaceStateV2 } from "./types";
import { uid } from "./utils";
import { defaultMainFile, defaultMainCode } from "./languageDefaults";

export const STORAGE_KEY_V2 = "learnoir.ide.workspace.v2";
export const STORAGE_KEY_V1 = "learnoir.ide.workspace.v1";

export function loadV2(storageKey: string): WorkspaceStateV2 | null {
    try {
        const raw = localStorage.getItem(storageKey);
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

export function saveV2(storageKey: string, ws: WorkspaceStateV2) {
    try {
        localStorage.setItem(storageKey, JSON.stringify(ws));
    } catch {}
}


export function tryMigrateV1(): WorkspaceStateV2 | null {
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
                content: String(f.content ?? defaultMainCode(language)),
                createdAt: Date.now(),
                updatedAt: Date.now(),
            })),
        ];

        const fileIds = nodes.filter((n: any) => n.kind === "file").map((f: any) => f.id);
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
