"use client";

import React, { useEffect, useMemo, useRef } from "react";
import type { RunResult } from "@/lib/code/runCode";
import type { TermLine } from "../types";
import { cleanTermText } from "../utils/text";

const lineCls = (t: TermLine["type"]) => {
    switch (t) {
        case "err":
            return "font-semibold text-rose-600 dark:text-rose-300";
        case "in":
            return "text-sky-700 dark:text-sky-200";
        case "sys":
            return "text-neutral-500 dark:text-white/60";
        default:
            return "text-neutral-900 dark:text-white/85";
    }
};

function fmtMeta(r: RunResult) {
    const time = r.time ? ` • ${r.time}s` : "";
    const mem = r.memory ? ` • ${Math.round(r.memory / 1024)}MB` : "";
    return `${r.status ?? (r.ok ? "OK" : "Error")}${time}${mem}`;
}

export default function TerminalPane(props: {
    terminal: TermLine[];
    stdinBuffer: string;
    awaitingInput: boolean;
    inputPrompt: string;
    inputLine: string;
    setInputLine: (v: string) => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
    busy: boolean;
    disabled: boolean;
    lastResult: RunResult | null;
    onSubmitInput: () => void;
}) {
    const {
        terminal,
        stdinBuffer,
        awaitingInput,
        inputPrompt,
        inputLine,
        setInputLine,
        inputRef,
        busy,
        disabled,
        lastResult,
        onSubmitInput,
    } = props;

    const scrollRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
    }, [terminal, awaitingInput]);

    const stdinLines = useMemo(
        () => (stdinBuffer ? stdinBuffer.split("\n").filter(Boolean).length : 0),
        [stdinBuffer],
    );

    const terminalHasError = !!lastResult && lastResult.ok === false && !awaitingInput;

    return (
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
                    typed lines: {stdinLines}
                </div>
            </div>

            <div
                ref={scrollRef}
                className={[
                    "mt-2 flex-1 overflow-auto rounded-xl border p-3",
                    "bg-white/60 dark:bg-black/30",
                    terminalHasError ? "border-rose-300/20" : "border-neutral-200 dark:border-white/10",
                ].join(" ")}
            >
        <pre className="whitespace-pre-wrap break-words text-xs leading-5">
          {terminal.map((l, i) => {
              const prefix = l.type === "sys" ? "• " : l.type === "in" ? "> " : "";
              return (
                  <React.Fragment key={i}>
                <span className={lineCls(l.type)}>
                  {prefix}
                    {cleanTermText(l.text)}
                </span>
                      {"\n"}
                  </React.Fragment>
              );
          })}
        </pre>

                {awaitingInput ? (
                    <div className="mt-2 flex items-center gap-2">
                        <div className="text-xs font-extrabold text-neutral-700 dark:text-white/70">
                            {inputPrompt || "Input:"}
                        </div>
                        <input
                            ref={inputRef}
                            value={inputLine}
                            onChange={(e) => setInputLine(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onSubmitInput();
                                }
                            }}
                            placeholder="Type and press Enter…"
                            className="h-9 w-full rounded-xl border border-neutral-200 bg-white/70 px-3 text-xs text-neutral-900 outline-none dark:border-white/10 dark:bg-black/40 dark:text-white/80"
                        />
                        <button
                            type="button"
                            disabled={busy || disabled}
                            onClick={onSubmitInput}
                            className={[
                                "rounded-xl border px-3 py-2 text-xs font-extrabold transition",
                                busy || disabled
                                    ? "border-neutral-200 bg-neutral-50 text-neutral-400 dark:border-white/10 dark:bg-white/5 dark:text-white/50"
                                    : "border-amber-300/40 bg-amber-300/15 text-neutral-900 hover:bg-amber-300/20 dark:text-white/90",
                            ].join(" ")}
                        >
                            Enter
                        </button>
                    </div>
                ) : null}
            </div>

            {lastResult && !awaitingInput ? (
                <div
                    className={[
                        "mt-2 text-[11px] font-extrabold",
                        lastResult.ok === false ? "text-rose-600 dark:text-rose-300" : "text-neutral-500 dark:text-white/50",
                    ].join(" ")}
                >
                    Last run: {fmtMeta(lastResult)}
                </div>
            ) : null}
        </div>
    );
}
