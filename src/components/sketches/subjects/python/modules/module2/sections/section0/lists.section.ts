// src/components/sketches/subjects/python/modules/module0/sections/section0/lists.section.ts
// import { SketchEntry } from "../../../../.";

import {SketchEntry} from "@/components/sketches/subjects";

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

But real programs handle many values:

- many names
- many scores
- many items in a cart
- many temperatures in a week

That’s what a **list** is for.

Think of a list like a backpack:

You can put many items inside, and take them out later.

---

## Creating a list

~~~python
colors = ["red", "blue", "green"]
scores = [90, 82, 76]
~~~

A list can hold strings, numbers, booleans—anything.

---

## Indexing (like strings, but for items)

Lists use indexes starting at 0, just like strings did:

~~~python
colors = ["red", "blue", "green"]
print(colors[0])   # red
print(colors[-1])  # green
~~~

---

## Try it (editor on the right)

~~~python
colors = ["red", "blue", "green", "yellow"]
print("first:", colors[0])
print("last:", colors[-1])
~~~

Change the list items and run again.

---

## Adding items: append()

~~~python
tasks = []
tasks.append("study")
tasks.append("eat")
print(tasks)
~~~

---

## Removing items: remove()

~~~python
tasks = ["study", "eat", "sleep"]
tasks.remove("eat")
print(tasks)
~~~

(If the item isn’t there, Python will complain—so be careful.)

---

## Looping through a list (this is why loops matter)

~~~python
scores = [90, 82, 76]

for s in scores:
    print("score:", s)
~~~

---

## Mini-Project: Average Score

We combine everything:
- list + loop + math + print

~~~python
scores = [90, 82, 76, 100]
total = 0

for s in scores:
    total = total + s

avg = total / len(scores)
print("average =", avg)
~~~

Try changing the list numbers.

---

## Lists + input (build your own list)

~~~python
names = []

for i in range(3):
    n = input("Enter a name: ").strip()
    names.append(n)

print("names:", names)
~~~

---

## What you unlocked

Lists let you store **many values** and then:

- loop through them
- compute totals/averages
- build small datasets

Next up: **Functions** — because once you repeat patterns (like average, input loops, menus), you’ll want a clean reusable “machine.”
`.trim(),
        },
    },
};
