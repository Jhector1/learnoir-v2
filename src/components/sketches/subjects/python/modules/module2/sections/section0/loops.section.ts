// src/components/sketches/subjects/python/modules/module0/sections/section0/loops.section.ts
import { SketchEntry } from "@/components/sketches/subjects";

export const PY_LOOPS_SECTION: Record<string, SketchEntry> = {
    "py.loops.basics": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Loops: Teaching Your Program to Repeat",
            bodyMarkdown: String.raw`
You can now make decisions using \`if / elif / else\`.

Next question:

What if you want to do something **more than once**?

That’s what **loops** are for.

Think of a loop like a video game level:

- you try
- if you fail, the game says: “Try again.”
- you repeat until you succeed (or quit)

A loop is simply: **repeat a block of code**.

---

## \`while\`: repeat while a condition is True

\`while\` means:

> “Keep repeating this block as long as the condition stays True.”

~~~python
count = 1

while count <= 3:
    print("count =", count)
    count = count + 1
~~~

Key idea: if you never change \`count\`, the loop may never stop.

---

## Try it (watch it count)

~~~python
count = 1

while count <= 5:
    print("count =", count)
    count = count + 1
~~~

Change \`5\` to \`10\` and run again.

---

## Loops are perfect for “keep asking until valid”

Remember: \`input()\` returns a string, and users can type anything.

Think of your program like a bouncer:

> “I need a number from 1 to 10. If it’s not valid, I’ll ask again.”

~~~python
n = int(input("Enter a number 1..10: "))

while n < 1 or n > 10:
    print("⛔ Invalid. Try again.")
    n = int(input("Enter a number 1..10: "))

print("✅ Thanks! You entered:", n)
~~~

---

## \`break\` and \`continue\`

Sometimes you want more control over a loop.

### \`break\` = exit the loop immediately

~~~python
while True:
    cmd = input("Type 'quit' to stop: ")
    if cmd == "quit":
        break
    print("You typed:", cmd)
~~~

Here, \`while True\` means “repeat forever” until \`break\` stops it.

---

### \`continue\` = skip to the next loop step

~~~python
count = 0

while count < 5:
    count = count + 1

    if count == 3:
        continue  # skip printing 3

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

Try a few wrong guesses, then type \`7\`.

---

## \`for\`: repeat a specific number of times

Use a \`for\` loop when you already know how many steps you want.

~~~python
for i in range(5):
    print("i =", i)
~~~

\`range(5)\` produces 5 values: \`0, 1, 2, 3, 4\`

---

## Try it: sum of numbers

~~~python
total = 0

for i in range(1, 6):
    total = total + i

print("sum 1..5 =", total)
~~~

Change the range to sum \`1..100\`:

- keep the start as \`1\`
- change the end to \`101\` (because the end is not included)

---

## Mini-Project 2: Menu Loop

Think of your program like a tiny kiosk that keeps running until the user chooses “Quit.”

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

- repeat actions automatically
- keep asking until input is valid
- run menus, games, and interactive programs

Next up: **Lists** — because most programs don’t store just one value… they store many.
`.trim(),
        },
    },
};