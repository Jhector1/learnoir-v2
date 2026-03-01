// src/components/sketches/subjects/python/modules/module0/sections/section0/functions.section.ts
import { SketchEntry } from "@/components/sketches/subjects";

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
- decisions (\`if\`)  
- repetition (loops)  
- collections (lists)

At some point, you usually hit this pain:

> “I keep writing the same logic again.”

That’s the signal you’re ready for **functions**.

A function is like a small machine:

- you **give it inputs**
- it **does a job**
- it can **give you an output**

You can run the same “machine” many times without rewriting the logic.

---

## You already used functions (built-in)

You already used built-in functions—functions that come with Python.

**Keep this in mind:** we talked about these already, and I promise we’ll go deeper into them later.  
For now, we’re learning the *magic of functions* by understanding how they work and how to make our own.

- \`print(...)\` shows output
- \`input(...)\` asks a question
- \`type(...)\` checks a type
- \`len(...)\` counts items

Yes—these are functions. They’re called **built-in functions** because Python provides them for you.  
There are many more built-in functions, but for now we’ll focus on building our own **user-defined functions**.

---

## Defining a function

A function definition has:

- the keyword \`def\`
- a **name**
- parentheses \`( )\` for parameters
- a colon \`: \`
- an indented body

~~~python
def greet():
    print("Hello!")
~~~

### Calling it

Calling (running) the function means writing its name with parentheses:

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

## Parameters vs. arguments (very important)

People mix these up at first—here’s the clean rule:

- **Parameters** are the *names* inside the function definition.
- **Arguments** are the *actual values* you pass in when calling the function.

Example:

~~~python
def greet(name):        # name is a PARAMETER
    print(f"Hello, {name}!")

greet("Maya")           # "Maya" is an ARGUMENT
greet("Ayo")            # "Ayo" is an ARGUMENT
~~~

### Why parameters matter
Parameters let your function become flexible instead of hard-coded.

---

## Try it (use input as an argument)

~~~python
def greet(name):
    print(f"Hello, {name}!")

name = input("Name: ")
greet(name)
~~~

---

## Return values (output you can *use*)

Sometimes you don’t want to **print** inside a function.

- \`print()\` shows something to the user, but it does **not** give a value back to your program.
- \`return\` sends a value back to the caller so you can store it, combine it, or use it in expressions.

~~~python
def add(a, b):
    return a + b

result = add(10, 5)
print("result =", result)
~~~

### What does \`return\` do?
When Python hits \`return\`:
1) it immediately ends the function  
2) it sends the returned value back to the line that called the function  

---

## Try it (use the returned result)

~~~python
def add(a, b):
    return a + b

x = float(input("x: "))
y = float(input("y: "))

print(f"x + y = {add(x, y)}")
~~~

---

## A practical refactor (tip calculator)

Earlier, you wrote tip math directly in your program.
Now we turn that logic into a reusable machine:

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

### Why this is better
- You can reuse \`total_with_tip\` anywhere (even in a bigger app).
- Your main program becomes easier to read.
- You can test the function by itself.

---

## Scope (very light, but crucial)

Variables created inside a function live **only** inside that function.

~~~python
def demo():
    x = 10
    print("inside:", x)

demo()
~~~

That \`x\` does not “leak out” to the rest of the program.

For Module 0, remember this simple rule:

✅ **What happens inside the function stays inside the function**  
(unless you \`return\` something).

---

## What you unlocked

Functions let you:

- avoid repeating code
- write cleaner programs
- break big problems into smaller steps
- build reusable tools you can call anytime

Next, you’ll start combining:
**lists + loops + conditionals + functions** into real mini-apps.
`.trim(),
        },
    },
};