import {SketchEntry} from "@/components/sketches/subjects";

export const PY_COMPUTER_INTRO_SECTION: Record<string, SketchEntry> = {
    // ---------- SECTION I - Topic { print() complete } ----------
    "py.computer.ipo": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Input, Processing, Output",
            bodyMarkdown: String.raw`

At a very basic level, computers do three main things:

- **Input**
- **Processing**
- **Output**

### For example

When you type in a Word document, your keyboard is an input device.

The computer processes what you typed.

Then it displays the text on your screen, which is an output device.

### Another example is a microphone

Your voice is the input.

The computer processes it.

Then produces an output, like text on the screen or audio through speakers.

So anytime you interact with a computer, you’re usually participating in this cycle:

**Input → Processing → Output**
`.trim(),
        },
    },

    "py.computer.instructions": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "How Do Computers Follow Instructions?",
            bodyMarkdown: String.raw`

Unlike humans, computers cannot “guess” what you mean (at least not in the basic, traditional programming sense). A computer only does what you tell it—exactly.

That’s why programming requires instructions that are:

- clear
- step-by-step
- precise

A step-by-step set of instructions is called an algorithm.

### Algorithm (simple definition)

An algorithm is a sequence of steps that tells a computer how to complete a task.

But even if your steps make sense to a human, the computer still needs them written in a strict format.
`.trim(),
        },
    },




}