// src/components/practice/kinds/VoiceInputExerciseUI.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import MathMarkdown from "@/components/markdown/MathMarkdown";
import {ExercisePrompt} from "@/components/practice/kinds/KindHelper";

function getSpeechRecognition(): any | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

// Basic autocorrelation pitch estimation (good enough for voiced speech)
function estimatePitchHz(buf: Float32Array, sampleRate: number): number | null {
  // remove DC
  let mean = 0;
  for (let i = 0; i < buf.length; i++) mean += buf[i];
  mean /= buf.length;

  const x = new Float32Array(buf.length);
  for (let i = 0; i < buf.length; i++) x[i] = buf[i] - mean;

  // RMS gate (avoid false pitch on silence)
  let rms = 0;
  for (let i = 0; i < x.length; i++) rms += x[i] * x[i];
  rms = Math.sqrt(rms / x.length);
  if (rms < 0.015) return null;

  const minHz = 60;
  const maxHz = 400;
  const minLag = Math.floor(sampleRate / maxHz);
  const maxLag = Math.floor(sampleRate / minHz);

  let bestLag = -1;
  let bestCorr = 0;

  for (let lag = minLag; lag <= maxLag; lag++) {
    let corr = 0;
    for (let i = 0; i < x.length - lag; i++) {
      corr += x[i] * x[i + lag];
    }
    if (corr > bestCorr) {
      bestCorr = corr;
      bestLag = lag;
    }
  }

  if (bestLag <= 0) return null;
  const hz = sampleRate / bestLag;
  if (!Number.isFinite(hz) || hz < minHz || hz > maxHz) return null;
  return hz;
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

  // Visualizer (no React rerenders per frame)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const ampTextRef = useRef<HTMLSpanElement | null>(null);
  const pitchTextRef = useRef<HTMLSpanElement | null>(null);

  const ampSmoothRef = useRef(0);

  const canRecord = Boolean(Rec) && !disabled;

  const stopVisualizer = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    try {
      analyserRef.current?.disconnect();
    } catch {}
    analyserRef.current = null;

    try {
      audioCtxRef.current?.close?.();
    } catch {}
    audioCtxRef.current = null;

    try {
      mediaStreamRef.current?.getTracks?.().forEach((t) => t.stop());
    } catch {}
    mediaStreamRef.current = null;

    ampSmoothRef.current = 0;

    if (ampTextRef.current) ampTextRef.current.textContent = "0%";
    if (pitchTextRef.current) pitchTextRef.current.textContent = "—";

    const c = canvasRef.current;
    if (c) {
      const g = c.getContext("2d");
      if (g) g.clearRect(0, 0, c.width, c.height);
    }
  }, []);

  const startVisualizer = useCallback(async () => {
    if (analyserRef.current || audioCtxRef.current || mediaStreamRef.current) return;

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } as any,
      video: false,
    });
    mediaStreamRef.current = stream;

    const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext) as
        | typeof AudioContext
        | undefined;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    audioCtxRef.current = ctx;

    try {
      if (ctx.state === "suspended") await ctx.resume();
    } catch {}

    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyserRef.current = analyser;

    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.86;
    source.connect(analyser);

    const timeU8 = new Uint8Array(analyser.fftSize);
    const timeF32 = new Float32Array(analyser.fftSize);

    let lastTextUpdate = 0;

    const draw = (t: number) => {
      const a = analyserRef.current;
      const audioCtx = audioCtxRef.current;
      const canvas = canvasRef.current;
      if (!a || !audioCtx || !canvas) return;

      const dpr = window.devicePixelRatio || 1;
      const cssW = canvas.clientWidth || 1;
      const cssH = canvas.clientHeight || 1;
      const w = Math.max(1, Math.floor(cssW * dpr));
      const h = Math.max(1, Math.floor(cssH * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      const g = canvas.getContext("2d");
      if (!g) return;

      a.getByteTimeDomainData(timeU8);

      let sumSq = 0;
      for (let i = 0; i < timeU8.length; i++) {
        const v = (timeU8[i] - 128) / 128;
        sumSq += v * v;
        timeF32[i] = v;
      }

      const rms = Math.sqrt(sumSq / timeU8.length);
      const ampRaw = clamp01(rms * 2.2);

      // smoother amplitude (EMA): increase alpha for “buttery”, decrease for “snappier”
      const alpha = 0.90;
      const prev = ampSmoothRef.current;
      const amp = prev === 0 ? ampRaw : prev * alpha + ampRaw * (1 - alpha);
      ampSmoothRef.current = amp;

      const pitch = estimatePitchHz(timeF32, audioCtx.sampleRate);

      // Minimal waveform paint
      g.clearRect(0, 0, w, h);
      g.globalAlpha = 0.9;
      g.beginPath();
      for (let i = 0; i < timeU8.length; i++) {
        const x = (i / (timeU8.length - 1)) * w;
        const y = (timeU8[i] / 255) * h;
        if (i === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.strokeStyle = "rgba(255,255,255,0.85)";
      g.lineWidth = Math.max(1.25 * dpr, 2);
      g.stroke();
      g.globalAlpha = 1;

      // Tiny amplitude bar (bottom)
      const pad = Math.floor(10 * dpr);
      const barH = Math.floor(h * 0.12);
      const barW = Math.floor(w * 0.22);
      const x0 = pad;
      const y0 = h - pad - barH;

      g.globalAlpha = 0.35;
      g.fillStyle = "rgba(255,255,255,0.25)";
      g.fillRect(x0, y0, barW, barH);
      g.globalAlpha = 0.9;
      g.fillStyle = "rgba(255,255,255,0.85)";
      g.fillRect(x0, y0, Math.floor(barW * amp), barH);
      g.globalAlpha = 1;

      // update badges ~10fps (no React rerender => stable UI)
      if (t - lastTextUpdate > 100) {
        lastTextUpdate = t;

        const ampPct = Math.round(amp * 100);
        if (ampTextRef.current) ampTextRef.current.textContent = `${ampPct}%`;

        if (pitchTextRef.current) {
          pitchTextRef.current.textContent = pitch ? `${Math.round(pitch)} Hz` : "—";
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    return () => {
      try {
        recRef.current?.stop?.();
      } catch {}
      stopVisualizer();
    };
  }, [stopVisualizer]);

  const start = useCallback(async () => {
    if (!canRecord) return;

    setStatus(null);

    try {
      try {
        await startVisualizer();
      } catch (e: any) {
        setStatus(`Mic visualizer unavailable: ${String(e?.message ?? e)}`);
      }

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
        stopVisualizer();
      };

      r.onend = () => {
        setIsRecording(false);
        setStatus(null);
        stopVisualizer();
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
      stopVisualizer();
    }
  }, [
    Rec,
    canRecord,
    exercise.locale,
    exercise.maxSeconds,
    onChangeTranscript,
    startVisualizer,
    stopVisualizer,
  ]);

  const stop = useCallback(() => {
    try {
      recRef.current?.stop?.();
    } catch {}
    setIsRecording(false);
    setStatus(null);
    stopVisualizer();
  }, [stopVisualizer]);

  const shell = [
    "rounded-2xl border p-4",
    "border-neutral-200/70 bg-white/70",
    "dark:border-white/10 dark:bg-white/[0.04]",
  ].join(" ");

  const muted = "text-neutral-600 dark:text-white/60";
  const text = "text-neutral-900 dark:text-white/90";

  const pillBase =
      "rounded-full border px-2.5 py-1 text-[11px] font-semibold tabular-nums";
  const pillOk = "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200";
  const pillBad = "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-200";

  const btnBase =
      "rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed";
  const btnIdle =
      "border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900 " +
      "dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] dark:text-white/90";
  const btnDanger =
      "border-rose-500/25 bg-rose-500/10 hover:bg-rose-500/15 text-rose-700 dark:text-rose-200";

  return (
      <div className={shell}>
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <ExercisePrompt exercise={exercise} />


          {checked ? (
              <div className={[pillBase, ok ? pillOk : pillBad].join(" ")}>
                {ok ? "Correct" : "Try again"}
              </div>
          ) : null}
        </div>

        {/* Content */}
        <div className="mt-4 grid gap-4 lg:grid-cols-2 lg:gap-3">
          {/* Target */}
          <div className="rounded-2xl border border-neutral-200/70 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <div className={`text-xs font-semibold ${muted}`}>Target</div>
            <div className={`mt-2 text-lg font-semibold ${text}`}>
              {exercise.targetText}
            </div>

            {exercise.hint ? (
                <div className={`mt-3 text-xs ${muted}`}>
                  Hint:{" "}
                  <span className="font-semibold text-neutral-700 dark:text-white/70">
                {exercise.hint}
              </span>
                </div>
            ) : null}

            {/* Minimal mic strip */}
            <div className="mt-4 rounded-2xl border border-neutral-200/70 bg-neutral-900 p-3 dark:border-white/10 dark:bg-black/50">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-[11px] font-semibold text-white/70">
                  Mic
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-white/70">
                  <span className="min-w-[88px] tabular-nums">Amp: <span ref={ampTextRef}>0%</span></span>
                  <span className="min-w-[104px] tabular-nums">Pitch: <span ref={pitchTextRef}>—</span></span>
                </div>
              </div>

              <canvas
                  ref={canvasRef}
                  className="mt-2 h-[64px] w-full rounded-xl bg-white/5 sm:h-[80px]"
              />
            </div>
          </div>

          {/* Transcript */}
          <div className="rounded-2xl border border-neutral-200/70 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className={`text-xs font-semibold ${muted}`}>Transcript</div>

              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <button
                    type="button"
                    disabled={!canRecord || isRecording}
                    onClick={start}
                    className={[btnBase, btnIdle, "w-full sm:w-auto sm:min-w-[92px]"].join(" ")}
                >
                  {Rec ? (isRecording ? "Listening…" : "Start") : "No mic"}
                </button>
                <button
                    type="button"
                    disabled={!isRecording}
                    onClick={stop}
                    className={[btnBase, btnDanger, "w-full sm:w-auto sm:min-w-[72px]"].join(" ")}
                >
                  Stop
                </button>
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onChangeTranscript("")}
                    className={[btnBase, btnIdle, "w-full sm:w-auto sm:min-w-[72px]"].join(" ")}
                >
                  Clear
                </button>
              </div>
            </div>

            {status ? (
                <div className="mt-2 text-xs font-semibold text-neutral-600 dark:text-white/60">
                  {status}
                </div>
            ) : null}

            <textarea
                value={transcript ?? ""}
                disabled={disabled}
                onChange={(e) => onChangeTranscript(e.target.value)}
                placeholder="Speak or type…"
                className={[
                  "mt-3 w-full rounded-2xl border px-3 py-3 text-sm outline-none transition",
                  "min-h-[120px] sm:min-h-[140px] md:min-h-[160px]",
                  "border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-300",
                  "dark:border-white/10 dark:bg-white/[0.04] dark:text-white/90 dark:placeholder:text-white/40 dark:focus:border-white/20",
                  disabled ? "opacity-70" : "",
                ].join(" ")}
            />

            <div className="mt-2 flex flex-col gap-1 text-[11px] font-semibold text-neutral-500 dark:text-white/50 sm:flex-row sm:items-center sm:justify-between">
              <span>{exercise.maxSeconds ? `Auto-stop: ${exercise.maxSeconds}s` : "Auto-stop: off"}</span>
              <span className="tabular-nums">{transcript?.length ?? 0} chars</span>
            </div>

            {checked && ok === false && reviewCorrectTranscript ? (
                <div className="mt-4 rounded-2xl border border-neutral-200/70 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.04]">
                  <div className={`text-xs font-semibold ${muted}`}>Correct</div>
                  <div className={`mt-1 text-sm font-semibold ${text}`}>
                    {reviewCorrectTranscript}
                  </div>
                </div>
            ) : null}
          </div>
        </div>
      </div>
  );
}
