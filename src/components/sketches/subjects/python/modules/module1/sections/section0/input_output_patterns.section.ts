import { SketchEntry } from "../../../../../index";

export const PY_INPUT_OUTPUT_PATTERNS_SECTION: Record<string, SketchEntry> = {
    "py.io.patterns": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Input + Output Patterns: From Answers to Real Mini-Programs",
            bodyMarkdown: String.raw`
So far you’ve learned the building blocks of Python:

- **Variables** store values.
- **Types** describe what those values are.
- **Operators + expressions** compute new results.
- **Strings** represent text (and \`input()\` returns strings).

Now we combine everything into the basic structure of a program.

Most beginner programs follow the same loop:

### Ask → Convert → Compute → Show

1. **Ask** the user for information  
2. **Convert** it into the correct type  
3. **Compute** something with it  
4. **Show** the result  

Once you understand this pattern, you can build many small programs.

---

## The “Ask” tool: \`input()\`

\`input()\` pauses the program and waits for the user to type something.

Example:

~~~python
name = input("What is your name? ")
print("Hello", name)
~~~

But there is one important rule:

> ✅ **\`input()\` always returns a string (\`str\`).**

Even if the user types a number.

---

## Try it (prove it)

Run this and type something like \`25\`.

~~~python
x = input("Type something: ")

print("You typed:", x)
print("type:", type(x))
~~~

Even when you type a number, Python still stores it as **text**.

---

## The “Convert” step: casting

If you want to do math, you must convert the text into a number.

Common conversions:

- \`int(...)\` → whole numbers
- \`float(...)\` → decimals

Example:

~~~python
age = int(input("Age: "))
print("Next year:", age + 1)
~~~

Now Python can perform arithmetic.

---

## Try it

~~~python
age = int(input("Age: "))
print(f"Next year you will be {age + 1}.")
~~~

Run it twice with different numbers.

---

## Quick warning: conversions can fail

If the user types something that is **not a number**, conversion fails.

~~~python
age = int("hello")  # 🚫 ValueError
~~~

Python is saying:

> “I tried to convert that text to a number, but it isn’t valid.”

For now, it’s enough to understand **why the error happens**.  
Later you’ll learn how to handle this safely.

---

## The “Show” step: clear output

You already saw **f-strings** in the strings lesson.

They are the cleanest way to display results.

~~~python
name = "Maya"
age = 16

print(f"Hi {name}, you are {age} years old.")
~~~

F-strings combine **text + variables** naturally.

---

## Pattern 1: Ask → Convert → Compute → Show

Let’s put the entire pattern together.

~~~python
value = float(input("Enter a number: "))
result = value * 2

print(f"Double is {result}")
~~~

The program does four things:

1️⃣ Ask for input  
2️⃣ Convert it to a number  
3️⃣ Compute a result  
4️⃣ Show the result  

---

## Try modifying the computation

Change the math and run again.

~~~python
value = float(input("Enter a number: "))

print("plus ten:", value + 10)
print("times three:", value * 3)
print("half:", value / 2)
~~~

Notice how the same input can produce different results.

---

## A tiny calculator

Here’s a small real program using the same pattern.

~~~python
a = float(input("First number: "))
b = float(input("Second number: "))

sum_result = a + b
print(f"The sum is {sum_result}")
~~~

You just built a **two-number calculator**.

---

## The key idea

Many beginner programs follow the same structure:

**Input → Process → Output**

or more concretely:

**Ask → Convert → Compute → Show**

Once this pattern feels natural, programming starts to feel much simpler.

---

## What comes next

Right now your programs always run the same instructions.

Next, we’ll unlock **conditionals**, so your program can decide:

> *“If this happens… do that instead.”*
`.trim(),
        },
    },
};