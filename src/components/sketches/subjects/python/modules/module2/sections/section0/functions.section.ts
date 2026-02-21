// src/components/sketches/subjects/python/modules/module0/sections/section0/functions.section.ts
// import { SketchEntry } from "../../../../.";

import {SketchEntry} from "@/components/sketches/subjects";

export const PY_FUNCTIONS_SECTION: Record<string, SketchEntry> = {
    "py.func.basics": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Functions: Small Machines You Can Reuse",
            bodyMarkdown: String.raw`
You’ve been building bigger and bigger programs:

- variables + types
- expressions
- strings + clean output
- input patterns
- decisions (if)
- repetition (loops)
- collections (lists)

Now you’ve probably felt this pain:

> “I keep writing the same logic again.”

That’s the signal you’re ready for functions.

Think of a **function** like a small machine:

- you feed it inputs
- it does a job
- it gives you an output

You already used built-in machines:

- \`print(...)\` shows output
- \`input(...)\` asks a question
- \`type(...)\` checks a type
- \`len(...)\` counts items

Now you’ll build your own.

---

## Defining a function

~~~python
def greet():
    print("Hello!")
~~~

Calling it:

~~~python
greet()
greet()
~~~

---

## Try it

~~~python
def greet():
    print("Hello!")

greet()
greet()
~~~

---

## Parameters: sending information into the machine

~~~python
def greet(name):
    print(f"Hello, {name}!")
~~~

~~~python
greet("Maya")
greet("Ayo")
~~~

---

## Try it

~~~python
def greet(name):
    print(f"Hello, {name}!")

name = input("Name: ")
greet(name)
~~~

---

## Return values: getting a result back

Sometimes you don’t want to *print* inside the function.
You want the function to *return* a value so you can use it in expressions.

~~~python
def add(a, b):
    return a + b

result = add(10, 5)
print("result =", result)
~~~

---

## Try it (use the result)

~~~python
def add(a, b):
    return a + b

x = float(input("x: "))
y = float(input("y: "))

print(f"x + y = {add(x, y)}")
~~~

---

## Refactor a previous pattern (tip calculator)

Earlier, you wrote tip math directly.
Now we turn it into a reusable machine:

~~~python
def total_with_tip(bill, tip_percent):
    tip = bill * (tip_percent / 100)
    return bill + tip
~~~

Use it:

~~~python
bill = float(input("Bill: "))
tip_percent = float(input("Tip %: "))
total = total_with_tip(bill, tip_percent)
print(f"Total = {total}")
~~~

---

## Scope (very light)

Variables inside a function live inside that function.

~~~python
def demo():
    x = 10
    print("inside:", x)

demo()
~~~

That \`x\` does not “leak out” to the rest of the program.

For Module 0, remember this simple rule:

✅ **What happens inside the function stays inside the function**  
(unless you return something).

---

## What you unlocked

Functions let you:

- avoid repeating code
- write cleaner programs
- build your own reusable tools

After this, you’re ready for bigger projects—because now you can combine:
**lists + loops + conditionals + functions** into real apps.
`.trim(),
        },
    },
};
