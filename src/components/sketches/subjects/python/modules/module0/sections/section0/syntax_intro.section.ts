import { SketchEntry } from "@/components/sketches/subjects";

export const PY_SYNTAX_SECTION: Record<string, SketchEntry> = {
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
      `.trim(),
        },
    },
};