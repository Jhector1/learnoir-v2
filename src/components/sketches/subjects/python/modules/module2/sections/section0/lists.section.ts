// src/components/sketches/subjects/python/modules/module0/sections/section0/lists.section.ts
import { SketchEntry } from "@/components/sketches/subjects";

export const PY_LISTS_SECTION: Record<string, SketchEntry> = {
    "py.lists.basics": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Lists: Your First Real Collection of Many Values",
            bodyMarkdown: String.raw`
So far, your variables usually hold **one** value:

~~~python
name = "Maya"
age = 16
~~~

But real programs rarely work with only one thing.

They deal with **collections**:

- many names
- many scores
- many items in a cart
- many temperatures across a week

That’s what a **list** is for.

Think of a list like a backpack:

- it holds multiple items
- you can add, remove, and check what’s inside
- you can pull out a specific item when you need it

---

## Creating a list

Lists use square brackets \`[ ... ]\`.

~~~python
colors = ["red", "blue", "green"]
scores = [90, 82, 76]
~~~

A list can hold strings, numbers, booleans—almost anything.

(You *can* mix types, but most of the time you keep lists consistent: all names, all scores, etc.)

---

## Indexing: grab one item

Lists use indexes starting at \`0\`, just like strings:

~~~python
colors = ["red", "blue", "green"]

print(colors[0])   # red
print(colors[1])   # blue
print(colors[-1])  # green (last item)
~~~

---

## Try it

~~~python
colors = ["red", "blue", "green", "yellow"]

print("first:", colors[0])
print("last:", colors[-1])
~~~

Change the list and run again.

---

## How many items? \`len(...)\`

\`len(list)\` tells you the number of items in the list.

~~~python
colors = ["red", "blue", "green"]
print(len(colors))  # 3
~~~

This becomes very important for totals, averages, and loops.

---

## Adding items: \`append()\`

\`append\` adds an item to the end of the list.

~~~python
tasks = []
tasks.append("study")
tasks.append("eat")
print(tasks)
~~~

---

## Removing items

### Remove by value: \`remove()\`

~~~python
tasks = ["study", "eat", "sleep"]
tasks.remove("eat")
print(tasks)
~~~

⚠️ If the value isn’t in the list, Python will raise an error.

---

### Remove by position: \`pop()\` (quick mention)

\`pop()\` removes an item by index (position).

~~~python
tasks = ["study", "eat", "sleep"]
tasks.pop(1)        # removes "eat"
print(tasks)
~~~

---

## Looping through a list (this is the big use)

Loops + lists is where programming starts to feel powerful.

~~~python
scores = [90, 82, 76]

for s in scores:
    print("score:", s)
~~~

---

## Mini-Project: Average Score

We combine:
- list + loop + math + output

~~~python
scores = [90, 82, 76, 100]
total = 0

for s in scores:
    total = total + s

avg = total / len(scores)
print("average =", avg)
~~~

Try changing the numbers.

---

## Lists + input: build your own list

~~~python
names = []

for i in range(3):
    n = input("Enter a name: ").strip()
    names.append(n)

print("names:", names)
~~~

Try changing \`3\` to \`5\` and run again.

---

## What you unlocked

Lists let you store **many values** and then:

- loop through them
- compute totals and averages
- build small datasets from user input

Next up: **Functions** — because once you repeat patterns (average, input loops, menus), you’ll want a reusable “machine.”
`.trim(),
        },
    },
};