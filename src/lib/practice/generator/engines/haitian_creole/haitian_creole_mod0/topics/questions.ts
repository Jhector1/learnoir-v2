// src/lib/practice/generator/engines/haitian/haitian_creole_part1_mod0/topics/questions.ts
import type {
    SingleChoiceExercise,
    TextInputExercise,
    VoiceInputExercise,
    ListenBuildExercise,
    WordBankArrangeExercise,
    FillBlankChoiceExercise,
} from "../../../../../types";

import { makeTextExpected, makeVoiceExpected } from "../../_shared";
import {
    defineTopic,
    makeSingleChoiceOut,
    type Handler,
    type TopicBundle,
} from "@/lib/practice/generator/engines/utils";

export const HC_QUESTIONS_POOL = [
    { key: "hc_q_ki_kote_means_where_mcq", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "hc_q_translate_why_text", w: 1, kind: "text_input", purpose: "quiz" },
    { key: "hc_q_voice_say_kijan_ou_ye", w: 1, kind: "voice_input", purpose: "quiz" },

    // ✅ NEW kinds
    { key: "hc_q_listen_build_kijan_ou_ye", w: 1, kind: "listen_build", purpose: "quiz" },
    { key: "hc_q_wordbank_ki_kote", w: 1, kind: "word_bank_arrange", purpose: "quiz" },
    { key: "hc_q_fill_blank___ou_ye", w: 1, kind: "fill_blank_choice", purpose: "quiz" },
] as const;

export type HcQuestionsKey = (typeof HC_QUESTIONS_POOL)[number]["key"];

export const HC_QUESTIONS_HANDLERS: Record<HcQuestionsKey, Handler> = {
    hc_q_ki_kote_means_where_mcq: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "hc_q_ki_kote_means_where_mcq",
            id,
            topic,
            diff,
            title: "Question: Ki kote",
            prompt: `What does **Ki kote** mean?`,
            options: [
                { id: "a", text: "Who" },
                { id: "b", text: "Where" },
                { id: "c", text: "When" },
            ],
            answerOptionId: "b",
            hint: "**Ki kote** = where.",
        }),

    hc_q_translate_why_text: ({ diff, id, topic }) => {
        const exercise: TextInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "text_input",
            title: "Translate",
            prompt: `Translate to Haitian Creole: **why**`,
            placeholder: "Type in Kreyòl…",
            ui: "short",
            hint: `why = "poukisa"`,
        };

        const expected = makeTextExpected(["poukisa"]);
        return { archetype: "hc_q_translate_why_text", exercise, expected };
    },

    hc_q_voice_say_kijan_ou_ye: ({ diff, id, topic }) => {
        const exercise: VoiceInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "voice_input",
            title: "Say it",
            prompt: `Say this out loud: **Kijan ou ye?**`,
            targetText: "Kijan ou ye?",
            locale: "ht-HT",
            maxSeconds: 7,
            hint: "Say the whole phrase: **Kijan ou ye?**",
        };

        const expected = makeVoiceExpected(["kijan ou ye", "kijan ou ye?"], "includes");
        return { archetype: "hc_q_voice_say_kijan_ou_ye", exercise, expected };
    },

    // ✅ NEW: listen_build
    hc_q_listen_build_kijan_ou_ye: ({ diff, id, topic }) => {
        const exercise: ListenBuildExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "listen_build",
            title: "Listen & build",
            prompt: "Listen, then build the question.",
            targetText: "Kijan ou ye?",
            locale: "ht-HT",
            hint: `"Kijan ou ye?" = "How are you?"`,
            distractors: ["Ki kote", "Poukisa"],
        };

        const expected = makeTextExpected(["kijan ou ye", "kijan ou ye?"]);
        return { archetype: "hc_q_listen_build_kijan_ou_ye", exercise, expected };
    },

    // ✅ NEW: word_bank_arrange
    hc_q_wordbank_ki_kote: ({ diff, id, topic }) => {
        const exercise: WordBankArrangeExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "word_bank_arrange",
            title: "Build the question",
            prompt: `Build: **Ki kote?**`,
            targetText: "Ki kote?",
            locale: "ht-HT",
            hint: `"Ki kote?" means "Where?"`,
            distractors: ["Kijan", "Poukisa", "ou"],
        };

        const expected = makeTextExpected(["ki kote", "ki kote?"]);
        return { archetype: "hc_q_wordbank_ki_kote", exercise, expected };
    },

    // ✅ NEW: fill_blank_choice
    hc_q_fill_blank___ou_ye: ({ diff, id, topic }) => {
        const exercise: FillBlankChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "fill_blank_choice",
            title: "Fill the blank",
            prompt: "Choose the word that completes the question.",
            template: "____ ou ye?",
            choices: ["Kijan", "Ki kote", "Poukisa"],
            locale: "ht-HT",
            hint: `"Kijan" is "How".`,
        };

        const expected = makeTextExpected(["kijan"]);
        return { archetype: "hc_q_fill_blank___ou_ye", exercise, expected };
    },
};

export const HC_QUESTIONS_TOPIC: TopicBundle = defineTopic(
    "hc_questions",
    HC_QUESTIONS_POOL as any,
    HC_QUESTIONS_HANDLERS as any,
);