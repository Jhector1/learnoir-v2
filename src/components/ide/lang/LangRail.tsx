"use client";

import React, {useMemo, useState} from "react";
import type {Lang} from "@/lib/code/runCode";
import {
    SiPython,


    SiJavascript,
    SiC,
    SiCplusplus,
} from "react-icons/si";
// import {AiOutlineJava} from "react-icons/ai";
import {FaJava} from "react-icons/fa6";

function cn(...cls: Array<string | false | undefined | null>) {
    return cls.filter(Boolean).join(" ");
}

type LangItem = {
    id: Lang;
    label: string;
    desc: string;
    Icon: React.ComponentType<{ className?: string }>;
};

export const LANGS: LangItem[] = [
    {id: "python", label: "Python", desc: "Best for quick practice", Icon: SiPython},
    {id: "java", label: "Java", desc: "OOP + interviews", Icon: FaJava},
    {id: "javascript", label: "JavaScript", desc: "Web scripting", Icon: SiJavascript},
    {id: "c", label: "C", desc: "Low-level fundamentals", Icon: SiC},
    {id: "cpp", label: "C++", desc: "Performance + STL", Icon: SiCplusplus},
];

export function LangRail(props: {
    lang: Lang;
    setLang: (l: Lang) => void;
}) {
    const {lang, setLang} = props;
    const [collapsed, setCollapsed] = useState(true);

    return (
        <aside
            className={cn(
                "min-h-0 ui-navcard-unround overflow-hidden",
                "transition-[width] duration-300 ease-out",
                collapsed ? "w-[72px]" : "w-[260px]",
            )}
        >
            <div className="h-full min-h-0 flex flex-col">
                {/* Header */}
                <div className="p-3 border-b border-neutral-200/70 dark:border-white/10">
                    <div className="flex items-center justify-between gap-2">
                        <div className={cn("min-w-0", collapsed && "hidden")}>
                            <div className="text-xs font-extrabold text-neutral-600 dark:text-white/60">
                                Languages
                            </div>
                            <div className="text-[10px] font-black text-neutral-400 dark:text-white/40">
                                click to switch
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setCollapsed((v) => !v)}
                            className={cn(
                                "grid h-9 w-9 place-items-center rounded-xl border",
                                "border-neutral-200 bg-white hover:bg-neutral-50",
                                "dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.06]",
                            )}
                            title={collapsed ? "Expand" : "Collapse"}
                        >
              <span className="text-sm font-black text-neutral-700 dark:text-white/80">
                {collapsed ? "»" : "«"}
              </span>
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="min-h-0 flex-1 overflow-auto p-2">
                    <div className="space-y-2">
                        {LANGS.map((l) => {
                            const on = l.id === lang;
                            const Icon = l.Icon;

                            return (
                                <button
                                    key={l.id}
                                    type="button"
                                    onClick={() => setLang(l.id)}
                                    className={cn(
                                        "w-full rounded-2xl border text-left transition",
                                        "flex items-center gap-3",
                                        collapsed ? "px-2 py-2 justify-center" : "px-3 py-3",
                                        on
                                            ? "border-emerald-600/25 bg-emerald-500/10"
                                            : "border-neutral-200 bg-white hover:bg-neutral-50 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.06]",
                                    )}
                                    title={collapsed ? l.label : undefined}
                                >
                                    {/* Icon */}
                                    <div
                                        className={cn(
                                            "grid place-items-center rounded-xl border",
                                            "border-neutral-200/70 dark:border-white/10",
                                            on
                                                ? "bg-emerald-500/10"
                                                : "bg-neutral-50 dark:bg-white/[0.04]",
                                            collapsed ? "h-10 w-10" : "h-10 w-10",
                                        )}
                                    >
                                        <Icon
                                            className={cn(
                                                "h-5 w-5",
                                                on ? "text-emerald-700 dark:text-emerald-300" : "text-neutral-700 dark:text-white/75",
                                            )}
                                        />
                                    </div>

                                    {/* Text */}
                                    {!collapsed ? (
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <div
                                                    className={cn(
                                                        "text-sm font-black truncate",
                                                        on ? "text-neutral-900 dark:text-white/90" : "text-neutral-800 dark:text-white/80",
                                                    )}
                                                >
                                                    {l.label}
                                                </div>

                                                <div
                                                    className={cn(
                                                        "shrink-0 rounded-lg border px-2 py-[2px] text-[10px] font-black",
                                                        on
                                                            ? "border-emerald-600/25 bg-emerald-500/10 text-neutral-900 dark:text-white/85"
                                                            : "border-neutral-200 bg-white text-neutral-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/55",
                                                    )}
                                                >
                                                    {l.id}
                                                </div>
                                            </div>

                                            <div
                                                className={cn(
                                                    "mt-1 text-xs font-semibold truncate",
                                                    on ? "text-neutral-600 dark:text-white/70" : "text-neutral-500 dark:text-white/50",
                                                )}
                                            >
                                                {l.desc}
                                            </div>
                                        </div>
                                    ) : null}
                                </button>
                            );
                        })}
                    </div>

                    {!collapsed ? (
                        <div className="mt-3 ui-soft p-3">
                            <div className="text-[11px] font-extrabold text-neutral-600 dark:text-white/60">
                                Tip
                            </div>
                            <div className="mt-1 text-xs font-semibold text-neutral-600 dark:text-white/60">
                                Each language keeps its own workspace.
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </aside>
    );
}
