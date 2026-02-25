// src/components/review/module/CardRenderer.tsx
"use client";

import React from "react";
import type {ReviewCard, ReviewQuizSpec} from "@/lib/subjects/types";
import type {SavedQuizState} from "@/lib/subjects/progressTypes";

import MathMarkdown from "@/components/markdown/MathMarkdown";
import QuizBlock from "@/components/review/QuizBlock";
import {buildReviewQuizKey} from "@/lib/subjects/quizClient";
import {cn} from "@/lib/cn";

import SketchBlock from "@/components/sketches/subjects/SketchBlock";

type SavedSketchState = any;

function GateBanner({kind}: { kind: "quiz" | "project" }) {
    return (
        <div
            className="mt-2 rounded-xl border border-amber-600/20 bg-amber-500/10 p-2 text-xs font-extrabold text-amber-950 dark:border-amber-400/30 dark:bg-amber-300/10 dark:text-amber-100">
            Complete the topic items above (readings, videos, sketches) to unlock this {kind}.
        </div>
    );
}

function CompletedBadge() {
    return (
        <div className="mt-2 text-xs font-extrabold text-emerald-700 dark:text-emerald-300/80">
            ✓ Completed
        </div>
    );
}

function CardTitle({title}: { title?: string | null }) {
    if (!title) return null;
    return (
        <div className="text-sm font-black text-neutral-900 dark:text-white/90">
            {title}
        </div>
    );
}

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

    function renderQuizLike(kind: "quiz" | "project") {
        // if (card.type !== "video") {
            const key = buildReviewQuizKey(card.spec as any, card.id, versionStr);
        // }

        // ✅ show banner ONLY when locked by prereqs and not already completed
        const showGate = !done && !prereqsMet;

        // ✅ avoid mounting QuizBlock (and fetching) until prereqs are met
        // (but still allow rendering when already completed)
        const canMountQuizBlock = progressHydrated && (prereqsMet || done);

        const quizBlockProps =
            kind === "quiz"
                ? {
                    passScore: (card as any).passScore ?? 1.0,
                    sequential: undefined as boolean | undefined, // default in QuizBlock
                    strictSequential: undefined as boolean | undefined,
                    unlimitedAttempts: true,
                }
                : {
                    passScore: 1.0,
                    sequential: true,
                    strictSequential: true,
                    unlimitedAttempts: false,
                };

        return (
            <div className={wrapCls}>
                <CardTitle title={card.title}/>

                {showGate ? <GateBanner kind={kind}/> : null}

                {!showGate ? (
                    !canMountQuizBlock ? (
                        // this covers: not hydrated yet (while prereqs met) OR other edge cases
                        <div className="mt-2 text-xs text-neutral-600 dark:text-white/60">
                            Loading saved {kind} state…
                        </div>
                    ) : (
                        <QuizBlock
                            key={key}
                            quizId={card.id}
                            quizCardId={card.id}
                            spec={card.spec as any}
                            quizKey={key}
                            passScore={quizBlockProps.passScore}
                            prereqsMet={prereqsMet}
                            locked={locked}
                            isCompleted={Boolean(done)}
                            initialState={savedQuiz ?? null}
                            onPass={() => onQuizPass(card.id)}
                            onStateChange={(s: SavedQuizState) => onQuizStateChange(card.id, s)}
                            onReset={() => onQuizReset(card.id)}
                            // quiz/project behavior knobs
                            sequential={quizBlockProps.sequential as any}
                            strictSequential={quizBlockProps.strictSequential as any}
                            unlimitedAttempts={quizBlockProps.unlimitedAttempts}
                            // ✅ deterministic ordering across topic page
                            orderBase={orderBase}
                        />
                    )
                ) : null}

                {done ? <CompletedBadge/> : null}
            </div>
        );
    }

    if (card.type === "text") {
        return (
            <div className={wrapCls}>
                <CardTitle title={card.title}/>
                <MathMarkdown className="ui-math [&_.katex]:text-inherit" content={card.markdown}/>
                <div className="mt-3 flex justify-end">
                    <button type="button" onClick={onMarkDone} className={actionBtn} data-flow-focus="1"
                    >
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
                <CardTitle title={card.title}/>

                <div className="mt-3 ui-sketch-panel p-3">
                    {isFile ? (
                        <video className="w-full rounded-xl" controls preload="metadata" poster={card.posterUrl}>
                            <source src={url}/>
                        </video>
                    ) : (
                        <iframe
                            className="w-full rounded-xl"
                            style={{height: 380}}
                            src={url}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    )}

                    {card.captionMarkdown ? (
                        <div className="mt-3">
                            <MathMarkdown className="ui-math [&_.katex]:text-inherit" content={card.captionMarkdown}/>
                        </div>
                    ) : null}
                </div>

                <div className="mt-3 flex justify-end">
                    <button type="button" onClick={onMarkDone} className={actionBtn} data-flow-focus="1">
                        {done ? "✓ Watched" : "Mark watched"}
                    </button>
                </div>
            </div>
        );
    }

    if (card.type === "quiz") {
        return renderQuizLike("quiz");
    }

    if (card.type === "project") {
        return renderQuizLike("project");
    }

    return null;
}