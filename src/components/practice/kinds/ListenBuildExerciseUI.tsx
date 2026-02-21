"use client";

import React, { useMemo, useState } from "react";
import { ExercisePrompt } from "@/components/practice/kinds/KindHelper";
import { useSpeak } from "./_shared/useSpeak";

type Exercise = {
    title: string;
    prompt: string;
    targetText: string;
    locale?: string;
    hint?: string;
    wordBank?: string[];
    distractors?: string[];
};

function tokenize(s: string) {
    const re = /[\p{L}\p{M}]+(?:['’-][\p{L}\p{M}]+)*|\d+|[^\s]/gu;
    return (s.match(re) ?? []).filter(Boolean);
}
function joinNice(tokens: string[]) {
    return tokens.join(" ").replace(/\s+([.,!?;:])/g, "$1").replace(/\s+'/g, "'").trim();
}
function shuffle<T>(arr: T[]) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export default function ListenBuildExerciseUI({
                                                  exercise,
                                                  value,
                                                  onChangeValue,
                                                  disabled,
                                                  checked,
                                                  ok,
                                              }: {
    exercise: Exercise;
    value: string;
    onChangeValue: (v: string) => void;
    disabled: boolean;
    checked: boolean;
    ok: boolean | null;
}) {
    const { speak, ttsStatus } = useSpeak();

    const baseTokens = useMemo(() => {
        const core = exercise.wordBank?.length ? exercise.wordBank : tokenize(exercise.targetText);
        return [...core, ...(exercise.distractors ?? [])].filter(Boolean);
    }, [exercise.wordBank, exercise.targetText, exercise.distractors]);

    const [bank, setBank] = useState<string[]>(() => shuffle(baseTokens));
    const [answer, setAnswer] = useState<string[]>(() => tokenize(value));
    const [revealed, setRevealed] = useState(false);

    const listen = (speed = 1.0) =>
        void speak(exercise.targetText, {
            speed,
            voice: "marin",
            instructions: "Speak clearly. Slightly slow. Haitian Creole friendly teacher tone.",
        });

    const add = (token: string, idx: number) => {
        if (disabled) return;
        setBank((b) => b.filter((_, i) => i !== idx));
        setAnswer((a) => {
            const next = [...a, token];
            onChangeValue(joinNice(next));
            return next;
        });
    };

    const remove = (token: string, idx: number) => {
        if (disabled) return;
        setAnswer((a) => {
            const next = a.slice();
            next.splice(idx, 1);
            onChangeValue(joinNice(next));
            return next;
        });
        setBank((b) => [...b, token]);
    };

    const reset = () => {
        setAnswer([]);
        setBank(shuffle(baseTokens));
        onChangeValue("");
        setRevealed(false);
    };

    const shell =
        "rounded-2xl border p-4 border-neutral-200/70 bg-white/70 dark:border-white/10 dark:bg-white/[0.04]";
    const muted = "text-neutral-600 dark:text-white/60";
    const text = "text-neutral-900 dark:text-white/90";
    const btn =
        "rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed " +
        "border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] dark:text-white/90";
    const chip =
        "select-none rounded-xl border px-3 py-2 text-sm font-semibold " +
        "border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900 " +
        "dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] dark:text-white/90";

    return (
        <div className={shell}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <ExercisePrompt exercise={exercise} />
                <div className={`text-xs font-semibold ${muted}`}>
                    Listen → build the sentence from the bank.
                </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
                <button className={btn} onClick={() => listen(1.0)} disabled={disabled}>
                    🔊 Listen
                </button>
                <button className={btn} onClick={() => listen(0.9)} disabled={disabled}>
                    🐢 Slow
                </button>
                <button className={btn} onClick={reset} disabled={disabled}>
                    ↩ Reset
                </button>
                <button className={btn} onClick={() => setRevealed((v) => !v)}>
                    {revealed ? "Hide" : "Reveal"}
                </button>
            </div>

            {ttsStatus ? <div className={`mt-2 text-xs font-semibold ${muted}`}>{ttsStatus}</div> : null}

            {revealed || checked ? (
                <div className="mt-3 rounded-2xl border border-neutral-200/70 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                    <div className={`text-xs font-semibold ${muted}`}>Target</div>
                    <div className={`mt-1 text-sm font-semibold ${text}`}>{exercise.targetText}</div>
                </div>
            ) : null}

            <div className="mt-4 rounded-2xl border border-neutral-200/70 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                <div className={`text-xs font-semibold ${muted}`}>Your sentence</div>
                <div className="mt-2 flex flex-wrap gap-2">
                    {answer.length ? (
                        answer.map((t, i) => (
                            <button key={`${t}-${i}`} className={chip} onClick={() => remove(t, i)} disabled={disabled}>
                                {t}
                            </button>
                        ))
                    ) : (
                        <div className={`text-sm font-semibold ${muted}`}>Tap words below…</div>
                    )}
                </div>
                <div className={`mt-2 text-xs ${muted}`}>
                    Preview: <span className={`font-semibold ${text}`}>{joinNice(answer) || "—"}</span>
                </div>
            </div>

            <div className="mt-4">
                <div className={`text-xs font-semibold ${muted}`}>Word bank</div>
                <div className="mt-2 flex flex-wrap gap-2">
                    {bank.map((t, i) => (
                        <button key={`${t}-${i}`} className={chip} onClick={() => add(t, i)} disabled={disabled}>
                            {t}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}