// src/components/sketches/subjects/python/modules/module1/sketches/variables.section.ts
import { SketchEntry } from "@/components/sketches/subjects";

export const PY_MOD1_VARIABLES_SKETCHES: Record<string, SketchEntry> = {
    "py.vars.boxes": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Variables: Labeled Boxes for Your Data",
            bodyMarkdown: String.raw`
Imagine your computer's memory as a **huge storage room**.

Inside that room, the computer keeps many pieces of information:

- numbers  
- text  
- results of calculations  

But if everything were thrown into the room without organization, it would be impossible to find anything.

So we use **labeled boxes**.

Each box holds a piece of data, and the **label tells us what’s inside**.

For example, you might have boxes labeled:

- **snacks**
- **homework**
- **cables**
- **important_stuff**

Now, instead of searching the whole room, you can just look for the **label**.

In Python, a **variable** is exactly that label.

✅ A variable is a **name that refers to a value stored in memory**.

---

## The “show it on the terminal screen” tool

You’ll see \`print(...)\` used a lot, and you might be wondering what it does.

For now, think of \`print(...)\` as a **display tool**.

> Whatever you put inside \`print(...)\` will appear in the **terminal output** when the program runs.

We’ll talk more about these **tools with parentheses** (called functions) later.

---

## The moment a variable is created

In Python, a variable is created the moment you assign a value to it.

~~~python
age = 16
name = "Maya"
~~~

Read this like a story:

- Put **16** in a box labeled **age**
- Put **"Maya"** in a box labeled **name**

Python uses the symbol \`=\` for **assignment**.

In mathematics, \`=\` means **is equal to**.  
In programming, it means:

> “Store this value inside this variable.”

*(When we want to compare values later, we use \`==\`. We'll learn that soon.)*

---

## Try it (editor on the right)

Copy this code into the editor on the **right**, then run it and watch the terminal output:

~~~python
age = 16
name = "Maya"

print("age =", age)
print("name =", name)
~~~

Now change the values (try a different name and age) and run it again.

---

## Variables can change (that’s the whole point)

Variables are useful because the value inside the box can **change**.

~~~python
score = 10
score = score + 5
print(score)  # 15
~~~

That second line means:

> Take the value inside **score**, add 5, and store the new result back into **score**.

The label stays the same — but the **value inside the box changes**.

---

## Try it (watch the change)

~~~python
score = 10
print("start:", score)

score = score + 5
print("after +5:", score)

score = score - 2
print("after -2:", score)
~~~

Change the \`+5\` and \`-2\` to other numbers and run the code again.

Watch how the value keeps updating.

---

## Variable names (label rules)

Because variables are **labels**, they must follow some rules.

✅ Allowed:
- letters
- numbers
- underscores

❗ But they **cannot start with a number**.

❌ Not allowed:
- spaces
- symbols like \`$\` or \`@\`
- Python keywords like \`class\`, \`for\`, \`if\`

Examples:

~~~python
student_name = "Ayo"   # good (snake_case is common in Python)
studentName = "Ayo"    # also valid
2cool = "nope"         # invalid (starts with a number)
~~~

---

## Quick mental model

A variable is **not the value itself**.

It is a **name tag** that lets you reuse and organize your data.

~~~python
price = 4.99
tax = 0.10
total = price + (price * tax)

print(total)
~~~

Without variables, you would repeat numbers everywhere.

With variables, your programs become:

- easier to read
- easier to change
- easier to understand
`.trim(),
        },
    },
};