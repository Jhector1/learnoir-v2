import type {
    SingleChoiceExercise,
    VoiceInputExercise,
    ListenBuildExercise,
    FillBlankChoiceExercise,
    DragReorderExercise,
} from "../../../../../types";

import { defineTopic, type Handler, type TopicBundle, makeSingleChoiceOut } from "@/lib/practice/generator/engines/utils";
import { makeTextExpected, makeVoiceExpected, makeDragExpected, pickName } from "../../_shared";

export const HC_INTRO_POOL = [
    { key: "hc_intro_mwen_rele_means_mcq", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "hc_intro_pick_best_intro_mcq", w: 1, kind: "single_choice", purpose: "quiz" },

    { key: "hc_intro_reorder_mwen_rele_name", w: 1, kind: "drag_reorder", purpose: "quiz" },
    { key: "hc_intro_reorder_bonjou_mwen_rele_name", w: 1, kind: "drag_reorder", purpose: "quiz" },

    { key: "hc_intro_fill_blank_mwen___name", w: 1, kind: "fill_blank_choice", purpose: "quiz" },
    { key: "hc_intro_voice_mwen_rele_name", w: 1, kind: "voice_input", purpose: "quiz" },

    // (optional swap) listen_build instead of one mcq
    // { key: "hc_intro_listen_build_mwen_rele_name", w: 1, kind: "listen_build", purpose: "quiz" },
] as const;

export type HcIntroKey = (typeof HC_INTRO_POOL)[number]["key"];

export const HC_INTRO_HANDLERS: Record<HcIntroKey, Handler> = {
    hc_intro_mwen_rele_means_mcq: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "hc_intro_mwen_rele_means_mcq",
            id,
            topic,
            diff,
            title: "Meaning",
            prompt: `What does **"Mwen rele"** mean in an introduction?`,
            options: [
                { id: "a", text: "I am hungry" },
                { id: "b", text: "My name is / I'm called" },
                { id: "c", text: "Good night" },
            ],
            answerOptionId: "b",
            hint: `"Mwen rele ..." is a common way to say your name.`,
        }),

    hc_intro_pick_best_intro_mcq: ({ rng, diff, id, topic }) => {
        const name = pickName(rng);
        const exercise: SingleChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "single_choice",
            title: "Pick the best",
            prompt: `Which sentence means **"My name is ${name}."**?`,
            options: [
                { id: "a", text: `Mwen byen.` },
                { id: "b", text: `Mwen rele ${name}.` },
                { id: "c", text: `Ki kote?` },
            ],
            hint: `Pattern: "Mwen rele <Name>."`,
        };
        return { archetype: "hc_intro_pick_best_intro_mcq", exercise, expected: { kind: "single_choice", optionId: "b" } };
    },

    hc_intro_reorder_mwen_rele_name: ({ rng, diff, id, topic }) => {
        const name = pickName(rng);
        const tokens = [
            { id: "t1", text: "Mwen" },
            { id: "t2", text: "rele" },
            { id: "t3", text: `${name}.` },
        ];

        const exercise: DragReorderExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "drag_reorder",
            title: "Word order",
            prompt: `Rearrange to say: **My name is ${name}.**`,
            tokens: rng.shuffle(tokens as any) as any,
            hint: `Pattern: "Mwen rele <Name>."`,
        };

        const expected = makeDragExpected(["t1", "t2", "t3"]);
        return { archetype: "hc_intro_reorder_mwen_rele_name", exercise, expected };
    },

    hc_intro_reorder_bonjou_mwen_rele_name: ({ rng, diff, id, topic }) => {
        const name = pickName(rng);
        const tokens = [
            { id: "t1", text: "Bonjou," },
            { id: "t2", text: "mwen" },
            { id: "t3", text: "rele" },
            { id: "t4", text: `${name}.` },
        ];

        const exercise: DragReorderExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "drag_reorder",
            title: "Greeting + name",
            prompt: `Rearrange to say: **Hello, my name is ${name}.**`,
            tokens: rng.shuffle(tokens as any) as any,
            hint: `Pattern: "Bonjou, mwen rele <Name>."`,
        };

        const expected = makeDragExpected(["t1", "t2", "t3", "t4"]);
        return { archetype: "hc_intro_reorder_bonjou_mwen_rele_name", exercise, expected };
    },

    hc_intro_fill_blank_mwen___name: ({ rng, diff, id, topic }) => {
        const name = pickName(rng);
        const exercise: FillBlankChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "fill_blank_choice",
            title: "Fill the blank",
            prompt: "Choose the word that completes the introduction.",
            template: `Mwen ____ ${name}.`,
            choices: ["rele", "byen", "ou"],
            locale: "ht-HT",
            hint: `Use "rele" to say your name.`,
        };

        const expected = makeTextExpected(["rele"]);
        return { archetype: "hc_intro_fill_blank_mwen___name", exercise, expected };
    },

    hc_intro_voice_mwen_rele_name: ({ rng, diff, id, topic }) => {
        const name = pickName(rng);
        const target = `Mwen rele ${name}.`;

        const exercise: VoiceInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "voice_input",
            title: "Say it",
            prompt: `Say this out loud: **${target}**`,
            targetText: target,
            locale: "ht-HT",
            maxSeconds: 7,
            hint: `Say the full sentence: "Mwen rele ${name}."`,
        };

        const expected = makeVoiceExpected([normalizePhrase(target)], "includes");
        return { archetype: "hc_intro_voice_mwen_rele_name", exercise, expected };
    },
};

export const HC_INTRO_TOPIC: TopicBundle = defineTopic(
    "hc_introductions",
    HC_INTRO_POOL as any,
    HC_INTRO_HANDLERS as any
);

// local helper (same normalization as your voice UI)
function normalizePhrase(s: string) {
    return String(s ?? "").replace(/[’‘]/g, "'").replace(/\s+/g, " ").trim().toLowerCase();
}