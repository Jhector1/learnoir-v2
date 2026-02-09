import type { GradeResult } from ".";
import type { LoadedInstance } from "../load";
import type { SubmitAnswer } from "../schemas";

function norm(s: string) {
  return String(s ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function gradeTextInput(args: {
  instance: LoadedInstance;
  expectedCanon: any;
  answer: SubmitAnswer | null;
  isReveal: boolean;
}): GradeResult {
  const expectedRaw =
    typeof args.expectedCanon.value === "string"
      ? args.expectedCanon.value
      : typeof args.expectedCanon.text === "string"
        ? args.expectedCanon.text
        : null;

  const acceptedRaw: string[] = Array.isArray(args.expectedCanon.accepted)
    ? args.expectedCanon.accepted.filter((x: any) => typeof x === "string")
    : [];

  // ✅ NEW: support canonical `answers: string[]`
  const answersRaw: string[] = Array.isArray(args.expectedCanon.answers)
    ? args.expectedCanon.answers.filter((x: any) => typeof x === "string")
    : [];

  // merge all candidates
  const expectedList = [
    ...(expectedRaw ? [expectedRaw] : []),
    ...acceptedRaw,
    ...answersRaw,
  ]
    .map(norm)
    .filter(Boolean);

  if (args.isReveal) {
    const shown = expectedRaw ?? answersRaw[0] ?? acceptedRaw[0] ?? "";
    return {

        
      ok: false,
      // (your RevealAnswerCard can evolve later; this is fine)
      revealAnswer: {
        kind: "text_input",
        value: shown,
        answers: [shown, ...expectedList.filter((x) => x !== norm(shown))],
      },
      explanation: "Solution shown.",
    };
  }

  const received = (args.answer as any)?.value;
  if (typeof received !== "string" || !received.trim()) {
    return { ok: false, revealAnswer: null, explanation: "Missing text answer." };
  }

  // ⚠️ If you want to STOP silently accepting when expected is missing:
  // return { ok: false, revealAnswer: null, explanation: "Server bug: missing expected." };

  if (!expectedList.length) {
    return { ok: true, revealAnswer: null, explanation: "Answer recorded." };
  }

  const r = norm(received);
  const ok = expectedList.includes(r);

  return {
    ok,
    revealAnswer: null,
    explanation: ok ? "Correct." : "Not correct.",
  };
}
