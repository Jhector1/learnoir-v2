// src/lib/practice/generator/engines/haitian/haitian_creole_part1_mod0/topics/greetings.ts
import type {
    SingleChoiceExercise,
    TextInputExercise,
    VoiceInputExercise,
    ListenBuildExercise,
    WordBankArrangeExercise,
} from "../../../../../types";

import { makeTextExpected, makeVoiceExpected } from "../../_shared";
import { defineTopic, type Handler, type TopicBundle } from "@/lib/practice/generator/engines/utils";

export const HC_GREETINGS_POOL = [
    { key: "hc_greet_bonjou_mcq", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "hc_translate_good_evening_text", w: 1, kind: "text_input", purpose: "quiz" },
    { key: "hc_voice_say_bonjou", w: 1, kind: "voice_input", purpose: "quiz" },

    // ✅ NEW
    { key: "hc_greet_listen_build_bonswa", w: 1, kind: "listen_build", purpose: "quiz" },
    { key: "hc_greet_wordbank_bonjou", w: 1, kind: "word_bank_arrange", purpose: "quiz" },
] as const;

export type HcGreetingsKey = (typeof HC_GREETINGS_POOL)[number]["key"];

export const HC_GREETINGS_HANDLERS: Record<HcGreetingsKey, Handler> = {
    hc_greet_bonjou_mcq: ({ diff, id, topic }) => {
        const exercise: SingleChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "single_choice",
            title: "Bonjou",
            prompt: `What does **Bonjou** mean?`,
            options: [
                { id: "a", text: "Goodbye" },
                { id: "b", text: "Hello / Good morning" },
                { id: "c", text: "Thank you" },
            ],
            hint: "Bonjou is a common greeting in the morning/daytime.",
        };

        return {
            archetype: "hc_greet_bonjou_mcq",
            exercise,
            expected: { kind: "single_choice", optionId: "b" },
        };
    },

    hc_translate_good_evening_text: ({ diff, id, topic }) => {
        const exercise: TextInputExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "text_input",
            title: "Translate",
            prompt: `Translate to Haitian Creole: **Good evening**`,
            placeholder: `Type in Kreyòl...`,
            ui: "short",
            hint: `Common answer: "Bonswa"`,
        };

        const expected = makeTextExpected(["bonswa", "bon swa"]);
        return { archetype: "hc_translate_good_evening_text", exercise, expected };
    },

    hc_voice_say_bonjou: ({ diff, id, topic }) => {
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
        return { archetype: "hc_voice_say_bonjou", exercise, expected };
    },

    // ✅ NEW: listen_build
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
            distractors: ["Bonjou", "Mwen"],
        };

        const expected = makeTextExpected(["bonswa", "bonswa."]);
        return { archetype: "hc_greet_listen_build_bonswa", exercise, expected };
    },

    // ✅ NEW: word_bank_arrange
    hc_greet_wordbank_bonjou: ({ diff, id, topic }) => {
        const exercise: WordBankArrangeExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "word_bank_arrange",
            title: "Build the greeting",
            prompt: `Build: **Bonjou.**`,
            targetText: "Bonjou.",
            locale: "ht-HT",
            hint: `Tap tiles to form: "Bonjou."`,
            distractors: ["Bonswa", "byen"],
        };

        const expected = makeTextExpected(["bonjou", "bonjou."]);
        return { archetype: "hc_greet_wordbank_bonjou", exercise, expected };
    },
};

export const HC_GREETINGS_TOPIC: TopicBundle = defineTopic(
    "hc_greetings",
    HC_GREETINGS_POOL as any,
    HC_GREETINGS_HANDLERS as any,
);