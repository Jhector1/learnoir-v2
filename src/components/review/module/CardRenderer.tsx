// src/components/review/module/CardRenderer.tsx
"use client";

import React from "react";
import type { ReviewCard, ReviewQuizSpec } from "@/lib/subjects/types";
import type { SavedQuizState } from "@/lib/subjects/progressTypes";

import MathMarkdown from "@/components/markdown/MathMarkdown";
import QuizBlock from "@/components/review/QuizBlock";
import { buildReviewQuizKey } from "@/lib/subjects/quizClient";
import { cn } from "@/lib/cn";

import SketchBlock from "@/components/sketches/subjects/SketchBlock";

type SavedSketchState = any;

export default function CardRenderer(props: {
    card: ReviewCard;

    // ✅ NEW
    cardIndex?: number;

    done: boolean;
    onMarkDone: () => void;

    prereqsMet: boolean;
    locked?: boolean;

    progressHydrated: boolean;

    savedQuiz: SavedQuizState | null;
    versionStr: string;
    onQuizPass: (quizId: string) => void;
    onQuizStateChange: (quizCardId: string, s: SavedQuizState) => void;
    onQuizReset: (quizCardId: string) => void;

    savedSketch: SavedSketchState | null;
    onSketchStateChange: (sketchCardId: string, s: SavedSketchState) => void;
}) {
    const {
        card,
        cardIndex = 0,
        done,
        onMarkDone,
        prereqsMet,
        locked = false,
        progressHydrated,
        savedQuiz,
        versionStr,
        onQuizPass,
        onQuizStateChange,
        onQuizReset,
        savedSketch,
        onSketchStateChange,
    } = props;

    const wrapCls = "ui-soft p-4";

    const actionBtn = cn(
        "ui-btn ui-btn-secondary",
        "px-3 py-2 text-xs font-extrabold",
        done &&
        "border-emerald-600/20 bg-emerald-500/10 text-emerald-900 hover:bg-emerald-500/15 " +
        "dark:border-emerald-400/30 dark:bg-emerald-300/10 dark:text-emerald-100 dark:hover:bg-emerald-300/15",
    );

    // deterministic cross-page ordering: each card gets a huge block
    const orderBase = cardIndex * 10000;

    if (card.type === "text") {
        return (
            <div className={wrapCls}>
                {card.title ? (
                    <div className="text-sm font-black text-neutral-900 dark:text-white/90">
                        {card.title}
                    </div>
                ) : null}

                <MathMarkdown className="ui-math [&_.katex]:text-inherit" content={card.markdown} />

                <div className="mt-3 flex justify-end">
                    <button type="button" onClick={onMarkDone} className={actionBtn}>
                        {done ? "✓ Read" : "Mark as read"}
                    </button>
                </div>
            </div>
        );
    }

    if (card.type === "sketch") {
        return (
            <div className="">
                <SketchBlock
                    cardId={card.id}
                    title={card.title}
                    sketchId={card.sketchId}
                    height={card.height}
                    propsPatch={card.props}
                    initialState={savedSketch}
                    onStateChange={(s) => onSketchStateChange(card.id, s)}
                    done={done}
                    onMarkDone={onMarkDone}
                    prereqsMet={prereqsMet}
                    locked={locked}
                />
            </div>
        );
    }

    if (card.type === "video") {
        const provider = card.provider ?? "auto";
        const url = card.url;

        const isFile = /\.(mp4|webm|mov)(\?|#|$)/i.test(url) || provider === "file";

        return (
            <div className={wrapCls}>
                {card.title ? (
                    <div className="text-sm font-black text-neutral-900 dark:text-white/90">
                        {card.title}
                    </div>
                ) : null}

                <div className="mt-3 ui-sketch-panel p-3">
                    {isFile ? (
                        <video className="w-full rounded-xl" controls preload="metadata" poster={card.posterUrl}>
                            <source src={url} />
                        </video>
                    ) : (
                        <iframe
                            className="w-full rounded-xl"
                            style={{ height: 380 }}
                            src={url}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    )}

                    {card.captionMarkdown ? (
                        <div className="mt-3">
                            <MathMarkdown className="ui-math [&_.katex]:text-inherit" content={card.captionMarkdown} />
                        </div>
                    ) : null}
                </div>

                <div className="mt-3 flex justify-end">
                    <button type="button" onClick={onMarkDone} className={actionBtn}>
                        {done ? "✓ Watched" : "Mark watched"}
                    </button>
                </div>
            </div>
        );
    }

    if (card.type === "quiz") {
        const quizKey = buildReviewQuizKey(card.spec as ReviewQuizSpec, card.id, versionStr);

        return (
            <div className={wrapCls}>
                {card.title ? (
                    <div className="text-sm font-black text-neutral-900 dark:text-white/90">
                        {card.title}
                    </div>
                ) : null}

                {!prereqsMet ? (
                    <div className="mt-2 rounded-xl border border-amber-600/20 bg-amber-500/10 p-2 text-xs font-extrabold text-amber-950 dark:border-amber-400/30 dark:bg-amber-300/10 dark:text-amber-100">
                        Read the topics and mark them as read to unlock this quiz.
                    </div>
                ) : null}

                {!progressHydrated ? (
                    <div className="mt-2 text-xs text-neutral-600 dark:text-white/60">
                        Loading saved quiz state…
                    </div>
                ) : (
                    <QuizBlock
                        key={quizKey}
                        quizId={card.id}
                        quizCardId={card.id}
                        spec={card.spec as ReviewQuizSpec}
                        quizKey={quizKey}
                        passScore={card.passScore ?? 1.0}
                        unlimitedAttempts
                        prereqsMet={prereqsMet}
                        locked={locked}
                        isCompleted={Boolean(done)}
                        initialState={savedQuiz ?? null}
                        onPass={() => onQuizPass(card.id)}
                        onStateChange={(s: SavedQuizState) => onQuizStateChange(card.id, s)}
                        onReset={() => onQuizReset(card.id)}
                        // ✅ NEW
                        orderBase={orderBase}
                    />
                )}

                {done ? (
                    <div className="mt-2 text-xs font-extrabold text-emerald-700 dark:text-emerald-300/80">
                        ✓ Completed
                    </div>
                ) : null}
            </div>
        );
    }

    if (card.type === "project") {
        const projectKey = buildReviewQuizKey(card.spec as any, card.id, versionStr);

        return (
            <div className={wrapCls}>
                {card.title ? <div className="text-sm font-black">{card.title}</div> : null}

                <QuizBlock
                    key={projectKey}
                    quizId={card.id}
                    quizCardId={card.id}
                    spec={card.spec as any}
                    quizKey={projectKey}
                    passScore={1.0}
                    prereqsMet={prereqsMet}
                    locked={locked}
                    isCompleted={Boolean(done)}
                    initialState={savedQuiz ?? null}
                    onPass={() => onQuizPass(card.id)}
                    onStateChange={(s) => onQuizStateChange(card.id, s)}
                    onReset={() => onQuizReset(card.id)}
                    sequential
                    strictSequential
                    unlimitedAttempts={false}
                    // ✅ NEW
                    orderBase={orderBase}
                />
            </div>
        );
    }

    return null;
}