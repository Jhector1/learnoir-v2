import type {
    SingleChoiceExercise,
    VoiceInputExercise,
    DragReorderExercise,
    ListenBuildExercise,
    FillBlankChoiceExercise,
} from "../../../../../types";

import { makeTextExpected, makeVoiceExpected, makeDragExpected } from "../../_shared";
import { defineTopic, makeSingleChoiceOut, type Handler, type TopicBundle } from "@/lib/practice/generator/engines/utils";

export const HC_SENTENCES_POOL = [
    { key: "hc_sent_svo_order_mcq", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "hc_sent_renmen_means_like_mcq", w: 1, kind: "single_choice", purpose: "quiz" },

    { key: "hc_sent_reorder_mwen_renmen_diri", w: 1, kind: "drag_reorder", purpose: "quiz" },
    { key: "hc_sent_voice_say_mwen_byen", w: 1, kind: "voice_input", purpose: "quiz" },

    { key: "hc_sent_listen_build_mwen_renmen_diri", w: 1, kind: "listen_build", purpose: "quiz" },
    { key: "hc_sent_fill_blank_mwen___diri", w: 1, kind: "fill_blank_choice", purpose: "quiz" },
    { key: "hc_sent_fill_blank_mwen___", w: 1, kind: "fill_blank_choice", purpose: "quiz" },
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

    hc_sent_renmen_means_like_mcq: ({ diff, id, topic }) => {
        const exercise: SingleChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "single_choice",
            title: "Vocabulary",
            prompt: `What does **renmen** mean?`,
            options: [
                { id: "a", text: "to like / to love" },
                { id: "b", text: "to eat" },
                { id: "c", text: "to sleep" },
            ],
            hint: `"Mwen renmen diri." = I like rice.`,
        };
        return { archetype: "hc_sent_renmen_means_like_mcq", exercise, expected: { kind: "single_choice", optionId: "a" } };
    },

    hc_sent_reorder_mwen_renmen_diri: ({ rng, diff, id, topic }) => {
        const tokens = [
            { id: "t1", text: "Mwen" },
            { id: "t2", text: "renmen" },
            { id: "t3", text: "diri." },
        ];

        const exercise: DragReorderExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "drag_reorder",
            title: "Word order",
            prompt: `Rearrange to form the sentence: **I like rice.**`,
            tokens: rng.shuffle(tokens as any) as any,
            hint: `Pattern: "Mwen renmen diri."`,
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

    hc_sent_listen_build_mwen_renmen_diri: ({ diff, id, topic }) => {
        const exercise: ListenBuildExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "listen_build",
            title: "Listen & build",
            prompt: `Listen, then build the sentence.`,
            targetText: "Mwen renmen diri.",
            locale: "ht-HT",
            hint: `"Mwen renmen diri." = I like rice.`,
            distractors: ["byen", "bonjou", "ou"],
        };

        const expected = makeTextExpected(["mwen renmen diri", "mwen renmen diri."]);
        return { archetype: "hc_sent_listen_build_mwen_renmen_diri", exercise, expected };
    },

    hc_sent_fill_blank_mwen___diri: ({ diff, id, topic }) => {
        const exercise: FillBlankChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "fill_blank_choice",
            title: "Fill the blank",
            prompt: "Choose the word that completes the sentence.",
            template: "Mwen ____ diri.",
            choices: ["renmen", "byen", "bonjou"],
            locale: "ht-HT",
            hint: `"Mwen renmen diri." = I like rice.`,
        };

        const expected = makeTextExpected(["renmen"]);
        return { archetype: "hc_sent_fill_blank_mwen___diri", exercise, expected };
    },

    hc_sent_fill_blank_mwen___: ({ diff, id, topic }) => {
        const exercise: FillBlankChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "fill_blank_choice",
            title: "Fill the blank",
            prompt: "Choose the word that completes the sentence.",
            template: "Mwen ____.",
            choices: ["byen", "diri", "kote"],
            locale: "ht-HT",
            hint: `"Mwen byen." = I'm fine.`,
        };

        const expected = makeTextExpected(["byen"]);
        return { archetype: "hc_sent_fill_blank_mwen___", exercise, expected };
    },
};

export const HC_SENTENCES_TOPIC: TopicBundle = defineTopic(
    "hc_sentences",
    HC_SENTENCES_POOL as any,
    HC_SENTENCES_HANDLERS as any
);