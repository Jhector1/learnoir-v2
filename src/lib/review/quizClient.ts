import type { ReviewQuizSpec } from "@/lib/review/types";

function bool01(v: any) {
  return v ? 1 : 0;
}

// export function buildReviewQuizKey(
//   spec: ReviewQuizSpec,
//   quizCardId: string,
//   version: string | number = 0
// ) {
//   const s: any = spec as any;
//   return [
//     "review-quiz",
//     `subject=${spec.subject}`,
//     `module=${spec.module ?? ""}`,
//     `section=${spec.section ?? ""}`,
//     `topic=${spec.topic ?? ""}`,
//     `difficulty=${spec.difficulty ?? ""}`,
//     `n=${spec.n ?? 4}`,
//     `allowReveal=${bool01(s.allowReveal)}`,
//     `preferKind=${s.preferKind ?? ""}`,
//     `maxAttempts=${s.maxAttempts ?? 1}`,
//     `quizCard=${quizCardId}`,
//     `v=${String(version)}`, // ✅ string ok
//   ].join("|");
// }

export function buildReviewQuizKey(
  spec: ReviewQuizSpec,
  quizCardId: string,
  version: string | number = 0
) {
  const s: any = spec as any;
  return [
    "review-quiz",
    `subject=${spec.subject}`,
    `module=${spec.module ?? ""}`,
    `section=${spec.section ?? ""}`,
    `topic=${spec.topic ?? ""}`,
    `difficulty=${spec.difficulty ?? ""}`,
    `n=${spec.n ?? 4}`,
    `allowReveal=${bool01(s.allowReveal)}`,
    `preferKind=${s.preferKind ?? ""}`,
    `maxAttempts=${s.maxAttempts ?? 1}`,
    `quizCard=${quizCardId}`,
    `v=${version}`,
  ].join("|");
}
