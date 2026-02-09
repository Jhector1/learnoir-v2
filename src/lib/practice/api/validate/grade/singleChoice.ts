// src/lib/practice/validate/grade/singleChoice.ts
import type { GradeResult } from ".";
import type { LoadedInstance } from "../load";
import type { SubmitAnswer } from "../schemas";

export function gradeSingleChoice(args: {
  instance: LoadedInstance;
  expectedCanon: any;
  answer: SubmitAnswer | null;
  isReveal: boolean;
}): GradeResult {
  const correct = String(args.expectedCanon.optionId ?? "");

  if (args.isReveal) {
    return {
      ok: false,
      revealAnswer: { kind: "single_choice", optionId: correct },
      explanation: "Solution shown.",
    };
  }

  const chosen = String((args.answer as any)?.optionId ?? "");
  const ok = chosen === correct;

  return {
    ok,
    revealAnswer: null,
    explanation: ok ? "Correct choice." : "Not quite — review the concept.",
  };
}
