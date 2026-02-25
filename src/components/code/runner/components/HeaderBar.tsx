"use client";

import React from "react";

import type { TerminalDock } from "../types";

import Tooltip from "@/components/ui/Tooltip";

import {
    FiMoon,
    FiSun,
    FiTerminal,
    FiRefreshCw,
    FiPlay,
    FiLoader,
    FiCode,
} from "react-icons/fi";
import { SiPython, SiJavascript, SiC, SiCplusplus } from "react-icons/si";
import { FaJava } from "react-icons/fa";
import {CodeLanguage} from "@/lib/practice/types";

const LANG_META: Record<
    CodeLanguage,
    { label: string; Icon: React.ComponentType<{ className?: string }> }
> = {
    python: { label: "Python", Icon: SiPython },
    java: { label: "Java", Icon: FaJava },
    javascript: { label: "JavaScript", Icon: SiJavascript },
    c: { label: "C", Icon: SiC },
    cpp: { label: "C++", Icon: SiCplusplus },
};

function cx(...xs: Array<string | false | null | undefined>) {
    return xs.filter(Boolean).join(" ");
}

// ✅ icon-only until lg, then icon + text
function IconText({ icon, text }: { icon: React.ReactNode; text: React.ReactNode }) {
    return (
        <span className="inline-flex items-center">
      <span className="inline-flex @lg:hidden">{icon}</span>
      <span className="hidden @lg:inline-flex items-center gap-2">
        {icon}
          <span className="whitespace-nowrap">{text}</span>
      </span>
    </span>
    );
}

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
    allowedLangs: CodeLanguage[];
    lang: CodeLanguage;
    onSwitchLang: (l: CodeLanguage) => void;

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

    const themeIsDark = editorTheme === "vs-dark";
    const dockLabel = dock === "bottom" ? "Bottom" : "Right";

    const langMeta = LANG_META[lang] ?? { label: String(lang), Icon: FiCode };
    const LangIcon = langMeta.Icon;

    // ✅ consistent button tokens
    const btnBase =
        "inline-flex items-center justify-center rounded-xl border text-xs font-extrabold transition select-none";
    const btnPad = "p-2 @lg:px-3 @lg:py-1.5";
    const btnIdle =
        "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 " +
        "dark:border-white/10 dark:bg-white/[0.06] dark:text-white/80 dark:hover:bg-white/[0.10]";
    const btnDisabled = "disabled:opacity-50 disabled:cursor-not-allowed";

    const btnActive =
        "border-emerald-300/30 bg-emerald-300/10 text-neutral-900 " +
        "dark:text-white/90";

    const btnRun =
        "border-sky-300/30 bg-sky-300/10 text-neutral-900 hover:bg-sky-300/15 " +
        "dark:text-white/90";

    return (
        <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 truncate text-sm font-black text-neutral-900 dark:text-white/90">
                {title}
            </div>

            <div className="flex items-center gap-2">
                {/* Theme */}
                {showEditorThemeToggle ? (
                    <Tooltip tip={themeIsDark ? "Editor theme: Dark" : "Editor theme: Light"}>
                        <button
                            type="button"
                            onClick={onToggleTheme}
                            disabled={disabled}
                            className={cx(btnBase, btnPad, btnIdle, btnDisabled)}
                            aria-label={themeIsDark ? "Editor theme: Dark" : "Editor theme: Light"}
                        >
                            <IconText
                                icon={
                                    themeIsDark ? (
                                        <FiMoon className="text-[14px]" />
                                    ) : (
                                        <FiSun className="text-[14px]" />
                                    )
                                }
                                text={themeIsDark ? "Dark" : "Light"}
                            />
                        </button>
                    </Tooltip>
                ) : null}

                {/* Dock */}
                {showDockToggle ? (
                    <Tooltip tip={`Terminal dock: ${dockLabel}`}>
                        <button
                            type="button"
                            onClick={onToggleDock}
                            disabled={disabled}
                            className={cx(btnBase, btnPad, btnIdle, btnDisabled)}
                            aria-label={`Terminal dock: ${dockLabel}`}
                        >
                            <IconText icon={<FiTerminal className="text-[14px]" />} text={dockLabel} />
                        </button>
                    </Tooltip>
                ) : null}

                {/* Language */}
                {showPicker ? (
                    <div className="flex items-center gap-2">
                        {/* hide "Language" label until lg to keep compact */}
                        <div className="hidden lg:block text-xs font-extrabold text-neutral-600 dark:text-white/60">
                            Language
                        </div>

                        {allowedLangs.map((l) => {
                            const meta = LANG_META[l] ?? { label: String(l), Icon: FiCode };
                            const Icon = meta.Icon;
                            const active = lang === l;

                            return (
                                <Tooltip key={l} tip={meta.label}>
                                    <button
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => onSwitchLang(l)}
                                        className={cx(btnBase, btnPad, active ? btnActive : btnIdle, btnDisabled)}
                                        aria-label={meta.label}
                                    >
                                        <IconText icon={<Icon className="text-[14px]" />} text={meta.label} />
                                    </button>
                                </Tooltip>
                            );
                        })}
                    </div>
                ) : (
                    <Tooltip tip={`Language: ${langMeta.label}`}>
                        <div className="text-xs font-extrabold text-neutral-500 dark:text-white/60">
                            <IconText icon={<LangIcon className="text-[14px]" />} text={langMeta.label} />
                        </div>
                    </Tooltip>
                )}

                {/* Reset */}
                {allowReset ? (
                    <Tooltip tip="Reset">
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={onReset}
                            className={cx(btnBase, btnPad, btnIdle, btnDisabled)}
                            aria-label="Reset"
                        >
                            <IconText icon={<FiRefreshCw className="text-[14px]" />} text="Reset" />
                        </button>
                    </Tooltip>
                ) : null}

                {/* Run */}
                {allowRun ? (
                    <Tooltip tip={busy ? "Running…" : "Run"}>
                        <button
                            type="button"
                            disabled={busy || disabled}
                            onClick={onRun}
                            className={cx(btnBase, btnPad, busy || disabled ? btnIdle : btnRun, btnDisabled)}
                            aria-label={busy ? "Running…" : "Run"}
                        >
                            <IconText
                                icon={
                                    busy ? (
                                        <FiLoader className="text-[14px] animate-spin" />
                                    ) : (
                                        <FiPlay className="text-[14px]" />
                                    )
                                }
                                text={busy ? "Running…" : "Run"}
                            />
                        </button>
                    </Tooltip>
                ) : null}
            </div>
        </div>
    );
}
