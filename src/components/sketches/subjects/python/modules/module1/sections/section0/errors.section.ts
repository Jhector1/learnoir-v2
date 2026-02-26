// src/components/sketches/subjects/python/modules/module1/sketches/errors.section.ts
import { SketchEntry } from "@/components/sketches/subjects";

export const PY_MOD1_ERRORS_SKETCHES: Record<string, SketchEntry> = {
    "py.types.errors": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Common Errors: NameError, TypeError, and Debug Tricks",
            bodyMarkdown: String.raw`
Let’s turn mistakes into skills.

When Python shows an error, it’s not “mad.”
It’s telling you exactly what it couldn’t do.

Here are the big three you’ll see early on.

---

## 1) NameError — “That label doesn’t exist”

~~~python
print(score)
~~~

If you never created \`score\`, Python can’t guess what it is.

Common causes:
- a typo: \`scroe\` vs \`score\`
- using a variable before you assign it

---

## Try it (safe version first)

Run this (it works):

~~~python
score = 10
print(score)
~~~

Now delete the \`score = 10\` line and run again.
You should see **NameError**.

---

## 2) TypeError — “Those types don’t mix”

~~~python
age = input("Age: ")   # string
print(age + 1)         # 🚫 string + int
~~~

Fix:

~~~python
age = int(input("Age: "))
print(age + 1)
~~~

---

## 3) ValueError — “That text isn’t a valid number”

~~~python
age = int("twelve")  # 🚫 ValueError
~~~

Python is saying:
> “I tried to convert it to a number, but that text doesn’t represent a number.”

✅ You can only convert strings that *look like numbers* (like \`"12"\`, \`"3.5"\`) into numeric types.

---

## The best beginner debug combo

### 1) Print the value
~~~python
print("value:", x)
~~~

### 2) Print the type
~~~python
print("type:", type(x))
~~~

If something feels weird, it’s often a type mismatch.

---

## A quick story to remember them

- **NameError**: you used a label that was never created.
- **TypeError**: you tried to combine things that don’t fit together.
- **ValueError**: the value exists, but it’s not in the format you promised.

If you can read errors calmly, you’ll improve fast.
`.trim(),
        },
    },
};