import type { GradeResult } from ".";
import type { LoadedInstance } from "../load";
import type { SubmitAnswer } from "../schemas";

function toStrList(v: any): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x));
}

export function gradeDragReorder(args: {
  instance: LoadedInstance;
  expectedCanon: any;
  answer: SubmitAnswer | null;
  isReveal: boolean;
}): GradeResult {
  const expectedOrder = toStrList(args.expectedCanon.order);

  if (args.isReveal) {
    return {
      ok: false,
      revealAnswer: { kind: "drag_reorder", order: expectedOrder },
      explanation: "Solution shown.",
    };
  }

  const order = toStrList((args.answer as any)?.order);
  if (!order.length) {
    return { ok: false, revealAnswer: null, explanation: "Missing order." };
  }

  if (!expectedOrder.length) {
    // If generator forgot to store expected order, don’t block user
    return { ok: true, revealAnswer: null, explanation: "Answer recorded." };
  }

  const ok =
    order.length === expectedOrder.length &&
    order.every((id, i) => id === expectedOrder[i]);

  return {
    ok,
    revealAnswer: null,
    explanation: ok ? "Correct." : "Not correct.",
  };
}
