function normalizeText(s: string) {
  return String(s ?? "")
    .toLowerCase()
    .trim()
    // normalize accents
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // remove punctuation
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sameNormalized(a: string, b: string) {
  return normalizeText(a) === normalizeText(b);
}

function arrayEq(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

// expected shapes
type TextExpected = { kind: "text_input"; answers: string[]; match?: "exact" | "includes" };
type DragExpected = { kind: "drag_reorder"; tokenIds: string[] };
type VoiceExpected = { kind: "voice_input"; answers: string[]; match?: "exact" | "includes" };

// In your validator switch:
export function validateAnswer(expected: any, answer: any): { ok: boolean; detail?: any } {
  if (!expected || !answer) return { ok: false };

  switch (expected.kind) {
    case "text_input": {
      const exp = expected as TextExpected;
      const val = String(answer?.value ?? "");
      const match = exp.match ?? "exact";

      const ok =
        match === "includes"
          ? exp.answers.some((a) => normalizeText(val).includes(normalizeText(a)))
          : exp.answers.some((a) => sameNormalized(val, a));

      return { ok };
    }

    case "drag_reorder": {
      const exp = expected as DragExpected; // exp.tokenIds OR exp.order depending on your type
      const got = Array.isArray(answer?.order) ? answer.order.map(String) : [];
      const want = Array.isArray((exp as any).order)
          ? (exp as any).order.map(String)
          : Array.isArray((exp as any).tokenIds)
              ? (exp as any).tokenIds.map(String)
              : [];
      return { ok: arrayEq(got, want) };
    }

    case "voice_input": {
      const exp = expected as VoiceExpected;
      const t = String(answer?.transcript ?? "");
      const match = exp.match ?? "exact";

      const ok =
        match === "includes"
          ? exp.answers.some((a) => normalizeText(t).includes(normalizeText(a)))
          : exp.answers.some((a) => sameNormalized(t, a));

      return { ok };
    }

    default:
      // your existing cases...
      return { ok: false };
  }
}
