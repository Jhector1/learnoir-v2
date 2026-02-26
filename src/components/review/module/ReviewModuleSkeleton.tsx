"use client";

import React from "react";
import { cn } from "@/lib/cn";

function Skel({ className }: { className?: string }) {
    return <div aria-hidden className={cn("ui-skel", className)} />;
}

export default function ReviewModuleSkeleton(props: {
    leftCollapsed: boolean;
    rightCollapsed: boolean;
    leftW: number;
    rightW: number;
}) {
    const { leftCollapsed, rightCollapsed, leftW, rightW } = props;

    return (
        <div className="h-full w-full p-3 md:p-4">
            <div className="h-full flex gap-3">
                {/* LEFT */}
                <aside
                    className={cn(
                        "h-full transition-[width] duration-300 ease-out overflow-hidden",
                        leftCollapsed && "w-0"
                    )}
                    style={{ width: leftCollapsed ? 0 : leftW }}
                >
                    <div className="h-full rounded-2xl border border-neutral-200/70 bg-white/70 p-3 backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
                        <div className="flex items-center gap-3">
                            <Skel className="h-10 w-10 rounded-2xl" />
                            <div className="min-w-0 flex-1 space-y-2">
                                <Skel className="h-4 w-40" />
                                <Skel className="h-3 w-24" />
                            </div>
                            <Skel className="h-8 w-8 rounded-xl" />
                        </div>

                        <div className="mt-4 space-y-2">
                            <Skel className="h-2 w-full rounded-full" />
                            <div className="flex items-center justify-between">
                                <Skel className="h-3 w-16" />
                                <Skel className="h-3 w-10" />
                            </div>
                        </div>

                        <div className="mt-5 space-y-2">
                            {Array.from({ length: 7 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="rounded-xl border border-neutral-200/60 bg-white/60 p-2 dark:border-white/10 dark:bg-white/[0.03]"
                                >
                                    <div className="flex items-center gap-2">
                                        <Skel className="h-7 w-7 rounded-lg" />
                                        <div className="min-w-0 flex-1 space-y-2">
                                            <Skel
                                                className={cn(
                                                    "h-3",
                                                    i % 3 === 0 ? "w-40" : i % 3 === 1 ? "w-32" : "w-44"
                                                )}
                                            />
                                            <Skel
                                                className={cn(
                                                    "h-3 opacity-70",
                                                    i % 2 === 0 ? "w-24" : "w-20"
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-5 space-y-2">
                            <div className="rounded-xl border border-neutral-200/60 bg-white/60 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                                <Skel className="h-4 w-32" />
                                <Skel className="mt-2 h-3 w-40 opacity-70" />
                                <Skel className="mt-3 h-10 w-full rounded-xl" />
                            </div>

                            <Skel className="h-10 w-full rounded-xl" />
                            <Skel className="h-10 w-full rounded-xl" />
                        </div>
                    </div>
                </aside>

                {!leftCollapsed ? (
                    <div className="w-2 rounded-xl bg-neutral-200/60 dark:bg-white/5" />
                ) : null}

                {/* MAIN */}
                <main className="flex-1 min-w-0 h-full overflow-hidden">
                    <div className="rounded-2xl border border-neutral-200/70 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1 space-y-2">
                                <Skel className="h-7 w-72 max-w-[70vw]" />
                                <Skel className="h-4 w-[32rem] max-w-[80vw] opacity-80" />
                            </div>

                            <div className="flex items-center gap-2">
                                <Skel className="h-9 w-20 rounded-xl" />
                                <Skel className="h-9 w-24 rounded-xl" />
                                <Skel className="h-9 w-10 rounded-xl" />
                                <Skel className="h-9 w-10 rounded-xl" />
                            </div>
                        </div>

                        <div className="mt-4 grid gap-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="rounded-2xl border border-neutral-200/60 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-2">
                                            <Skel className={cn("h-4", i % 2 === 0 ? "w-56" : "w-64")} />
                                            <Skel className={cn("h-3 opacity-80", i % 3 === 0 ? "w-80" : "w-72")} />
                                        </div>
                                        <Skel className="h-8 w-20 rounded-xl" />
                                    </div>

                                    <Skel
                                        className={cn(
                                            "mt-4 rounded-xl",
                                            i % 3 === 0 ? "h-28" : i % 3 === 1 ? "h-36" : "h-24"
                                        )}
                                    />

                                    <div className="mt-3 flex gap-2">
                                        <Skel className="h-9 w-24 rounded-xl" />
                                        <Skel className="h-9 w-28 rounded-xl" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>

                {!rightCollapsed ? (
                    <div className="w-2 rounded-xl bg-neutral-200/60 dark:bg-white/5" />
                ) : null}

                {/* RIGHT */}
                <aside
                    className={cn(
                        "h-full transition-[width] duration-300 ease-out overflow-hidden",
                        rightCollapsed && "w-0"
                    )}
                    style={{ width: rightCollapsed ? 0 : rightW }}
                >
                    <div className="h-full rounded-2xl border border-neutral-200/70 bg-white/70 p-3 backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
                        <div className="flex items-center justify-between gap-2">
                            <Skel className="h-5 w-28" />
                            <Skel className="h-8 w-8 rounded-xl" />
                        </div>

                        <div className="mt-3 flex gap-2">
                            <Skel className="h-8 w-20 rounded-xl" />
                            <Skel className="h-8 w-20 rounded-xl" />
                            <Skel className="h-8 w-20 rounded-xl" />
                        </div>

                        <Skel className="mt-4 h-52 w-full rounded-2xl" />
                        <Skel className="mt-3 h-32 w-full rounded-2xl" />

                        <div className="mt-3 space-y-2">
                            <Skel className="h-10 w-full rounded-xl" />
                            <Skel className="h-10 w-full rounded-xl" />
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}