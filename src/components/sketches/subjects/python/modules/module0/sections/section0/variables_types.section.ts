import { SketchEntry } from "../../../../.";

export const PY_VARIABLES_TYPES_SECTION: Record<string, SketchEntry> = {
    "py.vars.boxes": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Variables: Labeled Boxes for Your Data",
            bodyMarkdown: String.raw`
Imagine you’re organizing your room.

You don’t want to hold everything in your hands, so you grab **boxes**.
But a box is only useful if you **label it**:

- **"snacks"**
- **"homework"**
- **"cables"**
- **"important stuff"**

In Python, a **variable** is that label.

✅ A variable is a **name** that points to a **value**.

---

## The “show it on the terminal screen” tool

You’ll often see \`print(...)\`.

For now, don’t worry about what it “is” officially.
Just treat \`print(...)\` like a **screen display**:

> Whatever you put inside and clicked the run button, gets shown in the terminal output.

(We’ll explain these “tools with parentheses” later.)

---

## The moment a variable is created

In Python, a variable exists the instant you assign a value:

~~~python
age = 16
name = "Maya"
~~~

Read it like this:

- Put **16** in a box labeled **age**
- Put **"Maya"** in a box labeled **name**

Python uses **=** for **assignment** (“store this here”), not “equals” like in math.

---

## Try it (editor on the right)

Copy this into the editor on the **right**, then run it and watch the terminal output:

~~~python
age = 16
name = "Maya"
print("age =", age)
print("name =", name)
~~~

Now change the values (try a different name and age) and run again.

---

## Variables can change (that’s the whole point)

~~~python
score = 10
score = score + 5
print(score)  # 15
~~~

That second line means:

> “Take what’s inside \`score\`, add 5, and store it back into \`score\`.”

---

## Try it (watch the change)

~~~python
score = 10
print("start:", score)

score = score + 5
print("after +5:", score)

score = score - 2
print("after -2:", score)
~~~

Change the +5 and -2 to other numbers and run again.

---

## Variable names (label rules)

✅ Allowed:
- letters, numbers, underscores
- can’t start with a number

❌ Not allowed:
- spaces
- symbols like \`$\` or \`@\`
- Python keywords like \`class\`, \`for\`, \`if\`

Examples:

~~~python
student_name = "Ayo"   # good
studentName = "Ayo"    # also fine
2cool = "nope"         # invalid (starts with a number)
~~~

---

## Quick mental model

A variable is not the value itself.

It’s a **name tag** so you can reuse the value easily:

~~~python
price = 4.99
tax = 0.10
total = price + price * tax
print(total)
~~~

Without variables, you’d repeat numbers everywhere.
With variables, your code becomes:
- clearer
- easier to change
- easier to read
`.trim(),
        },
    },

    "py.types.basic": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Data Types: What’s Inside the Box?",
            bodyMarkdown: String.raw`
So you have labeled boxes (variables). Now a key question:

**What kind of thing is inside the box?**

A banana is not the same as a book.
A number is not the same as a sentence.

Python calls this idea a **data type**.

---

## The 5 types you’ll use constantly

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

## Heads-up: checking the type

When you see the function \`type(...)\`.

For now, treat it like a **label-checker**:
it looks in the box and tells you what kind of value is inside.

---

## Try it (scan the boxes)

Paste this into the editor on the **right** and run it:

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

Change one value (example: set \`price = "3.75"\`) and run again.
Notice how the type changes.

---

## Why types matter (real example)

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

That’s not math — it’s **string joining** or precisely **string concatenation**.

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

You’ll see \`input("...")\`.

For now, treat it like a **question box**:
Python asks, the user types an answer.

One rule matters most:

✅ **\`input()\` always returns text (a string). Always.**

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

## The fix: convert the type (casting)

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

## Try it (mini challenge)

Make a tiny “total cost” calculator:

~~~python
price = float(input("Price: "))
qty = int(input("Quantity: "))
total = price * qty
print("Total =", total)
~~~

Now run it again with different numbers.
`.trim(),
        },
    },

    "py.types.errors": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Common Errors: NameError, TypeError, and Debug Tricks",
            bodyMarkdown: String.raw`
Let’s turn mistakes into skills.

When Python shows an error, it’s not “mad.”
It’s being precise about what it couldn’t do.

Here are the big three you’ll see early on.

---

## 1) NameError — “That label doesn’t exist”

~~~python
print(score)
~~~

If you never created \`score\`, Python can’t guess what it is.

Common causes:
- typo: \`scroe\` vs \`score\`
- using a variable before you assign it

---

## Try it (safe version first)

Run this (it works):

~~~python
score = 10
print(score)
~~~

Now delete the \`score = 10\` line and run again.
You should see **NameError**.

---

## 2) TypeError — “Those types don’t mix”

~~~python
age = input("Age: ")   # string
print(age + 1)         # 🚫 string + int
~~~

Fix:

~~~python
age = int(input("Age: "))
print(age + 1)
~~~

---

## Try it (spot the mismatch)

Run this first (it errors):

~~~python
age = input("Age: ")
print(age + 1)
~~~

Then fix it by converting to int:

~~~python
age = int(input("Age: "))
print(age + 1)
~~~

---

## 3) ValueError — “I tried to convert it, but it wasn’t valid”

~~~python
age = int("twelve")  # 🚫 ValueError
~~~

Python is saying:
> “That text doesn’t represent a number.”

---

## The best beginner debug combo

### 1) Print the value
~~~python
print("value:", x)
~~~

### 2) Print the type
~~~python
print("type:", type(x))
~~~

If something feels weird, it’s often a **type mismatch**.

---

## A quick story to remember them

- **NameError**: you used a label that was never created.
- **TypeError**: you tried to combine things that don’t fit together.
- **ValueError**: the value exists, but it’s not in the format you promised.

If you can read errors calmly, you’ll improve *fast*.
`.trim(),
        },
    },
};
