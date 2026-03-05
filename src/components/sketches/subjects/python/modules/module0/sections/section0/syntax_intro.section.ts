import { SketchEntry } from "@/components/sketches/subjects";

export const PY_SYNTAX_SECTION: Record<string, SketchEntry> = {
    "py.syntax.intro": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Syntax: The Rules of a Programming Language",
            bodyMarkdown: String.raw`
Every programming language has a set of rules that determine **how instructions must be written**.  
These rules are called **syntax**.

Just like spoken languages have **grammar rules**, programming languages have **syntax rules** that define how code must be structured so the computer can understand it.

Each programming language has its own syntax:

- Python has its own syntax  
- Java has its own syntax  
- C has its own syntax  

Even though many languages share similar ideas, the **exact way you write instructions** can be different in each language.

If you break these syntax rules, Python will raise a **SyntaxError**, and the program will stop running because the **interpreter cannot understand the instruction**.

In this module, you will begin getting comfortable with Python syntax so you can write **clear and correct instructions** for the computer to execute.
      `.trim(),
        },
    },
};