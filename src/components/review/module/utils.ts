import type { ReviewCard } from "@/lib/subjects/types";

export function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

export function clamp01(n: number) {
    return Math.max(0, Math.min(1, n));
}

export function isTopicComplete(topicCards: ReviewCard[], tstate: any) {
    const cardsDone = tstate?.cardsDone ?? {};
    const quizzesDone = tstate?.quizzesDone ?? {};
    for (const c of topicCards) {
        if (c.type === "quiz") {
            if (!quizzesDone[c.id]) return false;
        } else {
            if (!cardsDone[c.id]) return false;
        }
    }
    return true;
}

export function prereqsMetForQuiz(cards: ReviewCard[], tp: any, quizCardId: string) {
    const idx = cards.findIndex((c) => c.id === quizCardId);
    const prereqCards = idx >= 0 ? cards.slice(0, idx).filter((c) => c.type !== "quiz") : [];
    return prereqCards.every((c) => Boolean(tp?.cardsDone?.[c.id]));
}

export function countAnswered(cards: ReviewCard[], tstate: any) {
    let answered = 0;
    for (const c of cards) {
        const done = c.type === "quiz" ? Boolean(tstate?.quizzesDone?.[c.id]) : Boolean(tstate?.cardsDone?.[c.id]);
        if (done) answered++;
    }
    return { answeredCount: answered, sessionSize: cards.length };
}
