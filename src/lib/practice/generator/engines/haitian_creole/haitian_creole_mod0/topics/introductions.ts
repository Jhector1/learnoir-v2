import type { DragReorderExercise } from "../../../../../types";
import {defineTopic, Handler, TopicBundle} from "@/lib/practice/generator/engines/utils";
import {  makeDragExpected, pickName } from "../../_shared";

export const HC_INTRO_POOL = [
    { key: "hc_reorder_mwen_rele", w: 1, kind: "drag_reorder", purpose: "quiz" },
] as const;

export type HcIntroKey = (typeof HC_INTRO_POOL)[number]["key"];

export const HC_INTRO_HANDLERS: Record<HcIntroKey, Handler> = {
    hc_reorder_mwen_rele: ({ rng, diff, id, topic }) => {
        const name = pickName(rng);

        const tokens = [
            { id: "t1", text: "Mwen" },
            { id: "t2", text: "rele" },
            { id: "t3", text: name },
        ];

        const exercise: DragReorderExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "drag_reorder",
            title: "Word order",
            prompt: `Rearrange the words to make the sentence: **My name is ${name}.**`,
            tokens: rng.shuffle(tokens as any) as any,
            hint: `Pattern: "Mwen rele <Name>"`,
        };

        const expected = makeDragExpected(["t1", "t2", "t3"]);
        return { archetype: "hc_reorder_mwen_rele", exercise, expected };
    },
};

export const HC_INTRO_TOPIC: TopicBundle = defineTopic(
    "hc_introductions",
    HC_INTRO_POOL as any,
    HC_INTRO_HANDLERS as any,
);