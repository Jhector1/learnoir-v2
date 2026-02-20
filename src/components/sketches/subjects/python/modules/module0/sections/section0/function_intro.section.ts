import {SketchEntry} from "@/components/sketches/subjects";

export const PY_FUNCTION_INTRO_SECTION: Record<string, SketchEntry> = {
    // ---------- SECTION I - Topic { print() complete } ----------

//
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