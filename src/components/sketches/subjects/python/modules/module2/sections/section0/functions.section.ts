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

At some point you hit the same problem:

> “I keep rewriting the same steps.”

That’s the moment functions become useful.

A **function** is a small reusable machine:

- it can take **inputs**
- it performs a **job**
- it can produce an **output**

Once the machine exists, you can run it as many times as you want without rewriting the logic.

---

## The problem: repeated code (hard to maintain)

Here’s an example of code that repeats itself.

It works… but it’s not practical:

~~~python
# Calculate totals for 3 different customers

bill1 = float(input("Customer 1 bill: "))
tip1 = bill1 * 0.15
total1 = bill1 + tip1
print("Customer 1 total:", total1)

bill2 = float(input("Customer 2 bill: "))
tip2 = bill2 * 0.15
total2 = bill2 + tip2
print("Customer 2 total:", total2)

bill3 = float(input("Customer 3 bill: "))
tip3 = bill3 * 0.15
total3 = bill3 + tip3
print("Customer 3 total:", total3)
~~~

Why this is a problem:

- it’s long and repetitive
- if you want to change the tip rate, you must change it in multiple places
- repeated logic increases bugs (you might fix one spot and forget another)

---

## The solution: one function, used many times

Instead of repeating the same steps, build a reusable machine:

~~~python
def total_with_tip(bill, tip_rate):
    tip = bill * tip_rate
    return bill + tip
~~~

Now the main program becomes clean:

~~~python
bill1 = float(input("Customer 1 bill: "))
print("Customer 1 total:", total_with_tip(bill1, 0.15))

bill2 = float(input("Customer 2 bill: "))
print("Customer 2 total:", total_with_tip(bill2, 0.15))

bill3 = float(input("Customer 3 bill: "))
print("Customer 3 total:", total_with_tip(bill3, 0.15))
~~~

Now if you change the tip rule, you change it **once** inside the function.

---

## You already used functions (built-in)

You’ve already been calling functions this whole time:

- \`print(...)\` displays output
- \`input(...)\` asks the user a question
- \`type(...)\` reports a value’s type
- \`len(...)\` counts items in a list or string

These are **built-in functions** (Python gives them to you).

Now we’ll learn to write our own: **user-defined functions**.

---

## Defining a function

A function definition includes:

- the keyword \`def\`
- a function **name**
- parentheses \`( )\` for parameters
- a colon \`:\`
- an indented body (the steps the function runs)

~~~python
def greet():
    print("Hello!")
~~~

### Calling a function

To run the function, write its name followed by parentheses:

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

## Parameters vs. arguments (important)

This is a common confusion. Here’s the rule:

- **Parameters** are the names inside the function definition.
- **Arguments** are the real values you pass in when you call the function.

~~~python
def greet(name):        # name is a PARAMETER
    print(f"Hello, {name}!")

greet("Maya")           # "Maya" is an ARGUMENT
greet("Ayo")            # "Ayo" is an ARGUMENT
~~~

Parameters make your function flexible instead of hard-coded.

---

## Try it (use input as an argument)

~~~python
def greet(name):
    print(f"Hello, {name}!")

name = input("Name: ")
greet(name)
~~~

---

## Return values: output you can *use*

Sometimes you want a function to produce a value for the rest of your program.

- \`print()\` shows something to the user, but it does **not** give a usable value back.
- \`return\` sends a value back to the caller.

~~~python
def add(a, b):
    return a + b

result = add(10, 5)
print("result =", result)
~~~

When Python reaches \`return\`:

1) the function stops immediately  
2) the value is sent back to the line that called it  

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

## A practical refactor: tip calculator (full)

Here’s the same idea using tip percent (like a real checkout):

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

## Scope (light but important)

Variables created inside a function exist only inside that function.

~~~python
def demo():
    x = 10
    print("inside:", x)

demo()
~~~

That \`x\` does not exist outside the function.

For now, remember:

✅ What happens inside the function stays inside the function  
(unless you \`return\` something).

---

## What you unlocked

Functions help you:

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