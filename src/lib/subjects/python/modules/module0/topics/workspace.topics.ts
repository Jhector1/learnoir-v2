export const PY_WORKSPACE_TOPICS = {
    id: "editor_workspace_overview",
    label: "Understanding the editor, Run button, and terminal",
    minutes: 8,
    summary:
        "A quick tour of the workspace, then a short hands-on exercise to run code and verify output in the terminal.",
    cards: [
        {
            type: "sketch",
            id: "workspaces_s0",
            title: "Workspace overview",
            sketchId: "py.workspace.intro",
            height: 520,
        },
        {
            type: "sketch",
            id: "workspaces_s1",
            title: "Run your first edits",
            sketchId: "py.workspace.instructions.intro",
            height: 520,
        },
    ],
} as const;