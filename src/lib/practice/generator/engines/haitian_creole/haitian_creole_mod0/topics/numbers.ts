import type {
    SingleChoiceExercise,
    VoiceInputExercise,
    ListenBuildExercise,
    FillBlankChoiceExercise,
} from "../../../../../types";

import { defineTopic, type Handler, type TopicBundle, makeSingleChoiceOut } from "@/lib/practice/generator/engines/utils";
import { makeTextExpected, makeVoiceExpected } from "../../_shared";

export const HC_NUMBERS_POOL = [
    { key: "hc_num_10_is_dis_mcq", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "hc_num_kat_is_which_number_mcq", w: 1, kind: "single_choice", purpose: "quiz" },

    { key: "hc_num_fill_blank_2_equals", w: 1, kind: "fill_blank_choice", purpose: "quiz" },
    { key: "hc_num_fill_blank__equals_5", w: 1, kind: "fill_blank_choice", purpose: "quiz" },

    { key: "hc_num_listen_build_de", w: 1, kind: "listen_build", purpose: "quiz" },
    { key: "hc_num_voice_say_dis", w: 1, kind: "voice_input", purpose: "quiz" },
] as const;

export type HcNumbersKey = (typeof HC_NUMBERS_POOL)[number]["key"];

export const HC_NUMBERS_HANDLERS: Record<HcNumbersKey, Handler> = {
    hc_num_10_is_dis_mcq: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "hc_num_10_is_dis_mcq",
            id,
            topic,
            diff,
            title: "Number: 10",
            prompt: "Which Haitian Creole word means **10**?",
            options: [
                { id: "a", text: "senk" },
                { id: "b", text: "dis" },
                { id: "c", text: "kat" },
            ],
            answerOptionId: "b",
            hint: "10 = **dis**.",
        }),

    hc_num_kat_is_which_number_mcq: ({ diff, id, topic }) => {
        const exercise: SingleChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "single_choice",
            title: "kat",
            prompt: `**kat** is which number?`,
            options: [
                { id: "a", text: "2" },
                { id: "b", text: "4" },
                { id: "c", text: "10" },
            ],
            hint: "kat = 4",
        };
        return { archetype: "hc_num_kat_is_which_number_mcq", exercise, expected: { kind: "single_choice", optionId: "b" } };
    },

    hc_num_fill_blank_2_equals: ({ diff, id, topic }) => {
        const exercise: FillBlankChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "fill_blank_choice",
            title: "Fill the blank",
            prompt: "Choose the correct word.",
            template: "2 = ____",
            choices: ["de", "dis", "kat"],
            locale: "ht-HT",
            hint: "2 = de",
        };
        const expected = makeTextExpected(["de"]);
        return { archetype: "hc_num_fill_blank_2_equals", exercise, expected };
    },

    hc_num_fill_blank__equals_5: ({ diff, id, topic }) => {
        const exercise: FillBlankChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "fill_blank_choice",
            title: "Fill the blank",
            prompt: "Choose the correct word.",
            template: "____ = 5",
            choices: ["senk", "sis", "kat"],
            locale: "ht-HT",
            hint: "5 = senk",
        };
        const expected = makeTextExpected(["senk"]);
        return { archetype: "hc_num_fill_blank__equals_5", exercise, expected };
    },

    hc_num_listen_build_de: ({ diff, id, topic }) => {
        const exercise: ListenBuildExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "listen_build",
            title: "Listen & build",
            prompt: "Listen, then build the number word.",
            targetText: "de",
            locale: "ht-HT",
            hint: "2 = de",
            distractors: ["dis", "kat", "senk"],
        };
        const expected = makeTextExpected(["de"]);
        return { archetype: "hc_num_listen_build_de", exercise, expected };
    },

    hc_num_voice_say_dis: ({ diff, id, topic }) => {
        const exercise: VoiceInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "voice_input",
            title: "Say it",
            prompt: `Say this out loud: **dis** (10)`,
            targetText: "dis",
            locale: "ht-HT",
            maxSeconds: 6,
            hint: "Say it clearly: dis.",
        };

        const expected = makeVoiceExpected(["dis"], "includes");
        return { archetype: "hc_num_voice_say_dis", exercise, expected };
    },
};

export const HC_NUMBERS_TOPIC: TopicBundle = defineTopic(
    "hc_numbers",
    HC_NUMBERS_POOL as any,
    HC_NUMBERS_HANDLERS as any
);