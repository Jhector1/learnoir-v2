"use client";

import React from "react";
import type { FileNode, FSNode, NodeId } from "./types";
import { cn } from "./utils";
import { pathOf } from "./fsTree";

export default function TabsBar(props: {
    nodes: FSNode[];
    tabFiles: FileNode[];
    activeFileId: NodeId;
    setActiveFileId: (id: NodeId) => void;
    closeTab: (id: NodeId) => void;
}) {
    const { nodes, tabFiles, activeFileId, setActiveFileId, closeTab } = props;

    return (
        <div className="flex flex-wrap items-center gap-2">
            {tabFiles.map((f) => {
                const active = f.id === activeFileId;
                return (
                    <div
                        key={f.id}
                        className={cn(
                            "flex items-center gap-2 rounded-xl border px-3 py-1 text-xs font-extrabold",
                            active
                                ? "border-emerald-600/25 bg-emerald-500/10 text-emerald-950 dark:border-emerald-300/30 dark:bg-emerald-300/10 dark:text-white/90"
                                : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/75 dark:hover:bg-white/[0.10]",
                        )}
                    >
                        <button type="button" onClick={() => setActiveFileId(f.id)} title={pathOf(nodes, f.id)}>
                            {f.name}
                        </button>
                        <button
                            type="button"
                            onClick={() => closeTab(f.id)}
                            className="rounded-lg border border-neutral-200 bg-white px-2 py-[2px] text-[10px] font-black text-neutral-600 hover:bg-neutral-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/70 dark:hover:bg-white/[0.10]"
                            title="Close"
                        >
                            ×
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
