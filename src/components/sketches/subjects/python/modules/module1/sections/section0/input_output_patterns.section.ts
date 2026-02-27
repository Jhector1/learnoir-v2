import { SketchEntry } from "../../../../../index";

export const PY_INPUT_OUTPUT_PATTERNS_SECTION: Record<string, SketchEntry> = {
    "py.io.patterns": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Input + Output Patterns: From Answers to Real Mini-Programs",
            bodyMarkdown: String.raw`
So far, you’ve learned the building blocks:

- **Variables** are labeled boxes.
- **Types** tell you what’s in the box.
- **Operators + expressions** let you compute results.
- **Strings** let you work with text (and \`input()\` gives strings).

Now we combine everything into one simple loop of reality:

**Ask → Convert → Compute → Show**

That’s the heart of most beginner programs.

---

## The “Ask” tool: input()

When you use \`input("...")\`, Python pauses and waits for the user to type.

But here’s the rule that changes everything:

✅ **\`input()\` always returns a string (\`str\`). Always.**

Even if the user types a number.

---

## Try it (prove it)

Run this and type a number like \`25\`:

~~~python
x = input("Type something: ")
print("You typed:", x)
print("type:", type(x))
~~~

It’s still \`str\`.

---

## The “Convert” step: casting

If you want math, you must convert text into numbers:

- \`int(...)\` for whole numbers
- \`float(...)\` for decimals

### Example: converting age to int

~~~python
age = int(input("Age: "))
print("Next year:", age + 1)
~~~

---

## Try it (change what you type)

~~~python
age = int(input("Age: "))
print(f"Next year you will be {age + 1}.")
~~~

Run it twice with different ages.

---

## Quick warning: conversion can fail

If the user types \`hello\` when you expect a number:

~~~python
age = int("hello")  # 🚫 ValueError
~~~

That means:
> “I can’t turn that text into a number.”

For Module 0, it’s enough to understand why it happens.
Later, you’ll learn how to handle it safely with loops and checks.

---

## The “Show” step: clean output (f-strings)

You already met f-strings in the strings lesson.

They’re perfect for output because they mix text + variables naturally:

~~~python
name = "Maya"
age = 16
print(f"Hi {name}, you are {age} years old.")
~~~

---

## Pattern 1: Ask → Convert → Compute → Show

Here’s the most important pattern in this lesson:

~~~python
value = float(input("Enter a number: "))
result = value * 2
print(f"Double is {result}")
~~~

Try changing the math to \`value + 10\` or \`value / 3\`.

---



This is the real beginner foundation.

Next, we’ll add **conditionals** so your programs can make decisions:
**“if this happens… do that.”**
`.trim(),
        },
    },
};
