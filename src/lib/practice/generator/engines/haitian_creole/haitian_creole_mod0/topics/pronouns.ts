import type {
    SingleChoiceExercise,
    VoiceInputExercise,
    ListenBuildExercise,
    FillBlankChoiceExercise,
    DragReorderExercise,
} from "../../../../../types";

import { defineTopic, type Handler, type TopicBundle, makeSingleChoiceOut } from "@/lib/practice/generator/engines/utils";
import { makeTextExpected, makeVoiceExpected, makeDragExpected, pickName } from "../../_shared";

export const HC_PRONOUNS_POOL = [
    { key: "hc_pro_mwen_means_i_mcq", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "hc_pro_ou_means_you_mcq", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "hc_pro_li_means_he_she_it_mcq", w: 1, kind: "single_choice", purpose: "quiz" },

    { key: "hc_pro_reorder_mwen_se_name", w: 1, kind: "drag_reorder", purpose: "quiz" },
    { key: "hc_pro_fill_blank___byen", w: 1, kind: "fill_blank_choice", purpose: "quiz" },
    { key: "hc_pro_voice_say_ou", w: 1, kind: "voice_input", purpose: "quiz" },

    // extra swap option:
    // { key: "hc_pro_listen_build_mwen", w: 1, kind: "listen_build", purpose: "quiz" },
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

    hc_pro_ou_means_you_mcq: ({ diff, id, topic }) => {
        const exercise: SingleChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "single_choice",
            title: "Pronoun: ou",
            prompt: "What does **ou** mean?",
            options: [
                { id: "a", text: "you" },
                { id: "b", text: "I / me" },
                { id: "c", text: "he / she / it" },
            ],
            hint: "**ou** = you.",
        };
        return { archetype: "hc_pro_ou_means_you_mcq", exercise, expected: { kind: "single_choice", optionId: "a" } };
    },

    hc_pro_li_means_he_she_it_mcq: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "hc_pro_li_means_he_she_it_mcq",
            id,
            topic,
            diff,
            title: "Pronoun: li",
            prompt: "What does **li** mean most often?",
            options: [
                { id: "a", text: "we" },
                { id: "b", text: "he / she / it" },
                { id: "c", text: "you" },
            ],
            answerOptionId: "b",
            hint: "**li** is used for he / she / it (context decides).",
        }),

    hc_pro_reorder_mwen_se_name: ({ rng, diff, id, topic }) => {
        const name = pickName(rng);
        const tokens = [
            { id: "t1", text: "Mwen" },
            { id: "t2", text: "se" },
            { id: "t3", text: `${name}.` },
        ];

        const exercise: DragReorderExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "drag_reorder",
            title: "Word order",
            prompt: `Rearrange to say: **I am ${name}.**`,
            tokens: rng.shuffle(tokens as any) as any,
            hint: `Another pattern: "Mwen se <Name>."`,
        };

        const expected = makeDragExpected(["t1", "t2", "t3"]);
        return { archetype: "hc_pro_reorder_mwen_se_name", exercise, expected };
    },

    hc_pro_fill_blank___byen: ({ diff, id, topic }) => {
        const exercise: FillBlankChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "fill_blank_choice",
            title: "Fill the blank",
            prompt: "Choose the best pronoun.",
            template: "____ byen.",
            choices: ["Mwen", "Ou", "Li"],
            locale: "ht-HT",
            hint: `"Mwen byen." = I'm fine.`,
        };

        const expected = makeTextExpected(["mwen"]);
        return { archetype: "hc_pro_fill_blank___byen", exercise, expected };
    },

    hc_pro_voice_say_ou: ({ diff, id, topic }) => {
        const exercise: VoiceInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "voice_input",
            title: "Say it",
            prompt: `Say this out loud: **ou**`,
            targetText: "ou",
            locale: "ht-HT",
            maxSeconds: 6,
            hint: "Say it clearly: ou.",
        };

        const expected = makeVoiceExpected(["ou"], "includes");
        return { archetype: "hc_pro_voice_say_ou", exercise, expected };
    },
};

export const HC_PRONOUNS_TOPIC: TopicBundle = defineTopic(
    "hc_pronouns",
    HC_PRONOUNS_POOL as any,
    HC_PRONOUNS_HANDLERS as any
);