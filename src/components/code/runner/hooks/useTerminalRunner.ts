// src/components/code/runner/hooks/useTerminalRunner.ts
"use client";

import * as React from "react";
import type { Lang, RunResult } from "@/lib/code/runCode";
import type { TermLine, OnRun } from "../types";
import { cleanTermText, toLines } from "../utils/text";
import { inferInputPlan } from "../utils/input";
import { expandPrompts, prettyPrompt, splitStdoutByPrompts } from "../utils/prompts";

// ---- helpers ----

function fmtMeta(r: RunResult) {
    const time = r.time ? ` • ${r.time}s` : "";
    const mem = r.memory ? ` • ${Math.round((Number(r.memory) || 0) / 1024)}MB` : "";
    return `${r.status ?? (r.ok ? "OK" : "Error")}${time}${mem}`;
}

function needsMoreInput(lang: Lang, r: RunResult) {
    const blob = cleanTermText(
        (r.compile_output ?? "") + "\n" + (r.stderr ?? "") + "\n" + (r.message ?? "") + "\n" + (r.error ?? ""),
    );

    if (lang === "python") return /\bEOFError\b/.test(blob);
    if (lang === "java") return /NoSuchElementException/.test(blob);
    return false;
}

// Remove lines that are ONLY spaces/tabs (these are usually artifacts from prompt splitting)
function toOutTermLines(seg: string): TermLine[] {
    const lines = toLines(cleanTermText(seg ?? ""));
    return lines
        .filter((l) => l === "" || l.trim().length > 0) // keep real blank line, drop whitespace-only
        .map((t) => ({ type: "out" as const, text: t }));
}

// ---- safe-ish pre-output extraction for C/C++ (so "Hello" shows before inputs) ----

function unescapeCStringContent(x: string) {
    const s = String(x ?? "");
    let out = "";
    for (let i = 0; i < s.length; ) {
        const ch = s[i];
        if (ch !== "\\") {
            out += ch;
            i++;
            continue;
        }
        const nxt = s[i + 1];
        if (nxt == null) {
            out += "\\";
            i++;
            continue;
        }
        switch (nxt) {
            case "\\":
                out += "\\";
                i += 2;
                break;
            case "n":
                out += "\n";
                i += 2;
                break;
            case "r":
                out += "\r";
                i += 2;
                break;
            case "t":
                out += "\t";
                i += 2;
                break;
            case '"':
                out += '"';
                i += 2;
                break;
            default:
                out += nxt;
                i += 2;
                break;
        }
    }
    return out;
}

