// src/lib/practice/generator/engines/python/python_part1_mod0/topics/workspace.ts
import type { Handler } from "../../python_shared/_shared";
import { makeSingleChoiceOut } from "../../python_shared/_shared";

export const M0_WORKSPACE_POOL = [
    { key: "m0_workspace_run_button", w: 1, kind: "single_choice", purpose:"quiz" },
    { key: "m0_workspace_terminal_output", w: 1, kind: "single_choice", purpose:"quiz" },
    { key: "m0_workspace_editor_area", w: 1, kind: "single_choice", purpose:"quiz" },
] as const;

export type M0WorkspaceKey = (typeof M0_WORKSPACE_POOL)[number]["key"];
export const M0_WORKSPACE_VALID_KEYS = M0_WORKSPACE_POOL.map((p) => p.key) as M0WorkspaceKey[];

export const M0_WORKSPACE_HANDLERS: Record<M0WorkspaceKey, Handler> = {
    m0_workspace_run_button: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "m0_workspace_run_button",
            id,
            topic,
            diff,
            title: "Workspace: Run button",
            prompt: "What does the **Run** button do in your workspace?",
            options: [
                { id: "a", text: "Deletes your code so you can start over" },
                { id: "b", text: "Executes your code and shows results in the terminal" },
                { id: "c", text: "Only checks spelling and grammar" },
            ],
            answerOptionId: "b",
            hint: "Run executes code; output appears in the terminal.",
        }),

    m0_workspace_terminal_output: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "m0_workspace_terminal_output",
            id,
            topic,
            diff,
            title: "Workspace: Terminal output",
            prompt: "Where do **print() output** and **errors** usually appear?",
            options: [
                { id: "a", text: "In the module sidebar" },
                { id: "b", text: "In the terminal / console area" },
                { id: "c", text: "Inside your keyboard" },
            ],
            answerOptionId: "b",
            hint: "The terminal shows printed output and error messages.",
        }),

    m0_workspace_editor_area: ({ diff, id, topic }) =>
        makeSingleChoiceOut({
            archetype: "m0_workspace_editor_area",
            id,
            topic,
            diff,
            title: "Workspace: Code editor",
            prompt: "Where do you type Python code before running it?",
            options: [
                { id: "a", text: "In the code editor area" },
                { id: "b", text: "In the terminal output area" },
                { id: "c", text: "In the browser address bar" },
            ],
            answerOptionId: "a",
            hint: "You write code in the editor, then run it.",
        }),
};