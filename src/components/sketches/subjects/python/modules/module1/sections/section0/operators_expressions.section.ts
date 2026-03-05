// src/components/sketches/subjects/python/modules/module1/sketches/operators.section.ts
import { SketchEntry } from "../../../../../index";

export const PY_OPERATORS_EXPRESSIONS_SECTION: Record<string, SketchEntry> = {
    "py.ops.expressions": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Operators + Expressions: The Calculator Inside Your Code",
            bodyMarkdown: String.raw`
You already learned two important ideas:

- **Variables** are labeled boxes that store values.
- **Data types** tell you what kind of value is inside those boxes.

Now we unlock the next capability:

✅ **Using those values to compute new ones.**

Think of your program like a small kitchen.

- Variables are your **ingredients** (flour, sugar, milk).
- Operators are your **tools** (mix, cut, heat).
- Expressions are the **recipe steps** that combine everything.

When you write an expression, you are telling Python:

> “Take these values, apply an operation, and give me the result.”

---

## What is an operator?

An **operator** is a symbol that performs an operation.

Examples:

- \`+\` adds numbers
- \`*\` multiplies numbers
- \`==\` compares two values

Operators take values and produce a result.

---

## What is an expression?

An **expression** is a piece of code that **evaluates to a value**.

Examples:

~~~python
2 + 3
price * tax
age >= 18
~~~

Each expression produces a result that Python can use.

---

## The basic math operators

These are the core arithmetic operators in Python:

- \`+\` addition
- \`-\` subtraction
- \`*\` multiplication
- \`/\` division (result is a float)
- \`//\` floor division
- \`%\` modulo (remainder)
- \`**\` exponent (power)

---

## Try it

Copy this into the editor on the right and run it:

~~~python
print("2 + 3 =", 2 + 3)
print("10 - 4 =", 10 - 4)
print("6 * 7 =", 6 * 7)
print("8 / 2 =", 8 / 2)
print("7 / 2 =", 7 / 2)
~~~

Notice that division with \`/\` can produce decimals.

---

## Floor division

Floor division \`//\` means:

> Divide, then keep only the whole-number part.

~~~python
print("7 // 2 =", 7 // 2)
print("9 // 4 =", 9 // 4)
~~~

### Try it

~~~python
print("15 // 2 =", 15 // 2)
print("15 / 2  =", 15 / 2)
~~~

Compare the results.

---

## Modulo: the remainder operator

Modulo \`%\` returns the remainder after division.

~~~python
print("7 % 2 =", 7 % 2)
print("10 % 3 =", 10 % 3)
~~~

### Why modulo is useful

Modulo is commonly used to:

- check **even vs odd numbers**
- cycle through values
- group items into batches

Example:

~~~python
n = 14
print("n % 2 =", n % 2)  # 0 means even

n = 15
print("n % 2 =", n % 2)  # 1 means odd
~~~

---

## Exponents

The exponent operator \`**\` raises a number to a power.

~~~python
print("2 ** 3 =", 2 ** 3)
print("5 ** 2 =", 5 ** 2)
~~~

Try changing the numbers and run again.

---

## Using variables in expressions

This is where the kitchen metaphor becomes useful.

Variables hold the **ingredients**, and expressions combine them.

~~~python
price = 4.99
qty = 3
subtotal = price * qty

print("subtotal =", subtotal)
~~~

### Try it

Change \`price\` and \`qty\` and run the program again.

The **same expression** produces a different result because the ingredients changed.

---

## Comparison operators

Sometimes you don’t want a number result.  
You want to **check a condition**.

Comparison operators produce a **boolean value**:

- \`==\` equal to
- \`!=\` not equal to
- \`<\` less than
- \`<=\` less than or equal
- \`>\` greater than
- \`>=\` greater than or equal

Example:

~~~python
age = 16
print(age >= 18)
~~~

The result is either \`True\` or \`False\`.

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

## A common beginner mistake: = vs ==

- \`=\` **assignment** (store a value in a variable)
- \`==\` **comparison** (check if two values match)

~~~python
x = 5
print(x == 5)
~~~

---

## Expressions depend on types

Operators behave differently depending on the data type.

~~~python
print(10 + 5)      
print("10" + "5")
~~~

The first line adds numbers.  
The second joins text.

If you're unsure about a value's type, inspect it:

~~~python
x = "10"
print(type(x))
~~~

---

## Mini exercise: simple checkout

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

Try changing \`qty\` and \`tax_rate\` and run it again.

---

## What you unlocked

Operators and expressions allow programs to:

1) **Compute results**
2) **Evaluate conditions**

Next, we’ll improve how programs work with **strings** and produce cleaner output.
`.trim(),
        },
    },
};