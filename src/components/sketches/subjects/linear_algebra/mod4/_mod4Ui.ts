// src/components/review/sketches/linear_algebra/mod4/_mod4Ui.ts
"use client";

import { useEffect, useRef, useState } from "react";

export function cn(...cls: Array<string | false | undefined | null>) {
    return cls.filter(Boolean).join(" ");
}

// shared “theme-aware” surfaces (match your homepage/billing style)
export const CARD =
    "rounded-2xl border border-neutral-200/70 bg-white/80 shadow-sm overflow-hidden " +
    "dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none";

export const PANEL =
    "rounded-2xl border border-neutral-200/70 bg-white/70 shadow-sm p-4 " +
    "dark:border-white/10 dark:bg-black/20 dark:shadow-none";

export function useSideBySide(minWidth = 760) {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const [sideBySide, setSideBySide] = useState(false);

    useEffect(() => {
        const el = rootRef.current;
        if (!el) return;

        const ro = new ResizeObserver(([entry]) => {
            setSideBySide(entry.contentRect.width >= minWidth);
        });

        ro.observe(el);
        return () => ro.disconnect();
    }, [minWidth]);

    return { rootRef, sideBySide };
}
