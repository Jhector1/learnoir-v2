"use client";

import React, { useMemo, useState } from "react";
import SketchShell from "./_shared/SketchShell";
import { cn, CHOICE_IDLE, CHOICE_SELECTED, LABEL, MUTED, PILL, PILL_GOOD, PILL_WARN, SOFT } from "./_shared/aiUi";

type Choice = "ai" | "not" | "depends";

type CardQ = {
    id: string;
    title: string;
    prompt: string;
    correct: Choice;
    why: string;
};

const QUESTIONS: CardQ[] = [
    {
        id: "q1",
        title: "Spam filter",
        prompt: "An email app moves spam messages to a spam folder automatically.",
        correct: "ai",
        why: "Most spam filters learn patterns from examples (spam vs. not spam).",
    },
    {
        id: "q2",
        title: "Calculator",
        prompt: "A calculator computes 24 × 6 exactly.",
        correct: "not",
        why: "That’s fixed rules and arithmetic—not pattern learning.",
    },
    {
        id: "q3",
        title: "Autocomplete",
        prompt: "Your phone predicts the next word as you type.",
        correct: "depends",
        why: "Some systems use simple rules; many use learned models. It depends on the app.",
    },
    {
        id: "q4",
        title: "Photo grouping",
        prompt: "Your gallery groups photos by people/pets automatically.",
        correct: "ai",
        why: "Recognizing patterns in images is a classic AI task.",
    },
    {
        id: "q5",
        title: "Sorting A→Z",
        prompt: "A list of names is sorted alphabetically.",
        correct: "not",
        why: "Sorting is a normal algorithm—no learning needed.",
    },
];

function label(x: Choice) {
    if (x === "ai") return "AI";
    if (x === "not") return "Not AI";
    return "Depends";
}

export default function AiWhatIsSketch({ height = 420 }: { height?: number }) {
    const [idx, setIdx] = useState(0);
    const [picked, setPicked] = useState<Choice | null>(null);
    const [score, setScore] = useState({ correct: 0, total: 0 });

    const q = QUESTIONS[idx] ?? QUESTIONS[0];

    const status = useMemo(() => {
        if (!picked) return null;
        const ok = picked === q.correct;
        return { ok, msg: ok ? "Nice!" : "Not quite", why: q.why };
    }, [picked, q]);

    function choose(c: Choice) {
        if (picked) return;
        setPicked(c);
        setScore((s) => ({
            correct: s.correct + (c === q.correct ? 1 : 0),
            total: s.total + 1,
        }));
    }

    function next() {
        setPicked(null);
        setIdx((i) => (i + 1) % QUESTIONS.length);
    }

    const left = (
        <div>
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-lg font-extrabold">AI or Not? (spot the difference)</div>
                    <div className={cn(MUTED, "mt-1")}>Pick the best label for the scenario.</div>
                </div>

                <div className={cn(PILL, "gap-2")}>
                    <span className={MUTED}>Score</span>
                    <span className="font-extrabold">
            {score.correct}/{score.total}
          </span>
                </div>
            </div>

            <div className={cn(SOFT, "mt-3")}>
                <div className={LABEL}>{q.title}</div>
                <div className="mt-2 text-sm font-extrabold">{q.prompt}</div>

                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    <button className={picked === "ai" ? cn(CHOICE_SELECTED) : cn(CHOICE_IDLE)} onClick={() => choose("ai")}>
                        AI
                    </button>
                    <button className={picked === "not" ? cn(CHOICE_SELECTED) : cn(CHOICE_IDLE)} onClick={() => choose("not")}>
                        Not AI
                    </button>
                    <button
                        className={picked === "depends" ? cn(CHOICE_SELECTED) : cn(CHOICE_IDLE)}
                        onClick={() => choose("depends")}
                    >
                        Depends
                    </button>
                </div>

                {status ? (
                    <div className={cn("mt-3", SOFT)}>
                        <div className="flex items-center justify-between gap-3">
                            <div className="text-sm font-extrabold">
                                {status.msg} — Correct: <span className="underline">{label(q.correct)}</span>
                            </div>
                            <span className={status.ok ? PILL_GOOD : PILL_WARN}>{status.ok ? "Correct" : "Try again"}</span>
                        </div>
                        <div className={cn(MUTED, "mt-2")}>{status.why}</div>
                        <button className="ui-btn ui-btn-primary mt-3 w-full" onClick={next}>
                            Next
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );

    const right = (
        <div>
            <div className="text-sm font-extrabold">Quick rule of thumb</div>
            <div className={cn(MUTED, "mt-2")}>
                AI usually means the system learns patterns from examples, then predicts or classifies.
            </div>
            <div className={cn(MUTED, "mt-2")}>
                Not AI is usually fixed rules (calculator, sorting). “Depends” when some apps do either.
            </div>
            <div className="mt-4">
                <div className={LABEL}>Try this</div>
                <div className={cn(MUTED, "mt-2")}>
                    Ask: “Did it learn from data?” If yes, it’s probably AI.
                </div>
            </div>
        </div>
    );

    return <SketchShell height={height} left={left} right={right} />;
}
