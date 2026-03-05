import { SketchEntry } from "../../../../../index";

export const PY_STRING_BASICS_SECTION: Record<string, SketchEntry> = {
    "py.strings.basics": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "String Basics: Working With Text Like a Pro",
            bodyMarkdown: String.raw`
You already learned how Python stores and uses values:

- **Variables** are labeled boxes.
- **Data types** tell you what kind of value is inside the box.
- **Operators + expressions** let you compute results.

Now we meet a type you’ll use constantly:

✅ **Strings** (\`str\`) — text.

Strings store things like:

- names  
- messages  
- emails  
- passwords  
- search terms  
- anything the user types using \`input()\`

In fact, remember this rule:

> ✅ \`input()\` always returns a **string**.

So understanding strings means understanding how your program reads and displays text.

---

## What is a string?

A string is simply **text inside quotes**.

~~~python
name = "Maya"
city = 'Chicago'
~~~

Single quotes and double quotes both work.  
Just pick one style and stay consistent.

---

## Showing text with print()

We’ve been using \`print(...)\` to show results in the terminal.

Now we’ll use it to display text and variables together.

---

## Concatenation vs commas in print()

### Concatenation (string + string)

Concatenation means **joining strings together** using \`+\`.

~~~python
first = "Maya"
last = "Johnson"

full = first + " " + last
print(full)
~~~

This works well, but there’s one rule:

✅ Both sides of \`+\` must be **strings**.

If you try to join text and numbers directly, Python raises an error.

~~~python
age = 16
print("age: " + age)  # 🚫 TypeError
~~~

Fix it by converting the number to a string:

~~~python
age = 16
print("age: " + str(age))
~~~

---

### Commas in print (simpler)

When you use commas inside \`print\`, Python prints each value separated by a space.

~~~python
age = 16
print("age:", age)
~~~

This is often the easiest way to display mixed values.

---

## Try it

~~~python
name = "Maya"
age = 16

print("Hello " + name)
print("Hello", name)

print("age: " + str(age))
print("age:", age)
~~~

Run it and compare the outputs.

---

## f-strings: the cleanest way to mix text and variables

Modern Python usually uses **f-strings**.

They allow you to insert variables directly inside text.

~~~python
name = "Maya"
age = 16

print(f"Hi {name}, you are {age} years old.")
~~~

It reads almost like a normal sentence.

---

## Try it

~~~python
name = "YourNameHere"
city = "YourCityHere"

print(f"Hi {name}! Welcome to {city}.")
~~~

Change the values and run it again.

---

## Indexing: strings are sequences of characters

A string is like a row of characters.

Each character has a position called an **index**.

Indexes start at **0**:

~~~python
word = "Python"

print(word[0])  # P
print(word[1])  # y
~~~

Python also supports negative indexes.

\`-1\` means **the last character**:

~~~python
word = "Python"

print(word[-1])  # n
print(word[-2])  # o
~~~

---

## Try it

~~~python
word = "Learnoir"

print("first:", word[0])
print("second:", word[1])
print("last:", word[-1])
print("second last:", word[-2])
~~~

Now change \`word\` to your own name and run it again.

---

## Slicing: taking a piece of a string

Slicing lets you extract part of a string.

Format: \`text[start:end]\`

- includes \`start\`
- stops before \`end\`

~~~python
word = "Python"

print(word[0:2])  # Py
print(word[2:6])  # thon
~~~

Shortcuts:

~~~python
word = "Python"

print(word[:2])  # Py
print(word[2:])  # thon
~~~

---

## Try it

~~~python
word = "Programming"

print(word[:4])
print(word[4:])
print(word[1:6])
~~~

---

## Common string methods

Methods are built-in tools attached to strings.

Think of them as **small text utilities**.

### lower() — convert to lowercase

~~~python
msg = "HeLLo!"
print(msg.lower())
~~~

### strip() — remove extra spaces

~~~python
raw = "   hello   "
print(raw.strip())
~~~

### replace() — substitute text

~~~python
text = "I like cats"
print(text.replace("cats", "dogs"))
~~~

---

## Try it: clean user input

User input is often messy.

~~~python
name = input("Enter your name: ")

clean = name.strip().lower()

print("raw:", name)
print("clean:", clean)
print(f"Hello, {clean}!")
~~~

Try typing:

\`   MAya   \`

Notice how the cleaned version changes.

---

## Mini exercise: simple username generator

~~~python
first = input("First name: ").strip()
last = input("Last name: ").strip()

username = (first[0] + last).lower()

print(f"username: {username}")
~~~

You just used:

- variables  
- strings  
- indexing  
- methods  
- f-strings  
- terminal output

---

## What you unlocked

Strings are how programs **communicate**.

Now you can:

- display messages clearly
- combine text with variables
- access characters inside text
- extract pieces of a string
- clean user input

Next, we’ll combine **strings + numbers + input** to build small interactive programs.
`.trim(),
        },
    },
};