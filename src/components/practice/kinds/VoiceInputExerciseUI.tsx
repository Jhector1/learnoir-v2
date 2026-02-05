// src/components/practice/kinds/VoiceInputExerciseUI.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import MathMarkdown from "@/components/math/MathMarkdown";

function getSpeechRecognition(): any | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export default function VoiceInputExerciseUI({
  exercise,
  transcript,
  onChangeTranscript,
  disabled,
  checked,
  ok,
  reviewCorrectTranscript = null,
}: {
  exercise: {
    title: string;
    prompt: string;
    targetText: string;
    locale?: string;
    maxSeconds?: number;
    hint?: string;
  };
  transcript: string;
  onChangeTranscript: (t: string) => void;
  disabled: boolean;
  checked: boolean;
  ok: boolean | null;
  reviewCorrectTranscript?: string | null;
}) {
  const Rec = useMemo(() => getSpeechRecognition(), []);
  const recRef = useRef<any | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const canRecord = Boolean(Rec) && !disabled;

  const border =
    checked && ok === true
      ? "border-emerald-400/30"
      : checked && ok === false
        ? "border-rose-400/30"
        : "border-white/10";

  const bg =
    checked && ok === true
      ? "bg-emerald-300/10"
      : checked && ok === false
        ? "bg-rose-300/10"
        : "bg-white/[0.04]";

  useEffect(() => {
    return () => {
      try {
        recRef.current?.stop?.();
      } catch {}
    };
  }, []);

  function start() {
    if (!canRecord) return;
    try {
      const r = new Rec();
      recRef.current = r;

      r.lang = exercise.locale ?? "ht-HT";
      r.interimResults = true;
      r.continuous = false;

      r.onstart = () => {
        setIsRecording(true);
        setStatus("Listening…");
      };

      r.onerror = (e: any) => {
        setStatus(`Mic error: ${String(e?.error ?? "unknown")}`);
        setIsRecording(false);
      };

      r.onend = () => {
        setIsRecording(false);
        setStatus(null);
      };

      r.onresult = (event: any) => {
        let finalText = "";
        let interimText = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          const text = String(res[0]?.transcript ?? "");
          if (res.isFinal) finalText += text;
          else interimText += text;
        }

        const next = (finalText || interimText).trim();
        if (next) onChangeTranscript(next);
      };

      r.start();

      // optional auto-stop
      const max = Number(exercise.maxSeconds ?? 0);
      if (max > 0) {
        window.setTimeout(() => {
          try {
            r.stop();
          } catch {}
        }, max * 1000);
      }
    } catch (e: any) {
      setStatus(`Speech not available: ${String(e?.message ?? e)}`);
      setIsRecording(false);
    }
  }

  function stop() {
    try {
      recRef.current?.stop?.();
    } catch {}
    setIsRecording(false);
    setStatus(null);
  }

  return (
    <div className={`rounded-2xl border ${border} ${bg} p-4`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-black text-white/90">{exercise.title}</div>
          <MathMarkdown
            className="mt-2 text-sm text-white/80 [&_.katex]:text-white/90"
            content={String(exercise.prompt ?? "")}
          />
        </div>

        {checked ? (
          <div
            className={[
              "rounded-full border px-3 py-1 text-[11px] font-extrabold",
              ok === true
                ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
                : "border-rose-300/30 bg-rose-300/10 text-rose-100",
            ].join(" ")}
          >
            {ok === true ? "Correct" : "Try again"}
          </div>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
          <div className="text-xs font-extrabold text-white/70">Target</div>
          <div className="mt-1 text-lg font-black text-white/90">
            {exercise.targetText}
          </div>
          <div className="mt-2 text-xs font-extrabold text-white/50">
            Tip: you can also type the transcript manually if your browser doesn’t support speech.
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-extrabold text-white/70">Transcript</div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!canRecord || isRecording}
                onClick={start}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs font-extrabold text-white/85 disabled:opacity-40"
              >
                {Rec ? "Start" : "No mic"}
              </button>
              <button
                type="button"
                disabled={!isRecording}
                onClick={stop}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs font-extrabold text-white/85 disabled:opacity-40"
              >
                Stop
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChangeTranscript("")}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs font-extrabold text-white/85 disabled:opacity-40"
              >
                Clear
              </button>
            </div>
          </div>

          {status ? (
            <div className="mt-2 text-xs font-extrabold text-white/60">{status}</div>
          ) : null}

          <textarea
            value={transcript ?? ""}
            disabled={disabled}
            onChange={(e) => onChangeTranscript(e.target.value)}
            placeholder="Your transcript appears here…"
            className={[
              "mt-3 w-full min-h-[90px] rounded-xl border px-3 py-2 text-sm font-extrabold outline-none",
              "border-white/10 bg-white/[0.06] text-white/90 placeholder:text-white/40",
              disabled ? "opacity-70" : "focus:border-white/20",
            ].join(" ")}
          />
        </div>
      </div>

      {checked && ok === false && reviewCorrectTranscript ? (
        <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3">
          <div className="text-xs font-extrabold text-white/70">Correct</div>
          <div className="mt-1 text-sm font-black text-white/90">
            {reviewCorrectTranscript}
          </div>
        </div>
      ) : null}

      {exercise.hint ? (
        <div className="mt-3 text-xs font-extrabold text-white/60">
          Hint: <span className="font-bold text-white/70">{exercise.hint}</span>
        </div>
      ) : null}
    </div>
  );
}
