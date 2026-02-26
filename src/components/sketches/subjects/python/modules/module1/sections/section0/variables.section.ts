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
Imagine you’re organizing your room.

You don’t want to hold everything in your hands, so you grab **boxes**.
But a box is only useful if you **label it**:

- **"snacks"**
- **"homework"**
- **"cables"**
- **"important stuff"**

In Python, a **variable** is that label.

✅ A variable is a **name** that points to a **value**.

---

## The “show it on the terminal screen” tool

You’ll see \`print(...)\` used a lot, and you might be wondering what it does.

For now, don’t worry about the official definition. Just treat \`print(...)\` like a **screen display**:

> Whatever you put inside \`print(...)\` will show up in the terminal output when you run the code.

(We’ll explain these “tools with parentheses” later.)

---

## The moment a variable is created

In Python, a variable exists the instant you assign a value:

~~~python
age = 16
name = "Maya"
~~~

Read it like this:

- Put **16** in a box labeled **age**
- Put **"Maya"** in a box labeled **name**

Python uses \`=\` to **assign** a value to a variable.
In math, \`=\` usually means “is equal to,” but in programming (here) it means **assignment**.

(When you want to compare values for equality in Python, you use \`==\`.)

---

## Try it (editor on the right)

Copy this into the editor on the **right**, then run it and watch the terminal output:

~~~python
age = 16
name = "Maya"
print("age =", age)
print("name =", name)
~~~

Now change the values (try a different name and age) and run again.

---

## Variables can change (that’s the whole point)

~~~python
score = 10
score = score + 5
print(score)  # 15
~~~

That second line means:

> “Take what’s inside \`score\`, add 5, and store it back into \`score\`.”

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

Change the \`+5\` and \`-2\` to other numbers and run again.

---

## Variable names (label rules)

✅ Allowed:
- letters, numbers, underscores
- can’t start with a number

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

A variable is not the value itself.

It’s a **name tag** so you can reuse the value easily:

~~~python
price = 4.99
tax = 0.10
total = price + (price * tax)
print(total)
~~~

Without variables, you’d repeat numbers everywhere.
With variables, your code becomes clearer, easier to change, and easier to read.
`.trim(),
        },
    },
};