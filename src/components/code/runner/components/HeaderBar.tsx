"use client";

import React from "react";
import type { Lang } from "@/lib/code/runCode";
import type { TerminalDock } from "../types";

export default function HeaderBar(props: {
    title: string;
    disabled: boolean;
    busy: boolean;

    editorTheme: "vs" | "vs-dark";
    onToggleTheme: () => void;
    showEditorThemeToggle: boolean;

    dock: TerminalDock;
    onToggleDock: () => void;
    showDockToggle: boolean;

    showPicker: boolean;
    allowedLangs: Lang[];
    lang: Lang;
    onSwitchLang: (l: Lang) => void;

    allowReset: boolean;
    onReset: () => void;

    allowRun: boolean;
    onRun: () => void;
}) {
    const {
        title,
        disabled,
        busy,

        editorTheme,
        onToggleTheme,
        showEditorThemeToggle,

        dock,
        onToggleDock,
        showDockToggle,

        showPicker,
        allowedLangs,
        lang,
        onSwitchLang,

        allowReset,
        onReset,

        allowRun,
        onRun,
    } = props;

    return (
        <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-black text-neutral-900 dark:text-white/90">{title}</div>

            <div className="flex items-center gap-2">
                {showEditorThemeToggle ? (
                    <button
                        type="button"
                        onClick={onToggleTheme}
                        className="ui-authbtn"
                        title="Toggle editor theme"
                        disabled={disabled}
                    >
                        {editorTheme === "vs-dark" ? "Editor: Dark" : "Editor: Light"}
                    </button>
                ) : null}

                {showDockToggle ? (
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={onToggleDock}
                        className="ui-authbtn disabled:opacity-60"
                        title="Toggle terminal position"
                    >
                        Terminal: {dock === "bottom" ? "Bottom" : "Right"}
                    </button>
                ) : null}

                {showPicker ? (
                    <>
                        <div className="text-xs font-extrabold text-neutral-600 dark:text-white/60">Language</div>
                        {allowedLangs.map((l) => (
                            <button
                                key={l}
                                type="button"
                                disabled={disabled}
                                onClick={() => onSwitchLang(l)}
                                className={[
                                    "rounded-xl border px-3 py-1 text-xs font-extrabold transition",
                                    lang === l
                                        ? "border-emerald-300/30 bg-emerald-300/10 text-neutral-900 dark:text-white/90"
                                        : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/75 dark:hover:bg-white/[0.10]",
                                    disabled ? "opacity-60" : "",
                                ].join(" ")}
                            >
                                {l}
                            </button>
                        ))}
                    </>
                ) : (
                    <div className="text-xs font-extrabold text-neutral-500 dark:text-white/60">
                        Language: <span className="text-neutral-900 dark:text-white/85">{lang}</span>
                    </div>
                )}

                {allowReset ? (
                    <button type="button" disabled={disabled} onClick={onReset} className="ui-authbtn disabled:opacity-60">
                        Reset
                    </button>
                ) : null}

                {allowRun ? (
                    <button
                        type="button"
                        disabled={busy || disabled}
                        onClick={onRun}
                        className={[
                            "rounded-xl border px-3 py-1 text-xs font-extrabold transition",
                            busy || disabled
                                ? "border-neutral-200 bg-white/60 text-neutral-400 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/40"
                                : "border-sky-300/30 bg-sky-300/10 text-neutral-900 hover:bg-sky-300/15 dark:text-white/90",
                        ].join(" ")}
                    >
                        {busy ? "Running…" : "Run"}
                    </button>
                ) : null}
            </div>
        </div>
    );
}
