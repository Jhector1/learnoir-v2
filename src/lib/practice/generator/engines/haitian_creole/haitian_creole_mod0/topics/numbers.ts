// src/lib/practice/generator/engines/haitian/haitian_creole_part1_mod0/topics/numbers.ts
import type {
    SingleChoiceExercise,
    TextInputExercise,
    VoiceInputExercise,
} from "../../../../../types";
// import {defineTopic, Handler, TopicBundle} from "@/lib/practice/generator/engines/utils";
import {

    makeTextExpected,
    makeVoiceExpected,
} from "../../_shared";
import {defineTopic, Handler, makeSingleChoiceOut, TopicBundle} from "@/lib/practice/generator/engines/utils";

export const HC_NUMBERS_POOL = [
    { key: "hc_num_10_is_dis_mcq", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "hc_num_translate_2_text", w: 1, kind: "text_input", purpose: "quiz" },
    { key: "hc_num_voice_say_de", w: 1, kind: "voice_input", purpose: "quiz" },
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

    hc_num_translate_2_text: ({ diff, id, topic }) => {
        const exercise: TextInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "text_input",
            title: "Translate",
            prompt: `Translate to Haitian Creole: **2**`,
            placeholder: "Type in Kreyòl…",
            ui: "short",
            hint: `2 = "de"`,
        };

        const expected = makeTextExpected(["de"]);
        return { archetype: "hc_num_translate_2_text", exercise, expected };
    },

    hc_num_voice_say_de: ({ diff, id, topic }) => {
        const exercise: VoiceInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "voice_input",
            title: "Say it",
            prompt: `Say this out loud: **de** (2)`,
            targetText: "de",
            locale: "ht-HT",
            maxSeconds: 6,
            hint: "Say it clearly: **de**.",
        };

        const expected = makeVoiceExpected(["de"], "includes");
        return { archetype: "hc_num_voice_say_de", exercise, expected };
    },
};

export const HC_NUMBERS_TOPIC: TopicBundle = defineTopic(
    "hc_numbers",
    HC_NUMBERS_POOL as any,
    HC_NUMBERS_HANDLERS as any,
);