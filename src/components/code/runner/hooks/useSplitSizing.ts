"use client";

import * as React from "react";
import type { TerminalDock } from "../types";
import { clamp } from "../utils/text";

export function useSplitSizing(args: {
    height: number;
    showEditor: boolean;
    showTerminal: boolean;
    dock: TerminalDock;
    disabled: boolean;
    initialTerminalSize?: number;
    mainRef: React.RefObject<HTMLDivElement | null>;
    requestLayout: () => void;

    // constants (optional overrides)
    splitPx?: number;
    minEditorH?: number;
    minTermH?: number;
    minEditorW?: number;
    minTermW?: number;
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
    } = args;

    const [termH, setTermH] = React.useState<number>(clamp(initialTerminalSize, minTermH, 520));
    const [termW, setTermW] = React.useState<number>(clamp(initialTerminalSize, minTermW, 720));

    const [bottomTotalH, setBottomTotalH] = React.useState<number>(() => {
        if (!(showEditor && showTerminal)) return height;
        return height + clamp(initialTerminalSize, minTermH, 520) + splitPx;
    });

    React.useEffect(() => {
        if (!(showEditor && showTerminal)) {
            setBottomTotalH(height);
            return;
        }
        setBottomTotalH(() => height + termH + splitPx);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [height]);

    const [mainW, setMainW] = React.useState<number>(0);

    React.useEffect(() => {
        const el = mainRef.current;
        if (!el) return;

        const update = () => setMainW(el.getBoundingClientRect().width);
        const ro = new ResizeObserver(update);
        ro.observe(el);
        update();

        return () => ro.disconnect();
    }, [mainRef]);

    const splitDragRef = React.useRef<{
        startX: number;
        startY: number;
        startSize: number;
        dock: TerminalDock;
    } | null>(null);

    function onMouseDownSplit(e: React.MouseEvent) {
        if (disabled) return;
        e.preventDefault();

        splitDragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            startSize: dock === "bottom" ? termH : termW,
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
                const maxTerm = Math.max(minTermH, bottomTotalH - splitPx - minEditorH);
                const next = clamp(d.startSize - dy, minTermH, maxTerm);
                setTermH(next);
            } else {
                const dx = ev.clientX - d.startX;
                const available = mainW || 0;
                const maxTerm = Math.max(minTermW, available - 2 - minEditorW);
                const next = clamp(d.startSize - dx, minTermW, maxTerm || 720);
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

    const bottomMaxTerm = Math.max(minTermH, bottomTotalH - splitPx - minEditorH);
    const bottomTermH = clamp(termH, minTermH, bottomMaxTerm);
    const bottomEditorH = Math.max(minEditorH, bottomTotalH - splitPx - bottomTermH);

    // ✅ Right dock uses same total height so editor stretches fully
    const rightTotalH = showEditor && showTerminal ? bottomTotalH : height;

    return {
        splitPx,
        termH,
        termW,
        setTermH,
        setTermW,
        bottomTotalH,
        bottomTermH,
        bottomEditorH,
        rightTotalH,
        onMouseDownSplit,
    };
}
