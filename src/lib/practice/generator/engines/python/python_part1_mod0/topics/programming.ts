import {defineTopic, Handler, makeSingleChoiceOut, TopicBundle} from "@/lib/practice/generator/engines/utils";
// import { defineTopic, makeSingleChoiceOut } from "../../_shared";

export const M0_PROGRAMMING_POOL = [
    { key: "m0_prog_language_definition", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "m0_prog_python_is_language", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "m0_prog_instructions_precise", w: 1, kind: "single_choice", purpose: "quiz" },
] as const;

export type M0ProgrammingKey = (typeof M0_PROGRAMMING_POOL)[number]["key"];

export const M0_PROGRAMMING_HANDLERS: Record<M0ProgrammingKey, Handler> = {
    m0_prog_language_definition: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "m0_prog_language_definition",
            id,
            topic,
            diff,
            title: "Programming language",
            prompt: "A **programming language** is best described as:",
            options: [
                { id: "a", text: "A way to give instructions to a computer" },
                { id: "b", text: "A type of internet browser" },
                { id: "c", text: "A folder on your desktop" },
            ],
            answerOptionId: "a",
            hint: "We use programming languages to give computers instructions.",
        }),

    m0_prog_python_is_language: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "m0_prog_python_is_language",
            id,
            topic,
            diff,
            title: "Python",
            prompt: "Python is a:",
            options: [
                { id: "a", text: "Programming language" },
                { id: "b", text: "Computer brand" },
                { id: "c", text: "Keyboard shortcut" },
            ],
            answerOptionId: "a",
            hint: "Python is a language used to write programs.",
        }),

    m0_prog_instructions_precise: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "m0_prog_instructions_precise",
            id,
            topic,
            diff,
            title: "Precision matters",
            prompt: "Computers usually need instructions that are:",
            options: [
                { id: "a", text: "Vague so they can guess what you mean" },
                { id: "b", text: "Clear and precise (step-by-step)" },
                { id: "c", text: "Written only in emojis" },
            ],
            answerOptionId: "b",
            hint: "Computers follow exact instructions.",
        }),
};

export const M0_PROGRAMMING_TOPIC: TopicBundle = defineTopic(
    "programming_intro",
    M0_PROGRAMMING_POOL as any,
    M0_PROGRAMMING_HANDLERS as any,
);