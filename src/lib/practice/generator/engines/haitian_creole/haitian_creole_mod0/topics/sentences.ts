// src/lib/practice/generator/engines/haitian/haitian_creole_part1_mod0/topics/sentences.ts
import type {
    SingleChoiceExercise,
    TextInputExercise,
    VoiceInputExercise,
    DragReorderExercise,
    WordBankArrangeExercise,
    ListenBuildExercise,
    FillBlankChoiceExercise,
} from "../../../../../types";

import {
    makeTextExpected,
    makeVoiceExpected,
    makeDragExpected,
} from "../../_shared";

import {
    defineTopic,
    makeSingleChoiceOut,
    type Handler,
    type TopicBundle,
} from "@/lib/practice/generator/engines/utils";

export const HC_SENTENCES_POOL = [
    { key: "hc_sent_svo_order_mcq", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "hc_sent_translate_im_fine_text", w: 1, kind: "text_input", purpose: "quiz" },
    { key: "hc_sent_reorder_mwen_renmen_diri", w: 1, kind: "drag_reorder", purpose: "quiz" },
    { key: "hc_sent_voice_say_mwen_byen", w: 1, kind: "voice_input", purpose: "quiz" },

    // ✅ NEW kinds
    { key: "hc_sent_wordbank_mwen_renmen_diri", w: 1, kind: "word_bank_arrange", purpose: "project" },
    { key: "hc_sent_listen_build_mwen_byen", w: 1, kind: "listen_build", purpose: "project" },
    { key: "hc_sent_fill_blank_mwen___", w: 1, kind: "fill_blank_choice", purpose: "project" },
] as const;

export type HcSentencesKey = (typeof HC_SENTENCES_POOL)[number]["key"];

export const HC_SENTENCES_HANDLERS: Record<HcSentencesKey, Handler> = {
    hc_sent_svo_order_mcq: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "hc_sent_svo_order_mcq",
            id,
            topic,
            diff,
            title: "Sentence order",
            prompt: "Most simple Haitian Creole sentences use:",
            options: [
                { id: "a", text: "Verb → Subject → Object" },
                { id: "b", text: "Subject → Verb → Object" },
                { id: "c", text: "Object → Verb → Subject" },
            ],
            answerOptionId: "b",
            hint: "Basic order is usually **S + V + O**.",
        }),

    hc_sent_translate_im_fine_text: ({ diff, id, topic }) => {
        const exercise: TextInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "text_input",
            title: "Translate",
            prompt: `Translate to Haitian Creole: **I’m fine.**`,
            placeholder: "Type in Kreyòl…",
            ui: "short",
            hint: `Common: "Mwen byen."`,
        };

        const expected = makeTextExpected(["mwen byen", "mwen byen."]);
        return { archetype: "hc_sent_translate_im_fine_text", exercise, expected };
    },

    hc_sent_reorder_mwen_renmen_diri: ({ rng, diff, id, topic }) => {
        const tokens = [
            { id: "t1", text: "Mwen" },
            { id: "t2", text: "renmen" },
            { id: "t3", text: "diri" },
        ];

        const exercise: DragReorderExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "drag_reorder",
            title: "Word order",
            prompt: `Rearrange to form the sentence: **I like rice.**`,
            tokens: rng.shuffle(tokens as any) as any,
            hint: `Pattern: "Mwen renmen diri"`,
        };

        const expected = makeDragExpected(["t1", "t2", "t3"]);
        return { archetype: "hc_sent_reorder_mwen_renmen_diri", exercise, expected };
    },

    hc_sent_voice_say_mwen_byen: ({ diff, id, topic }) => {
        const exercise: VoiceInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "voice_input",
            title: "Say it",
            prompt: `Say this out loud: **Mwen byen.**`,
            targetText: "Mwen byen.",
            locale: "ht-HT",
            maxSeconds: 6,
            hint: "Say it clearly: **Mwen byen.**",
        };

        const expected = makeVoiceExpected(["mwen byen", "mwen byen."], "includes");
        return { archetype: "hc_sent_voice_say_mwen_byen", exercise, expected };
    },

    // ✅ NEW: word_bank_arrange
    hc_sent_wordbank_mwen_renmen_diri: ({ diff, id, topic }) => {
        const exercise: WordBankArrangeExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "word_bank_arrange",
            title: "Build the sentence",
            prompt: `Build: **Mwen renmen diri.**`,
            targetText: "Mwen renmen diri.",
            locale: "ht-HT",
            hint: `Tap tiles to form: "Mwen renmen diri."`,
            distractors: ["byen", "bonjou"],
        };

        const expected = makeTextExpected(["mwen renmen diri", "mwen renmen diri."]);
        return { archetype: "hc_sent_wordbank_mwen_renmen_diri", exercise, expected };
    },

    // ✅ NEW: listen_build
    hc_sent_listen_build_mwen_byen: ({ diff, id, topic }) => {
        const exercise: ListenBuildExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "listen_build",
            title: "Listen & build",
            prompt: `Listen, then build the sentence.`,
            targetText: "Mwen byen.",
            locale: "ht-HT",
            hint: `Common: "Mwen byen."`,
            distractors: ["diri", "renmen"],
        };

        const expected = makeTextExpected(["mwen byen", "mwen byen."]);
        return { archetype: "hc_sent_listen_build_mwen_byen", exercise, expected };
    },

    // ✅ NEW: fill_blank_choice
    hc_sent_fill_blank_mwen___: ({ diff, id, topic }) => {
        const exercise: FillBlankChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "fill_blank_choice",
            title: "Fill the blank",
            prompt: "Choose the word that completes the sentence.",
            template: "Mwen ____.",
            choices: ["byen", "bonjou", "diri"],
            locale: "ht-HT",
            hint: `"Mwen byen." means "I’m fine."`,
        };

        const expected = makeTextExpected(["byen"]);
        return { archetype: "hc_sent_fill_blank_mwen___", exercise, expected };
    },
};

export const HC_SENTENCES_TOPIC: TopicBundle = defineTopic(
    "hc_sentences",
    HC_SENTENCES_POOL as any,
    HC_SENTENCES_HANDLERS as any,
);