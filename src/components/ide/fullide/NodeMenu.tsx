"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "./utils";
import { IconDots } from "./icons";

export type MenuAction = {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    danger?: boolean;
    disabled?: boolean;
};

export default function NodeMenu({ actions }: { actions: MenuAction[] }) {
    const [open, setOpen] = useState(false);
    const btnRef = useRef<HTMLButtonElement | null>(null);
    const panelRef = useRef<HTMLDivElement | null>(null);
    const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

    const MENU_W = 220;

    useEffect(() => {
        if (!open) return;

        const update = () => {
            const b = btnRef.current;
            if (!b) return;
            const r = b.getBoundingClientRect();
            const top = Math.min(window.innerHeight - 12, r.bottom + 8);
            const left = Math.min(window.innerWidth - MENU_W - 12, r.right - MENU_W);
            setPos({ top, left });
        };

        update();
        window.addEventListener("resize", update);
        window.addEventListener("scroll", update, true);

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };

        // ✅ close on CLICK (after the browser handles caret placement)
        const onDocClick = (e: MouseEvent) => {
            const t = e.target as Node | null;
            if (!t) return;

            if (btnRef.current?.contains(t)) return;
            if (panelRef.current?.contains(t)) return;

            setOpen(false);
        };

        window.addEventListener("keydown", onKey);
        document.addEventListener("click", onDocClick, true);

        return () => {
            window.removeEventListener("resize", update);
            window.removeEventListener("scroll", update, true);
            window.removeEventListener("keydown", onKey);
            document.removeEventListener("click", onDocClick, true);
        };
    }, [open]);

    const panel =
        open && pos
            ? createPortal(
                <div
                    className="fixed z-[9999]"
                    style={{ top: pos.top, left: pos.left, width: MENU_W }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div ref={panelRef} className="ui-ide-menupanel">
                        {actions.map((a, i) => (
                            <button
                                key={i}
                                type="button"
                                disabled={a.disabled}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (a.disabled) return;
                                    setOpen(false);
                                    a.onClick();
                                }}
                                className={cn(
                                    "ui-ide-menuitem",
                                    a.danger && "ui-ide-menuitem--danger",
                                    a.disabled && "opacity-45 cursor-not-allowed",
                                )}
                            >
                                <span className="grid h-5 w-5 place-items-center">{a.icon}</span>
                                <span className="flex-1">{a.label}</span>
                            </button>
                        ))}
                    </div>
                </div>,
                document.body,
            )
            : null;

    return (
        <>
            <button
                ref={btnRef}
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpen((v) => !v);
                }}
                className="ui-ide-menubtn"
                title="Actions"
            >
                <IconDots className="h-4 w-4" />
            </button>
            {panel}
        </>
    );
}
