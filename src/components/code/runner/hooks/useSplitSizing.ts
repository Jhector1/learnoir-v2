"use client";

import * as React from "react";
import type { TerminalDock } from "../types";
import { clamp } from "../utils/text";

export function useSplitSizing(args: {
    // Total available height for the editor+terminal region
    height: number;

    showEditor: boolean;
    showTerminal: boolean;
    dock: TerminalDock;
    disabled: boolean;
    initialTerminalSize?: number;

    mainRef: React.RefObject<HTMLDivElement | null>;
    requestLayout: () => void;

    splitPx?: number;

    minEditorH?: number;
    minTermH?: number;
    minEditorW?: number;
    minTermW?: number;

    hardMinEditorH?: number;
    hardMinTermH?: number;
    hardMinEditorW?: number;
    hardMinTermW?: number;
}) {
    const {
        height,
        showEditor,
        showTerminal,
        dock,
        disabled,
        initialTerminalSize = 240,
        mainRef,
        requestLayout,

        splitPx = 8,

        minEditorH = 160,
        minTermH = 140,
        minEditorW = 320,
        minTermW = 240,

        hardMinEditorH = 80,
        hardMinTermH = 80,
        hardMinEditorW = 180,
        hardMinTermW = 180,
    } = args;

    const hasSplit = showEditor && showTerminal;

    // Measure real container size (critical inside tools panel)
    const [mainW, setMainW] = React.useState(0);
    const [mainH, setMainH] = React.useState(0);

    React.useEffect(() => {
        const el = mainRef.current;
        if (!el) return;

        const update = () => {
            const r = el.getBoundingClientRect();
            setMainW(r.width);
            setMainH(r.height);
        };

        const ro = new ResizeObserver(update);
        ro.observe(el);
        update();

        return () => ro.disconnect();
    }, [mainRef]);

    const totalH = Math.max(0, mainH || height);
    const totalW = Math.max(0, mainW || 0);

    // Manual size state (only used AFTER user drags)
    const [termH, setTermH] = React.useState<number>(() =>
        clamp(initialTerminalSize, hardMinTermH, 720),
    );
    const [termW, setTermW] = React.useState<number>(() =>
        clamp(initialTerminalSize, hardMinTermW, 960),
    );

    // ✅ Auto 50/50 until the user drags
    const userResizedRef = React.useRef(false);

    // --- bounds ---
    const bottomMaxTerm = hasSplit
        ? getBottomMaxTerm({
            totalH,
            splitPx,
            minEditorH,
            minTermH,
            hardMinEditorH,
            hardMinTermH,
        })
        : totalH;

    const rightMaxTerm = hasSplit
        ? getRightMaxTerm({
            totalW,
            splitPx,
            minEditorW,
            minTermW,
            hardMinEditorW,
            hardMinTermW,
        })
        : termW;

    // --- effective terminal sizes ---
    const autoHalfH = (totalH - splitPx) / 2;
    const autoHalfW = (totalW - splitPx) / 2;

    const effectiveTermH = hasSplit
        ? userResizedRef.current
            ? clamp(termH, hardMinTermH, bottomMaxTerm)
            : clamp(autoHalfH, hardMinTermH, bottomMaxTerm)
        : 0;

    const effectiveTermW = hasSplit
        ? userResizedRef.current
            ? clamp(termW, hardMinTermW, rightMaxTerm)
            : clamp(autoHalfW, hardMinTermW, rightMaxTerm)
        : clamp(termW, hardMinTermW, rightMaxTerm);

    // computed allocations (bottom dock)
    const bottomTermH = effectiveTermH;
    const bottomEditorH = hasSplit
        ? Math.max(hardMinEditorH, totalH - splitPx - bottomTermH)
        : totalH;

    const rightTotalH = totalH;

    // ---------------- drag logic ----------------
    const splitDragRef = React.useRef<{
        startX: number;
        startY: number;
        startSize: number;
        dock: TerminalDock;
    } | null>(null);

    function onMouseDownSplit(e: React.MouseEvent) {
        if (disabled) return;
        e.preventDefault();

        userResizedRef.current = true; // ✅ lock into manual sizing once user touches it

        splitDragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            startSize: dock === "bottom" ? effectiveTermH : effectiveTermW, // ✅ use effective (auto/locked)
            dock,
        };

        const prevSelect = document.body.style.userSelect;
        const prevCursor = document.body.style.cursor;
        document.body.style.userSelect = "none";
        document.body.style.cursor = dock === "bottom" ? "row-resize" : "col-resize";

        const onMove = (ev: MouseEvent) => {
            const d = splitDragRef.current;
            if (!d) return;

            if (d.dock === "bottom") {
                const dy = ev.clientY - d.startY;

                const maxTerm = getBottomMaxTerm({
                    totalH,
                    splitPx,
                    minEditorH,
                    minTermH,
                    hardMinEditorH,
                    hardMinTermH,
                });

                // ✅ Drag UP => terminal grows. Drag DOWN => terminal shrinks.
                const next = clamp(d.startSize - dy, hardMinTermH, maxTerm);
                setTermH(next);
            } else {
                const dx = ev.clientX - d.startX;

                const maxTerm = getRightMaxTerm({
                    totalW,
                    splitPx,
                    minEditorW,
                    minTermW,
                    hardMinEditorW,
                    hardMinTermW,
                });

                // ✅ Drag LEFT => terminal grows. Drag RIGHT => terminal shrinks.
                const next = clamp(d.startSize - dx, hardMinTermW, maxTerm);
                setTermW(next);
            }

            requestLayout();
        };

        const onUp = () => {
            splitDragRef.current = null;
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
            document.body.style.userSelect = prevSelect;
            document.body.style.cursor = prevCursor;
        };

        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
    }

    return {
        splitPx,

        // exposed sizes (these are what CodeRunner should use)
        termH: effectiveTermH,
        termW: effectiveTermW,

        // setters (manual mode)
        setTermH,
        setTermW,

        // totals
        bottomTotalH: totalH,
        rightTotalH,

        // allocations
        bottomTermH,
        bottomEditorH,

        // measured
        mainW,
        mainH,

        // handler
        onMouseDownSplit,
    };
}

