"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import MathMarkdown from "@/components/math/MathMarkdown";
import type { Lang, RunResult } from "@/lib/code/runCode";

const Monaco = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const DEFAULT_LANGS: Lang[] = ["python", "java", "javascript", "c", "cpp"];

const DEFAULT_CODE: Record<Lang, string> = {
  python: `print("Hello from Python!")\n`,
  java: `public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello from Java!");\n  }\n}\n`,
  javascript: `console.log("Hello from JavaScript!");\n`,
  c: `#include <stdio.h>\n\nint main() {\n  printf("Hello from C!\\n");\n  return 0;\n}\n`,
  cpp: `#include <iostream>\n\nint main() {\n  std::cout << "Hello from C++!" << std::endl;\n  return 0;\n}\n`,
};

type TermLine =
    | { type: "sys"; text: string; runId?: number }
    | { type: "out"; text: string; runId?: number }
    | { type: "in"; text: string; runId?: number }
    | { type: "err"; text: string; runId?: number };

type TerminalDock = "bottom" | "right";

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function cleanTermText(s: string) {
  return (s ?? "").replace(/\r/g, "").replace(/\x1b\[[0-9;]*m/g, "");
}

function fmtMeta(r: RunResult) {
  const time = r.time ? ` • ${r.time}s` : "";
  const mem = r.memory ? ` • ${Math.round(r.memory / 1024)}MB` : "";
  return `${r.status ?? (r.ok ? "OK" : "Error")}${time}${mem}`;
}

function monacoLang(l: Lang) {
  if (l === "python") return "python";
  if (l === "java") return "java";
  if (l === "javascript") return "javascript";
  return "cpp";
}

function extractFirstInputPrompt(src: string) {
  // Keep as-authored; don't trim aggressively (prompt may include trailing space)
  const m = String(src ?? "").match(/\binput\s*\(\s*(['"])([\s\S]*?)\1\s*\)/);
  return (m?.[2] ?? "");
}

function toLines(s: string) {
  const raw = cleanTermText(s ?? "");
  if (!raw) return [];
  const parts = raw.split("\n").map((x) => x.replace(/\r$/, ""));
  // drop only trailing empty line
  while (parts.length && parts[parts.length - 1] === "") parts.pop();
  return parts;
}

function findPromptSplit(stdout: string, prompt: string) {
  const out = String(stdout ?? "");
  const p = String(prompt ?? "");
  if (!out || !p) return { found: false, pre: out, post: "" };

  const cand = [
    p,
    p + " ",
    p.trimEnd(),
    p.trimEnd() + " ",
  ].filter(Boolean);

  for (const c of cand) {
    const idx = out.indexOf(c);
    if (idx >= 0) {
      return {
        found: true,
        pre: out.slice(0, idx),
        post: out.slice(idx + c.length),
      };
    }
  }
  return { found: false, pre: out, post: "" };
}

function detectNeedsInput(lang: Lang, r: RunResult, srcCode?: string) {
  if (lang !== "python" && lang !== "java") return { needs: false, prompt: "" };

  const errBlob = cleanTermText(
      (r.compile_output ?? "") +
      "\n" +
      (r.stderr ?? "") +
      "\n" +
      (r.message ?? "") +
      "\n" +
      (r.error ?? ""),
  );

  const pythonNeeds =
      /\bEOFError\b/.test(errBlob) ||
      /EOFError: EOF when reading a line/.test(errBlob) ||
      /\binput\(\)/.test(errBlob);

  const javaNeeds =
      /NoSuchElementException/.test(errBlob) ||
      /java\.util\.NoSuchElementException/.test(errBlob) ||
      /Scanner/.test(errBlob);

  let needs = lang === "python" ? pythonNeeds : javaNeeds;

  // prompt guess from stdout
  const outLines = toLines(r.stdout ?? "");
  const lastNonEmpty =
      [...outLines].reverse().find((l) => l.trim().length) ?? "";

  // fallback: if code contains input() and we got an error-ish blob, treat as awaiting input
  if (!needs && lang === "python" && srcCode && /\binput\s*\(/.test(srcCode)) {
    const endedWithIssue =
        r.ok === false ||
        !!r.compile_output ||
        !!r.stderr ||
        !!r.message ||
        !!r.error;
    if (endedWithIssue) needs = true;
  }

  return { needs, prompt: lastNonEmpty };
}

type ControlledProps = {
  language: Lang;
  onChangeLanguage: (l: Lang) => void;

  code: string;
  onChangeCode: (code: string) => void;

  terminalDock?: TerminalDock;
  onChangeTerminalDock?: (d: TerminalDock) => void;
};

type UncontrolledProps = {
  initialLanguage?: Lang;
  initialCode?: string;

  initialTerminalDock?: TerminalDock;
  initialTerminalSize?: number; // used as initial terminal height/width
};

type CommonProps = {
  title?: string;
  height?: number;

  hintMarkdown?: string;

  showHeaderBar?: boolean;
  showEditor?: boolean;
  showTerminal?: boolean;
  showHint?: boolean;

  fixedLanguage?: Lang;
  allowedLanguages?: Lang[];
  showLanguagePicker?: boolean;

  allowReset?: boolean;
  allowRun?: boolean;
  disabled?: boolean;

  resetTerminalOnRun?: boolean;

  fixedTerminalDock?: TerminalDock;

  showEditorThemeToggle?: boolean;
  showTerminalDockToggle?: boolean;

  onRun?: (args: { language: Lang; code: string; stdin: string }) => Promise<RunResult>;
};

type CodeRunnerProps =
    | (CommonProps & ControlledProps)
    | (CommonProps & UncontrolledProps);

function isControlled(p: CodeRunnerProps): p is CommonProps & ControlledProps {
  return (
      (p as any).language !== undefined &&
      typeof (p as any).onChangeLanguage === "function"
  );
}

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

export default function CodeRunner(props: CodeRunnerProps) {
  const {
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

  // ---------- theme aware Monaco ----------
  const { resolvedTheme } = useTheme();
  const [editorTheme, setEditorTheme] = useState<"vs" | "vs-dark">("vs-dark");

  useEffect(() => {
    if (!showEditorThemeToggle) {
      setEditorTheme(resolvedTheme === "dark" ? "vs-dark" : "vs");
    }
  }, [resolvedTheme, showEditorThemeToggle]);

  // ---------- languages ----------
  const allowedLangs = useMemo(() => {
    const base = allowedLanguages?.length ? allowedLanguages : DEFAULT_LANGS;
    if (fixedLanguage) return [fixedLanguage];
    return base;
  }, [allowedLanguages, fixedLanguage]);

  const initialLang: Lang =
      fixedLanguage ??
      (controlled ? (props as any).language : (props as any).initialLanguage) ??
      allowedLangs[0] ??
      "python";

  // ---------- uncontrolled state ----------
  const [uLang, setULang] = useState<Lang>(initialLang);
  const [uCode, setUCode] = useState<string>(
      (props as any).initialCode ?? DEFAULT_CODE[initialLang],
  );

  // ---------- resolved state ----------
  const lang: Lang = fixedLanguage
      ? fixedLanguage
      : controlled
          ? (props as any).language
          : uLang;

  const code: string = controlled ? (props as any).code : uCode;

  const setLang = (l: Lang) => {
    if (fixedLanguage) return;
    if (!allowedLangs.includes(l)) return;
    controlled ? (props as any).onChangeLanguage(l) : setULang(l);
  };

  const setCode = (c: string) =>
      controlled ? (props as any).onChangeCode(c) : setUCode(c);

  // ---------- dock ----------
  const [uDock, setUDock] = useState<TerminalDock>(
      (props as any).initialTerminalDock ?? "bottom",
  );

  const dock: TerminalDock =
      fixedTerminalDock ?? (props as any).terminalDock ?? uDock;

  const setDock = (d: TerminalDock) => {
    if (fixedTerminalDock) return;
    const cb = (props as any).onChangeTerminalDock as
        | ((d: TerminalDock) => void)
        | undefined;
    if (cb) cb(d);
    else setUDock(d);
  };

  // ---------- split sizing ----------
  const SPLIT_PX = 8;
  const MIN_EDITOR_H = 160;
  const MIN_TERM_H = 140;

  const MIN_EDITOR_W = 320;
  const MIN_TERM_W = 240;

  const initialTerm = (props as any).initialTerminalSize ?? 240;

  const [termH, setTermH] = useState<number>(clamp(initialTerm, MIN_TERM_H, 520));
  const [termW, setTermW] = useState<number>(clamp(initialTerm, MIN_TERM_W, 720));

  const [bottomTotalH, setBottomTotalH] = useState<number>(() => {
    if (!(showEditor && showTerminal)) return height;
    return height + clamp(initialTerm, MIN_TERM_H, 520) + SPLIT_PX;
  });

  useEffect(() => {
    if (!(showEditor && showTerminal)) {
      setBottomTotalH(height);
      return;
    }
    setBottomTotalH(() => height + termH + SPLIT_PX);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height]);

  // ---------- measure width for right dock clamp ----------
  const mainRef = useRef<HTMLDivElement | null>(null);
  const [mainW, setMainW] = useState<number>(0);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;

    const update = () => setMainW(el.getBoundingClientRect().width);
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();

    return () => ro.disconnect();
  }, []);

  // ---------- Monaco layout reliability ----------
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

  useEffect(() => {
    requestLayout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dock, termH, termW, bottomTotalH]);

  // ---------- splitter drag ----------
  const splitDragRef = useRef<{
    startX: number;
    startY: number;
    startSize: number;
    dock: TerminalDock;
  } | null>(null);

  function onMouseDownSplit(e: React.MouseEvent) {
    if (disabled) return;
    e.preventDefault();

    splitDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startSize: dock === "bottom" ? termH : termW,
      dock,
    };

    const prevSelect = document.body.style.userSelect;
    const prevCursor = document.body.style.cursor;
    document.body.style.userSelect = "none";
    document.body.style.cursor = dock === "bottom" ? "row-resize" : "col-resize";

    const onMove = (ev: MouseEvent) => {
      const d = splitDragRef.current;
      if (!d) return;

      if (d.dock === "bottom") {
        const dy = ev.clientY - d.startY;
        const maxTerm = Math.max(MIN_TERM_H, bottomTotalH - SPLIT_PX - MIN_EDITOR_H);
        const next = clamp(d.startSize - dy, MIN_TERM_H, maxTerm);
        setTermH(next);
      } else {
        const dx = ev.clientX - d.startX;
        const available = mainW || 0;
        const maxTerm = Math.max(MIN_TERM_W, available - 2 - MIN_EDITOR_W);
        const next = clamp(d.startSize - dx, MIN_TERM_W, maxTerm || 720);
        setTermW(next);
      }

      requestLayout();
    };

    const onUp = () => {
      splitDragRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);

      document.body.style.userSelect = prevSelect;
      document.body.style.cursor = prevCursor;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  // ---- terminal state ----
  const [stdinBuffer, setStdinBuffer] = useState<string>(""); // typed lines (accumulated)
  const [terminal, setTerminal] = useState<TermLine[]>([
    { type: "sys", text: "Ready." },
  ]);

  const [awaitingInput, setAwaitingInput] = useState(false);
  const [inputPrompt, setInputPrompt] = useState<string>("");
  const [inputLine, setInputLine] = useState<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [busy, setBusy] = useState(false);
  const [lastResult, setLastResult] = useState<RunResult | null>(null);

  // ✅ prevent double/triple executions
  const runLockRef = useRef(false);

  // ✅ run id tracking (we replace the whole run block after input)
  const runIdRef = useRef(0);
  const activeRunIdRef = useRef<number | null>(null);

  const appendFreeLines = (lines: TermLine[]) =>
      setTerminal((prev) => [...prev, ...lines]);

  const appendRunLines = (runId: number, lines: TermLine[]) => {
    const tagged = lines.map((l) => ({ ...l, runId }));
    setTerminal((prev) => [...prev, ...tagged]);
  };

  const replaceRunLines = (runId: number, lines: TermLine[]) => {
    const tagged = lines.map((l) => ({ ...l, runId }));
    setTerminal((prev) => [...prev.filter((l) => l.runId !== runId), ...tagged]);
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
    activeRunIdRef.current = null;
  };

  const runOnce = async (stdinToUse: string) => {
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
        data = {
          ok: false,
          error: `Non-JSON response (${res.status}): ${text.slice(0, 300)}`,
        };
      }
      setLastResult(data);
      return data;
    } finally {
      runLockRef.current = false;
      setBusy(false);
    }
  };

  const startRun = async () => {
    if (disabled || runLockRef.current || busy || !allowRun) return;

    // new run -> clear typed buffer
    setStdinBuffer("");

    if (resetTerminalOnRun) resetTerminal();
    else {
      setAwaitingInput(false);
      setInputPrompt("");
      setInputLine("");
    }

    const runId = ++runIdRef.current;
    activeRunIdRef.current = runId;

    appendRunLines(runId, [{ type: "sys", text: `Running… (${lang})` }]);

    const data = await runOnce("");
    if (!data) return;

    const info = detectNeedsInput(lang, data, code);

    const stdoutText = cleanTermText(data.stdout ?? "");
    const outLines = toLines(stdoutText).map<TermLine>((t) => ({ type: "out", text: t }));

    if (info.needs) {
      // show whatever stdout we got (often empty with some runners)
      if (outLines.length) appendRunLines(runId, outLines);

      const promptFromCode = extractFirstInputPrompt(code);
      setAwaitingInput(true);
      setInputPrompt(info.prompt || promptFromCode || "Input:");
      appendRunLines(runId, [{ type: "sys", text: "Waiting for input…" }]);
      setTimeout(() => inputRef.current?.focus(), 0);
      return;
    }

    const extraErrs: TermLine[] = [];
    if (data.compile_output) extraErrs.push({ type: "err", text: cleanTermText(data.compile_output) });
    if (data.stderr) extraErrs.push({ type: "err", text: cleanTermText(data.stderr) });
    if (data.message) extraErrs.push({ type: "err", text: cleanTermText(data.message) });
    if (data.error) extraErrs.push({ type: "err", text: cleanTermText(data.error) });

    appendRunLines(runId, [
      ...outLines,
      ...extraErrs,
      { type: data.ok === false ? "err" : "sys", text: `Done • ${fmtMeta(data)}` },
    ]);
  };

  const submitInput = async () => {
    if (disabled || runLockRef.current || busy) return;
    const runId = activeRunIdRef.current;
    if (!runId) return;

    const typed = String(inputLine ?? "");
    if (!typed.length) return;

    // accumulate typed lines
    const nextBuffer = stdinBuffer + typed + "\n";
    setInputLine("");
    setStdinBuffer(nextBuffer);

    const data = await runOnce(nextBuffer);
    if (!data) return;

    const info = detectNeedsInput(lang, data, code);

    const stdoutText = cleanTermText(data.stdout ?? "");
    const prompt = inputPrompt || extractFirstInputPrompt(code) || "Input:";

    // ---- Build a "nice" transcript block ----
    // We try to split stdout around the prompt so it doesn't glue to output.
    let preOutLines: string[] = [];
    let postOutLines: string[] = [];

    if (lang === "python") {
      const split = findPromptSplit(stdoutText, prompt);
      if (split.found) {
        preOutLines = toLines(split.pre);
        postOutLines = toLines(split.post);
      } else {
        preOutLines = toLines(stdoutText);
        postOutLines = [];
      }
    } else {
      // keep default for other langs
      preOutLines = toLines(stdoutText);
      postOutLines = [];
    }

    const extraErrs: TermLine[] = [];
    // When we are still awaiting input, don't spam EOF stack traces.
    // If you want to show them, remove this guard.
    if (!info.needs) {
      if (data.compile_output) extraErrs.push({ type: "err", text: cleanTermText(data.compile_output) });
      if (data.stderr) extraErrs.push({ type: "err", text: cleanTermText(data.stderr) });
      if (data.message) extraErrs.push({ type: "err", text: cleanTermText(data.message) });
      if (data.error) extraErrs.push({ type: "err", text: cleanTermText(data.error) });
    }

    const rebuilt: TermLine[] = [
      { type: "sys", text: `Running… (${lang})` },
      ...preOutLines.map((t) => ({ type: "out", text: t })),
      // show the user's typed line like a real terminal
      { type: "in", text: `${prompt} ${typed}` },
      ...postOutLines.map((t) => ({ type: "out", text: t })),
      ...extraErrs,
    ];

    if (info.needs) {
      // more input needed
      const promptFromCode = extractFirstInputPrompt(code);
      setAwaitingInput(true);
      setInputPrompt(info.prompt || promptFromCode || prompt || "Input:");
      rebuilt.push({ type: "sys", text: "Waiting for input…" });
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

    // ✅ Replace the whole run block (no weird ordering, no duplicates)
    replaceRunLines(runId, rebuilt);
  };

  const onSwitchLang = (next: Lang) => {
    if (fixedLanguage) return;
    if (!allowedLangs.includes(next)) return;

    setLang(next);
    setCode(
        (code?.trim()?.length ? code : DEFAULT_CODE[next]) ?? DEFAULT_CODE[next],
    );
    resetTerminal();
  };

  const showPickerUI =
      showLanguagePicker && !fixedLanguage && allowedLangs.length > 1;

  const showEditorThemeToggleUI = showEditorThemeToggle && showHeaderBar;
  const showDockToggleUI =
      showTerminalDockToggle &&
      !fixedTerminalDock &&
      showHeaderBar &&
      showEditor &&
      showTerminal;

  const bottomMaxTerm = Math.max(
      MIN_TERM_H,
      bottomTotalH - SPLIT_PX - MIN_EDITOR_H,
  );
  const bottomTermH = clamp(termH, MIN_TERM_H, bottomMaxTerm);
  const bottomEditorH = Math.max(
      MIN_EDITOR_H,
      bottomTotalH - SPLIT_PX - bottomTermH,
  );

  const terminalView = useMemo(() => {
    const stdinLines = stdinBuffer
        ? stdinBuffer.split("\n").filter(Boolean).length
        : 0;
    const terminalHasError =
        !!lastResult && lastResult.ok === false && !awaitingInput;

    return (
        <div
            className={[
              "h-full rounded-2xl border p-3 flex flex-col",
              "bg-white/80 dark:bg-black/40",
              terminalHasError
                  ? "border-rose-300/30"
                  : "border-neutral-200 dark:border-white/10",
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
              className={[
                "mt-2 flex-1 overflow-auto rounded-xl border p-3",
                "bg-white/60 dark:bg-black/30",
                terminalHasError
                    ? "border-rose-300/20"
                    : "border-neutral-200 dark:border-white/10",
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
                          submitInput();
                        }
                      }}
                      placeholder="Type and press Enter…"
                      className="h-9 w-full rounded-xl border border-neutral-200 bg-white/70 px-3 text-xs text-neutral-900 outline-none dark:border-white/10 dark:bg-black/40 dark:text-white/80"
                  />
                  <button
                      type="button"
                      disabled={busy || disabled}
                      onClick={submitInput}
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
                    lastResult.ok === false
                        ? "text-rose-600 dark:text-rose-300"
                        : "text-neutral-500 dark:text-white/50",
                  ].join(" ")}
              >
                Last run: {fmtMeta(lastResult)}
              </div>
          ) : null}
        </div>
    );
  }, [
    terminal,
    awaitingInput,
    inputPrompt,
    inputLine,
    busy,
    stdinBuffer,
    lastResult,
    disabled,
  ]);
  const rightTotalH =
      showEditor && showTerminal ? bottomTotalH : height;

  return (
      <div className="ui-card w-full p-4">
        {showHeaderBar ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-black text-neutral-900 dark:text-white/90">
                {title}
              </div>

              <div className="flex items-center gap-2">
                {showEditorThemeToggleUI ? (
                    <button
                        type="button"
                        onClick={() =>
                            setEditorTheme((t) => (t === "vs-dark" ? "vs" : "vs-dark"))
                        }
                        className="ui-authbtn"
                        title="Toggle editor theme"
                        disabled={disabled}
                    >
                      {editorTheme === "vs-dark" ? "Editor: Dark" : "Editor: Light"}
                    </button>
                ) : null}

                {showDockToggleUI ? (
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => setDock(dock === "bottom" ? "right" : "bottom")}
                        className="ui-authbtn disabled:opacity-60"
                        title="Toggle terminal position"
                    >
                      Terminal: {dock === "bottom" ? "Bottom" : "Right"}
                    </button>
                ) : null}

                {showPickerUI ? (
                    <>
                      <div className="text-xs font-extrabold text-neutral-600 dark:text-white/60">
                        Language
                      </div>
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
                      Language:{" "}
                      <span className="text-neutral-900 dark:text-white/85">{lang}</span>
                    </div>
                )}

                {allowReset ? (
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          setCode(DEFAULT_CODE[lang]);
                          resetTerminal();
                        }}
                        className="ui-authbtn disabled:opacity-60"
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
                              ? "border-neutral-200 bg-white/60 text-neutral-400 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/40"
                              : "border-sky-300/30 bg-sky-300/10 text-neutral-900 hover:bg-sky-300/15 dark:text-white/90",
                        ].join(" ")}
                    >
                      {busy ? "Running…" : "Run"}
                    </button>
                ) : null}
              </div>
            </div>
        ) : null}

        {showHint && hintMarkdown ? (
            <div className="ui-soft mt-3 p-3">
              <MathMarkdown className="ui-math" content={hintMarkdown} />
            </div>
        ) : null}

        {showEditor || showTerminal ? (
            <div
                ref={mainRef}
                className="mt-3 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50/60 dark:border-white/10 dark:bg-black/20"
            >
              {/* Editor only */}
              {showEditor && !showTerminal ? (
                  <div className="bg-white/70 dark:bg-black/10">
                    <Monaco
                        height={height}
                        language={monacoLang(lang)}
                        value={code}
                        theme={editorTheme}
                        onMount={(ed: any) => {
                          monacoEditorRef.current = ed;
                          requestLayout();
                        }}
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
              ) : null}

              {/* Terminal only */}
              {!showEditor && showTerminal ? (
                  <div style={{ height }} className="p-3">
                    {terminalView}
                  </div>
              ) : null}

              {/* Editor + Terminal */}
              {showEditor && showTerminal ? (
                  dock === "bottom" ? (
                      <div className="flex flex-col" style={{ height: bottomTotalH }}>
                        <div className="min-h-0 border-b border-neutral-200 bg-white/70 dark:border-white/10 dark:bg-black/10">
                          <Monaco
                              height={bottomEditorH}
                              language={monacoLang(lang)}
                              value={code}
                              theme={editorTheme}
                              onMount={(ed: any) => {
                                monacoEditorRef.current = ed;
                                requestLayout();
                              }}
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

                        <div
                            onMouseDown={onMouseDownSplit}
                            className="h-2 cursor-row-resize bg-neutral-200/60 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10"
                            title="Drag to resize terminal"
                        />

                        <div className="min-h-0 p-3" style={{ height: bottomTermH }}>
                          {terminalView}
                        </div>
                      </div>
                  ) : (
                      <div className="flex" style={{ height: rightTotalH }}>
                        <div className="min-w-0 flex-1 border-r border-neutral-200 bg-white/70 dark:border-white/10 dark:bg-black/10">
                          <Monaco
                              height={rightTotalH}
                              language={monacoLang(lang)}
                              value={code}
                              theme={editorTheme}
                              onMount={(ed: any) => {
                                monacoEditorRef.current = ed;
                                requestLayout();
                              }}
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

                        <div
                            onMouseDown={onMouseDownSplit}
                            className="w-2 cursor-col-resize bg-neutral-200/60 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10"
                            title="Drag to resize terminal"
                        />

                        <div className="min-w-0 p-3" style={{ width: termW, height: rightTotalH }}>
                          {terminalView}
                        </div>
                      </div>

                  )
              ) : null}
            </div>
        ) : null}
      </div>
  );
}
