export const PY_COMPUTER_INTRO_TOPICS =      {
    id: "computer_intro",
    label: "The Input → Processing → Output Model",
    minutes: 8,
    summary:
        "Understand how computers take input, process it, and produce output in everyday examples.",
    cards: [
        {
            type: "sketch",
            id: "computer_intro_s0",
            title: "Input → Processing → Output",
            sketchId: "py.computer.ipo",
            height: 520,
        },
        {
            type: "sketch",
            id: "computer_intro_s1",
            title: "How Computers Follow Instructions",
            sketchId: "py.computer.instructions",
            height: 520,
        },
    ],
} as const;