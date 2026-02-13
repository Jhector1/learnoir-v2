"use client";

import * as React from "react";
import type {Lang, RunResult} from "@/lib/code/runCode";
import type {TermLine, OnRun} from "../types";
import {cleanTermText, toLines} from "../utils/text";
import {
    detectNeedsInput,
    extractFirstInputPrompt,
    extractJavaPrintPrompts,
    findPromptSplit, inferInputPlan,
    stripPromptsFromStdout
} from "../utils/input";
import {extractInputPromptsPython} from "@/components/code/runner/utils/input.python";

function fmtMeta(r: RunResult) {
    const time = r.time ? ` • ${r.time}s` : "";
    const mem = r.memory ? ` • ${Math.round(r.memory / 1024)}MB` : "";
    return `${r.status ?? (r.ok ? "OK" : "Error")}${time}${mem}`;
}

export function useTerminalRunner(args: {
    lang: Lang;
    code: string;
    disabled: boolean;
    allowRun: boolean;
    resetTerminalOnRun: boolean;
    onRun?: OnRun;
}) {
    const {lang, code, disabled, allowRun, resetTerminalOnRun, onRun} = args;

    const [stdinBuffer, setStdinBuffer] = React.useState("");
    const [terminal, setTerminal] = React.useState<TermLine[]>([{type: "sys", text: "Ready."}]);

    const [awaitingInput, setAwaitingInput] = React.useState(false);
    const [inputPrompt, setInputPrompt] = React.useState("");
    const [inputLine, setInputLine] = React.useState("");
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    const [busy, setBusy] = React.useState(false);
    const [lastResult, setLastResult] = React.useState<RunResult | null>(null);

    const runLockRef = React.useRef(false);
    const runIdRef = React.useRef(0);
    const activeRunIdRef = React.useRef<number | null>(null);
    const inputPlan = React.useMemo(() => inferInputPlan(lang, code), [lang, code]);

// For C/C++ we collect inputs first, then run once.
    const deferredRunRef = React.useRef(false);

    const replaceRunLines = React.useCallback((runId: number, lines: TermLine[]) => {
        const tagged = lines.map((l) => ({...l, runId}));
        setTerminal((prev) => [...prev.filter((l) => l.runId !== runId), ...tagged]);
    }, []);

    const appendRunLines = React.useCallback((runId: number, lines: TermLine[]) => {
        const tagged = lines.map((l) => ({...l, runId}));
        setTerminal((prev) => [...prev, ...tagged]);
    }, []);

    const resetTerminal = React.useCallback((opts?: { keepReady?: boolean }) => {
        setTerminal([{type: "sys", text: opts?.keepReady === false ? "" : "Ready."}].filter((l) => l.text));
        setAwaitingInput(false);
        setInputPrompt("");
        setInputLine("");
        setLastResult(null);
        setStdinBuffer("");
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
                    const data = await onRun({language: lang, code, stdin: stdinToUse});
                    setLastResult(data);
                    return data;
                }

                const res = await fetch("/api/run", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({language: lang, code, stdin: stdinToUse}),
                });

                const text = await res.text();
                let data: RunResult;
                try {
                    data = JSON.parse(text);
                } catch {
                    data = {ok: false, error: `Non-JSON response (${res.status}): ${text.slice(0, 300)}`};
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
    const splitStdoutByPrompts = React.useCallback((stdout: string, prompts: string[]) => {
        const out = String(stdout ?? "");
        if (!prompts.length) return [out];

        let pos = 0;
        const segs: string[] = [];

        for (const pRaw of prompts) {
            const p = String(pRaw ?? "");
            if (!p) continue;

            const variants = [p, p + " ", p.trimEnd(), p.trimEnd() + " "].filter(Boolean);

            let bestIdx = -1;
            let bestLen = 0;

            // find the earliest match >= pos for THIS prompt
            for (const v of variants) {
                const idx = out.indexOf(v, pos);
                if (idx !== -1 && (bestIdx === -1 || idx < bestIdx)) {
                    bestIdx = idx;
                    bestLen = v.length;
                }
            }

            if (bestIdx === -1) break;

            segs.push(out.slice(pos, bestIdx));
            pos = bestIdx + bestLen;
        }

        segs.push(out.slice(pos));
        return segs;
    }, []);

    const toOutTermLines = React.useCallback((s: string) => {
        const txt = cleanTermText(s ?? "");
        return toLines(txt).map<TermLine>((t) => ({ type: "out", text: t }));
    }, []);

    const startRun = React.useCallback(async () => {
        if (disabled || runLockRef.current || busy || !allowRun) return;

        setStdinBuffer("");

        if (resetTerminalOnRun) resetTerminal();
        else {
            setAwaitingInput(false);
            setInputPrompt("");
            setInputLine("");
        }

        const runId = ++runIdRef.current;



        activeRunIdRef.current = runId;

        appendRunLines(runId, [{type: "sys", text: `Running… (${lang})`}]);


        // ---- C/C++: collect inputs first to avoid uninitialized garbage ----
        if ((lang === "python" || lang === "c" || lang === "cpp") && inputPlan.expected > 0) {
            deferredRunRef.current = true;
            setAwaitingInput(true);
            setInputPrompt(inputPlan.prompts[0] || "Input:");
            appendRunLines(runId, [{ type: "sys", text: "Waiting for input…" }]);
            setTimeout(() => inputRef.current?.focus(), 0);
            return;
        }

        deferredRunRef.current = false;

        const data = await runOnce("");
        if (!data) return;

        const info = detectNeedsInput(lang, data, code);
        const stdoutText = cleanTermText(data.stdout ?? "");
        const outLines = toLines(stdoutText).map<TermLine>((t) => ({type: "out", text: t}));

        if (info.needs) {
            if (lang === "python") {
                const prompts = extractInputPromptsPython(code);
                const firstPrompt = prompts[0] || extractFirstInputPrompt(code) || info.prompt || "Input:";

                // show only output BEFORE the first prompt
                const segs = splitStdoutByPrompts(stdoutText, prompts.length ? [prompts[0]] : [firstPrompt]);
                const pre = segs[0] ?? "";
                const preLines = toOutTermLines(pre);
                if (preLines.length) appendRunLines(runId, preLines);

                setAwaitingInput(true);
                setInputPrompt(firstPrompt);
                appendRunLines(runId, [{ type: "sys", text: "Waiting for input…" }]);
                setTimeout(() => inputRef.current?.focus(), 0);
                return;
            }
            if (outLines.length) appendRunLines(runId, outLines);

            const promptFromCode = extractFirstInputPrompt(code);
            setAwaitingInput(true);
            setInputPrompt(info.prompt || promptFromCode || "Input:");
            appendRunLines(runId, [{type: "sys", text: "Waiting for input…"}]);
            setTimeout(() => inputRef.current?.focus(), 0);
            return;
        }

        const extraErrs: TermLine[] = [];
        if (data.compile_output) extraErrs.push({type: "err", text: cleanTermText(data.compile_output)});
        if (data.stderr) extraErrs.push({type: "err", text: cleanTermText(data.stderr)});
        if (data.message) extraErrs.push({type: "err", text: cleanTermText(data.message)});
        if (data.error) extraErrs.push({type: "err", text: cleanTermText(data.error)});

        appendRunLines(runId, [
            ...outLines,
            ...extraErrs,
            {type: data.ok === false ? "err" : "sys", text: `Done • ${fmtMeta(data)}`},
        ]);
    }, [
        disabled,
        busy,
        allowRun,
        resetTerminalOnRun,
        resetTerminal,
        appendRunLines,
        runOnce,
        lang,
        code,
    ]);

    const submitInput = React.useCallback(async () => {
        if (disabled || runLockRef.current || busy) return;
        const runId = activeRunIdRef.current;
        if (!runId) return;

        const typed = String(inputLine ?? "");
        if (!typed.length) return;

        const nextBuffer = stdinBuffer + typed + "\n";

        setInputLine("");
        setStdinBuffer(nextBuffer);

        const data = await runOnce(nextBuffer);


        if (!data) return;

        const info = detectNeedsInput(lang, data, code);

        const stdoutText = cleanTermText(data.stdout ?? "");
        const prompt = inputPrompt || extractFirstInputPrompt(code) || "Input:";
        const typedLinesAll = nextBuffer.split("\n").filter(Boolean);
        // const typedLinesAll = nextBuffer.split("\n").filter(Boolean);

        if ((lang === "c" || lang === "cpp") && deferredRunRef.current) {
            const expected = inputPlan.expected || typedLinesAll.length;

            // If we still need more inputs, just update transcript and keep waiting.
            if (typedLinesAll.length < expected) {
                const rebuilt = [
                    { type: "sys" as const, text: `Running… (${lang})` },
                    ...typedLinesAll.map((val, i) => ({
                        type: "in" as const,
                        text: `${inputPlan.prompts[i] || "Input:"} ${val}`,
                    })),
                    { type: "sys" as const, text: "Waiting for input…" },
                ];

                setAwaitingInput(true);
                setInputPrompt(inputPlan.prompts[typedLinesAll.length] || "Input:");
                replaceRunLines(runId, rebuilt);
                setTimeout(() => inputRef.current?.focus(), 0);
                return;
            }

            // We have enough inputs -> run ONCE with full stdin
            deferredRunRef.current = false;
        }

        let preOutLines: string[] = [];
        // let postOutLines: string[] = [];

        if (lang === "python") {
            const promptsFromCode = extractInputPromptsPython(code);
            const typedCount = typedLinesAll.length;

            // fallback if prompts can't be extracted (rare)
            const fallbackPrompt = extractFirstInputPrompt(code) || info.prompt || "Input:";
            const prompts =
                promptsFromCode.length > 0
                    ? promptsFromCode
                    : Array(Math.max(typedCount + (info.needs ? 1 : 0), 1)).fill(fallbackPrompt);

            // Split stdout in the *real* order by prompts
            const segs = splitStdoutByPrompts(stdoutText, prompts);

            const rebuilt: any[] = [{ type: "sys", text: `Running… (${lang})` }];

            // output before first prompt
            rebuilt.push(...toOutTermLines(segs[0] ?? ""));

            // interleave: input i, then output segment i+1
            for (let i = 0; i < typedCount; i++) {
                const p = prompts[i] || "Input:";
                rebuilt.push({ type: "in", text: `${p} ${typedLinesAll[i]}` });
                rebuilt.push(...toOutTermLines(segs[i + 1] ?? ""));
            }

            if (info.needs) {
                setAwaitingInput(true);
                setInputPrompt(prompts[typedCount] || info.prompt || "Input:");
                rebuilt.push({ type: "sys", text: "Waiting for input…" });
                replaceRunLines(runId, rebuilt);
                setTimeout(() => inputRef.current?.focus(), 0);
                return;
            }

            // finished: append errors + Done
            if (data.compile_output) rebuilt.push({ type: "err", text: cleanTermText(data.compile_output) });
            if (data.stderr) rebuilt.push({ type: "err", text: cleanTermText(data.stderr) });
            if (data.message) rebuilt.push({ type: "err", text: cleanTermText(data.message) });
            if (data.error) rebuilt.push({ type: "err", text: cleanTermText(data.error) });

            setAwaitingInput(false);
            setInputPrompt("");
            rebuilt.push({ type: data.ok === false ? "err" : "sys", text: `Done • ${fmtMeta(data)}` });

            replaceRunLines(runId, rebuilt);
            return;
        }


        // const stdoutText = cleanTermText(data.stdout ?? "");
        else if (lang === "java") {
            const prompts = extractJavaPrintPrompts(code);
            const stdoutClean = stripPromptsFromStdout(stdoutText, prompts);
            const outLines = toLines(stdoutClean).map((t) => ({type: "out" as const, text: t}));

            const inLines = typedLinesAll.map((val, i) => {
                const p = prompts[i] || "Input:";
                return {type: "in" as const, text: `${p} ${val}`};
            });

            const rebuilt: any[] = [
                {type: "sys", text: `Running… (${lang})`},
                ...inLines,
                ...outLines,
            ];

            if (info.needs) {
                // next prompt = next expected prompt by index
                setAwaitingInput(true);
                setInputPrompt(prompts[typedLinesAll.length] || info.prompt || "Input:");
                rebuilt.push({type: "sys", text: "Waiting for input…"});
                replaceRunLines(runId, rebuilt);
                setTimeout(() => inputRef.current?.focus(), 0);
                return;
            }

            setAwaitingInput(false);
            setInputPrompt("");

            rebuilt.push({
                type: data.ok === false ? "err" : "sys",
                text: `Done • ${fmtMeta(data)}`,
            });

            replaceRunLines(runId, rebuilt);
            return;
        }else if (lang === "c" || lang === "cpp") {
            const promptList = inputPlan.prompts;
            const stdoutClean = stripPromptsFromStdout(cleanTermText(data.stdout ?? ""), promptList);
            const outLines = toLines(stdoutClean).map((t) => ({ type: "out" as const, text: t }));

            const inLines = typedLinesAll.map((val, i) => ({
                type: "in" as const,
                text: `${promptList[i] || "Input:"} ${val}`,
            }));

            const extraErrs: any[] = [];
            if (data.compile_output) extraErrs.push({ type: "err", text: cleanTermText(data.compile_output) });
            if (data.stderr) extraErrs.push({ type: "err", text: cleanTermText(data.stderr) });
            if (data.message) extraErrs.push({ type: "err", text: cleanTermText(data.message) });
            if (data.error) extraErrs.push({ type: "err", text: cleanTermText(data.error) });

            const rebuilt = [
                { type: "sys" as const, text: `Running… (${lang})` },
                ...inLines,
                ...outLines,
                ...extraErrs,
                { type: data.ok === false ? ("err" as const) : ("sys" as const), text: `Done • ${fmtMeta(data)}` },
            ];

            setAwaitingInput(false);
            setInputPrompt("");
            replaceRunLines(runId, rebuilt);
            return;
        }





        else {
            preOutLines = toLines(stdoutText);
        }

        const extraErrs: TermLine[] = [];
        if (!info.needs) {
            if (data.compile_output) extraErrs.push({type: "err", text: cleanTermText(data.compile_output)});
            if (data.stderr) extraErrs.push({type: "err", text: cleanTermText(data.stderr)});
            if (data.message) extraErrs.push({type: "err", text: cleanTermText(data.message)});
            if (data.error) extraErrs.push({type: "err", text: cleanTermText(data.error)});
        }

        const rebuilt: TermLine[] = [
            {type: "sys", text: `Running… (${lang})`},
            ...preOutLines.map((t) => ({type: "out", text: t})),
            {type: "in", text: `${prompt} ${typed}`},
            ...postOutLines.map((t) => ({type: "out", text: t})),
            ...extraErrs,
        ];

        if (info.needs) {
            const promptFromCode = extractFirstInputPrompt(code);
            setAwaitingInput(true);
            setInputPrompt(info.prompt || promptFromCode || prompt || "Input:");
            rebuilt.push({type: "sys", text: "Waiting for input…"});
            replaceRunLines(runId, rebuilt);
            setTimeout(() => inputRef.current?.focus(), 0);
            return;
        }

        setAwaitingInput(false);
        setInputPrompt("");

        rebuilt.push({type: data.ok === false ? "err" : "sys", text: `Done • ${fmtMeta(data)}`});
        replaceRunLines(runId, rebuilt);
    }, [
        disabled,
        busy,
        inputLine,
        stdinBuffer,
        runOnce,
        lang,
        code,
        inputPrompt,
        replaceRunLines,
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
