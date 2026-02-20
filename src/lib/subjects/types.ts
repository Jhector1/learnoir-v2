export type ReviewTopicId = string;


export type ReviewTopic = {
  id: ReviewTopicId;
  label: string;
  minutes?: number;
  summary?: string;
  cards: ReviewCard[];
};



  import type { PracticeKind } from "@prisma/client";

export type ReviewQuizSpec = {
  subject: string;              // "python"
  module?: string;              // "python-0"
  section?: string;             // "python-0-foundations"
  topic?: string;               // "py0.io_vars" | "all" | "" (treated as all)
  difficulty?: "easy" | "medium" | "hard";
  n?: number;                   // number of questions
  allowReveal?: boolean;
  preferKind?: PracticeKind | null;
  maxAttempts?: number;         // per practice question (default 1)
};

export type ReviewQuestion =
  | {
      kind: "mcq";
      id: string;
      prompt: string;
      choices: { id: string; label: string }[];
      answerId: string;
      explain?: string;
    }
  | {
      kind: "numeric";
      id: string;
      prompt: string;
      answer: number;
      tolerance?: number;
      explain?: string;
    }
  | {
      kind: "practice";
      id: string;
      prompt?: string;
      fetch: {
        subject: string;
        module?: string;
        section?: string;
        topic?: string; // slug
        difficulty?: "easy" | "medium" | "hard";
        allowReveal?: boolean;
        preferKind?: PracticeKind | null;
      };
      maxAttempts?: number;
    };


    export type ReviewVideoProvider = "auto" | "youtube" | "vimeo" | "iframe" | "file";

export type ReviewVideoCard = {
  type: "video";
  id: string;
  title?: string;

  /** Can be hosted anywhere */
  url: string;

  /**
   * auto:
   *  - youtube/vimeo => iframe embed
   *  - .mp4/.webm/.mov => <video>
   *  - otherwise => iframe
   */
  provider?: ReviewVideoProvider;

  /** Optional start time in seconds (works for youtube/vimeo; for <video> we seek on mount best-effort) */
  startSeconds?: number;

  /** Optional poster image for <video> */
  posterUrl?: string;

  /** Optional caption/notes under the video */
  captionMarkdown?: string;
};

// then include it in ReviewCard


// export type ReviewCard =
//   | { type: "text"; id: string; title?: string; markdown: string }
//   | { type: "sketch"; id: string; title?: string; sketchId: string; height?: number; props?: any }
//   | {
//       type: "quiz";
//       id: string;
//       title?: string;
//       passScore?: number;
//       spec: ReviewQuizSpec; // ✅ spec, not questions
//     }
//   | ReviewVideoCard;
export type ReviewCard =
    | { type: "text"; id: string; title?: string; markdown: string }
    | { type: "sketch"; id: string; title?: string; sketchId: string; height?: number; props?: any }
    | { type: "quiz"; id: string; title?: string; passScore?: number; spec: ReviewQuizSpec }
    | { type: "project"; id: string; title?: string; spec: ReviewProjectSpec }
    | ReviewVideoCard;


export type ReviewModule = {
  id: string;
  title: string;
  subtitle?: string;
  startPracticeHref?: (topicSlug: string) => string;
  topics: Array<{
    id: string;
    label: string;
    minutes?: number;
    summary?: string;
    cards: ReviewCard[];
  }>;
};




export type SeedPolicy = "actor" | "global";

export type ReviewProjectStep = {
    id: string;                 // stable step id: "s1", "part_a"
    title?: string;             // UI label ("Step 1 — ...")

    // practice fetch target
    topic: string;              // exact topic slug, not "all"
    difficulty?: "easy" | "medium" | "hard";
    preferKind?: PracticeKind | null;

    // determinism controls
    exerciseKey?: string;       // optional: force a specific generator handler
    seedPolicy?: SeedPolicy;    // "global" => same exercise for everyone

    maxAttempts?: number;

    // optional: step i starter code can carry from previous step
    carryFromPrev?: boolean;
};

export type ReviewProjectSpec = {
    mode: "project";

    subject: string;
    module?: string;
    section?: string;

    allowReveal?: boolean;      // usually false for projects
    maxAttempts?: number;       // default per step if step.maxAttempts missing

    steps: ReviewProjectStep[];
};
