// src/lib/review/progressTypes.ts
export type SavedQuizState = {
  answers: Record<string, any>;
  checkedById: Record<string, boolean>;

  // practice questions: store only patches (no keys/secrets)
  practiceItemPatch?: Record<string /*questionId*/, any>;
  practiceMeta?: Record<
    string /*questionId*/,
    { attempts: number; ok: boolean | null }
  >;

  updatedAt?: number;
};

export type ReviewProgressState = {
  activeTopicId?: string;
 // ✅ new
  moduleCompleted?: boolean;
  moduleCompletedAt?: string;
  topics?: Record<
    string /*topicId*/,
    { quizVersion?: number;
      cardsDone?: Record<string /*cardId*/, boolean>;
      quizzesDone?: Record<string /*quizCardId*/, boolean>;
      quizState?: Record<string /*quizCardId*/, SavedQuizState>;
      completed?: boolean;
      completedAt?: string;
    }
  >;
    quizVersion?: number;
};
