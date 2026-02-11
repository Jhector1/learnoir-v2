"use client";

import React from "react";
import type { FSNode, NodeId } from "./types";

export default function DeleteModal(props: {
    nodes: FSNode[];
    pendingDeleteId: NodeId;
    onCancel: () => void;
    onDelete: () => void;
}) {
    const n = props.nodes.find((x) => x.id === props.pendingDeleteId);

    return (
        <div className="fixed inset-0 z-[999] grid place-items-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-4 dark:border-white/10 dark:bg-[#0b0f14]">
                <div className="text-sm font-black text-neutral-900 dark:text-white/90">Delete</div>
                <div className="mt-2 text-xs font-semibold text-neutral-600 dark:text-white/70">
                    Delete <span className="font-extrabold text-neutral-900 dark:text-white/85">{n?.name ?? "this item"}</span>?
                </div>

                <div className="mt-4 flex items-center justify-end gap-2">
                    <button type="button" onClick={props.onCancel} className="ui-quiz-action ui-quiz-action--ghost">
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={props.onDelete}
                        className="rounded-xl border border-rose-300/25 bg-rose-300/10 px-3 py-2 text-xs font-extrabold text-rose-900 hover:bg-rose-300/15 dark:text-white/90"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
