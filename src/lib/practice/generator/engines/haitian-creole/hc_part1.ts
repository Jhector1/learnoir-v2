import type {
  Difficulty,
  ExerciseKind,
  SingleChoiceExercise,
  TextInputExercise,
  DragReorderExercise,
  VoiceInputExercise,
} from "../../../types";
import type { GenOut } from "../../shared/expected";
import type { RNG } from "../../shared/rng";
import type { TopicContext } from "../../generatorTypes";

import type { PracticeKind } from "@prisma/client";

// ------------------------------------------------------------
// Pool helpers (same style as your Python engine)
// ------------------------------------------------------------
type HandlerArgs = { rng: RNG; diff: Difficulty; id: string; topic: string };
type Handler = (args: HandlerArgs) => GenOut<ExerciseKind>;
type PoolItem = { key: string; w: number; kind?: PracticeKind };

function readPoolFromMeta(meta: any): PoolItem[] {
  const pool = meta?.pool;
  if (!Array.isArray(pool)) return [];
  return pool
    .map((p: any) => ({
      key: String(p?.key ?? "").trim(),
      w: Number(p?.w ?? 0),
      kind: p?.kind ? (String(p.kind).trim() as PracticeKind) : undefined,
    }))
    .filter((p) => p.key && Number.isFinite(p.w) && p.w > 0);
}

function weightedKey(rng: RNG, pool: PoolItem[]): string {
  const picked = rng.weighted(pool.map((p) => ({ value: p.key, w: p.w })));
  return String(picked);
}

// ------------------------------------------------------------
// Expected helpers (new kinds)
// ------------------------------------------------------------
type TextExpected = { kind: "text_input"; answers: string[]; match?: "exact" | "includes" };
type DragExpected = { kind: "drag_reorder"; tokenIds: string[] };
type VoiceExpected = { kind: "voice_input"; answers: string[]; match?: "exact" | "includes" };

function makeTextExpected(answers: string[], match: "exact" | "includes" = "exact"): TextExpected {
  return { kind: "text_input", answers, match };
}
function makeDragExpected(tokenIds: string[]): DragExpected {
  return { kind: "drag_reorder", tokenIds };
}
function makeVoiceExpected(answers: string[], match: "exact" | "includes" = "exact"): VoiceExpected {
  return { kind: "voice_input", answers, match };
}

// ------------------------------------------------------------
// Small content helpers
// ------------------------------------------------------------
function pickName(rng: RNG) {
  return rng.pick(["Jean", "Mads", "Sophia", "Daniella", "Alex", "Maria"] as const);
}
function pickTime(rng: RNG) {
  return rng.pick(["morning", "evening"] as const);
}

