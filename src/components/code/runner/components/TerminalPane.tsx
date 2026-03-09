"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { RunResult } from "@/lib/code/runCode";
import type { TermLine } from "../types";
import { cleanTermText } from "../utils/text";

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
    inputRef: React.RefObject<HTMLTextAreaElement | null>;
    busy: boolean;
    disabled: boolean;
    lastResult: RunResult | null;
    onSubmitInput: () => void;
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
    const surfaceRef = useRef<HTMLDivElement | null>(null);

    const [caret, setCaret] = useState<number>(0);
    const [histPos, setHistPos] = useState<number | null>(null);
    const [histDraft, setHistDraft] = useState<string>("");

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
    }, [terminal, awaitingInput, inputLine]);

    useEffect(() => {
        if (!awaitingInput || disabled || busy) return;
        const id = window.setTimeout(() => {
            inputRef.current?.focus();
            const len = (inputLine ?? "").length;
            inputRef.current?.setSelectionRange(len, len);
        }, 0);
        return () => window.clearTimeout(id);
    }, [awaitingInput, disabled, busy, inputRef, inputLine]);

    useEffect(() => {
        setCaret((c) => clamp(c, 0, (inputLine ?? "").length));
    }, [inputLine]);

    useEffect(() => {
        if (awaitingInput) {
            const len = (inputLine ?? "").length;
            setCaret(len);
            setHistPos(null);
            setHistDraft("");
        }
    }, [awaitingInput, inputLine]);

    const terminalHasError = !!lastResult && lastResult.ok === false && !awaitingInput;

    const livePrompt = useMemo(() => {
        const p = String(inputPrompt ?? "");
        if (!p) return "";
        return p.endsWith(" ") ? p : p + " ";
    }, [inputPrompt]);

    const syncCaretFromTextarea = () => {
        const el = inputRef.current;
        if (!el) return;
        setCaret(el.selectionStart ?? 0);
    };

    const placeCaretAtEnd = (value: string) => {
        requestAnimationFrame(() => {
            const el = inputRef.current;
            if (!el) return;
            const len = value.length;
            el.focus();
            el.setSelectionRange(len, len);
            setCaret(len);
        });
    };

    const recallHistory = (nextPos: number | null) => {
        if (nextPos == null) {
            setHistPos(null);
            setInputLine(histDraft);
            placeCaretAtEnd(histDraft);
            return;
        }

        const line = String(typedLines[nextPos] ?? "");
        setHistPos(nextPos);
        setInputLine(line);
        placeCaretAtEnd(line);
    };

    const insertAtNativeSelection = (text: string) => {
        const el = inputRef.current;
        if (!el) return;

        const start = el.selectionStart ?? 0;
        const end = el.selectionEnd ?? start;
        const value = inputLine ?? "";
        const next = value.slice(0, start) + text + value.slice(end);

        setInputLine(next);

        requestAnimationFrame(() => {
            el.focus();
            const pos = start + text.length;
            el.setSelectionRange(pos, pos);
            setCaret(pos);
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!awaitingInput || disabled || busy) return;

        if (e.ctrlKey && !e.metaKey) {
            if (e.key.toLowerCase() === "a") {
                e.preventDefault();
                inputRef.current?.setSelectionRange(0, 0);
                setCaret(0);
                return;
            }
            if (e.key.toLowerCase() === "e") {
                e.preventDefault();
                placeCaretAtEnd(inputLine ?? "");
                return;
            }
        }

        if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            onSubmitInput();
            return;
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
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
            if (histPos == null) return;

            if (histPos >= typedLines.length - 1) {
                recallHistory(null);
            } else {
                recallHistory(histPos + 1);
            }
            return;
        }

        if (e.key === "Escape") {
            e.preventDefault();
            setInputLine("");
            placeCaretAtEnd("");
            setHistPos(null);
            setHistDraft("");
            return;
        }

        if (e.key === "Tab") {
            e.preventDefault();
            insertAtNativeSelection("  ");
            return;
        }

        requestAnimationFrame(syncCaretFromTextarea);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const next = e.target.value.replace(/\r?\n/g, "");
        setInputLine(next);
        setCaret(e.target.selectionStart ?? next.length);
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        if (!awaitingInput || disabled || busy) return;
        e.preventDefault();

        const text = e.clipboardData.getData("text") ?? "";
        const cleaned = text.replace(/\r?\n/g, " ");
        if (!cleaned) return;

        insertAtNativeSelection(cleaned);
    };

    const focusNativeInput = () => {
        if (!awaitingInput || disabled || busy) return;
        inputRef.current?.focus();
    };

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
                    "h-full  border-t p-3 flex flex-col",
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
                        "mt-2 flex-1 overflow-auto border-t py-2 relative",
                        "bg-white/60 dark:bg-black/30",
                        terminalHasError ? "border-rose-300/20" : "border-neutral-200 dark:border-white/10",
                    ].join(" ")}
                >
          <textarea
              ref={inputRef}
              value={inputLine}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onSelect={syncCaretFromTextarea}
              onClick={syncCaretFromTextarea}
              onKeyUp={syncCaretFromTextarea}
              onPaste={handlePaste}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              inputMode="text"
              enterKeyHint="send"
              aria-label="Terminal input"
              className="absolute opacity-0 pointer-events-none h-0 w-0"
          />

                    <div
                        ref={surfaceRef}
                        tabIndex={0}
                        role="button"
                        aria-label="Terminal surface"
                        onMouseDown={focusNativeInput}
                        onTouchStart={focusNativeInput}
                        className={[
                            "outline-none",
                            "font-mono text-xs leading-5",
                            "whitespace-pre-wrap px-2 break-words",
                            "focus:ring-2 focus:ring-emerald-300/30 focus:rounded-lg",
                            "mx-1 cursor-text"
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