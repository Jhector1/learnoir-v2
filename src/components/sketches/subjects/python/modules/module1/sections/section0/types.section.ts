// src/components/sketches/subjects/python/modules/module1/sketches/types.section.ts
import { SketchEntry } from "@/components/sketches/subjects";

export const PY_MOD1_TYPES_SKETCHES: Record<string, SketchEntry> = {
    "py.types.basic": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Data Types: What’s Inside the Box?",
            bodyMarkdown: String.raw`
So you have labeled boxes (variables). Now a key question:

**What kind of thing is inside the box?**

Python calls this idea a **data type**.

---

## The 5 types you’ll use constantly

(There are more than five, but these show up everywhere.)

### 1) Integers (\`int\`) — whole numbers
~~~python
students = 28
~~~

### 2) Floats (\`float\`) — decimals
~~~python
price = 3.75
~~~

### 3) Strings (\`str\`) — text
~~~python
message = "Welcome!"
~~~

### 4) Booleans (\`bool\`) — True/False
~~~python
is_logged_in = True
~~~

### 5) None (\`NoneType\`) — “empty on purpose”
~~~python
nickname = None
~~~

\`None\` means:
> “There is no value here yet.”

---

## Try it (scan the boxes)

Paste this code into the editor on the **right** and run it:

~~~python
students = 28
price = 3.75
message = "Welcome!"
is_logged_in = True
nickname = None

print("students:", students, "type:", type(students))
print("price:", price, "type:", type(price))
print("message:", message, "type:", type(message))
print("is_logged_in:", is_logged_in, "type:", type(is_logged_in))
print("nickname:", nickname, "type:", type(nickname))
~~~

---

## Why types matter

In Python:
- numbers add like math
- strings “add” by joining text (concatenation)
- mixing incompatible types can cause errors

Numbers add like math:

~~~python
a = 10
b = 5
print(a + b)  # 15
~~~

Text joins together:

~~~python
a = "10"
b = "5"
print(a + b)  # "105"
~~~

That’s not math — it’s **string concatenation** (joining text with \`+\`).

---

## Try it (predict first)

Before you run this, guess the output:

~~~python
print(10 + 5)
print("10" + "5")
print("hi" + " there")
~~~

Then run it and check your guesses.
`.trim(),
        },
    },

    "py.types.convert": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Type Conversion: Turning Strings into Numbers",
            bodyMarkdown: String.raw`
Here’s a classic beginner surprise.

---

## Heads-up: \`input(...)\` asks the user a question

\`input("...")\` asks the user for input.

For now, treat it like a **question box**:
Python asks, and the user types an answer.

One rule matters most:

✅ **\`input()\` always returns text (a string).**

---

## Try it (see the type)

Run this and type anything when prompted:

~~~python
age = input("Enter your age: ")
print("You typed:", age)
print("type:", type(age))
~~~

No matter what you type, the type is still \`str\`.

---

## Convert the type (casting)

If you want Python to treat your input as a number, you must convert it:

- use \`int(...)\` for whole numbers
- use \`float(...)\` for decimals

### Convert to int (whole number)
~~~python
age = int(input("Enter your age: "))
print(age + 1)
~~~

### Convert to float (decimal)
~~~python
price = float(input("Enter price: "))
print(price * 1.10)
~~~

### Convert to string (when you need text)
~~~python
score = 95
msg = "Your score is " + str(score)
print(msg)
~~~

---

## Try it (play with it)

~~~python
price = float(input("Price: "))
qty = int(input("Quantity: "))
total = price * qty
print("Total =", total)
~~~

Run it again with different numbers.
`.trim(),
        },
    },
};