// src/components/sketches/subjects/python/modules/module0/sections/section0/loops.section.ts
// import { SketchEntry } from "../../../../.";

import {SketchEntry} from "@/components/sketches/subjects";

export const PY_LOOPS_SECTION: Record<string, SketchEntry> = {
    "py.loops.basics": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Loops: Teaching Your Program to Repeat",
            bodyMarkdown: String.raw`
You can now make decisions using \`if/elif/else\`.

Next question:

What if you want to do something **again** and **again**?

That’s what loops are for.

Think of a loop like a video game level:

- You try.
- If you fail, the game says: “Try again.”
- You keep going until you win.

---

## \`while\` loop (repeat while a condition is True)

\`while\` means:

> “Keep repeating this block as long as the condition stays True.”

~~~python
count = 1
while count <= 3:
    print("count =", count)
    count = count + 1
~~~

---

## Try it (watch it count)

~~~python
count = 1
while count <= 5:
    print("count =", count)
    count = count + 1
~~~

Change 5 to 10 and run again.

---

## Why \`while\` is perfect for “keep asking until valid”

Remember: \`input()\` gives strings, and users can type anything.

Story: your program is a bouncer:

> “I need a number from 1 to 10. If you don’t give me that, I’ll ask again.”

~~~python
n = int(input("Enter a number 1..10: "))

while n < 1 or n > 10:
    print("⛔ Invalid. Try again.")
    n = int(input("Enter a number 1..10: "))

print("✅ Thanks! You entered:", n)
~~~

---

## \`break\` and \`continue\`

### \`break\` = exit the loop immediately
~~~python
while True:
    cmd = input("Type 'quit' to stop: ")
    if cmd == "quit":
        break
    print("You typed:", cmd)
~~~

### \`continue\` = skip to the next loop step
~~~python
count = 0
while count < 5:
    count = count + 1
    if count == 3:
        continue
    print("count =", count)
~~~

---

## Mini-Project 1: Guessing Game

~~~python
secret = 7
guess = int(input("Guess the number: "))

while guess != secret:
    print("Nope. Try again.")
    guess = int(input("Guess the number: "))

print("✅ You got it!")
~~~

Try:
- wrong guesses
- then 7

---

## \`for\` loop (repeat a certain number of times)

Use \`for\` when you already know how many steps you want.

~~~python
for i in range(5):
    print("i =", i)
~~~

\`range(5)\` produces: 0, 1, 2, 3, 4

---

## Try it (sum of numbers)

~~~python
total = 0
for i in range(1, 6):
    total = total + i

print("sum 1..5 =", total)
~~~

Change it to sum 1..100 by changing the range.

---

## Mini-Project 2: Menu Loop

Story: your program is a tiny kiosk.

~~~python
while True:
    print("1) Say hello")
    print("2) Add two numbers")
    print("3) Quit")
    choice = input("Choose: ")

    if choice == "1":
        name = input("Name: ")
        print(f"Hello, {name}!")
    elif choice == "2":
        a = float(input("a: "))
        b = float(input("b: "))
        print(f"a + b = {a + b}")
    elif choice == "3":
        print("Bye!")
        break
    else:
        print("Invalid option.")
~~~

---

## What you unlocked

Loops let your program:

- repeat actions
- keep asking until input is valid
- run menus and games

Next up: **Lists** — because most programs don’t store one value… they store many.
`.trim(),
        },
    },
};

