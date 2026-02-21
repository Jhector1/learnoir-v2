// src/lib/practice/generator/engines/python/python_part1_mod0/topics/computer.ts
import type { Handler } from "../../python_shared/_shared";
import { makeSingleChoiceOut } from "../../python_shared/_shared";

// ✅ Source of truth: key + weight + kind
export const M0_COMPUTER_POOL = [
    { key: "m0_computer_ipo_order", w: 1, kind: "single_choice" },
    { key: "m0_computer_algorithm_definition", w: 1, kind: "single_choice" },
    { key: "m0_computer_input_examples", w: 1, kind: "single_choice" },
] as const;

// ✅ Derive keys from pool (for routing/validation)
export type M0ComputerKey = (typeof M0_COMPUTER_POOL)[number]["key"];
export const M0_COMPUTER_VALID_KEYS = M0_COMPUTER_POOL.map((p) => p.key) as M0ComputerKey[];

// ✅ Handlers keyed by derived key union
export const M0_COMPUTER_HANDLERS: Record<M0ComputerKey, Handler> = {
    m0_computer_ipo_order: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "m0_computer_ipo_order",
            id,
            topic,
            diff,
            title: "IPO cycle order",
            prompt: "Which order matches the basic computer cycle?",
            options: [
                { id: "a", text: "Output → Input → Processing" },
                { id: "b", text: "Input → Processing → Output" },
                { id: "c", text: "Processing → Output → Input" },
            ],
            answerOptionId: "b",
            hint: "First you give input, then it’s processed, then you see output.",
        }),

    m0_computer_algorithm_definition: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "m0_computer_algorithm_definition",
            id,
            topic,
            diff,
            title: "What is an algorithm?",
            prompt: "An **algorithm** is:",
            options: [
                { id: "a", text: "A step-by-step set of instructions to solve a task" },
                { id: "b", text: "A type of monitor" },
                { id: "c", text: "A programming mistake" },
            ],
            answerOptionId: "a",
            hint: "Algorithm = step-by-step instructions to complete a task.",
        }),

    m0_computer_input_examples: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "m0_computer_input_examples",
            id,
            topic,
            diff,
            title: "Input example",
            prompt: "Which is an example of **input** to a computer?",
            options: [
                { id: "a", text: "Typing on a keyboard" },
                { id: "b", text: "Text showing on your screen" },
                { id: "c", text: "Sound coming out of speakers" },
            ],
            answerOptionId: "a",
            hint: "Input = what you give the computer (keyboard, mouse, mic).",
        }),
};