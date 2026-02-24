import {defineTopic, Handler, makeSingleChoiceOut, TopicBundle} from "@/lib/practice/generator/engines/utils";
// import { defineTopic, makeSingleChoiceOut } from "../../_shared";

export const M0_SYNTAX_POOL = [
    { key: "m0_syntax_definition", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "m0_syntax_syntaxerror", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "m0_syntax_indentation_rule", w: 1, kind: "single_choice", purpose: "quiz" },
] as const;

export type M0SyntaxKey = (typeof M0_SYNTAX_POOL)[number]["key"];

export const M0_SYNTAX_HANDLERS: Record<M0SyntaxKey, Handler> = {
    m0_syntax_definition: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "m0_syntax_definition",
            id,
            topic,
            diff,
            title: "Syntax meaning",
            prompt: "In programming, what does **syntax** mean?",
            options: [
                { id: "a", text: "The rules for how code must be written" },
                { id: "b", text: "The speed of your computer fan" },
                { id: "c", text: "A type of keyboard" },
            ],
            answerOptionId: "a",
            hint: "Syntax = writing rules the language requires.",
        }),

    m0_syntax_syntaxerror: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "m0_syntax_syntaxerror",
            id,
            topic,
            diff,
            title: "SyntaxError",
            prompt: "If you break Python’s syntax rules, you often get:",
            options: [
                { id: "a", text: "SyntaxError" },
                { id: "b", text: "WiFiError" },
                { id: "c", text: "KeyboardError" },
            ],
            answerOptionId: "a",
            hint: "SyntaxError means Python couldn’t understand your code structure.",
        }),

    m0_syntax_indentation_rule: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "m0_syntax_indentation_rule",
            id,
            topic,
            diff,
            title: "Indentation matters",
            prompt: "Why is indentation important in Python?",
            options: [
                { id: "a", text: "It makes the code run faster" },
                { id: "b", text: "Python uses it as part of its syntax (structure)" },
                { id: "c", text: "It changes your font size" },
            ],
            answerOptionId: "b",
            hint: "Indentation is part of Python’s structure, not just style.",
        }),
};

export const M0_SYNTAX_TOPIC: TopicBundle = defineTopic(
    "syntax_intro",
    M0_SYNTAX_POOL as any,
    M0_SYNTAX_HANDLERS as any,
);