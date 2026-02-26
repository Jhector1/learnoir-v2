import type {
    SingleChoiceExercise,
    VoiceInputExercise,
    ListenBuildExercise,
    FillBlankChoiceExercise,
    DragReorderExercise,
} from "../../../../../types";

import { defineTopic, type Handler, type TopicBundle, makeSingleChoiceOut } from "@/lib/practice/generator/engines/utils";
import { makeTextExpected, makeVoiceExpected, makeDragExpected } from "../../_shared";

export const HC_GREETINGS_POOL = [
    { key: "hc_greet_bonjou_mcq", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "hc_greet_when_bonswa_mcq", w: 1, kind: "single_choice", purpose: "quiz" },

    { key: "hc_greet_fill_blank_bon____", w: 1, kind: "fill_blank_choice", purpose: "quiz" },
    { key: "hc_greet_listen_build_bonswa", w: 1, kind: "listen_build", purpose: "quiz" },

    { key: "hc_greet_reorder_bonjou_mwen_byen", w: 1, kind: "drag_reorder", purpose: "quiz" },
    { key: "hc_greet_voice_say_bonjou", w: 1, kind: "voice_input", purpose: "quiz" },
] as const;

export type HcGreetingsKey = (typeof HC_GREETINGS_POOL)[number]["key"];

export const HC_GREETINGS_HANDLERS: Record<HcGreetingsKey, Handler> = {
    hc_greet_bonjou_mcq: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "hc_greet_bonjou_mcq",
            id,
            topic,
            diff,
            title: "Bonjou",
            prompt: `What does **Bonjou** mean?`,
            options: [
                { id: "a", text: "Goodbye" },
                { id: "b", text: "Hello / Good morning" },
                { id: "c", text: "Thank you" },
            ],
            answerOptionId: "b",
            hint: "Bonjou is a common greeting in the morning/daytime.",
        }),

    hc_greet_when_bonswa_mcq: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "hc_greet_when_bonswa_mcq",
            id,
            topic,
            diff,
            title: "Bonswa",
            prompt: `Which greeting is best for the **evening**?`,
            options: [
                { id: "a", text: "Bonjou" },
                { id: "b", text: "Bonswa" },
                { id: "c", text: "Mwen" },
            ],
            answerOptionId: "b",
            hint: "Bonswa = Good evening.",
        }),

    hc_greet_fill_blank_bon____: ({ diff, id, topic }) => {
        const exercise: FillBlankChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "fill_blank_choice",
            title: "Fill the blank",
            prompt: "Complete the greeting.",
            template: "Bon____",
            choices: ["jou", "swa", "yen"],
            locale: "ht-HT",
            hint: `"Bonjou" = hello / good morning.`,
        };

        const expected = makeTextExpected(["jou"]);
        return { archetype: "hc_greet_fill_blank_bon____", exercise, expected };
    },

    hc_greet_listen_build_bonswa: ({ diff, id, topic }) => {
        const exercise: ListenBuildExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "listen_build",
            title: "Listen & build",
            prompt: `Listen, then build the greeting.`,
            targetText: "Bonswa.",
            locale: "ht-HT",
            hint: `"Bonswa" = good evening.`,
            distractors: ["Bonjou", "Mwen", "byen"],
        };

        const expected = makeTextExpected(["bonswa", "bonswa."]);
        return { archetype: "hc_greet_listen_build_bonswa", exercise, expected };
    },

    hc_greet_reorder_bonjou_mwen_byen: ({ rng, diff, id, topic }) => {
        const tokens = [
            { id: "t1", text: "Bonjou," },
            { id: "t2", text: "mwen" },
            { id: "t3", text: "byen." },
        ];

        const exercise: DragReorderExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "drag_reorder",
            title: "Word order",
            prompt: `Rearrange to form: **Hello, I'm fine.**`,
            tokens: rng.shuffle(tokens as any) as any,
            hint: `Pattern: "Bonjou, mwen byen."`,
        };

        const expected = makeDragExpected(["t1", "t2", "t3"]);
        return { archetype: "hc_greet_reorder_bonjou_mwen_byen", exercise, expected };
    },

    hc_greet_voice_say_bonjou: ({ diff, id, topic }) => {
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
        return { archetype: "hc_greet_voice_say_bonjou", exercise, expected };
    },
};

export const HC_GREETINGS_TOPIC: TopicBundle = defineTopic(
    "hc_greetings",
    HC_GREETINGS_POOL as any,
    HC_GREETINGS_HANDLERS as any
);