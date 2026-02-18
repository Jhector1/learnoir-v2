// src/components/code/runner/components/TerminalPane.tsx
"use client";

import React, {useEffect, useMemo, useRef, useState} from "react";
import type {RunResult} from "@/lib/code/runCode";
import type {TermLine} from "../types";
import {cleanTermText} from "../utils/text";

const lineCls = (t: TermLine["type"]) => {
    switch (t) {
        case "err":
            return "font-semibold text-rose-600 dark:text-rose-300";
        case "sys":
            return "text-neutral-500 dark:text-white/60";
        default:
            return "text-neutral-900 dark:text-white/85";
    }
};

function fmtMeta(r: RunResult) {
    const time = r.time ? ` • ${r.time}s` : "";
    const mem = r.memory ? ` • ${Math.round((Number(r.memory) || 0) / 1024)}MB` : "";
    return `${r.status ?? (r.ok ? "OK" : "Error")}${time}${mem}`;
}

function statusLabel(busy: boolean, awaitingInput: boolean) {
    if (busy) return "Running";
    if (awaitingInput) return "Waiting";
    return "Idle";
}

function clamp(n: number, lo: number, hi: number) {
    return Math.max(lo, Math.min(hi, n));
}

export default function TerminalPane(props: {
    terminal: TermLine[];
    stdinBuffer: string;
    awaitingInput: boolean;
    inputPrompt: string;
    inputLine: string;
    setInputLine: (v: string) => void;
    inputRef: React.RefObject<HTMLDivElement | null>;
    busy: boolean;
    disabled: boolean;
    lastResult: RunResult | null;
    onSubmitInput: () => void;

    // ✅ NEW: history lines (already submitted inputs)
    typedLines: string[];
}) {
    const {
        terminal,
        awaitingInput,
        inputPrompt,
        inputLine,
        setInputLine,
        inputRef,
        busy,
        disabled,
        lastResult,
        onSubmitInput,
        typedLines,
    } = props;

    const scrollRef = useRef<HTMLDivElement | null>(null);

    // caret position inside inputLine
    const [caret, setCaret] = useState<number>(0);

    // history navigation
    const [histPos, setHistPos] = useState<number | null>(null);
    const [histDraft, setHistDraft] = useState<string>("");

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
    }, [terminal, awaitingInput, inputLine]);

    // focus terminal surface when awaiting input
    useEffect(() => {
        if (awaitingInput) {
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    }, [awaitingInput, inputRef]);

    // keep caret valid when inputLine changes externally
    useEffect(() => {
        setCaret((c) => clamp(c, 0, (inputLine ?? "").length));
    }, [inputLine]);

    // when we start waiting for input, default caret to end
    useEffect(() => {
        if (awaitingInput) {
            setCaret((inputLine ?? "").length);
            setHistPos(null);
            setHistDraft("");
        }
    }, [awaitingInput]); // eslint-disable-line react-hooks/exhaustive-deps

    const terminalHasError = !!lastResult && lastResult.ok === false && !awaitingInput;

    const livePrompt = useMemo(() => {
        const p = String(inputPrompt ?? "");
        if (!p) return "";
        return p.endsWith(" ") ? p : p + " ";
    }, [inputPrompt]);

    const insertTextAtCaret = (txt: string) => {
        const s = String(inputLine ?? "");
        const i = clamp(caret, 0, s.length);
        const next = s.slice(0, i) + txt + s.slice(i);
        setInputLine(next);
        setCaret(i + txt.length);
    };

    const backspaceAtCaret = () => {
        const s = String(inputLine ?? "");
        if (caret <= 0) return;
        const i = clamp(caret, 0, s.length);
        const next = s.slice(0, i - 1) + s.slice(i);
        setInputLine(next);
        setCaret(i - 1);
    };

    const deleteAtCaret = () => {
        const s = String(inputLine ?? "");
        const i = clamp(caret, 0, s.length);
        if (i >= s.length) return;
        const next = s.slice(0, i) + s.slice(i + 1);
        setInputLine(next);
        setCaret(i);
    };

    const recallHistory = (nextPos: number | null) => {
        if (nextPos == null) {
            setHistPos(null);
            setInputLine(histDraft);
            setCaret(histDraft.length);
            return;
        }
        const line = String(typedLines[nextPos] ?? "");
        setHistPos(nextPos);
        setInputLine(line);
        setCaret(line.length);
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!awaitingInput || disabled || busy) return;

        // Handle helpful Ctrl shortcuts (don’t block everything)
        if (e.ctrlKey && !e.metaKey) {
            if (e.key.toLowerCase() === "a") {
                e.preventDefault();
                setCaret(0);
                return;
            }
            if (e.key.toLowerCase() === "e") {
                e.preventDefault();
                setCaret((inputLine ?? "").length);
                return;
            }
            // otherwise let browser do its thing
        }

        // Enter submits
        if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            onSubmitInput();
            return;
        }

        // History: Up/Down
        if (e.key === "ArrowUp") {
            e.preventDefault();
            e.stopPropagation();
            if (!typedLines.length) return;

            if (histPos == null) {
                setHistDraft(String(inputLine ?? ""));
                recallHistory(typedLines.length - 1);
            } else {
                recallHistory(Math.max(0, histPos - 1));
            }
            return;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            e.stopPropagation();
            if (histPos == null) return;

            if (histPos >= typedLines.length - 1) {
                recallHistory(null);
            } else {
                recallHistory(histPos + 1);
            }
            return;
        }

        // Caret navigation: Left/Right/Home/End
        if (e.key === "ArrowLeft") {
            e.preventDefault();
            e.stopPropagation();
            setCaret((c) => Math.max(0, c - 1));
            return;
        }

        if (e.key === "ArrowRight") {
            e.preventDefault();
            e.stopPropagation();
            setCaret((c) => Math.min((inputLine ?? "").length, c + 1));
            return;
        }

        if (e.key === "Home") {
            e.preventDefault();
            e.stopPropagation();
            setCaret(0);
            return;
        }

        if (e.key === "End") {
            e.preventDefault();
            e.stopPropagation();
            setCaret((inputLine ?? "").length);
            return;
        }

        // Editing: Backspace/Delete
        if (e.key === "Backspace") {
            e.preventDefault();
            e.stopPropagation();
            backspaceAtCaret();
            return;
        }

        if (e.key === "Delete") {
            e.preventDefault();
            e.stopPropagation();
            deleteAtCaret();
            return;
        }

        // Escape clears line
        if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            setInputLine("");
            setCaret(0);
            setHistPos(null);
            setHistDraft("");
            return;
        }

        // Tab inserts spaces
        if (e.key === "Tab") {
            e.preventDefault();
            e.stopPropagation();
            insertTextAtCaret("  ");
            return;
        }

        // Printable characters insert at caret
        if (e.key.length === 1 && !e.altKey && !e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            e.stopPropagation();
            insertTextAtCaret(e.key);
            return;
        }
    };

    const onPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
        if (!awaitingInput || disabled || busy) return;
        e.preventDefault();
        e.stopPropagation();

        const text = e.clipboardData.getData("text") ?? "";
        const cleaned = text.replace(/\r?\n/g, " "); // keep single-line stdin behavior
        if (!cleaned) return;

        insertTextAtCaret(cleaned);
    };

    // Render input line with caret inside it
    const inputBefore = cleanTermText(String(inputLine ?? "").slice(0, caret));
    const inputAfter = cleanTermText(String(inputLine ?? "").slice(caret));

    return (
        <>
            <style jsx global>{`
              @keyframes ui-term-blink {
                0%,
                49% {
                  opacity: 1;
                }
                50%,
                100% {
                  opacity: 0;
                }
              }

              .ui-term-cursor {
                display: inline-block;
                margin-left: 1px;
                opacity: 0.75;
                animation: ui-term-blink 1s step-end infinite;
                will-change: opacity;
              }
            `}</style>
            <div
                className={[
                    "h-full rounded-2xl border p-3 flex flex-col",
                    "bg-white/80 dark:bg-black/40",
                    terminalHasError ? "border-rose-300/30" : "border-neutral-200 dark:border-white/10",
                ].join(" ")}
            >
                <div className="flex items-center justify-between">
                    <div className="text-[11px] font-extrabold text-neutral-600 dark:text-white/60">
                        Terminal
                    </div>

                    <div className="text-[11px] font-extrabold text-neutral-500 dark:text-white/50">
                        {statusLabel(busy, awaitingInput)}
                        {lastResult && !awaitingInput ? ` • ${fmtMeta(lastResult)}` : ""}
                    </div>
                </div>

                <div
                    ref={scrollRef}
                    className={[
                        "mt-2 flex-1 overflow-auto rounded-xl border p-2",
                        "bg-white/60 dark:bg-black/30",
                        terminalHasError ? "border-rose-300/20" : "border-neutral-200 dark:border-white/10",
                    ].join(" ")}
                >
                    <div
                        ref={inputRef}
                        tabIndex={0}
                        role="textbox"
                        aria-label="Terminal input"
                        onKeyDown={onKeyDown}
                        onPaste={onPaste}
                        onMouseDown={() => inputRef.current?.focus()}
                        spellCheck={false}
                        className={[
                            "outline-none",
                            "font-mono text-xs leading-5",
                            "whitespace-pre-wrap px-2 break-words",
                            "focus:ring-2 focus:ring-emerald-300/30 focus:rounded-lg",
                        ].join(" ")}
                    >
                        {terminal.map((l, i) => {
                            const isLast = i === terminal.length - 1;
                            return (
                                <React.Fragment key={i}>
                                    <span className={lineCls(l.type)}>{cleanTermText(l.text)}</span>
                                    {!isLast ? "\n" : null}
                                </React.Fragment>
                            );
                        })}

                        {awaitingInput ? (
                            <span className={lineCls("in")}>
              {terminal.length ? "\n" : ""}
                                {livePrompt}
                                {inputBefore}
                                {/* ✅ blinking cursor class you already added */}
                                <span className="ui-term-cursor">▋</span>
                                {inputAfter}
            </span>
                        ) : null}
                    </div>
                </div>
            </div>
        </>
    );
}
