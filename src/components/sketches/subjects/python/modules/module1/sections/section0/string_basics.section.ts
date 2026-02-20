import { SketchEntry } from "../../../../../index";

export const PY_STRING_BASICS_SECTION: Record<string, SketchEntry> = {
    "py.strings.basics": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "String Basics: Working With Text Like a Pro",
            bodyMarkdown: String.raw`
You already learned how Python stores values:

- **Variables** are labeled boxes.
- **Data types** tell you what’s inside the box.
- **Operators + expressions** let you compute results.

Now we meet a type you’ll use constantly:

✅ **Strings** (\`str\`) — text.

A string is how Python stores things like:

- names
- messages
- emails
- passwords
- search words
- anything the user types with \`input()\`

In fact… remember this from earlier?

> ✅ \`input()\` always returns a string.

So understanding strings is like learning to read the language your program receives.

---

## What is a string?

A string is text inside quotes:

~~~python
name = "Maya"
city = 'Chicago'
~~~

Double or single quotes are both fine—just be consistent.

---

## The terminal display tool (print)

We’ve been using \`print(...)\` to show results in the terminal.

Now we’ll use it to display text nicely.

---

## Concatenation vs commas in print()

### Concatenation (string + string)
Concatenation means **joining text** with \`+\`.

~~~python
first = "Maya"
last = "Johnson"
full = first + " " + last
print(full)
~~~

That works, but you must be careful:

✅ \`+\` works only when both sides are strings.

If you try to join text with a number using \`+\`, Python complains:

~~~python
age = 16
print("age: " + age)  # 🚫 TypeError
~~~

To fix it, convert the number to a string:

~~~python
age = 16
print("age: " + str(age))
~~~

---

### Commas in print (easy and beginner-friendly)
When you use commas inside \`print\`, Python prints each piece with a space:

~~~python
age = 16
print("age:", age)
~~~

This is super beginner-friendly because it works with numbers too.

✅ If you just want to display values, commas are the easiest.

---

## Try it (editor on the right)

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

## f-strings: the cleanest way to mix text + variables

f-strings are the modern “best habit.”

They let you embed variables directly inside text using \`{ }\`.

~~~python
name = "Maya"
age = 16
print(f"Hi {name}, you are {age} years old.")
~~~

It reads like a real sentence.

---

## Try it (make it yours)

~~~python
name = "YourNameHere"
city = "YourCityHere"
print(f"Hi {name}! Welcome to {city}.")
~~~

Change the values and run again.

---

## Indexing: strings are sequences of characters

A string is like a row of letters.

Each character has a position (an index).

Indexes start at 0:

~~~python
word = "Python"
print(word[0])  # P
print(word[1])  # y
~~~

And Python has a neat trick:

\`-1\` means “last character”:

~~~python
word = "Python"
print(word[-1])  # n
print(word[-2])  # o
~~~

---

## Try it (peek inside the string)

~~~python
word = "Learnoir"
print("first:", word[0])
print("second:", word[1])
print("last:", word[-1])
print("second last:", word[-2])
~~~

Now change \`word\` to your name and run again.

---

## Slicing: grabbing a chunk of a string (light intro)

Slicing means “give me a piece.”

Format: \`text[start:end]\`  
- includes \`start\`
- stops before \`end\`

~~~python
word = "Python"
print(word[0:2])  # Py
print(word[2:6])  # thon
~~~

Shortcut rules:
- \`word[:2]\` means from the start to index 2
- \`word[2:]\` means from index 2 to the end

~~~python
word = "Python"
print(word[:2])  # Py
print(word[2:])  # thon
~~~

---

## Try it (slice your string)

~~~python
word = "Programming"
print(word[:4])
print(word[4:])
print(word[1:6])
~~~

---

## Common string methods (text tools)

Methods are built-in tools attached to a string value.

For now, treat them like “buttons” that transform text.

### 1) lower() — make everything lowercase
~~~python
msg = "HeLLo!"
print(msg.lower())  # hello!
~~~

### 2) strip() — remove extra spaces at the edges
~~~python
raw = "   hello   "
print(raw.strip())  # "hello"
~~~

### 3) replace() — swap one piece for another
~~~python
text = "I like cats"
print(text.replace("cats", "dogs"))
~~~

---

## Try it (clean up messy user input)

Remember: \`input()\` gives strings.
Users often type extra spaces or weird capitalization.

~~~python
name = input("Enter your name: ")
clean = name.strip().lower()

print("raw:", name)
print("clean:", clean)
print(f"Hello, {clean}!")
~~~

Try typing:
- \`   MAya   \`
and see how it becomes clean.

---

## A mini mission: polite username generator

~~~python
first = input("First name: ").strip()
last = input("Last name: ").strip()

username = (first[0] + last).lower()
print(f"username: {username}")
~~~

Try different names.
You just used:
- variables
- strings
- indexing
- methods
- f-strings
- print/output

---

## What you unlocked

Strings are how your program talks and listens.

Now you can:
- display messages cleanly
- mix variables into text
- grab letters and chunks
- clean user input

Next, we’ll combine strings + numbers + input into full mini-program patterns (like calculators).
`.trim(),
        },
    },
};
