// src/components/review/module/CardRenderer.tsx
"use client";

import React from "react";
import type { ReviewCard, ReviewQuizSpec } from "@/lib/review/types";
import type { SavedQuizState } from "@/lib/review/progressTypes";

import MathMarkdown from "@/components/math/MathMarkdown";
import SketchHost from "@/components/review/SketchHost";
import QuizBlock from "@/components/review/QuizBlock";
import { buildReviewQuizKey } from "@/lib/review/quizClient";
import { cn } from "@/lib/cn";

export default function CardRenderer(props: {
  card: ReviewCard;
  done: boolean;
  prereqsMet: boolean;

  progressHydrated: boolean;

  savedQuiz: SavedQuizState | null;
  versionStr: string;

  onMarkDone: () => void;

  onQuizPass: (quizId: string) => void;
  onQuizStateChange: (quizCardId: string, s: SavedQuizState) => void;
  onQuizReset: (quizCardId: string) => void;
}) {
  const {
    card,
    done,
    prereqsMet,
    progressHydrated,
    savedQuiz,
    versionStr,
    onMarkDone,
    onQuizPass,
    onQuizStateChange,
    onQuizReset,
  } = props;

  const wrapCls = "ui-soft p-4";

  const actionBtn = cn(
    "ui-btn ui-btn-secondary",
    "px-3 py-2 text-xs font-extrabold",
    done &&
      "border-emerald-600/20 bg-emerald-500/10 text-emerald-900 hover:bg-emerald-500/15 " +
        "dark:border-emerald-400/30 dark:bg-emerald-300/10 dark:text-emerald-100 dark:hover:bg-emerald-300/15",
  );

  if (card.type === "text") {
    return (
      <div className={wrapCls}>
        {card.title ? (
          <div className="text-sm font-black text-neutral-900 dark:text-white/90">
            {card.title}
          </div>
        ) : null}

        <MathMarkdown
          className="text-sm text-neutral-800 dark:text-white/80 [&_.katex]:text-inherit"
          content={card.markdown}
        />

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
      <div className={wrapCls}>
        {card.title ? (
          <div className="text-sm font-black text-neutral-900 dark:text-white/90">
            {card.title}
          </div>
        ) : null}

        <div className="mt-3">
          <SketchHost
            sketchId={card.sketchId}
            props={card.props}
            height={card.height ?? 360}
          />
        </div>

        <div className="mt-3 flex justify-end">
          <button type="button" onClick={onMarkDone} className={actionBtn}>
            {done ? "✓ Explored" : "Mark explored"}
          </button>
        </div>
      </div>
    );
  }

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
          isCompleted={Boolean(done)}
          initialState={savedQuiz ?? null}
          onPass={() => onQuizPass(card.id)}
          onStateChange={(s: SavedQuizState) => onQuizStateChange(card.id, s)}
          onReset={() => onQuizReset(card.id)}
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
