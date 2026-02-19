// src/components/sketches/subjects/python/modules/module0/sections/section0/conditionals.section.ts
// import { SketchEntry } from "../../../../../specTypes";

import {SketchEntry} from "@/components/sketches/subjects";

export const PY_CONDITIONALS_SECTION: Record<string, SketchEntry> = {
    "py.cond.basics": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Conditionals: Teaching Your Program to Make Decisions",
            bodyMarkdown: String.raw`
So far you can:

- store values in **variables**
- understand **types**
- compute using **operators + expressions**
- work with **strings**
- build mini-programs with **input → convert → compute → show**

Now we add something that makes programs feel *alive*:

✅ **Decision making**

Think of your program like a security guard at a door.

The guard asks questions:

- “Are you on the list?”
- “Are you old enough?”
- “Do you have the right password?”

And based on the answer, the guard chooses what happens next.

That’s exactly what conditionals do.

---

## The \`if\` statement

\`if\` means:

> “Only run this block if the condition is True.”

~~~python
age = 16

if age >= 18:
    print("Access granted.")
~~~

If the condition is False, nothing inside runs.

---

## \`if\` / \`else\`

Now your program can choose between two paths:

~~~python
age = 16

if age >= 18:
    print("Access granted.")
else:
    print("Access denied.")
~~~

---

## Try it (editor on the right)

~~~python
age = int(input("Age: "))

if age >= 18:
    print("✅ You can enter.")
else:
    print("⛔ Not yet.")
~~~

Run it twice:
- once with 18+
- once with a smaller number

---

## \`elif\` (multiple choices)

Sometimes you need more than two doors.

\`elif\` means “else if”:

~~~python
score = 82

if score >= 90:
    print("A")
elif score >= 80:
    print("B")
elif score >= 70:
    print("C")
else:
    print("Needs improvement")
~~~

---

## Real Example 1: Grade Checker

~~~python
score = int(input("Score (0-100): "))

if score >= 90:
    print("Grade: A")
elif score >= 80:
    print("Grade: B")
elif score >= 70:
    print("Grade: C")
elif score >= 60:
    print("Grade: D")
else:
    print("Grade: F")
~~~

---

## Boolean logic: \`and\` / \`or\` / \`not\`

Conditions can be combined.

### \`and\` (both must be True)
~~~python
age = 20
has_id = True

if age >= 18 and has_id:
    print("✅ Allowed")
else:
    print("⛔ Not allowed")
~~~

### \`or\` (at least one True)
~~~python
is_member = False
has_coupon = True

if is_member or has_coupon:
    print("Discount applied!")
~~~

### \`not\` (flip True/False)
~~~python
is_banned = False

if not is_banned:
    print("Welcome!")
~~~

---

## Real Example 2: Login Check

Story: your program is the guard checking the password.

~~~python
password = input("Password: ")

if password == "letmein":
    print("✅ Logged in")
else:
    print("⛔ Wrong password")
~~~

Try:
- \`letmein\`
- anything else

---

## Truthy / Falsey (simple version)

Python treats some values like “False” even if they aren’t literally \`False\`.

Common falsey values:
- \`False\`
- \`0\`
- \`""\` (empty string)
- \`None\`

Example:

~~~python
name = input("Name (press enter to skip): ")

if name:
    print(f"Hello, {name}!")
else:
    print("Hello, stranger!")
~~~

If the user presses Enter (empty string), it goes to the \`else\`.

---

## Real Example 3: Shipping Rules

~~~python
total = float(input("Cart total: "))

if total >= 50:
    print("✅ Free shipping!")
else:
    print("Shipping cost: $6.99")
~~~

---

## What you unlocked

Conditionals let your program:

- **decide**
- **branch**
- respond differently to different inputs

Next up: **Loops** — so your program can repeat actions (and keep asking until the input is valid).
`.trim(),
        },
    },
};
