"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import MathMarkdown from "@/components/markdown/MathMarkdown";

import { DEFAULT_CODE, DEFAULT_LANGS } from "./constants";
import { isControlled, type CodeRunnerProps, type TerminalDock } from "./types";
import HeaderBar from "./components/HeaderBar";
import EditorPane from "./components/EditorPane";
import TerminalPane from "./components/TerminalPane";
import { useSplitSizing } from "./hooks/useSplitSizing";
import { useTerminalRunner } from "./hooks/useTerminalRunner";
import { CodeLanguage } from "@/lib/practice/types";
import {runViaApi} from "@/lib/code/runClient";

function CodeRunnerContent(props: CodeRunnerProps) {
    const {
        frame = "card",
        title = "Try it",
        height = 320,
        hintMarkdown,

        showHeaderBar = true,
        showEditor = true,
        showTerminal = true,
        showHint = true,

        fixedLanguage,
        allowedLanguages,
        showLanguagePicker = true,

        allowReset = true,
        allowRun = true,
        disabled = false,

        resetTerminalOnRun = true,

        showEditorThemeToggle = true,
        showTerminalDockToggle = true,
        fixedTerminalDock,

        onRun,
    } = props as any;

    const controlled = isControlled(props);

    const { resolvedTheme } = useTheme();
    const [editorTheme, setEditorTheme] = useState<"vs" | "vs-dark">("vs-dark");

    useEffect(() => {
        if (!showEditorThemeToggle) {
            setEditorTheme(resolvedTheme === "dark" ? "vs-dark" : "vs");
        }
    }, [resolvedTheme, showEditorThemeToggle]);

    const allowedLangs = useMemo(() => {
        const base = allowedLanguages?.length ? allowedLanguages : DEFAULT_LANGS;
        if (fixedLanguage) return [fixedLanguage];
        return base;
    }, [allowedLanguages, fixedLanguage]);

    const initialLang: CodeLanguage =
        fixedLanguage ??
        (controlled ? (props as any).language : (props as any).initialLanguage) ??
        allowedLangs[0] ??
        "python";

    const [uLang, setULang] = useState<CodeLanguage>(initialLang);
    const [uCode, setUCode] = useState<string>(
        (props as any).initialCode ?? DEFAULT_CODE[initialLang],
    );

    const lang: CodeLanguage = fixedLanguage
        ? fixedLanguage
        : controlled
            ? (props as any).language
            : uLang;

    const code: string = controlled ? (props as any).code : uCode;

    const setLang = (l: CodeLanguage) => {
        if (fixedLanguage) return;
        if (!allowedLangs.includes(l)) return;
        controlled ? (props as any).onChangeLanguage(l) : setULang(l);
    };

    const setCode = (c: string) => {
        controlled ? (props as any).onChangeCode(c) : setUCode(c);
    };

    const [uDock, setUDock] = useState<TerminalDock>(
        (props as any).initialTerminalDock ?? "bottom",
    );

    const dock: TerminalDock = fixedTerminalDock ?? (props as any).terminalDock ?? uDock;

    const setDock = (d: TerminalDock) => {
        if (fixedTerminalDock) return;
        const cb = (props as any).onChangeTerminalDock as ((d: TerminalDock) => void) | undefined;
        if (cb) cb(d);
        else setUDock(d);
    };

    const monacoEditorRef = useRef<any>(null);

    const requestLayout = () => {
        const ed = monacoEditorRef.current;
        if (!ed) return;
        requestAnimationFrame(() => {
            try {
                ed.layout?.();
            } catch {}
        });
    };

    const mainRef = useRef<HTMLDivElement | null>(null);

    const numericHeight = typeof height === "number" ? height : 320;

    const split = useSplitSizing({
        height: numericHeight,
        showEditor,
        showTerminal,
        dock,
        disabled,
        initialTerminalSize: (props as any).initialTerminalSize ?? 240,
        mainRef,
        requestLayout,
    });
    const defaultOnRun = React.useCallback(
        (args: any) =>
            runViaApi(
                {
                    language: args.language,
                    code: args.code,
                    stdin: args.stdin,
                },
                args.signal,
            ),
        [],
    );

    const term = useTerminalRunner({
        lang,
        code,
        disabled,
        allowRun,
        resetTerminalOnRun,
        onRun: onRun ?? defaultOnRun,
    });

    useEffect(() => {
        requestLayout();
    }, [dock, split.termW, split.bottomEditorH, split.bottomTermH, split.rightTotalH]);

    const onSwitchLang = (next: CodeLanguage) => {
        if (fixedLanguage) return;
        if (!allowedLangs.includes(next)) return;
        setLang(next);
        setCode((code?.trim()?.length ? code : DEFAULT_CODE[next]) ?? DEFAULT_CODE[next]);
        term.resetTerminal();
    };

    const showPickerUI = showLanguagePicker && !fixedLanguage && allowedLangs.length > 1;
    const showEditorThemeToggleUI = showEditorThemeToggle && showHeaderBar;
    const showDockToggleUI =
        showTerminalDockToggle && !fixedTerminalDock && showHeaderBar && showEditor && showTerminal;

    const outerCls = frame === "plain" ? "w-full" : "ui-card w-full p-4";

    return (
        <div className={outerCls}>
            {showHeaderBar ? (
                <div className="relative z-20 overflow-visible @container">
                    <HeaderBar
                        title={title}
                        disabled={disabled}
                        busy={term.busy}
                        runState={term.runState}
                        onCancel={term.cancelRun}
                        editorTheme={editorTheme}
                        onToggleTheme={() => setEditorTheme((t) => (t === "vs-dark" ? "vs" : "vs-dark"))}
                        showEditorThemeToggle={showEditorThemeToggleUI}
                        dock={dock}
                        onToggleDock={() => setDock(dock === "bottom" ? "right" : "bottom")}
                        showDockToggle={showDockToggleUI}
                        showPicker={showPickerUI}
                        allowedLangs={allowedLangs}
                        lang={lang}
                        onSwitchLang={onSwitchLang}
                        allowReset={allowReset}
                        onReset={() => {
                            setCode(DEFAULT_CODE[lang]);
                            term.resetTerminal();
                        }}
                        allowRun={allowRun}
                        onRun={term.startRun}
                    />
                </div>
            ) : null}

            {showHint && hintMarkdown ? (
                <div className={frame === "plain" ? "mt-3" : "ui-soft mt-3 p-3"}>
                    <MathMarkdown className="ui-math" content={hintMarkdown} />
                </div>
            ) : null}

            {showEditor || showTerminal ? (
                <div
                    ref={mainRef}
                    style={typeof height === "number" ? { height } : undefined}
                    className={[
                        "relative z-0",
                        "mt-3 overflow-hidden rounded-2xl border",
                        "border-neutral-200 bg-neutral-50/60",
                        "dark:border-white/10 dark:bg-black/20",
                        "min-h-0",
                        "overscroll-contain",
                        height === "auto" ? "h-auto" : "",
                    ].join(" ")}
                >
                    {showEditor && !showTerminal ? (
                        <div className="h-full bg-white/70 dark:bg-black/10">
                            <EditorPane
                                lang={lang}
                                code={code}
                                onChange={setCode}
                                theme={editorTheme}
                                height={numericHeight}
                                disabled={disabled || term.busy}
                                onMount={(ed) => {
                                    monacoEditorRef.current = ed;
                                    requestLayout();
                                }}
                            />
                        </div>
                    ) : null}

                    {!showEditor && showTerminal ? (
                        <div className="h-full p-3">
                            <TerminalPane
                                terminal={term.terminal}
                                stdinBuffer={term.stdinBuffer}
                                awaitingInput={term.awaitingInput}
                                inputPrompt={term.inputPrompt}
                                inputLine={term.inputLine}
                                setInputLine={term.setInputLine}
                                inputRef={term.inputRef}
                                busy={term.busy}
                                disabled={disabled}
                                lastResult={term.lastResult}
                                onSubmitInput={term.submitInput}
                                typedLines={term.typedLines}
                            />
                        </div>
                    ) : null}

                    {showEditor && showTerminal ? (
                        dock === "bottom" ? (
                            <div className="flex h-full flex-col min-h-0">
                                <div className="min-h-0 border-b border-neutral-200 bg-white/70 dark:border-white/10 dark:bg-black/10">
                                    <EditorPane
                                        lang={lang}
                                        code={code}
                                        onChange={setCode}
                                        theme={editorTheme}
                                        height={split.bottomEditorH}
                                        disabled={disabled || term.busy}
                                        onMount={(ed) => {
                                            monacoEditorRef.current = ed;
                                            requestLayout();
                                        }}
                                    />
                                </div>

                                <div
                                    onMouseDown={term.busy ? undefined : split.onMouseDownSplit}
                                    className={[
                                        "h-2 bg-neutral-200/60 dark:bg-white/5",
                                        term.busy
                                            ? "cursor-not-allowed opacity-60"
                                            : "cursor-row-resize hover:bg-neutral-200 dark:hover:bg-white/10",
                                    ].join(" ")}
                                    title={term.busy ? "Cannot resize while running" : "Drag to resize terminal"}
                                />

                                <div className="min-h-0 p-3" style={{ height: split.bottomTermH }}>
                                    <TerminalPane
                                        terminal={term.terminal}
                                        stdinBuffer={term.stdinBuffer}
                                        awaitingInput={term.awaitingInput}
                                        inputPrompt={term.inputPrompt}
                                        inputLine={term.inputLine}
                                        setInputLine={term.setInputLine}
                                        inputRef={term.inputRef}
                                        busy={term.busy}
                                        disabled={disabled}
                                        lastResult={term.lastResult}
                                        onSubmitInput={term.submitInput}
                                        typedLines={term.typedLines}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex h-full min-h-0">
                                <div className="min-w-0 flex-1 border-r border-neutral-200 bg-white/70 dark:border-white/10 dark:bg-black/10">
                                    <EditorPane
                                        lang={lang}
                                        code={code}
                                        onChange={setCode}
                                        theme={editorTheme}
                                        height={split.rightTotalH}
                                        disabled={disabled || term.busy}
                                        onMount={(ed) => {
                                            monacoEditorRef.current = ed;
                                            requestLayout();
                                        }}
                                    />
                                </div>

                                <div
                                    onMouseDown={term.busy ? undefined : split.onMouseDownSplit}
                                    className={[
                                        "w-2 bg-neutral-200/60 dark:bg-white/5",
                                        term.busy
                                            ? "cursor-not-allowed opacity-60"
                                            : "cursor-col-resize hover:bg-neutral-200 dark:hover:bg-white/10",
                                    ].join(" ")}
                                    title={term.busy ? "Cannot resize while running" : "Drag to resize terminal"}
                                />

                                <div className="min-w-0 p-3" style={{ width: split.termW, height: split.rightTotalH }}>
                                    <TerminalPane
                                        terminal={term.terminal}
                                        stdinBuffer={term.stdinBuffer}
                                        awaitingInput={term.awaitingInput}
                                        inputPrompt={term.inputPrompt}
                                        inputLine={term.inputLine}
                                        setInputLine={term.setInputLine}
                                        inputRef={term.inputRef}
                                        busy={term.busy}
                                        disabled={disabled}
                                        lastResult={term.lastResult}
                                        onSubmitInput={term.submitInput}
                                        typedLines={term.typedLines}
                                    />
                                </div>
                            </div>
                        )
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}

export default function CodeRunner(props: CodeRunnerProps) {
    return (
            <CodeRunnerContent {...props} />
    );
}
