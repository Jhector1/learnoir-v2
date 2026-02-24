// src/lib/practice/generator/engines/haitian/haitian_creole_part1_mod0/topics/pronouns.ts
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

export const HC_PRONOUNS_POOL = [
    { key: "hc_pro_mwen_means_i_mcq", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "hc_pro_translate_you_text", w: 1, kind: "text_input", purpose: "quiz" },
    { key: "hc_pro_voice_say_mwen", w: 1, kind: "voice_input", purpose: "quiz" },
] as const;

export type HcPronounsKey = (typeof HC_PRONOUNS_POOL)[number]["key"];

export const HC_PRONOUNS_HANDLERS: Record<HcPronounsKey, Handler> = {
    hc_pro_mwen_means_i_mcq: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "hc_pro_mwen_means_i_mcq",
            id,
            topic,
            diff,
            title: "Pronoun: mwen",
            prompt: "What does **mwen** mean?",
            options: [
                { id: "a", text: "I / me" },
                { id: "b", text: "you" },
                { id: "c", text: "they / them" },
            ],
            answerOptionId: "a",
            hint: "**mwen** = I / me.",
        }),

    hc_pro_translate_you_text: ({ diff, id, topic }) => {
        const exercise: TextInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "text_input",
            title: "Translate",
            prompt: `Translate to Haitian Creole: **you**`,
            placeholder: "Type in Kreyòl…",
            ui: "short",
            hint: `you = "ou"`,
        };

        const expected = makeTextExpected(["ou"]);
        return { archetype: "hc_pro_translate_you_text", exercise, expected };
    },

    hc_pro_voice_say_mwen: ({ diff, id, topic }) => {
        const exercise: VoiceInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "voice_input",
            title: "Say it",
            prompt: `Say this out loud: **mwen**`,
            targetText: "mwen",
            locale: "ht-HT",
            maxSeconds: 6,
            hint: "Say it clearly: **mwen**.",
        };

        const expected = makeVoiceExpected(["mwen"], "includes");
        return { archetype: "hc_pro_voice_say_mwen", exercise, expected };
    },
};

export const HC_PRONOUNS_TOPIC: TopicBundle = defineTopic(
    "hc_pronouns",
    HC_PRONOUNS_POOL as any,
    HC_PRONOUNS_HANDLERS as any,
);