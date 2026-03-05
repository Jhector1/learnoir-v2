// src/lib/practice/generator/engines/python/python_part1_mod0/topics/computer.ts

import {
    defineTopic,
    type Handler,
    type TopicBundle,
    makeSingleChoiceOut,
} from "@/lib/practice/generator/engines/utils";

export const M0_COMPUTER_POOL = [
    { key: "m0_computer_ipo_order", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "m0_computer_algorithm_definition", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "m0_computer_input_examples", w: 1, kind: "single_choice", purpose: "quiz" },
] as const;

export type M0ComputerKey = (typeof M0_COMPUTER_POOL)[number]["key"];

function Q(key: M0ComputerKey) {
    return `quiz.${key}`;
}

type OptId = "a" | "b" | "c";

function buildOptions(key: M0ComputerKey, ids: OptId[]) {
    return ids.map((id) => ({
        id,
        text: `@:${Q(key)}.options.${id}`,
    }));
}

function sc(
    key: M0ComputerKey,
    answerOptionId: OptId,
    optionIds: OptId[] = ["a", "b", "c"],
): Handler {
    return ({ diff, id, topic }: any) =>
        makeSingleChoiceOut({
            archetype: key,
            id,
            topic,
            diff,
            title: `@:${Q(key)}.title`,
            prompt: `@:${Q(key)}.prompt`,
            options: buildOptions(key, optionIds),
            answerOptionId,
            hint: `@:${Q(key)}.hint`,
        });
}

export const M0_COMPUTER_HANDLERS: Record<M0ComputerKey, Handler> = {
    m0_computer_ipo_order: sc("m0_computer_ipo_order", "b"),
    m0_computer_algorithm_definition: sc("m0_computer_algorithm_definition", "a"),
    m0_computer_input_examples: sc("m0_computer_input_examples", "a"),
};

export const M0_COMPUTER_TOPIC: TopicBundle = defineTopic(
    "computer_intro",
    M0_COMPUTER_POOL as any,
    M0_COMPUTER_HANDLERS as any,
);