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
Mistakes are a normal part of programming.

When Python raises an error, it’s giving you **information about what went wrong**.  
Learning to read errors is one of the fastest ways to improve.

Here are three common ones beginners encounter.

---

## 1) NameError — using a variable that doesn’t exist

~~~python
print(score)
~~~

If the variable \`score\` was never created, Python cannot use it.

Common causes:
- a typo: \`scroe\` instead of \`score\`
- using a variable before assigning a value

---

## Try it

Run this (it works):

~~~python
score = 10
print(score)
~~~

Now delete the line:

~~~python
score = 10
~~~

Run the code again.  
You should see a **NameError** because the variable no longer exists.

---

## 2) TypeError — incompatible types

Sometimes values exist, but they **cannot be combined the way you tried**.

~~~python
age = input("Age: ")   # string
print(age + 1)         # 🚫 string + int
~~~

The variable \`age\` contains **text**, not a number.

Fix it by converting the type:

~~~python
age = int(input("Age: "))
print(age + 1)
~~~

---

## 3) ValueError — invalid value for a conversion

~~~python
age = int("twelve")  # 🚫 ValueError
~~~

Python is trying to convert text into a number, but the text **does not represent a valid number**.

Valid examples:

~~~python
int("12")
float("3.5")
~~~

Invalid examples:

~~~python
int("twelve")
float("hello")
~~~

---

## A simple debugging technique

When something looks wrong, inspect the value and its type.

### Print the value
~~~python
print("value:", x)
~~~

### Print the type
~~~python
print("type:", type(x))
~~~

This quickly reveals many beginner mistakes.

---

## Quick mental model

- **NameError** → the variable doesn't exist  
- **TypeError** → the types don’t work together  
- **ValueError** → the value is not in the expected format  

Learning to interpret these messages will save you a lot of time while programming.
`.trim(),
        },
    },
};