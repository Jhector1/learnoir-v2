"use client";

import React, { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import MathMarkdown from "@/components/math/MathMarkdown";
import type { Lang, RunResult } from "@/lib/code/runCode";

const Monaco = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const DEFAULT_CODE: Record<Lang, string> = {
  python: `print("Hello from Python!")\n`,
  java: `public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello from Java!");\n  }\n}\n`,
};

type TermLine =
  | { type: "sys"; text: string }
  | { type: "out"; text: string }
  | { type: "in"; text: string }
  | { type: "err"; text: string };

/**
 * Why it "stays white" for you:
 * - Many runners sometimes put errors/tracebacks into stdout (not stderr).
 * - Or Tailwind might not be emitting your dynamic text-* classes.
 *
 * This version fixes BOTH:
 * 1) If run failed and stderr/compile_output is empty, stdout is treated as error (red).
 * 2) We use inline color styles (guaranteed), while still keeping Tailwind classes for weight/etc.
 */

// Tailwind for font weight / general style (color handled by inline style below)
const termLineClass = (t: TermLine["type"]) => {
  switch (t) {
    case "err":
      return "font-semibold";
    case "in":
      return "";
    case "sys":
      return "";
    case "out":
    default:
      return "";
  }
};

// Guaranteed colors (no Tailwind dependency)
const termLineStyle = (t: TermLine["type"]): React.CSSProperties => {
  switch (t) {
    case "err":
      return { color: "#fda4af" }; // rose-300
    case "in":
      return { color: "#bae6fd" }; // sky-200
    case "sys":
      return { color: "rgba(255,255,255,0.70)" };
    case "out":
    default:
      return { color: "rgba(255,255,255,0.90)" };
  }
};

// Strip carriage returns + basic ANSI color codes (prevents “missing/overwritten” looking text)
function cleanTermText(s: string) {
  return (s ?? "")
    .replace(/\r/g, "")
    .replace(/\x1b\[[0-9;]*m/g, "");
}

function detectNeedsInput(lang: Lang, r: RunResult) {
  const stderr = cleanTermText(
    (r.stderr ?? "") + "\n" + (r.message ?? "") + "\n" + (r.error ?? ""),
  );

  // Python interactive: input() causes EOFError on Judge0-style runners if stdin missing
  const pythonNeeds =
    /EOFError: EOF when reading a line/.test(stderr) || /input\(\)/.test(stderr);

  // Java interactive: Scanner nextLine/nextInt with no stdin
  const javaNeeds =
    /NoSuchElementException/.test(stderr) ||
    /java\.util\.NoSuchElementException/.test(stderr) ||
    /Scanner/.test(stderr);

  const needs = lang === "python" ? pythonNeeds : javaNeeds;

  // Guess the prompt from last stdout line
  const outLines = cleanTermText(r.stdout ?? "")
    .split("\n")
    .map((s) => s.replace(/\r$/, ""));
  const lastNonEmpty =
    [...outLines].reverse().find((l) => l.trim().length) ?? "";

  return { needs, prompt: lastNonEmpty };
}

function fmtMeta(r: RunResult) {
  const time = r.time ? ` • ${r.time}s` : "";
  const mem = r.memory ? ` • ${Math.round(r.memory / 1024)}MB` : "";
  return `${r.status ?? (r.ok ? "OK" : "Error")}${time}${mem}`;
}

type ControlledProps = {
  language: Lang;
  onChangeLanguage: (l: Lang) => void;

  code: string;
  onChangeCode: (code: string) => void;

  stdin: string;
  onChangeStdin: (stdin: string) => void;
};

type UncontrolledProps = {
  initialLanguage?: Lang;
  initialCode?: string;
  initialStdin?: string;
};

type CodeRunnerProps =
  | ({
      title?: string;
      height?: number;
      hintMarkdown?: string;

      showLanguagePicker?: boolean;
      allowReset?: boolean;
      allowRun?: boolean;
      disabled?: boolean;

      resetTerminalOnRun?: boolean;
      resetStdinOnRun?: boolean;

      onRun?: (args: {
        language: Lang;
        code: string;
        stdin: string;
      }) => Promise<RunResult>;
    } & ControlledProps)
  | ({
      title?: string;
      height?: number;
      hintMarkdown?: string;

      showLanguagePicker?: boolean;
      allowReset?: boolean;
      allowRun?: boolean;
      disabled?: boolean;

      resetTerminalOnRun?: boolean;
      resetStdinOnRun?: boolean;

      onRun?: (args: {
        language: Lang;
        code: string;
        stdin: string;
      }) => Promise<RunResult>;
    } & UncontrolledProps);

function isControlled(
  p: CodeRunnerProps,
): p is Extract<CodeRunnerProps, ControlledProps> {
  return (
    (p as any).language !== undefined &&
    typeof (p as any).onChangeLanguage === "function"
  );
}

export default function CodeRunner(props: CodeRunnerProps) {
  const {
    title = "Try it",
    height = 320,
    hintMarkdown,
    showLanguagePicker = true,
    allowReset = true,
    allowRun = true,
    disabled = false,
    resetTerminalOnRun = true,
     // ✅ NEW
  showEditorThemeToggle = true,
    resetStdinOnRun = false,
    onRun,
  } = props;

  // ----- controlled vs uncontrolled state -----
  const controlled = isControlled(props);

  const [uLang, setULang] = useState<Lang>(props.initialLanguage ?? "python");
  const [uCode, setUCode] = useState<string>(
    props.initialCode ?? DEFAULT_CODE[props.initialLanguage ?? "python"],
  );
  const [uStdin, setUStdin] = useState<string>(
    (props as any).initialStdin ?? "",
  );

  const lang = controlled ? props.language : uLang;
  const code = controlled ? props.code : uCode;
  const stdin = controlled ? props.stdin : uStdin;

  const setLang = (l: Lang) =>
    controlled ? props.onChangeLanguage(l) : setULang(l);
  const setCode = (c: string) =>
    controlled ? props.onChangeCode(c) : setUCode(c);
  const setStdin = (s: string) =>
    controlled ? props.onChangeStdin(s) : setUStdin(s);

  // ----- terminal state -----
  const [stdinBuffer, setStdinBuffer] = useState<string>("");
  const [terminal, setTerminal] = useState<TermLine[]>([
    { type: "sys", text: "Ready." },
  ]);

  const [awaitingInput, setAwaitingInput] = useState(false);
  const [inputPrompt, setInputPrompt] = useState<string>("");
  const [inputLine, setInputLine] = useState<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [editorTheme, setEditorTheme] = useState<"vs" | "vs-dark">("vs-dark");

  const [busy, setBusy] = useState(false);
  const [lastResult, setLastResult] = useState<RunResult | null>(null);

  const appendLines = (lines: TermLine[]) => {
    setTerminal((prev) => [...prev, ...lines]);
  };

  const resetTerminal = (opts?: { keepReady?: boolean }) => {
    setTerminal(
      [{ type: "sys", text: opts?.keepReady === false ? "" : "Ready." }].filter(
        (l) => l.text,
      ),
    );
    setAwaitingInput(false);
    setInputPrompt("");
    setInputLine("");
    setLastResult(null);
    setStdinBuffer("");
  };

  const runOnce = async (stdinToUse: string) => {
    setBusy(true);
    setLastResult(null);

    if (onRun) {
      const data = await onRun({ language: lang, code, stdin: stdinToUse });
      setBusy(false);
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
      data = {
        ok: false,
        error: `Non-JSON response (${res.status}): ${text.slice(0, 300)}`,
      };
    }

    setBusy(false);
    setLastResult(data);
    return data;
  };

  const startRun = async () => {
    if (disabled || busy || !allowRun) return;

    if (resetTerminalOnRun) {
      resetTerminal();
    } else {
      setAwaitingInput(false);
      setInputPrompt("");
      setInputLine("");
    }

    if (resetStdinOnRun) setStdin("");

    const baseStdin = (resetStdinOnRun ? "" : stdin) + stdinBuffer;

    appendLines([{ type: "sys", text: `Running… (${lang})` }]);

    const data = await runOnce(baseStdin);
    const info = detectNeedsInput(lang, data);

    // Decide if this run is a failure (used to color stdout red when runner stuffs errors into stdout)
    const hasErrFields =
      !!data.compile_output || !!data.stderr || !!data.message || !!data.error;
    const isFailure = data.ok === false || hasErrFields;

    // stdout (sometimes contains errors on some runners)
    const stdoutText = cleanTermText(data.stdout ?? "");
    if (stdoutText) {
      const stdoutType: TermLine["type"] =
        isFailure && !data.stderr && !data.compile_output ? "err" : "out";
      appendLines([{ type: stdoutType, text: stdoutText }]);
    }

    if (info.needs) {
      setAwaitingInput(true);
      setInputPrompt(info.prompt || "Input:");
      appendLines([{ type: "sys", text: "Waiting for input…" }]);
      setTimeout(() => inputRef.current?.focus(), 0);
      return;
    }

    if (data.compile_output)
      appendLines([{ type: "err", text: cleanTermText(data.compile_output) }]);
    if (data.stderr)
      appendLines([{ type: "err", text: cleanTermText(data.stderr) }]);
    if (data.message)
      appendLines([{ type: "err", text: cleanTermText(data.message) }]);
    if (data.error)
      appendLines([{ type: "err", text: cleanTermText(data.error) }]);

    appendLines([
      {
        type: data.ok === false ? "err" : "sys",
        text: `Done • ${fmtMeta(data)}`,
      },
    ]);
  };

  const submitInput = async () => {
    if (disabled || busy) return;

    appendLines([{ type: "in", text: `${inputPrompt} ${inputLine}` }]);

    const nextTyped = stdinBuffer + inputLine + "\n";
    setStdinBuffer(nextTyped);
    setInputLine("");

    const combinedStdin = stdin + nextTyped;

    appendLines([{ type: "sys", text: "Continuing…" }]);

    const data = await runOnce(combinedStdin);
    const info = detectNeedsInput(lang, data);

    const hasErrFields =
      !!data.compile_output || !!data.stderr || !!data.message || !!data.error;
    const isFailure = data.ok === false || hasErrFields;

    const stdoutText = cleanTermText(data.stdout ?? "");
    if (stdoutText) {
      const stdoutType: TermLine["type"] =
        isFailure && !data.stderr && !data.compile_output ? "err" : "out";
      appendLines([{ type: stdoutType, text: stdoutText }]);
    }

    if (info.needs) {
      setAwaitingInput(true);
      setInputPrompt(info.prompt || inputPrompt || "Input:");
      appendLines([{ type: "sys", text: "Waiting for input…" }]);
      setTimeout(() => inputRef.current?.focus(), 0);
      return;
    }

    setAwaitingInput(false);
    setInputPrompt("");

    if (data.compile_output)
      appendLines([{ type: "err", text: cleanTermText(data.compile_output) }]);
    if (data.stderr)
      appendLines([{ type: "err", text: cleanTermText(data.stderr) }]);
    if (data.message)
      appendLines([{ type: "err", text: cleanTermText(data.message) }]);
    if (data.error)
      appendLines([{ type: "err", text: cleanTermText(data.error) }]);

    appendLines([
      {
        type: data.ok === false ? "err" : "sys",
        text: `Done • ${fmtMeta(data)}`,
      },
    ]);
  };

  const onSwitchLang = (next: Lang) => {
    setLang(next);
    setCode(
      (code?.trim()?.length ? code : DEFAULT_CODE[next]) ?? DEFAULT_CODE[next],
    );
    resetTerminal();
  };

  const terminalView = useMemo(() => {
    const stdinLines = stdinBuffer
      ? stdinBuffer.split("\n").filter(Boolean).length
      : 0;

    const terminalHasError = !!lastResult && lastResult.ok === false && !awaitingInput;

    return (
      <div
        className={[
          "rounded-2xl border bg-black/40 p-3",
          terminalHasError ? "border-rose-300/30" : "border-white/10",
        ].join(" ")}
      >
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-extrabold text-white/60">
            Terminal
          </div>
          <div className="text-[11px] font-extrabold text-white/50">
            typed lines: {stdinLines}
          </div>
        </div>

        <div
          className={[
            "mt-2 max-h-[260px] overflow-auto rounded-xl border bg-black/30 p-3",
            terminalHasError ? "border-rose-300/20" : "border-white/10",
          ].join(" ")}
        >
          {/* Base color prevents any "black-on-black" even if something isn't wrapped */}
          <pre className="whitespace-pre-wrap break-words text-xs leading-5 text-white/85">
            {terminal.map((l, i) => {
              const prefix =
                l.type === "sys" ? "• " : l.type === "in" ? "> " : "";
              return (
                <React.Fragment key={i}>
                  <span
                    className={termLineClass(l.type)}
                    style={termLineStyle(l.type)}
                  >
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
              <div className="text-xs font-extrabold text-white/70">
                {inputPrompt || "Input:"}
              </div>
              <input
                ref={inputRef}
                value={inputLine}
                onChange={(e) => setInputLine(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitInput();
                }}
                placeholder="Type and press Enter…"
                className="h-9 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-xs text-white/80 outline-none"
              />
              <button
                type="button"
                disabled={busy || disabled}
                onClick={submitInput}
                className={[
                  "rounded-xl border px-3 py-2 text-xs font-extrabold transition",
                  busy || disabled
                    ? "border-white/10 bg-white/5 text-white/50"
                    : "border-amber-300/30 bg-amber-300/10 text-white/90 hover:bg-amber-300/15",
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
              lastResult.ok === false ? "text-rose-300" : "text-white/50",
            ].join(" ")}
          >
            Last run: {fmtMeta(lastResult)}
          </div>
        ) : null}
      </div>
    );
  }, [terminal, awaitingInput, inputPrompt, inputLine, busy, stdinBuffer, lastResult, disabled]);

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-black text-white/90">{title}</div>

        <div className="flex items-center gap-2">
         {showEditorThemeToggle ? (
  <button
    type="button"
    onClick={() => setEditorTheme((t) => (t === "vs-dark" ? "vs" : "vs-dark"))}
    className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs font-extrabold text-white/80 hover:bg-white/10"
    title="Toggle editor theme"
    disabled={disabled}
  >
    {editorTheme === "vs-dark" ? "Editor: Dark" : "Editor: Light"}
  </button>
) : null}

          {showLanguagePicker ? (
            <>
              <div className="text-xs font-extrabold text-white/60">
                Language
              </div>
              {(["python", "java"] as Lang[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSwitchLang(l)}
                  className={[
                    "rounded-xl border px-3 py-1 text-xs font-extrabold transition",
                    lang === l
                      ? "border-emerald-300/30 bg-emerald-300/10 text-white/90"
                      : "border-white/10 bg-white/5 text-white/75 hover:bg-white/10",
                    disabled ? "opacity-60" : "",
                  ].join(" ")}
                >
                  {l}
                </button>
              ))}
            </>
          ) : null}

          {allowReset ? (
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                setCode(DEFAULT_CODE[lang]);
                setStdin("");
                resetTerminal();
              }}
              className="ml-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs font-extrabold text-white/80 hover:bg-white/10 disabled:opacity-60"
            >
              Reset
            </button>
          ) : null}

          {allowRun ? (
            <button
              type="button"
              disabled={busy || disabled}
              onClick={startRun}
              className={[
                "rounded-xl border px-3 py-1 text-xs font-extrabold transition",
                busy || disabled
                  ? "border-white/10 bg-white/5 text-white/50"
                  : "border-sky-300/30 bg-sky-300/10 text-white/90 hover:bg-sky-300/15",
              ].join(" ")}
            >
              {busy ? "Running…" : "Run"}
            </button>
          ) : null}
        </div>
      </div>

      {hintMarkdown ? (
        <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <MathMarkdown
            className="text-sm text-white/80 [&_.katex]:text-white/90"
            content={hintMarkdown}
          />
        </div>
      ) : null}

      {/* stdin box */}
      <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3">
        <div className="text-[11px] font-extrabold text-white/60">stdin</div>
        <textarea
          value={stdin}
          disabled={disabled}
          onChange={(e) => setStdin(e.target.value)}
          placeholder="Optional input fed to your program (before interactive typed lines)…"
          className="mt-2 h-20 w-full resize-none rounded-xl border border-white/10 bg-black/30 p-2 text-xs text-white/80 outline-none disabled:opacity-60"
        />
      </div>

      <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
        <Monaco
          height={height}
          language={lang === "python" ? "python" : "java"}
          value={code}
                    theme={editorTheme}   // ✅ switches on the fly

          onChange={(v) => setCode(v ?? "")}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            scrollBeyondLastLine: false,
            wordWrap: "on",
            automaticLayout: true,
            readOnly: disabled,
          }}
        />
      </div>

      <div className="mt-3">{terminalView}</div>
    </div>
  );
}
