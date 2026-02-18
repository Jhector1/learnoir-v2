import type { ReviewCard } from "@/lib/subjects/types";
import type { ReviewProgressState } from "@/lib/subjects/progressTypes";

export function emptyProgress(): ReviewProgressState {
  return {
    topics: {},
    quizVersion: 0,
    moduleCompleted: false,
    moduleCompletedAt: undefined,
  };
}

export function isTopicComplete(
  topicCards: ReviewCard[],
  tstate?: ReviewProgressState["topics"][string],
) {
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

type TopicLike = { id: string; cards?: ReviewCard[] };

export function topicIdOfCard(cardId: string, allTopics: TopicLike[]) {
  for (const t of allTopics) {
    if ((t.cards ?? []).some((c: any) => c.id === cardId)) return t.id;
  }
  return "";
}