// ------------------------------------------------------------
// Handlers
// ------------------------------------------------------------
const HANDLERS: Record<string, Handler> = {
  // ---------- GREETINGS (MCQ) ----------
  hc_greet_bonjou_mcq: ({ diff, id, topic }) => {
    const exercise: SingleChoiceExercise = {
      id,
      topic,
      difficulty: diff,
      kind: "single_choice",
      title: "Bonjou",
      prompt: `What does **Bonjou** mean?`,
      options: [
        { id: "a", text: "Goodbye" },
        { id: "b", text: "Hello / Good morning" },
        { id: "c", text: "Thank you" },
      ],
      hint: "Bonjou is a common greeting in the morning/daytime.",
    };

    return {
      archetype: "hc_greet_bonjou_mcq",
      exercise,
      expected: { kind: "single_choice", optionId: "b" },
    };
  },

  // ---------- TEXT INPUT (translate) ----------
  hc_translate_good_evening_text: ({ diff, id, topic }) => {
    const exercise: TextInputExercise = {
      id,
      topic,
      difficulty: diff,
      kind: "text_input",
      title: "Translate",
      prompt: `Translate to Haitian Creole: **Good evening**`,
      placeholder: `Type in Kreyòl...`,
      ui: "short",
      hint: `Common answer: "Bonswa"`,
    };

    // accept both common spellings
    const expected = makeTextExpected(["bonswa", "bon swa"]);

    return { archetype: "hc_translate_good_evening_text", exercise, expected };
  },

  // ---------- DRAG REORDER (word order) ----------
  hc_reorder_mwen_rele: ({ rng, diff, id, topic }) => {
    const name = pickName(rng);

    // tokens to drag
    const tokens = [
      { id: "t1", text: "Mwen" },
      { id: "t2", text: "rele" },
      { id: "t3", text: name },
    ];

    const exercise: DragReorderExercise = {
      id,
      topic,
      difficulty: diff,
      kind: "drag_reorder",
      title: "Word order",
      prompt: `Rearrange the words to make the sentence: **My name is ${name}.**`,
      tokens: rng.shuffle(tokens as any) as any,
      hint: `Pattern: "Mwen rele <Name>"`,
    };

    const expected = makeDragExpected(["t1", "t2", "t3"]);

    return { archetype: "hc_reorder_mwen_rele", exercise, expected };
  },

  // ---------- VOICE INPUT (say it) ----------
  hc_voice_say_bonjou: ({ diff, id, topic }) => {
    const exercise: VoiceInputExercise = {
      id,
      topic,
      difficulty: diff,
      kind: "voice_input",
      title: "Say it",
      prompt: `Say this out loud: **Bonjou**`,
      targetText: "Bonjou",
      locale: "ht-HT",
      maxSeconds: 6,
      hint: "Speak clearly; the system checks your transcript.",
    };

    const expected = makeVoiceExpected(["bonjou"], "includes");

    return { archetype: "hc_voice_say_bonjou", exercise, expected };
  },

  // ---------- Pronouns (text input) ----------
  hc_translate_i_text: ({ diff, id, topic }) => {
    const exercise: TextInputExercise = {
      id,
      topic,
      difficulty: diff,
      kind: "text_input",
      title: "Pronouns",
      prompt: `Translate to Haitian Creole: **I / me**`,
      placeholder: "Type your answer…",
      ui: "short",
      hint: `Usually "mwen" (often shortened to "m" in speech).`,
    };

    const expected = makeTextExpected(["mwen", "m"]);

    return { archetype: "hc_translate_i_text", exercise, expected };
  },

  // fallback
  fallback: ({ diff, id, topic }) => {
    const exercise: SingleChoiceExercise = {
      id,
      topic,
      difficulty: diff,
      kind: "single_choice",
      title: "Kreyòl basics (fallback)",
      prompt: `What does **Mèsi** mean?`,
      options: [
        { id: "a", text: "Please" },
        { id: "b", text: "Thank you" },
        { id: "c", text: "Good morning" },
      ],
      hint: "Mèsi = thank you.",
    };

    return { archetype: "fallback", exercise, expected: { kind: "single_choice", optionId: "b" } };
  },
};

// Safe mixed pool
const SAFE_MIXED_POOL: PoolItem[] = Object.keys(HANDLERS)
  .filter((k) => k !== "fallback")
  .map((k) => ({ key: k, w: 1 }));

export function makeGenHaitianCreolePart1(ctx: TopicContext) {
  return (rng: RNG, diff: Difficulty, id: string): GenOut<ExerciseKind> => {
    const R: RNG = (ctx as any).rng ?? rng;
    const topic = String(ctx.topicSlug);

    const base = readPoolFromMeta(ctx.meta).filter((p) => p.key in HANDLERS);

    const preferKind = (ctx.preferKind ?? ctx.meta?.preferKind ?? null) as PracticeKind | null;
    const filtered = preferKind ? base.filter((p) => !p.kind || p.kind === preferKind) : base;

    const pool =
      (filtered.length ? filtered : base).length
        ? (filtered.length ? filtered : base)
        : SAFE_MIXED_POOL;

    const key = weightedKey(R, pool);
    const handler = HANDLERS[key] ?? HANDLERS.fallback;

    return handler({ rng: R, diff, id, topic });
  };
}
