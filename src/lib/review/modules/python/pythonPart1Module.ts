import type { ReviewModule } from "@/lib/review/types";
import { PY_SECTION_PART1, PY_TOPIC } from "@/lib/practice/catalog/subjects/python/slugs";
import { PY_MOD0 } from "../../../../../prisma/seed/data/subjects/python/constants";

export const pythonPart1Module: ReviewModule = {
  id: PY_MOD0,
  title: "Python — Part 1",
  subtitle:
    "Your first programs: print/input, variables, strings, math, comments, and common errors",

  startPracticeHref: (topicSlug) =>
    `/practice?section=${PY_SECTION_PART1}&difficulty=easy&topic=${encodeURIComponent(topicSlug)}`,

  topics: [
    // ------------------------------------------------------------
    // print
    // ------------------------------------------------------------
    {
      id: PY_TOPIC.print,
      label: "Printing output: print(), sep, end",
      minutes: 10,
      summary:
        "Learn how print() formats output and how sep/end change spacing and line breaks.",
      cards: [
        {
          type: "text",
          id: "py1_t1",
          title: "print() writes text to the screen",
          markdown: String.raw`
The most common way to show output is **print()**:

~~~python
print("Hello world")
print(1, 2, 3)
~~~

By default:
- values are separated by a **space**
- printing ends with a **newline**
`.trim(),
        },
        {
          type: "text",
          id: "py1_t2",
          title: "sep and end control formatting",
          markdown: String.raw`
Two useful options:

- \(\texttt{sep}\) controls the **separator** between values
- \(\texttt{end}\) controls what prints at the **end** (default newline)

~~~python
print("A", "B", "C", sep=" | ")
print("Hi", end="")      # no newline
print(" again")
~~~
`.trim(),
        },
        {
          type: "sketch",
          id: "py1_v1",
          title: "Video: print() — sep and end",
          sketchId: "video.embed",
          height: 520,
          props: {
            title: "print() formatting (sep/end)",
            url: "https://youtu.be/QXeEoD0pB3E?si=uqlAuzd9PF9gmFCQ",
            provider: "auto",
            captionMarkdown: String.raw`
Watch this, then try the playground sketch below.
`.trim(),
            hudMarkdown: String.raw`
**Key idea**

- \`sep\` changes the separator between values  
- \`end\` changes what prints at the end (default is newline)
`.trim(),
          },
        },
        {
          type: "sketch",
          id: "py1_s1",
          title: "print() formatting playground",
          sketchId: "py.print",
          height: 420,
        },
        {
          type: "quiz",
          id: "py1_q1",
          title: "Quick check",
          spec: {
            subject: "python",
            module: PY_MOD0,
            section: PY_SECTION_PART1,
            topic: PY_TOPIC.print,
            difficulty: "easy",
            n: 4,
            allowReveal: true,
          },
        },
      ],
    },

    // ------------------------------------------------------------
    // io_vars
    // ------------------------------------------------------------
    {
      id: PY_TOPIC.io_vars,
      label: "Input + variables: store values and reuse them",
      minutes: 14,
      summary:
        "Use input() to read text, store it in variables, then print it back out.",
      cards: [
        {
          type: "text",
          id: "py2_t1",
          title: "input() reads a line of text",
          markdown: String.raw`
\(\texttt{input()}\) pauses the program and reads what the user types:

~~~python
name = input("Your name: ")
print("Hi", name)
~~~

Important: \(\texttt{input()}\) returns a **string**.
`.trim(),
        },
        {
          type: "text",
          id: "py2_t2",
          title: "Variables are named boxes",
          markdown: String.raw`
Assignment uses **=**:

~~~python
x = 10
x = x + 5
print(x)
~~~

The name points to a value; updating the value changes future results.
`.trim(),
        },
        {
          type: "sketch",
          id: "py2_s1",
          title: "Simulate input() → variable → print()",
          sketchId: "py.io",
          height: 420,
        },
        {
          type: "sketch",
          id: "py2_s2",
          title: "Edit variables and see output change",
          sketchId: "py.vars",
          height: 420,
        },
        {
          type: "quiz",
          id: "py2_q1",
          title: "Quick check",
          spec: {
            subject: "python",
            module: PY_MOD0,
            section: PY_SECTION_PART1,
            topic: PY_TOPIC.io_vars,
            difficulty: "easy",
            n: 4,
            allowReveal: true,
          },
        },
      ],
    },

    // ------------------------------------------------------------
    // strings
    // ------------------------------------------------------------
    {
      id: PY_TOPIC.strings,
      label: "Strings: quotes, len(), joining text",
      minutes: 12,
      summary:
        "Strings are text in quotes. Use len() and combine strings to build messages.",
      cards: [
        {
          type: "text",
          id: "py3_t1",
          title: "Strings are text in quotes",
          markdown: String.raw`
A **string** is a sequence of characters:

~~~python
a = "Hello"
b = 'World'
print(a, b)
~~~

Both single and double quotes work (just be consistent).
`.trim(),
        },
        {
          type: "text",
          id: "py3_t2",
          title: "len() and building messages",
          markdown: String.raw`
\(\texttt{len()}\) counts characters:

~~~python
word = "Python"
print(len(word))   # 6
~~~

Build text by combining pieces:

~~~python
first = "Alan"
last = "Turing"
print(first + " likes " + last)
~~~

Often nicer:
~~~python
print("Hi", first)
~~~
`.trim(),
        },
        {
          type: "sketch",
          id: "py3_s1",
          title: "Strings playground (len + concatenation)",
          sketchId: "py.strings",
          height: 420,
        },
        {
          type: "quiz",
          id: "py3_q1",
          title: "Quick check",
          spec: {
            subject: "python",
            module: PY_MOD0,
            section: PY_SECTION_PART1,
            topic: PY_TOPIC.strings,
            difficulty: "easy",
            n: 4,
            allowReveal: true,
          },
        },
      ],
    },

    // ------------------------------------------------------------
    // math_precedence
    // ------------------------------------------------------------
    {
      id: PY_TOPIC.math_precedence,
      label: "Math + operator precedence",
      minutes: 14,
      summary:
        "Understand how Python evaluates expressions and why parentheses matter.",
      cards: [
        {
          type: "text",
          id: "py4_t1",
          title: "Basic arithmetic operators",
          markdown: String.raw`
Python arithmetic:

- \(\texttt{+}\) add
- \(\texttt{-}\) subtract
- \(\texttt{*}\) multiply
- \(\texttt{/}\) divide (float)
- \(\texttt{//}\) integer divide (floor)
- \(\texttt{**}\) exponent

~~~python
print(7 / 2)   # 3.5
print(7 // 2)  # 3
print(2 ** 3)  # 8
~~~
`.trim(),
        },
        {
          type: "text",
          id: "py4_t2",
          title: "Precedence (order of operations)",
          markdown: String.raw`
Python uses standard precedence:

1) parentheses  
2) exponent \(\texttt{**}\)  
3) multiply/divide  
4) add/subtract  

Gotcha:
~~~python
print(-4 ** 2)    # -(4**2) = -16
print((-4) ** 2)  # 16
~~~
`.trim(),
        },
        {
          type: "sketch",
          id: "py4_s1",
          title: "Precedence explorer (edit x,y,z)",
          sketchId: "py.arith",
          height: 420,
        },
        {
          type: "quiz",
          id: "py4_q1",
          title: "Quick check",
          spec: {
            subject: "python",
            module: PY_MOD0,
            section: PY_SECTION_PART1,
            topic: PY_TOPIC.math_precedence,
            difficulty: "easy",
            n: 4,
            allowReveal: true,
          },
        },
      ],
    },

    // ------------------------------------------------------------
    // comments_errors
    // ------------------------------------------------------------
    {
      id: PY_TOPIC.comments_errors,
      label: "Comments, docstrings, and reading error messages",
      minutes: 16,
      summary:
        "Write readable code with comments/docstrings and learn to decode common beginner errors.",
      cards: [
        {
          type: "text",
          id: "py5_t1",
          title: "Comments explain code for humans",
          markdown: String.raw`
Comments start with \(\#\):

~~~python
# This prints a friendly greeting
print("Hello!")
~~~

Good comments explain **why**, not just what the code already says.
`.trim(),
        },
        {
          type: "text",
          id: "py5_t2",
          title: "Docstrings document programs and functions",
          markdown: String.raw`
Docstrings use triple quotes and often appear at the top of a file or inside a function:

~~~python
"""My program.

This script asks for a number and prints its square.
"""
~~~
`.trim(),
        },
        {
          type: "sketch",
          id: "py5_s1",
          title: "Comments vs docstrings examples",
          sketchId: "py.docs",
          height: 420,
        },
        {
          type: "text",
          id: "py5_t3",
          title: "Common errors to recognize quickly",
          markdown: String.raw`
Three very common beginner errors:

- **SyntaxError**: the code cannot be parsed (missing quote, missing parenthesis)
- **NameError**: using a variable name that does not exist (typo or never defined)
- **IndentationError**: whitespace is inconsistent (Python cares about indentation)

Rule of thumb: read the **last line** of the traceback first (it tells you the error type).
`.trim(),
        },
        {
          type: "sketch",
          id: "py5_s2",
          title: "Pick an error and see the fix",
          sketchId: "py.errors",
          height: 440,
        },
        {
          type: "quiz",
          id: "py5_q1",
          title: "Quick check",
          spec: {
            subject: "python",
            module: PY_MOD0,
            section: PY_SECTION_PART1,
            topic: PY_TOPIC.comments_errors,
            difficulty: "easy",
            n: 4,
            allowReveal: true,
          },
        },
      ],
    },

    // ------------------------------------------------------------
    // foundations (MIXED)  ✅ this is the one that didn’t surface
    // ------------------------------------------------------------
    {
      id: PY_TOPIC.foundations,
      label: "Python foundations (mixed)",
      minutes: 10,
      summary:
        "A mixed review of print/input, variables, strings, precedence, and common beginner errors.",
      cards: [
        {
          type: "text",
          id: "py6_t1",
          title: "Mixed review mode",
          markdown: String.raw`
This topic mixes questions from Part 1:

- print(), sep, end  
- input() + variables  
- strings + len()  
- math + precedence  
- comments + common errors  

Do this when you want a quick “everything so far” check.
`.trim(),
        },
        {
          type: "quiz",
          id: "py6_q1",
          title: "Foundations (mixed) — Quick check",
          spec: {
            subject: "python",
            module: PY_MOD0,
            section: PY_SECTION_PART1,
            topic: PY_TOPIC.foundations,
            difficulty: "easy",
            n: 8,
            allowReveal: true,
          },
        },
      ],
    },
  ],
};