function extractPreOutputForCCpp(lang: Lang, code: string, prompts: string[]) {
    const src = String(code ?? "");

    const firstInputIdx =
        lang === "c"
            ? (() => {
                const i = src.search(/\bscanf\s*\(|\bgets\s*\(|\bfgets\s*\(/);
                return i >= 0 ? i : src.length;
            })()
            : (() => {
                const i = src.search(/\b(?:std::)?cin\s*>>|\bgetline\s*\(/);
                return i >= 0 ? i : src.length;
            })();

    const pre = src.slice(0, firstInputIdx);

    const rawStrings: string[] = [];

    if (lang === "c") {
        const re = /\bprintf\s*\(\s*"([^"]*)"\s*(?:,|\))/g;
        for (const m of pre.matchAll(re)) rawStrings.push(unescapeCStringContent(m[1] ?? ""));
    } else if (lang === "cpp") {
        const re = /\b(?:std::)?cout\s*<<\s*"([^"]*)"/g;
        for (const m of pre.matchAll(re)) rawStrings.push(unescapeCStringContent(m[1] ?? ""));
    }

    // Filter out strings that are actually prompts (avoid duplicate prompts)
    const promptSet = new Set(prompts.map((p) => String(p ?? "").trimEnd()));
    const filtered = rawStrings.filter((s) => {
        const t = String(s ?? "").trimEnd();
        if (!t) return false;
        if (promptSet.has(t)) return false;
        // also skip if it begins with a prompt (common: "Enter a: ")
        for (const p of promptSet) if (p && t.startsWith(p)) return false;
        return true;
    });

    // Turn into terminal lines
    const lines: TermLine[] = [];
    for (const s of filtered) lines.push(...toOutTermLines(s));
    return lines;
}

// ---- main hook ----

export function useTerminalRunner(args: {
    lang: Lang;
    code: string;
    disabled: boolean;
    allowRun: boolean;
    resetTerminalOnRun: boolean;
    onRun?: OnRun;
}) {
    const { lang, code, disabled, allowRun, resetTerminalOnRun, onRun } = args;

    const [stdinBuffer, setStdinBuffer] = React.useState("");
    const [terminal, setTerminal] = React.useState<TermLine[]>([{ type: "sys", text: "Ready." }]);

    const [awaitingInput, setAwaitingInput] = React.useState(false);
    const [inputPrompt, setInputPrompt] = React.useState("");
    const [inputLine, setInputLine] = React.useState("");
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    const [busy, setBusy] = React.useState(false);
    const [lastResult, setLastResult] = React.useState<RunResult | null>(null);

    const runLockRef = React.useRef(false);
    const runIdRef = React.useRef(0);
    const activeRunIdRef = React.useRef<number | null>(null);

    const [typedLines, setTypedLines] = React.useState<string[]>([]);
    const hasStartedExecRef = React.useRef(false); // probe-run done for python/java?

    const inputPlan = React.useMemo(() => inferInputPlan(lang, code), [lang, code]);

    const replaceRunLines = React.useCallback((runId: number, lines: TermLine[]) => {
        const tagged = lines.map((l) => ({ ...l, runId }));
        setTerminal((prev) => [...prev.filter((l) => l.runId !== runId), ...tagged]);
    }, []);

    const resetTerminal = React.useCallback((opts?: { keepReady?: boolean }) => {
        setTerminal([{ type: "sys", text: opts?.keepReady === false ? "" : "Ready." }].filter((l) => l.text));
        setAwaitingInput(false);
        setInputPrompt("");
        setInputLine("");
        setLastResult(null);
        setStdinBuffer("");
        setTypedLines([]);
        hasStartedExecRef.current = false;
        activeRunIdRef.current = null;
    }, []);

    const runOnce = React.useCallback(
        async (stdinToUse: string) => {
            if (runLockRef.current) return null;
            runLockRef.current = true;
            setBusy(true);
            setLastResult(null);

            try {
                if (onRun) {
                    const data = await onRun({ language: lang, code, stdin: stdinToUse });
                    setLastResult(data);
                    return data;
                }

                const res = await fetch("/api/run", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ language: lang, code, stdin: stdinToUse }),
                });

                const text = await res.text();
                let data: RunResult;
                try {
                    data = JSON.parse(text);
                } catch {
                    data = { ok: false, error: `Non-JSON response (${res.status}): ${text.slice(0, 300)}` };
                }
                setLastResult(data);
                return data;
            } finally {
                runLockRef.current = false;
                setBusy(false);
            }
        },
        [onRun, lang, code],
    );

    const rebuildInteractiveTranscript = React.useCallback(
        (runId: number, lines: string[], r: RunResult, showWaiting: boolean) => {
            const promptsRaw = inputPlan.prompts?.length ? inputPlan.prompts : ["Input:"];

            // split stdout by prompts in correct order
            const splitCount = showWaiting ? lines.length + 1 : lines.length;
            const promptsForSplit = expandPrompts(promptsRaw, Math.max(splitCount, 1), "Input:");

            const stdoutText = cleanTermText(r.stdout ?? "");
            const segs = splitStdoutByPrompts(stdoutText, promptsForSplit);

            const rebuilt: TermLine[] = [{ type: "sys", text: `Running… (${lang})` }];

            rebuilt.push(...toOutTermLines(segs[0] ?? ""));

            for (let i = 0; i < lines.length; i++) {
                const pDisp = prettyPrompt(promptsForSplit[i] || promptsRaw[i] || promptsRaw[0] || "Input:");
                rebuilt.push({ type: "in", text: `${pDisp} ${lines[i] ?? ""}` });

                // if prompt splitting left a leading single space, drop it
                let seg = segs[i + 1] ?? "";
                if (seg.startsWith(" ") && !seg.startsWith(" \n")) seg = seg.slice(1);

                rebuilt.push(...toOutTermLines(seg));
            }

            const extraErrs: TermLine[] = [];
            if (r.compile_output) extraErrs.push({ type: "err", text: cleanTermText(r.compile_output) });
            if (r.stderr) extraErrs.push({ type: "err", text: cleanTermText(r.stderr) });
            if (r.message) extraErrs.push({ type: "err", text: cleanTermText(r.message) });
            if (r.error) extraErrs.push({ type: "err", text: cleanTermText(r.error) });

            if (showWaiting) {
                const nextRaw = promptsRaw[lines.length] || promptsRaw[0] || "Input:";
                setAwaitingInput(true);
                setInputPrompt(prettyPrompt(nextRaw));
                rebuilt.push({ type: "sys", text: "Waiting for input…" });
                replaceRunLines(runId, rebuilt);
                setTimeout(() => inputRef.current?.focus(), 0);
                return;
            }

            rebuilt.push(...extraErrs);
            setAwaitingInput(false);
            setInputPrompt("");
            rebuilt.push({ type: r.ok === false ? "err" : "sys", text: `Done • ${fmtMeta(r)}` });

            replaceRunLines(runId, rebuilt);
        },
        [inputPlan.prompts, lang, replaceRunLines],
    );

    const startRun = React.useCallback(async () => {
        if (disabled || runLockRef.current || busy || !allowRun) return;

        if (resetTerminalOnRun) resetTerminal();
        else {
            setAwaitingInput(false);
            setInputPrompt("");
            setInputLine("");
            setLastResult(null);
            setStdinBuffer("");
            setTypedLines([]);
            hasStartedExecRef.current = false;
        }

        const runId = ++runIdRef.current;
        activeRunIdRef.current = runId;

        const expectsInput = inputPlan.expected > 0;
        const probeSafe = lang === "python" || lang === "java";

        // If no input expected: just run once
        if (!expectsInput) {
            replaceRunLines(runId, [{ type: "sys", text: `Running… (${lang})` }]);
            const r = await runOnce("");
            if (!r) return;
            rebuildInteractiveTranscript(runId, [], r, false);
            return;
        }

        // ---- Python/Java: PROBE RUN so early prints show before input ----
        if (probeSafe) {
            replaceRunLines(runId, [{ type: "sys", text: `Running… (${lang})` }]);
            hasStartedExecRef.current = true;

            const r = await runOnce(""); // empty stdin => should hit EOF/NoSuchElement quickly
            if (!r) return;

            const more = needsMoreInput(lang, r);
            // show early output now, then wait for input
            rebuildInteractiveTranscript(runId, [], r, more || true);
            return;
        }

        // ---- C/C++: static pre-output (safe), then collect inputs (no probe-run) ----
        const preOut = extractPreOutputForCCpp(lang, code, inputPlan.prompts);
        const firstPrompt = prettyPrompt(inputPlan.prompts[0] || "Input:");
        setAwaitingInput(true);
        setInputPrompt(firstPrompt);
        setTypedLines([]);
        setStdinBuffer("");
        hasStartedExecRef.current = false;

        replaceRunLines(runId, [
            { type: "sys", text: `Running… (${lang})` },
            ...preOut,
            { type: "sys", text: "Waiting for input…" },
        ]);

        setTimeout(() => inputRef.current?.focus(), 0);
    }, [
        disabled,
        busy,
        allowRun,
        resetTerminalOnRun,
        resetTerminal,
        lang,
        code,
        inputPlan,
        runOnce,
        replaceRunLines,
        rebuildInteractiveTranscript,
    ]);

    const submitInput = React.useCallback(async () => {
        if (disabled || runLockRef.current || busy) return;

        const runId = activeRunIdRef.current;
        if (!runId) return;

        // IMPORTANT: allow blank line input (needed to stop loops)
        const typed = String(inputLine ?? "");
        const next = [...typedLines, typed];

        setTypedLines(next);
        setInputLine("");
        setStdinBuffer(next.join("\n") + "\n");

        const expectsInput = inputPlan.expected > 0;
        const probeSafe = lang === "python" || lang === "java";

        // C/C++ collecting phase: wait until we have expected lines
        if (expectsInput && !probeSafe && next.length < inputPlan.expected) {
            const preOut = extractPreOutputForCCpp(lang, code, inputPlan.prompts);
            const nextPrompt = prettyPrompt(inputPlan.prompts[next.length] || inputPlan.prompts[0] || "Input:");

            setAwaitingInput(true);
            setInputPrompt(nextPrompt);

            replaceRunLines(runId, [
                { type: "sys", text: `Running… (${lang})` },
                ...preOut,
                ...next.map((val, i) => ({
                    type: "in" as const,
                    text: `${prettyPrompt(inputPlan.prompts[i] || "Input:")} ${val}`,
                })),
                { type: "sys", text: "Waiting for input…" },
            ]);

            setTimeout(() => inputRef.current?.focus(), 0);
            return;
        }

        // Run with all collected stdin (Python/Java reruns each submit; C/C++ runs once at the end)
        const stdin = next.join("\n") + "\n";
        const r = await runOnce(stdin);
        if (!r) return;

        const more = (probeSafe && needsMoreInput(lang, r)) || false;
        rebuildInteractiveTranscript(runId, next, r, more);

        // if waiting for more, keep input focused
    }, [
        disabled,
        busy,
        inputLine,
        typedLines,
        lang,
        code,
        inputPlan,
        runOnce,
        replaceRunLines,
        rebuildInteractiveTranscript,
    ]);

    return {
        stdinBuffer,
        terminal,
        awaitingInput,
        inputPrompt,
        inputLine,
        setInputLine,
        inputRef,
        busy,
        lastResult,
        resetTerminal,
        startRun,
        submitInput,
    };
}
