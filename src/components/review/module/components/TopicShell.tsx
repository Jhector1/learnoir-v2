// src/components/review/module/components/TopicShell.tsx
"use client";

import React from "react";

export default function TopicShell(props: {
    title: string;
    subtitle?: string | null;
    right?: React.ReactNode;
    children: React.ReactNode;
}) {
    const { title, subtitle, right, children } = props;

    return (
        <section className="min-h-full">
            {/* ✅ STICKY HEADER (OPAQUE + ALWAYS ON TOP) */}
            <div className="sticky top-0 z-[9999] isolate">
                <div className="bg-white dark:bg-neutral-950">
                    <div className="mb-3 rounded-2xl border border-neutral-200 p-3 shadow-sm dark:border-white/10">
                        {/* ✅ always row: buttons have priority, title wraps */}
                        <div className="flex items-start justify-between gap-3">
                            {/* LEFT: flexible, can shrink and wrap */}
                            <div className="min-w-0 flex-1">
                                <div className="text-sm font-black tracking-tight text-neutral-900 dark:text-white/90 whitespace-normal break-words">
                                    {title}
                                </div>

                                {subtitle ? (
                                    <div className="mt-1 text-xs font-extrabold text-neutral-600 dark:text-white/60 whitespace-normal break-words">
                                        {subtitle}
                                    </div>
                                ) : null}
                            </div>

                            {/* RIGHT: fixed, never wraps, never scrolls */}
                            {right ? (
                                <div className="shrink-0 flex items-center gap-2 flex-nowrap whitespace-nowrap [&>button]:whitespace-nowrap">
                                    {right}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div className="relative z-0">{children}</div>
        </section>
    );
}
