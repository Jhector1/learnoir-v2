"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { ListIcon } from "lucide-react";

import type { Lang } from "@/lib/code/runCode";

import { cx } from "./utils/cx";
import ToolTabs from "./ToolTabs";
import { TOOL_SPECS } from "./registry";
import type { ToolsCtx, ToolId } from "./types";
import { useActiveTool } from "./hooks/useActiveTool";

const PANE_ANIM = {
    show: { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" },
    hide: { opacity: 0, scale: 0.985, y: 6, filter: "blur(2px)" },
};

const PANE_TRANSITION = { duration: 0.18, ease: [0.2, 0.8, 0.2, 1] as const };

export default function ToolsPanel(props: {
    onCollapse: () => void;
    onUnbind?: () => void;
    boundId?: string | null;

    rightBodyRef: React.RefObject<HTMLDivElement | null>;
    codeRunnerRegionH: number;

    toolLang: Lang;
    toolCode: string;
    toolStdin: string;

    onChangeLang: (l: Lang) => void;
    onChangeCode: (c: string) => void;
    onChangeStdin: (s: string) => void;

    // ✅ required for notes saving
    subjectSlug: string;
    moduleId: string;
    locale: string;

    // ✅ policy from subject
    codeEnabled: boolean;
}) {
    const ctx: ToolsCtx = useMemo(
        () => ({
            subjectSlug: props.subjectSlug,
            moduleId: props.moduleId,
            locale: props.locale,
            boundId: props.boundId ?? null,
            codeEnabled: props.codeEnabled,
        }),
        [props.subjectSlug, props.moduleId, props.locale, props.boundId, props.codeEnabled]
    );

    const { active, setActive } = useActiveTool(ctx);

    const scopeKey = props.boundId ? `exercise:${props.boundId}` : "general";

    const noteKey = useMemo(
        () => ({
            subjectSlug: props.subjectSlug,
            moduleId: props.moduleId,
            locale: props.locale,
            toolId: "notes",
            scopeKey,
        }),
        [props.subjectSlug, props.moduleId, props.locale, scopeKey]
    );

    // Keep-mounted tools render always (hidden/shown via animation)
    const keepMounted = TOOL_SPECS.filter((t) => t.keepMounted);

    return (
        <div className="h-full ui-card overflow-hidden flex flex-col">
            <div className="shrink-0 p-3 border-b border-neutral-200 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-black/30">
                <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                        <div className="text-sm font-black text-neutral-800 dark:text-white/80">
                            Tools
                        </div>

                        {props.boundId ? (
                            <div className="mt-1 text-[11px] font-extrabold text-neutral-600 dark:text-white/60">
                                Bound to: <span className="font-black">{props.boundId}</span>
                                {props.onUnbind ? (
                                    <button
                                        type="button"
                                        onClick={props.onUnbind}
                                        className="ml-2 underline underline-offset-2"
                                    >
                                        Unbind
                                    </button>
                                ) : null}
                            </div>
                        ) : (
                            <div className="mt-1 text-[11px] font-extrabold text-neutral-600 dark:text-white/60">
                                Not bound
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <ToolTabs
                            ctx={ctx}
                            value={active}
                            onChange={(v: ToolId) => {
                                const spec = TOOL_SPECS.find((t) => t.id === v);
                                if (!spec) return;
                                if (!spec.enabled(ctx)) return;
                                setActive(v);
                            }}
                        />

                        <button
                            type="button"
                            className="ui-btn ui-btn-secondary px-3 py-2 text-[11px] font-extrabold"
                            title="Collapse tools"
                            onClick={props.onCollapse}
                        >
                            <ListIcon />
                        </button>
                    </div>
                </div>
            </div>

            <div ref={props.rightBodyRef} className="flex-1 min-h-0 overflow-hidden p-3">
                <div className="relative h-full min-h-0">
                    {keepMounted.map((spec) => {
                        const isActive = active === spec.id;

                        // Render props per tool (keeps each tool isolated)
                        const pane =
                            spec.id === "code"
                                ? spec.render({
                                    height: props.codeRunnerRegionH,
                                    toolLang: props.toolLang,
                                    toolCode: props.toolCode,
                                    toolStdin: props.toolStdin,
                                    onChangeCode: props.onChangeCode,
                                    onChangeStdin: props.onChangeStdin,
                                })
                                : spec.id === "notes"
                                    ? spec.render({ noteKey, format: "markdown" })
                                    : null;

                        return (
                            <motion.div
                                key={spec.id}
                                className={cx("absolute inset-0", isActive ? "" : "")}
                                variants={PANE_ANIM}
                                animate={isActive ? "show" : "hide"}
                                transition={PANE_TRANSITION}
                                style={{ pointerEvents: isActive ? "auto" : "none" }}
                                aria-hidden={!isActive}
                            >
                                {/* if code is disabled, show a friendly card */}
                                {spec.id === "code" && !ctx.codeEnabled ? (
                                    <div className="h-full rounded-xl border border-neutral-200 p-4 text-sm text-neutral-700 dark:border-white/10 dark:text-white/70">
                                        Code tool is disabled for this subject.
                                    </div>
                                ) : (
                                    pane
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}