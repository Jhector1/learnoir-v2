// src/components/review/module/CardRenderer.tsx
"use client";

import React from "react";
import type { ReviewCard, ReviewQuizSpec } from "@/lib/review/types";
import type { SavedQuizState } from "@/lib/review/progressTypes";

import MathMarkdown from "@/components/math/MathMarkdown";
import SketchHost from "@/components/review/SketchHost";
import QuizBlock from "@/components/review/QuizBlock";
import { buildReviewQuizKey } from "@/lib/review/quizClient";

export default function CardRenderer(props: {
  card: ReviewCard;
  done: boolean;
  prereqsMet: boolean;

  progressHydrated: boolean;

  // quiz wiring
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

  if (card.type === "text") {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        {card.title ? <div className="text-sm font-black">{card.title}</div> : null}

        <MathMarkdown
          className="text-sm text-white/80 [&_.katex]:text-white/90"
          content={card.markdown}
        />

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onMarkDone}
            className={[
              "rounded-xl border px-3 py-2 text-xs font-extrabold transition",
              done
                ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100/90"
                : "border-white/10 bg-white/10 text-white/80 hover:bg-white/15",
            ].join(" ")}
          >
            {done ? "✓ Read" : "Mark as read"}
          </button>
        </div>
      </div>
    );
  }

  if (card.type === "sketch") {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        {card.title ? <div className="text-sm font-black">{card.title}</div> : null}

        <div className="mt-3">
          <SketchHost
            sketchId={card.sketchId}
            props={card.props}
            height={card.height ?? 360}
          />
        </div>

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onMarkDone}
            className={[
              "rounded-xl border px-3 py-2 text-xs font-extrabold transition",
              done
                ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100/90"
                : "border-white/10 bg-white/10 text-white/80 hover:bg-white/15",
            ].join(" ")}
          >
            {done ? "✓ Explored" : "Mark explored"}
          </button>
        </div>
      </div>
    );
  }

  // quiz
  const quizKey = buildReviewQuizKey(card.spec as ReviewQuizSpec, card.id, versionStr);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      {card.title ? <div className="text-sm font-black">{card.title}</div> : null}

      {!prereqsMet ? (
        <div className="mt-2 rounded-xl border border-amber-300/20 bg-amber-300/10 p-2 text-xs font-extrabold text-amber-100/90">
          Complete the cards above to unlock this quiz.
        </div>
      ) : null}

      {!progressHydrated ? (
        <div className="mt-2 text-xs text-white/60">Loading saved quiz state…</div>
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
        <div className="mt-2 text-xs font-extrabold text-emerald-300/80">✓ Completed</div>
      ) : null}
    </div>
  );
}
