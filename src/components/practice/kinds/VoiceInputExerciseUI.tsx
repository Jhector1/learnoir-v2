// src/components/practice/kinds/VoiceInputExerciseUI.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { ExercisePrompt } from "@/components/practice/kinds/KindHelper";

/* --------------------------------- speech api -------------------------------- */

function getSpeechRecognition(): any | null {
    if (typeof window === "undefined") return null;
    const w = window as any;
    return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

function getSpeechGrammarListCtor(): any | null {
    if (typeof window === "undefined") return null;
    const w = window as any;
    return w.SpeechGrammarList || w.webkitSpeechGrammarList || null;
}

function normalizeSpeechLang(locale?: string) {
    const raw = String(locale ?? "").trim();
    if (!raw) return "ht"; // Haitian Creole
    const lower = raw.toLowerCase();

    if (lower === "ht" || lower.startsWith("ht-") || lower === "hat") return "ht";
    if (lower === "fr" || lower.startsWith("fr-")) return "fr-FR";
    if (lower === "en" || lower.startsWith("en-")) return "en-US";

    return raw;
}

function normalizePhrase(s: string) {
    return String(s ?? "")
        .replace(/[’‘]/g, "'")
        .replace(/\s+/g, " ")
        .trim();
}

function escapeJsgfPhrase(s: string) {
    return normalizePhrase(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function buildJsgfFromPhrases(phrases: string[]) {
    const uniq = Array.from(new Set(phrases.map(normalizePhrase).filter(Boolean))).slice(0, 40);
    if (!uniq.length) return null;
    const body = uniq.map((p) => `"${escapeJsgfPhrase(p)}"`).join(" | ");
    return `#JSGF V1.0; grammar phrases; public <phrase> = ${body} ;`;
}

function phraseVariants(target: string) {
    const t = normalizePhrase(target);
    if (!t) return [];
    const stripped = t
        .replace(/[^\p{L}\p{N}\s']/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
    return Array.from(new Set([t, stripped].filter(Boolean)));
}

function pickBestAlternative(res: any): { text: string; conf: number } {
    let bestText = "";
    let bestConf = -1;
    const len = typeof res?.length === "number" ? res.length : 0;
    for (let j = 0; j < len; j++) {
        const alt = res[j];
        const text = String(alt?.transcript ?? "").trim();
        const conf = typeof alt?.confidence === "number" ? alt.confidence : 0;
        if (text && conf >= bestConf) {
            bestText = text;
            bestConf = conf;
        }
    }
    return { text: bestText, conf: bestConf };
}

/* --------------------------------- utils --------------------------------- */

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
        for (let i = 0; i < x.length - lag; i++) corr += x[i] * x[i + lag];
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

/* --------------------------- server STT helpers --------------------------- */

function canUseMediaRecorder(): boolean {
    if (typeof window === "undefined") return false;
    return (
        typeof (window as any).MediaRecorder !== "undefined" &&
        Boolean(navigator?.mediaDevices?.getUserMedia)
    );
}

function pickMimeType() {
    if (typeof window === "undefined") return "";
    const MR = (window as any).MediaRecorder;
    const isSupported = (t: string) => !!MR?.isTypeSupported?.(t);

    const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg"];
    for (const t of candidates) if (isSupported(t)) return t;
    return "";
}

async function blobToFile(blob: Blob, filename: string) {
    return new File([blob], filename, { type: blob.type || "audio/webm" });
}

/* -------------------------------- component -------------------------------- */

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

    // TTS (read-back) — MUST be inside component
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [autoReadBack, setAutoReadBack] = useState(true);
    const [ttsStatus, setTtsStatus] = useState<string | null>(null);

    const speakBack = useCallback(async (text: string) => {
        const clean = String(text ?? "").trim();
        if (!clean) return;

        try {
            setTtsStatus("Reading back…");

            const res = await fetch("/api/speech/speak", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: clean,
                    voice: "marin",
                    format: "mp3",
                    speed: 1.0,
                    instructions:
                        "Speak in Haitian Creole (Kreyòl ayisyen). Clear, friendly, teacher-like. Slightly slow.",
                }),
            });

            if (!res.ok) {
                const j = await res.json().catch(() => null);
                throw new Error(j?.message ?? j?.error ?? "TTS failed");
            }

            const ct = res.headers.get("Content-Type") || "audio/mpeg";
            const ab = await res.arrayBuffer();
            const blob = new Blob([ab], { type: ct });
            const url = URL.createObjectURL(blob);

            const a = audioRef.current ?? new Audio();
            audioRef.current = a;

            // stop previous
            try {
                a.pause();
                a.currentTime = 0;
            } catch {}

            // cleanup old URL
            const prev = (a as any).__blobUrl as string | undefined;
            if (prev) URL.revokeObjectURL(prev);
            (a as any).__blobUrl = url;

            a.src = url;

            // Autoplay can be blocked if not from a user gesture; user still has “Play back” button.
            await a.play();

            setTtsStatus(null);
        } catch (e: any) {
            setTtsStatus(`Read-back failed: ${String(e?.message ?? e)}`);
        }
    }, []);

    const [mode, setMode] = useState<"server" | "browser">("server");
    const [isRecording, setIsRecording] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
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

    // Server STT recording
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);
    const stopTimeoutRef = useRef<number | null>(null);

    const canBrowser = Boolean(Rec);
    const canServer = canUseMediaRecorder();
    const canAny = !disabled && (canServer || canBrowser);

    const clearStopTimeout = useCallback(() => {
        if (stopTimeoutRef.current) {
            window.clearTimeout(stopTimeoutRef.current);
            stopTimeoutRef.current = null;
        }
    }, []);

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

            const alpha = 0.9;
            const prev = ampSmoothRef.current;
            const amp = prev === 0 ? ampRaw : prev * alpha + ampRaw * (1 - alpha);
            ampSmoothRef.current = amp;

            const pitch = estimatePitchHz(timeF32, audioCtx.sampleRate);

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

            clearStopTimeout();
            try {
                mediaRecorderRef.current?.stop?.();
            } catch {}

            // cleanup TTS blob URL
            try {
                const a = audioRef.current as any;
                const prev = a?.__blobUrl as string | undefined;
                if (prev) URL.revokeObjectURL(prev);
            } catch {}

            stopVisualizer();
        };
    }, [clearStopTimeout, stopVisualizer]);

    /* -------------------------- server STT mode -------------------------- */

    const transcribeOnServer = useCallback(
        async (blob: Blob) => {
            const fd = new FormData();
            const file = await blobToFile(blob, "speech.webm");
            fd.append("file", file);

            // IMPORTANT:
            // Your server route will OMIT language for Haitian Creole, because OpenAI rejects ht/haitian codes in language=.
            // So we can skip language entirely here, and let the prompt steer HT.
            // If you want to support non-HT locales later, you can append conditionally.
            const lang = normalizeSpeechLang(exercise.locale);
            if (lang && lang !== "ht") fd.append("language", lang);

            fd.append("target", exercise.targetText);
            fd.append(
                "prompt",
                "Lang: Haitian Creole / Kreyòl ayisyen. Pa tradui. Kenbe òtograf nòmal."
            );

            const res = await fetch("/api/speech/transcribe", { method: "POST", body: fd });
            const json = await res.json().catch(() => ({}));

            const msg =
                (json as any)?.message ??
                (json as any)?.detail?.error?.message ??
                (json as any)?.detail?.message ??
                (json as any)?.error ??
                "Transcription failed";

            if (!res.ok) throw new Error(msg);

            return normalizePhrase(String((json as any)?.text ?? ""));
        },
        [exercise.locale, exercise.targetText]
    );

    const startServerMode = useCallback(async () => {
        if (!canAny || !canServer) throw new Error("High accuracy recording not supported here.");

        setStatus(null);
        setIsRecording(true);

        await startVisualizer();
        const stream = mediaStreamRef.current;
        if (!stream) throw new Error("No mic stream");

        const mimeType = pickMimeType();
        const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        mediaRecorderRef.current = rec;
        chunksRef.current = [];

        rec.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
        };

        rec.onerror = () => {
            setStatus("Recording error.");
            setIsRecording(false);
            stopVisualizer();
        };

        rec.onstop = async () => {
            try {
                setIsUploading(true);
                setStatus("Transcribing (high accuracy)…");

                const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
                const text = await transcribeOnServer(blob);

                if (text) onChangeTranscript(text);

                // Auto read-back (may be blocked if stop wasn't a user gesture; user still has Play back)
                if (autoReadBack && text) void speakBack(text);

                setStatus(null);
            } catch (e: any) {
                setStatus(`Transcription error: ${String(e?.message ?? e)}`);
            } finally {
                setIsUploading(false);
                setIsRecording(false);
                stopVisualizer();
            }
        };

        rec.start(250);
        setStatus("Recording (high accuracy)…");

        const max = Number(exercise.maxSeconds ?? 0);
        if (max > 0) {
            clearStopTimeout();
            stopTimeoutRef.current = window.setTimeout(() => {
                try {
                    if (rec.state !== "inactive") rec.stop();
                } catch {}
            }, max * 1000);
        }
    }, [
        autoReadBack,
        canAny,
        canServer,
        clearStopTimeout,
        exercise.maxSeconds,
        onChangeTranscript,
        speakBack,
        startVisualizer,
        stopVisualizer,
        transcribeOnServer,
    ]);

    const stopServerMode = useCallback(() => {
        clearStopTimeout();
        const rec = mediaRecorderRef.current;
        try {
            if (rec && rec.state !== "inactive") rec.stop();
        } catch {}
    }, [clearStopTimeout]);

    /* -------------------------- browser mode -------------------------- */

    const startBrowserMode = useCallback(async () => {
        if (!canAny || !canBrowser) throw new Error("Browser SpeechRecognition not available.");

        setStatus(null);

        try {
            try {
                await startVisualizer();
            } catch (e: any) {
                setStatus(`Mic visualizer unavailable: ${String(e?.message ?? e)}`);
            }

            const R = Rec;
            if (!R) throw new Error("SpeechRecognition missing");

            const r = new R();
            recRef.current = r;

            const lang = normalizeSpeechLang(exercise.locale ?? "ht");

            r.lang = lang;
            r.interimResults = true;
            r.continuous = false;
            r.maxAlternatives = 5;

            const GrammarList = getSpeechGrammarListCtor();
            if (GrammarList) {
                try {
                    const g = new GrammarList();
                    const phrases = [
                        ...phraseVariants(exercise.targetText),
                        ...(exercise.hint ? phraseVariants(exercise.hint) : []),
                    ];
                    const jsgf = buildJsgfFromPhrases(phrases);
                    if (jsgf) {
                        g.addFromString(jsgf, 1);
                        r.grammars = g;
                    }
                } catch {}
            }

            r.onstart = () => {
                setIsRecording(true);
                setStatus(lang === "ht" ? "Koute…" : "Listening…");
            };

            r.onerror = (e: any) => {
                setStatus(`Mic error: ${String(e?.error ?? "unknown")}`);
                setIsRecording(false);
                stopVisualizer();
            };

            r.onnomatch = () => {
                setStatus("I couldn’t catch that. Try again (slower / closer).");
            };

            r.onend = () => {
                setIsRecording(false);
                setStatus(null);
                stopVisualizer();
            };

            r.onresult = (event: any) => {
                let bestFinal = { text: "", conf: -1 };
                let bestInterim = { text: "", conf: -1 };

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const res = event.results[i];
                    const best = pickBestAlternative(res);
                    if (res.isFinal) {
                        if (best.text && best.conf >= bestFinal.conf) bestFinal = best;
                    } else {
                        if (best.text && best.conf >= bestInterim.conf) bestInterim = best;
                    }
                }

                const next = normalizePhrase(bestFinal.text || bestInterim.text);
                if (next) onChangeTranscript(next);
            };

            r.start();

            const max = Number(exercise.maxSeconds ?? 0);
            if (max > 0) {
                clearStopTimeout();
                stopTimeoutRef.current = window.setTimeout(() => {
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
        canAny,
        canBrowser,
        clearStopTimeout,
        exercise.hint,
        exercise.locale,
        exercise.maxSeconds,
        exercise.targetText,
        onChangeTranscript,
        startVisualizer,
        stopVisualizer,
    ]);

    const stopBrowserMode = useCallback(() => {
        clearStopTimeout();
        try {
            recRef.current?.stop?.();
        } catch {}
        setIsRecording(false);
        setStatus(null);
        stopVisualizer();
    }, [clearStopTimeout, stopVisualizer]);

    /* -------------------------- unified controls -------------------------- */

    const start = useCallback(async () => {
        if (!canAny || disabled || isUploading || isRecording) return;

        setStatus(null);

        if (mode === "server") {
            try {
                await startServerMode();
                return;
            } catch (e: any) {
                const msg = String(e?.message ?? e);
                if (canBrowser) {
                    setStatus(`High accuracy unavailable: ${msg}. Falling back…`);
                    try {
                        await startBrowserMode();
                    } catch (e2: any) {
                        setStatus(`Speech not available: ${String(e2?.message ?? e2)}`);
                    }
                } else {
                    setStatus(`High accuracy unavailable: ${msg}`);
                }
                return;
            }
        }

        try {
            await startBrowserMode();
        } catch (e: any) {
            setStatus(`Speech not available: ${String(e?.message ?? e)}`);
        }
    }, [
        canAny,
        canBrowser,
        disabled,
        isUploading,
        isRecording,
        mode,
        startServerMode,
        startBrowserMode,
    ]);

    const stop = useCallback(() => {
        if (mode === "server") stopServerMode();
        else stopBrowserMode();
    }, [mode, stopServerMode, stopBrowserMode]);

    /* --------------------------------- ui --------------------------------- */

    const shell = [
        "rounded-2xl border p-4",
        "border-neutral-200/70 bg-white/70",
        "dark:border-white/10 dark:bg-white/[0.04]",
    ].join(" ");

    const muted = "text-neutral-600 dark:text-white/60";
    const text = "text-neutral-900 dark:text-white/90";

    const pillBase = "rounded-full border px-2.5 py-1 text-[11px] font-semibold tabular-nums";
    const pillOk =
        "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200";
    const pillBad = "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-200";

    const btnBase =
        "rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed";
    const btnIdle =
        "border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900 " +
        "dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] dark:text-white/90";
    const btnDanger =
        "border-rose-500/25 bg-rose-500/10 hover:bg-rose-500/15 text-rose-700 dark:text-rose-200";

    const modePill = (active: boolean) =>
        [
            "rounded-full border px-2.5 py-1 text-[11px] font-semibold",
            active
                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
                : "border-neutral-200 bg-white text-neutral-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/70",
        ].join(" ");

    const startLabel = !canAny
        ? "No mic"
        : isUploading
            ? "Transcribing…"
            : isRecording
                ? mode === "server"
                    ? "Recording…"
                    : "Listening…"
                : "Start";

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

            {/* TTS controls */}
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex items-center gap-2 text-[11px] font-semibold text-neutral-500 dark:text-white/50">
                    <input
                        type="checkbox"
                        checked={autoReadBack}
                        onChange={(e) => setAutoReadBack(e.target.checked)}
                    />
                    Read back after speaking (AI voice)
                </label>

                <div className="flex gap-2">
                    <button
                        type="button"
                        disabled={disabled || isRecording || isUploading || !transcript?.trim()}
                        onClick={() => speakBack(transcript)}
                        className={[btnBase, btnIdle].join(" ")}
                    >
                        Play back
                    </button>
                </div>
            </div>

            {ttsStatus ? (
                <div className="mt-2 text-xs font-semibold text-neutral-600 dark:text-white/60">
                    {ttsStatus}
                </div>
            ) : null}

            {/* Content */}
            <div className="mt-4 grid gap-4 lg:grid-cols-2 lg:gap-3">
                {/* Target */}
                <div className="rounded-2xl border border-neutral-200/70 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                    <div className={`text-xs font-semibold ${muted}`}>Target</div>
                    <div className={`mt-2 text-lg font-semibold ${text}`}>{exercise.targetText}</div>

                    {exercise.hint ? (
                        <div className={`mt-3 text-xs ${muted}`}>
                            Hint:{" "}
                            <span className="font-semibold text-neutral-700 dark:text-white/70">
                {exercise.hint}
              </span>
                        </div>
                    ) : null}

                    {/* Mic strip */}
                    <div className="mt-4 rounded-2xl border border-neutral-200/70 bg-neutral-900 p-3 dark:border-white/10 dark:bg-black/50">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-[11px] font-semibold text-white/70">Mic</div>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-white/70">
                <span className="min-w-[88px] tabular-nums">
                  Amp: <span ref={ampTextRef}>0%</span>
                </span>
                                <span className="min-w-[104px] tabular-nums">
                  Pitch: <span ref={pitchTextRef}>—</span>
                </span>
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

                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                            {/* Mode toggle */}
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={disabled || isRecording || isUploading}
                                    onClick={() => setMode("server")}
                                    className={modePill(mode === "server")}
                                    title="Server transcription (best accuracy)"
                                >
                                    High accuracy
                                </button>
                                <button
                                    type="button"
                                    disabled={disabled || isRecording || isUploading}
                                    onClick={() => setMode("browser")}
                                    className={modePill(mode === "browser")}
                                    title="Browser SpeechRecognition (fast, less consistent)"
                                >
                                    Fast (browser)
                                </button>
                            </div>

                            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                                <button
                                    type="button"
                                    disabled={!canAny || disabled || isRecording || isUploading}
                                    onClick={start}
                                    className={[btnBase, btnIdle, "w-full sm:w-auto sm:min-w-[120px]"].join(" ")}
                                >
                                    {startLabel}
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
                                    disabled={disabled || isRecording || isUploading}
                                    onClick={() => onChangeTranscript("")}
                                    className={[btnBase, btnIdle, "w-full sm:w-auto sm:min-w-[72px]"].join(" ")}
                                >
                                    Clear
                                </button>
                            </div>
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
                            <div className={`mt-1 text-sm font-semibold ${text}`}>{reviewCorrectTranscript}</div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}