export type ReviewTopicId = string;

// export type ReviewCard =
//   | {
//       type: "text";
//       id: string;
//       title?: string;
//       markdown: string; // short, clean content
//     }
//   | {
//       type: "sketch";
//       id: string;
//       title?: string;
//       sketchId: string; // maps to a reusable sketch component
//       props?: Record<string, any>; // configuration
//       height?: number; // UI height
//     }
//   | {
//       type: "quiz";
//       id: string;
//       title?: string;
//       spec: ReviewQuestion;
//       passScore?: number; // default 1.0
//     };

// export type ReviewQuestion =
//   | {
//       kind: "mcq";
//       id: string;
//       prompt: string;
//       choices: { id: string; label: string }[];
//       answerId: string;
//       explain?: string;
//     }
//   | {
//       kind: "numeric";
//       id: string;
//       prompt: string;
//       answer: number;
//       tolerance?: number;
//       explain?: string;
//     };

export type ReviewTopic = {
  id: ReviewTopicId;
  label: string;
  minutes?: number;
  summary?: string;
  cards: ReviewCard[];
};

// export type ReviewModule = {
//   id: string;           // e.g. "vectors-1"
//   title: string;        // e.g. "Vectors"
//   subtitle?: string;    // e.g. "Foundations"
//   topics: ReviewTopic[];
//   // optional: deep-link into practice
//   startPracticeHref?: (topicId: string) => string;
// };



import type { Difficulty, ExerciseKind, TopicSlug } from "@/lib/practice/types";

// export type ReviewQuestion ={
//    subject: string;
//               module: string;
//               section: string;
//               topic: TopicSlug;
//               difficulty: Difficulty;
//               n: number;
//               allowReveal: boolean;
// }

  // | {
  //     kind: "mcq";
  //     id: string;
  //     prompt: string;
  //     choices: { id: string; label: string }[];
  //     answerId: string;
  //     explain?: string;
  //   }
  // | {
  //     kind: "numeric";
  //     id: string;
  //     prompt: string;
  //     answer: number;
  //     tolerance?: number;
  //     explain?: string;
  //   }
  // | {
  //     /**
  //      * ✅ NEW:
  //      * Ask QuizBlock to fetch a real Exercise via /api/practice and validate via /api/practice/validate.
  //      * This is how you get “code input” inside quiz, or any exercise kind, with the same styling.
  //      */
  //     kind: "practice";
  //     id: string;

  //     // Text shown above the exercise (optional)
  //     prompt?: string;
  //     explain?: string;

  //     // What to fetch from /api/practice
  //     fetch: {
  //       subject: string;
  //       module: string;
  //       section?: string;
  //       topic?: TopicSlug; // if omitted => server picks from pool (section or subject+module)
  //       difficulty?: Difficulty;
  //       allowReveal?: boolean;

  //       // ✅ NEW
  //       preferKind?: ExerciseKind; // "code_input" | "single_choice" | ...
  //       genKey?: string;           // optional: exact generator key if you support it
  //     };

  //     // Quiz attempt rules (client-side UI only)
  //     maxAttempts?: number; // default 1
  //   };



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


export type ReviewCard =
  | { type: "text"; id: string; title?: string; markdown: string }
  | { type: "sketch"; id: string; title?: string; sketchId: string; height?: number; props?: any }
  | {
      type: "quiz";
      id: string;
      title?: string;
      passScore?: number;
      spec: ReviewQuizSpec; // ✅ spec, not questions
    }
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
