import { PracticeKind } from "@prisma/client";
import type { TopicDefCompat } from "../_types";
import { HC_MOD0, HC_PREFIX0 } from "./constants";

export const HC_TOPICS = {
  [HC_MOD0]: [
    {
      id: "greetings",
      meta: {
        label: "Greetings: bonjou, bonswa, kijan ou ye",
        minutes: 10,
        pool: [
          { key: "greet_bonjou_when", w: 4, kind: PracticeKind.single_choice },
          { key: "greet_bonswa_when", w: 4, kind: PracticeKind.single_choice },
          { key: "greet_kijan_reply", w: 4, kind: PracticeKind.single_choice },
          { key: "greet_salutations_mix", w: 2, kind: PracticeKind.multi_choice },
        ],
      },
    },

    {
      id: "pronouns",
      meta: {
        label: "Pronouns: mwen, ou, li, nou, yo",
        minutes: 12,
        pool: [
          { key: "pro_mwen_meaning", w: 4, kind: PracticeKind.single_choice },
          { key: "pro_ou_meaning", w: 4, kind: PracticeKind.single_choice },
          { key: "pro_li_meaning", w: 4, kind: PracticeKind.single_choice },
          { key: "pro_nou_yo", w: 3, kind: PracticeKind.single_choice },
          { key: "pro_match_set", w: 2, kind: PracticeKind.multi_choice },
        ],
      },
    },

    {
      id: "simple_sentences",
      meta: {
        label: "Simple sentences: ‘Mwen se…’, ‘Mwen renmen…’",
        minutes: 14,
        pool: [
          { key: "sent_mwen_se", w: 4, kind: PracticeKind.single_choice },
          { key: "sent_mwen_renmen", w: 4, kind: PracticeKind.single_choice },
          { key: "sent_word_order", w: 3, kind: PracticeKind.single_choice },
          { key: "sent_fill_blank", w: 3, kind: PracticeKind.multi_choice },
        ],
      },
    },

    {
      id: "numbers",
      meta: {
        label: "Numbers: 1–20 + basic counting",
        minutes: 10,
        pool: [
          { key: "num_1_10_match", w: 4, kind: PracticeKind.single_choice },
          { key: "num_11_20_match", w: 4, kind: PracticeKind.single_choice },
          { key: "num_listen_style", w: 2, kind: PracticeKind.multi_choice },
        ],
      },
    },

    {
      id: "everyday_phrases",
      meta: {
        label: "Everyday phrases: mèsi, tanpri, eskize m",
        minutes: 12,
        pool: [
          { key: "phrase_mesi", w: 4, kind: PracticeKind.single_choice },
          { key: "phrase_tanpri", w: 4, kind: PracticeKind.single_choice },
          { key: "phrase_eskize", w: 4, kind: PracticeKind.single_choice },
          { key: "phrase_when_use", w: 2, kind: PracticeKind.multi_choice },
        ],
      },
    },

    {
      id: "foundations",
      variant: null, // ✅ mixed
      meta: {
        label: "Haitian Creole foundations (mixed)",
        minutes: 0,
        pool: [
          { key: "greet_bonjou_when", w: 2, kind: PracticeKind.single_choice },
          { key: "pro_mwen_meaning", w: 2, kind: PracticeKind.single_choice },
          { key: "sent_mwen_se", w: 2, kind: PracticeKind.single_choice },
          { key: "num_1_10_match", w: 2, kind: PracticeKind.single_choice },
          { key: "phrase_mesi", w: 2, kind: PracticeKind.single_choice },
          { key: "greet_salutations_mix", w: 1, kind: PracticeKind.multi_choice },
          { key: "sent_fill_blank", w: 1, kind: PracticeKind.multi_choice },
        ],
      },
    },
  ],
} satisfies Record<string, TopicDefCompat[]>;