// ---------------- helpers ----------------

function getBottomMaxTerm(args: {
    totalH: number;
    splitPx: number;
    minEditorH: number;
    minTermH: number;
    hardMinEditorH: number;
    hardMinTermH: number;
}) {
    const { totalH, splitPx, minEditorH, minTermH, hardMinEditorH, hardMinTermH } = args;

    const minEditorEff = Math.min(
        minEditorH,
        Math.max(hardMinEditorH, totalH - splitPx - hardMinTermH),
    );
    const minTermEff = Math.min(
        minTermH,
        Math.max(hardMinTermH, totalH - splitPx - hardMinEditorH),
    );

    const maxTerm = Math.max(hardMinTermH, totalH - splitPx - minEditorEff);
    return Math.max(minTermEff, maxTerm);
}

function getRightMaxTerm(args: {
    totalW: number;
    splitPx: number;
    minEditorW: number;
    minTermW: number;
    hardMinEditorW: number;
    hardMinTermW: number;
}) {
    const { totalW, splitPx, minEditorW, minTermW, hardMinEditorW, hardMinTermW } = args;

    const minEditorEff = Math.min(
        minEditorW,
        Math.max(hardMinEditorW, totalW - splitPx - hardMinTermW),
    );
    const minTermEff = Math.min(
        minTermW,
        Math.max(hardMinTermW, totalW - splitPx - hardMinEditorW),
    );

    const maxTerm = Math.max(hardMinTermW, totalW - splitPx - minEditorEff);
    return Math.max(minTermEff, maxTerm || hardMinTermW);
}
