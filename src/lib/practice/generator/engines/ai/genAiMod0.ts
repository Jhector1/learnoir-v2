// src/lib/practice/generators/ai/mod0/genAiMod0.ts
import type {
    Difficulty,
    ExerciseKind,
    SingleChoiceExercise,
    TextInputExercise,
    DragReorderExercise,
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
// Expected helpers (beginner-safe kinds only)
// ------------------------------------------------------------
type TextExpected = { kind: "text_input"; answers: string[]; match?: "exact" | "includes" };
type DragExpected = { kind: "drag_reorder"; tokenIds: string[] };

function makeTextExpected(answers: string[], match: "exact" | "includes" = "exact"): TextExpected {
    return { kind: "text_input", answers, match };
}
function makeDragExpected(tokenIds: string[]): DragExpected {
    return { kind: "drag_reorder", tokenIds };
}

// ------------------------------------------------------------
// Small content helpers
// ------------------------------------------------------------
function pickScenario(rng: RNG) {
    return rng.pick([
        "writing a polite email",
        "summarizing a long text",
        "planning a simple weekend",
        "explaining something in simpler words",
        "making a study plan",
    ] as const);
}

function pickUnsafeInfo(rng: RNG) {
    return rng.pick(["password", "SSN", "credit card number", "bank login"] as const);
}

// ------------------------------------------------------------
// Handlers (AI Module 0: basics, prompting, checking, privacy)
// ------------------------------------------------------------
const HANDLERS: Record<string, Handler> = {
    // 1) What is AI? (single choice)
    ai0_what_is_ai_mcq: ({ diff, id, topic }) => {
        const exercise: SingleChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "single_choice",
            title: "What is AI?",
            prompt: "Which option best describes **AI** in everyday terms?",
            options: [
                { id: "a", text: "A tool that can learn patterns from examples and generate helpful outputs" },
                { id: "b", text: "A human brain living inside a computer" },
                { id: "c", text: "A machine that always tells the truth" },
            ],
            hint: "Think: pattern-learning + useful outputs (not magic, not guaranteed truth).",
        };

        return {
            archetype: "ai0_what_is_ai_mcq",
            exercise,
            expected: { kind: "single_choice", optionId: "a" },
        };
    },

    // 2) AI strengths (single choice)
    ai0_best_for_mcq: ({ rng, diff, id, topic }) => {
        const scenario = pickScenario(rng);

        const exercise: SingleChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "single_choice",
            title: "What AI is good at",
            prompt: `AI is often helpful for **${scenario}**. Why?`,
            options: [
                { id: "a", text: "It can quickly draft ideas and examples you can edit" },
                { id: "b", text: "It can access your private files automatically" },
                { id: "c", text: "It guarantees perfect answers every time" },
            ],
            hint: "AI can help you get a first draft or options—then you review and improve it.",
        };

        return {
            archetype: "ai0_best_for_mcq",
            exercise,
            expected: { kind: "single_choice", optionId: "a" },
        };
    },

    // 3) “Always correct?” (single choice)
    ai0_always_correct_mcq: ({ diff, id, topic }) => {
        const exercise: SingleChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "single_choice",
            title: "Accuracy",
            prompt: "Is an AI answer **always** correct?",
            options: [
                { id: "a", text: "Yes, AI never makes mistakes" },
                { id: "b", text: "No, AI can be wrong, so you should double-check important info" },
                { id: "c", text: "Only when the answer is long" },
            ],
            hint: "Treat AI like a helpful assistant, not a perfect source of truth.",
        };

        return {
            archetype: "ai0_always_correct_mcq",
            exercise,
            expected: { kind: "single_choice", optionId: "b" },
        };
    },

    // 4) What to do with facts (text input)
    ai0_verify_text: ({ diff, id, topic }) => {
        const exercise: TextInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "text_input",
            title: "Best habit",
            prompt: `If AI gives you a fact you plan to use, what should you do first? (one word)`,
            placeholder: "Type one word…",
            ui: "short",
            hint: `Good answers include "verify" or "check".`,
        };

        const expected = makeTextExpected(["verify", "check", "double-check", "confirm"], "includes");

        return { archetype: "ai0_verify_text", exercise, expected };
    },

    // 5) Privacy basics (single choice)
    ai0_privacy_mcq: ({ rng, diff, id, topic }) => {
        const unsafe = pickUnsafeInfo(rng);

        const exercise: SingleChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "single_choice",
            title: "Privacy",
            prompt: `You should avoid sharing your **${unsafe}** with an AI chat.`,
            options: [
                { id: "a", text: "True" },
                { id: "b", text: "False" },
            ],
            hint: "Avoid sharing sensitive personal information.",
        };

        return {
            archetype: "ai0_privacy_mcq",
            exercise,
            expected: { kind: "single_choice", optionId: "a" },
        };
    },

    // 6) Prompt clarity: pick best prompt (single choice)
    ai0_best_prompt_mcq: ({ diff, id, topic }) => {
        const exercise: SingleChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "single_choice",
            title: "Clear prompts",
            prompt: "Which prompt will usually give the **best** result?",
            options: [
                { id: "a", text: "Help" },
                { id: "b", text: "Write something about my day" },
                {
                    id: "c",
                    text: "Write a short, polite email to my teacher asking for an extension. Keep it under 80 words.",
                },
            ],
            hint: "Clear goal + context + constraints = better output.",
        };

        return {
            archetype: "ai0_best_prompt_mcq",
            exercise,
            expected: { kind: "single_choice", optionId: "c" },
        };
    },

    // 7) Prompt ingredients (drag reorder)
    ai0_prompt_recipe_drag: ({ rng, diff, id, topic }) => {
        const tokens = [
            { id: "t1", text: "Goal (what you want)" },
            { id: "t2", text: "Context (who/why/what’s going on)" },
            { id: "t3", text: "Constraints (length, tone, rules)" },
            { id: "t4", text: "Output format (bullets, table, steps)" },
        ];

        const exercise: DragReorderExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "drag_reorder",
            title: "Prompt recipe",
            prompt: "Put these in a helpful order for writing a good prompt.",
            tokens: rng.shuffle(tokens as any) as any,
            hint: "Start with what you want, then give details, then rules, then format.",
        };

        const expected = makeDragExpected(["t1", "t2", "t3", "t4"]);

        return { archetype: "ai0_prompt_recipe_drag", exercise, expected };
    },

    // 8) When to ask follow-ups (single choice)
    ai0_followup_mcq: ({ diff, id, topic }) => {
        const exercise: SingleChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "single_choice",
            title: "Follow-ups",
            prompt: "If the AI answer is *too vague*, what’s a good next move?",
            options: [
                { id: "a", text: "Give up and stop" },
                { id: "b", text: "Ask a more specific follow-up question" },
                { id: "c", text: "Share your password so it can help more" },
            ],
            hint: "You control the conversation—ask for what you need.",
        };

        return {
            archetype: "ai0_followup_mcq",
            exercise,
            expected: { kind: "single_choice", optionId: "b" },
        };
    },

    // 9) “Made-up info” concept (single choice, no jargon)
    ai0_making_up_mcq: ({ diff, id, topic }) => {
        const exercise: SingleChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "single_choice",
            title: "Sometimes AI is wrong",
            prompt: "Sometimes AI gives a confident answer that is not true. What should you do?",
            options: [
                { id: "a", text: "Assume it must be true because it sounds confident" },
                { id: "b", text: "Check important details using a trusted source" },
                { id: "c", text: "Never use AI again" },
            ],
            hint: "Use AI for help—but verify important info.",
        };

        return {
            archetype: "ai0_making_up_mcq",
            exercise,
            expected: { kind: "single_choice", optionId: "b" },
        };
    },

    // 10) Step order for using AI well (drag reorder)
    ai0_workflow_drag: ({ rng, diff, id, topic }) => {
        const tokens = [
            { id: "t1", text: "Ask clearly" },
            { id: "t2", text: "Read the answer" },
            { id: "t3", text: "Check important parts" },
            { id: "t4", text: "Improve your prompt (iterate)" },
        ];

        const exercise: DragReorderExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "drag_reorder",
            title: "Simple workflow",
            prompt: "Put these steps in a good order when using AI for help.",
            tokens: rng.shuffle(tokens as any) as any,
            hint: "Clear ask → read → verify → refine.",
        };

        const expected = makeDragExpected(["t1", "t2", "t3", "t4"]);

        return { archetype: "ai0_workflow_drag", exercise, expected };
    },

    // 11) Short “do / don’t” (text input)
    ai0_yes_no_private_text: ({ diff, id, topic }) => {
        const exercise: TextInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "text_input",
            title: "Quick check",
            prompt: "Should you paste private account login details into an AI chat? (yes/no)",
            placeholder: "yes or no",
            ui: "short",
            hint: `Answer: "no"`,
        };

        const expected = makeTextExpected(["no", "nope"], "includes");

        return { archetype: "ai0_yes_no_private_text", exercise, expected };
    },

    // fallback (single choice)
    fallback: ({ diff, id, topic }) => {
        const exercise: SingleChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "single_choice",
            title: "AI basics (fallback)",
            prompt: "Which is a good way to get better AI results?",
            options: [
                { id: "a", text: "Be more specific about what you want" },
                { id: "b", text: "Use fewer words and no details" },
                { id: "c", text: "Share sensitive info" },
            ],
            hint: "Specific prompts usually help.",
        };

        return { archetype: "fallback", exercise, expected: { kind: "single_choice", optionId: "a" } };
    },
};

// Safe mixed pool
const SAFE_MIXED_POOL: PoolItem[] = Object.keys(HANDLERS)
    .filter((k) => k !== "fallback")
    .map((k) => ({ key: k, w: 1 }));

export function makeGenAiMod0(ctx: TopicContext) {
    return (rng: RNG, diff: Difficulty, id: string): GenOut<ExerciseKind> => {
        const R: RNG = (ctx as any).rng ?? rng;
        const topic = String(ctx.topicSlug);

        const base = readPoolFromMeta(ctx.meta).filter((p) => p.key in HANDLERS);

        // optional preferKind filtering (kept for compatibility)
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
