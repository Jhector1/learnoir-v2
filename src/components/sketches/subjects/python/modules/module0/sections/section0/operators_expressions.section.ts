import { SketchEntry } from "../../../../.";

export const PY_OPERATORS_EXPRESSIONS_SECTION: Record<string, SketchEntry> = {
    "py.ops.expressions": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Operators + Expressions: The Calculator Inside Your Code",
            bodyMarkdown: String.raw`
You already learned two huge ideas:

- **Variables** are labeled boxes that hold values.
- **Data types** tell you what kind of value is inside (number, text, True/False).

Now we unlock the next power:

✅ **Doing work with those values.**

Think of your program like a small kitchen.

- Variables are your **ingredients** (flour, sugar, milk).
- Operators are your **tools** (mix, cut, heat).
- Expressions are the **recipe steps** (mix sugar + flour, heat for 10 minutes).

When you write an expression, you’re telling Python:

> “Take these values… apply operations… and produce a result.”

---

## What is an operator?

An **operator** is a symbol that does work.

Examples:
- \`+\` adds
- \`*\` multiplies
- \`==\` compares

---

## What is an expression?

An **expression** is a piece of code that produces a value.

Examples:

~~~python
2 + 3
price * tax
age >= 18
~~~

Expressions are “compute something and give me the result.”

---

## The basic math operators

Here’s your core calculator set:

- \`+\` addition
- \`-\` subtraction
- \`*\` multiplication
- \`/\` division (gives a float)
- \`//\` floor division (drops decimals)
- \`%\` modulo (remainder)
- \`**\` exponent (power)

---

## Try it (editor on the right)

Copy this into the editor on the right and run it:

~~~python
print("2 + 3 =", 2 + 3)
print("10 - 4 =", 10 - 4)
print("6 * 7 =", 6 * 7)
print("8 / 2 =", 8 / 2)
print("7 / 2 =", 7 / 2)
~~~

Notice: division with \`/\` can produce decimals.

---

## Floor division: the “drop the decimals” move

Floor division \`//\` means:
> “Divide, then keep only the whole-number part.”

~~~python
print("7 // 2 =", 7 // 2)   # 3
print("9 // 4 =", 9 // 4)   # 2
~~~

### Try it
~~~python
print("15 // 2 =", 15 // 2)
print("15 / 2  =", 15 / 2)
~~~

---

## Modulo: the “remainder detector” (%)

Modulo \`%\` gives you the remainder after division.

This is secretly powerful.

~~~python
print("7 % 2 =", 7 % 2)     # 1
print("10 % 3 =", 10 % 3)   # 1
~~~

### Why it’s useful
- check **even vs odd**
- wrap around values (like clock math)
- split items into groups

### Try it (even/odd)
~~~python
n = 14
print("n =", n)
print("n % 2 =", n % 2)  # 0 means even

n = 15
print("n =", n)
print("n % 2 =", n % 2)  # 1 means odd
~~~

---

## Exponents: powers (**)

~~~python
print("2 ** 3 =", 2 ** 3)  # 8
print("5 ** 2 =", 5 ** 2)  # 25
~~~

Try changing the numbers and run again.

---

## Using variables in expressions (this is the real point)

Now we combine today’s lesson with your last lesson.

Variables hold values…
Expressions *use* them.

~~~python
price = 4.99
qty = 3
subtotal = price * qty
print("subtotal =", subtotal)
~~~

### Try it
Change \`price\` and \`qty\` and run again.
You’re watching the same recipe work with new ingredients.

---

## Comparison operators: “Is this true or false?”

Sometimes you don’t want a number result.
You want a **decision**.

Comparison operators produce a **boolean**:

- \`==\` equal to
- \`!=\` not equal to
- \`<\` less than
- \`<=\` less than or equal
- \`>\` greater than
- \`>=\` greater than or equal

Example:

~~~python
age = 16
print(age >= 18)  # False
~~~

That result is a boolean: \`True\` or \`False\`.

---

## Try it (predict first)

Before running, guess what each line prints:

~~~python
print(5 == 5)
print(5 != 5)
print(10 > 3)
print(10 < 3)
print(7 >= 7)
print(7 <= 6)
~~~

Run it and check your guesses.

---

## A common beginner trap: = vs ==

- \`=\` means **assignment** (store a value in a variable)
- \`==\` means **comparison** (check if two values match)

~~~python
x = 5        # assignment
print(x == 5)  # comparison -> True
~~~

If you write \`x = 5\` inside a comparison, Python will complain—because it’s the wrong tool.

---

## Expressions + types (why the type lesson mattered)

Remember: types change what operators mean.

~~~python
print(10 + 5)      # 15 (math)
print("10" + "5")  # "105" (join text)
~~~

So your brain should ask:

> “Am I working with numbers or text?”

Use \`type(...)\` when unsure:

~~~python
x = "10"
print("type:", type(x))
~~~

---

## Mini mission: build a checkout line

Use variables + expressions + print.

~~~python
price = 2.50
qty = 4
tax_rate = 0.10

subtotal = price * qty
tax = subtotal * tax_rate
total = subtotal + tax

print("subtotal =", subtotal)
print("tax =", tax)
print("total =", total)
~~~

### Try it
Change \`qty\` and \`tax_rate\`.
Run it again.
You just built a tiny “real program.”

---

## What you unlocked

After variables and types, operators + expressions let you do two things:

1) **Compute**
2) **Decide** (True/False)

Next, we’ll make your programs feel more human by leveling up **strings** and clean output formatting.
`.trim(),
        },
    },
};
