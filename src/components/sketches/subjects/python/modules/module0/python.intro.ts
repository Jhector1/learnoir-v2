import {SketchEntry} from "../../.";

export const PY_INTRO_TOPICS: Record<string, SketchEntry> = {
    // ---------- SECTION I - Topic { print() complete } ----------

// ---------- SECTION I - Topic { print() complete + fun reading } ----------
    "py.programming.intro": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Programming Languages: Talking to Computers",
            bodyMarkdown: String.raw`
Just like humans communicate with each other using language, we also communicate with computers using programming languages. Computer scientists designed these languages so we can give instructions to a computer in a way it can understand.

There are many programming languages—such as Python, Java, and C—and each one has its own strengths. In this lesson, we’ll focus on Python, one of the most widely used programming languages in the world today.
`.trim(),
        },
    },

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

    "py.syntax.intro": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Syntax: The Rules of a Programming Language",
            bodyMarkdown: String.raw`
Every programming language has a set of rules for how instructions must be written. These rules are called syntax.

- Python has its own syntax
- Java has its own syntax
- C has its own syntax

If you break the syntax rules, Python will produce a **SyntaxError**, and your program will stop because the computer can’t understand what you wrote.

In this module, you’ll start getting comfortable with Python syntax, so you can write instructions clearly and confidently.

By the end of this module, you’ll be able to write small programs—like a basic calculator in Python.
`.trim(),
        },
    },

    "py.function.intro": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Functions in Python",
            bodyMarkdown: String.raw`

In this module, we’ll learn about functions in Python.

### What is a function?

A function is like a small machine:

- it can take input
- it can perform an action or computation
- it may produce output

Python includes:

- Built-in functions (already provided by Python)
- User-defined functions (functions you create yourself)

### Examples of built-in functions:

- **print()** → produces output by displaying text on the screen
- **input()** → gets input from the user

Python has many built-in functions, and we’ll learn the most important ones step-by-step—starting with input and output, because they are the foundation of most programs.
`.trim(),
        },
    },
}