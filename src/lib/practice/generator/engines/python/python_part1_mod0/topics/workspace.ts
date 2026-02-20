// src/lib/practice/generator/engines/python/python_part1_mod0/topics/workspace.ts
import type { SingleChoiceExercise } from "../../../../../types";
import type { Handler } from "../../python_shared/_shared";

export const M0_WORKSPACE_VALID_KEYS = [
    "m0_workspace_run_button",
    "m0_workspace_terminal_output",
    "m0_workspace_editor_area",
] as const;

export const M0_WORKSPACE_HANDLERS: Record<(typeof M0_WORKSPACE_VALID_KEYS)[number], Handler> = {
    m0_workspace_run_button: ({ diff, id, topic }) => {
        const exercise: SingleChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "single_choice",
            title: "Workspace: the Run button",
            prompt: "What does the **Run** button do in your workspace?",
            options: [
                { id: "a", text: "Deletes your code so you can start over" },
                { id: "b", text: "Executes your code and shows results in the terminal" },
                { id: "c", text: "Only checks spelling and grammar" },
            ],
            hint: "Run executes code; output appears in the terminal.",
        };
        return { archetype: "m0_workspace_run_button", exercise, expected: { kind: "single_choice", optionId: "b" } };
    },

    m0_workspace_terminal_output: ({ diff, id, topic }) => {
        const exercise: SingleChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "single_choice",
            title: "Workspace: terminal output",
            prompt: "Where do **print() output** and **errors** usually appear?",
            options: [
                { id: "a", text: "In the module sidebar" },
                { id: "b", text: "In the terminal / console area" },
                { id: "c", text: "Inside your keyboard" },
            ],
            hint: "The terminal shows printed output and error messages.",
        };
        return { archetype: "m0_workspace_terminal_output", exercise, expected: { kind: "single_choice", optionId: "b" } };
    },

    m0_workspace_editor_area: ({ diff, id, topic }) => {
        const exercise: SingleChoiceExercise = {
            id,
            topic,
            difficulty: diff,
            kind: "single_choice",
            title: "Workspace: code editor",
            prompt: "Where do you type Python code before running it?",
            options: [
                { id: "a", text: "In the code editor area" },
                { id: "b", text: "In the terminal output area" },
                { id: "c", text: "In the browser address bar" },
            ],
            hint: "You write code in the editor, then run it.",
        };
        return { archetype: "m0_workspace_editor_area", exercise, expected: { kind: "single_choice", optionId: "a" } };
    },
};
