import {SketchEntry} from "@/components/sketches/subjects";

export const PY_SYNTAX_COMMENTS_SECTION: Record<string, SketchEntry> = {
    "py.syntax.comments": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Comments: Notes to Humans (Python Ignores Them)",
            bodyMarkdown: String.raw`
When you write code, you’re writing for **two audiences**:

1) The computer (Python)
2) Future you (and other humans)

A **comment** is a note for humans that Python completely ignores.

Think of comments like sticky notes on a recipe:
they help you remember *why* you did something, not just *what* you did.

---

## The comment symbol: \`#\`

Anything after \`#\` on a line is ignored by Python.

~~~python
# This is a comment.
print("Hello")  # This part is also a comment
~~~

---

## Why comments matter (Module 0 reasons)

Use comments to:
- explain what a line is doing
- label steps in a mini-program (ask → convert → compute → show)
- temporarily disable a line while debugging

---

## Try it (editor on the right)

Run this:

~~~python
# Step 1: store values in variables
price = 4.99
qty = 3

# Step 2: compute
total = price * qty

# Step 3: show output
print("total =", total)
~~~

Now **comment out** the line started with total and run again:

~~~python
price = 4.99
qty = 3

# total = price * qty

print("total =", total)
~~~

You should get an error — that’s expected.
It proves that comments truly “remove” code from execution.

---

## NB

✅ Write comments to explain **why** something exists.  
❌ Don’t write comments that just repeat the code.

Here is a way to write a proper comment:
~~~python
# Convert input (text) into a number so we can do math
age = int(input("Age: "))
~~~

This one is not useful, because it just repeat what the code does:
~~~python
# Set age to input
age = int(input("Age: "))
~~~

---

Next up: we’ll use comments to label our steps while learning **variables** and **data types**.
`.trim(),
        },
    },
};
