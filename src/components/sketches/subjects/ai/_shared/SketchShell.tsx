"use client";

import React from "react";
import { cn, SHELL } from "./aiUi";

export default function SketchShell({
                                        height = 420,
                                        left,
                                        right,
                                    }: {
    height?: number;
    left: React.ReactNode;
    right?: React.ReactNode;
}) {
    return (
        <div className="w-full" style={{ minHeight: height }}>
            <div className={cn("grid gap-3", right ? "md:grid-cols-[1fr_360px]" : "")}>
                <section className={cn(SHELL)}>{left}</section>
                {right ? <aside className={cn(SHELL)}>{right}</aside> : null}
            </div>
        </div>
    );
}
