// src/components/review/sketches/python/part1/configs.ts
import type { SketchEntry } from "@/components/sketches/subjects/registryTypes";
import type { SavedSketchState } from "@/components/sketches/subjects/types";

import ArithmeticPrecedenceCustom from "@/components/sketches/subjects/python/modules/module0/custom/ArithmeticPrecedenceCustom";
import {PY_INTRO_TOPICS} from "@/components/sketches/subjects/python/modules/module0/python.intro";
import {PY_PRINT_SKETCHES} from "@/components/sketches/subjects/python/modules/module0/python.print";
import {PY_WORKSPACE_TOPICS} from "@/components/sketches/subjects/python/modules/module0/python.workspace";
import {PY_SECTION0} from "@/components/sketches/subjects/python/modules/module0/sections/section0";


export const PY_PART1_SKETCHES: Record<string, SketchEntry> = {
    // ---------- SECTION I - Topic { print() complete } ----------
  ...PY_SECTION0,
//
//     "py.io_intro": {
//         kind: "archetype",
//         spec: {
//             archetype: "paragraph",
//             specVersion: 1,
//             title: "input() reads a line of text",
//             bodyMarkdown: String.raw`
// \(\texttt{input()}\) pauses the program and reads what the user types:
//
// ~~~python
// name = input("Your name: ")
// print("Hi", name)
// ~~~
//
// Important: \(\texttt{input()}\) returns a **string**.
// `.trim(),
//         },
//     },
//
//     "py.vars_intro": {
//         kind: "archetype",
//         spec: {
//             archetype: "paragraph",
//             specVersion: 1,
//             title: "Variables are named boxes",
//             bodyMarkdown: String.raw`
// Assignment uses **=**:
//
// ~~~python
// x = 10
// x = x + 5
// print(x)
// ~~~
//
// The name points to a value; updating the value changes future results.
// `.trim(),
//         },
//     },
//
//     "py.strings_intro": {
//         kind: "archetype",
//         spec: {
//             archetype: "paragraph",
//             specVersion: 1,
//             title: "Strings are text in quotes",
//             bodyMarkdown: String.raw`
// A **string** is a sequence of characters:
//
// ~~~python
// a = "Hello"
// b = 'World'
// print(a, b)
// ~~~
//
// Both single and double quotes work (just be consistent).
// `.trim(),
//         },
//     },
//
//     "py.strings_len": {
//         kind: "archetype",
//         spec: {
//             archetype: "paragraph",
//             specVersion: 1,
//             title: "len() and building messages",
//             bodyMarkdown: String.raw`
// \(\texttt{len()}\) counts characters:
//
// ~~~python
// word = "Python"
// print(len(word))   # 6
// ~~~
//
// Build text by combining pieces:
//
// ~~~python
// first = "Alan"
// last = "Turing"
// print(first + " likes " + last)
// ~~~
//
// Often nicer:
// ~~~python
// print("Hi", first)
// ~~~
// `.trim(),
//         },
//     },
//
//     "py.math_ops": {
//         kind: "archetype",
//         spec: {
//             archetype: "paragraph",
//             specVersion: 1,
//             title: "Basic arithmetic operators",
//             bodyMarkdown: String.raw`
// Python arithmetic:
//
// - \(\texttt{+}\) add
// - \(\texttt{-}\) subtract
// - \(\texttt{*}\) multiply
// - \(\texttt{/}\) divide (float)
// - \(\texttt{//}\) integer divide (floor)
// - \(\texttt{**}\) exponent
//
// ~~~python
// print(7 / 2)   # 3.5
// print(7 // 2)  # 3
// print(2 ** 3)  # 8
// ~~~
// `.trim(),
//         },
//     },
//
//     "py.precedence_read": {
//         kind: "archetype",
//         spec: {
//             archetype: "paragraph",
//             specVersion: 1,
//             title: "Precedence (order of operations)",
//             bodyMarkdown: String.raw`
// Python uses standard precedence:
//
// 1) parentheses
// 2) exponent \(\texttt{**}\)
// 3) multiply/divide
// 4) add/subtract
//
// Gotcha:
// ~~~python
// print(-4 ** 2)    # -(4**2) = -16
// print((-4) ** 2)  # 16
// ~~~
// `.trim(),
//         },
//     },
//
//     "py.comments_read": {
//         kind: "archetype",
//         spec: {
//             archetype: "paragraph",
//             specVersion: 1,
//             title: "Comments explain code for humans",
//             bodyMarkdown: String.raw`
// Comments start with \(\#\):
//
// ~~~python
// # This prints a friendly greeting
// print("Hello!")
// ~~~
//
// Good comments explain **why**, not just what the code already says.
// `.trim(),
//         },
//     },
//
//     "py.docstrings_read": {
//         kind: "archetype",
//         spec: {
//             archetype: "paragraph",
//             specVersion: 1,
//             title: "Docstrings document programs and functions",
//             bodyMarkdown: String.raw`
// Docstrings use triple quotes and often appear at the top of a file or inside a function:
//
// ~~~python
// """My program.
//
// This script asks for a number and prints its square.
// """
// ~~~
// `.trim(),
//         },
//     },
//
//     "py.errors_read": {
//         kind: "archetype",
//         spec: {
//             archetype: "paragraph",
//             specVersion: 1,
//             title: "Common errors to recognize quickly",
//             bodyMarkdown: String.raw`
// Three very common beginner errors:
//
// - **SyntaxError**: the code cannot be parsed (missing quote, missing parenthesis)
// - **NameError**: using a variable name that does not exist (typo or never defined)
// - **IndentationError**: whitespace is inconsistent (Python cares about indentation)
//
// Rule of thumb: read the **last line** of the traceback first (it tells you the error type).
// `.trim(),
//         },
//     },
//
//     "py.mixed_read": {
//         kind: "archetype",
//         spec: {
//             archetype: "paragraph",
//             specVersion: 1,
//             title: "Mixed review mode",
//             bodyMarkdown: String.raw`
// This topic mixes questions from Part 1:
//
// - print(), sep, end
// - input() + variables
// - strings + len()
// - math + precedence
// - comments + common errors
//
// Do this when you want a quick “everything so far” check.
// `.trim(),
//         },
//     },
//
//     // ---------- INTERACTIVES (GENERIC) ----------
//     "py.print": {
//         kind: "archetype",
//         spec: {
//             archetype: "print_playground",
//             specVersion: 1,
//             title: "print() formatting playground",
//             partsDefault: ["Today", "is", "Monday"],
//             sepDefault: " ",
//             endDefault: "\\n",
//             hudMarkdown: String.raw`
// **print() options**
//
// Python prints values separated by **sep** and finishes with **end**.
//
// - \(\texttt{sep}\): how values are joined
// - \(\texttt{end}\): what gets appended at the end (**newline** by default)
//
// Try:
// - set \(\texttt{sep="..."}\) to see glue change
// - set \(\texttt{end=""}\) to keep printing on the same line
// - set \(\texttt{end="!!"}\) for emphasis
// `.trim(),
//         },
//     },
//
//     "py.io": {
//         kind: "archetype",
//         spec: {
//             archetype: "io_simulator",
//             specVersion: 1,
//             title: "Simulate input() → variable → print()",
//             promptDefault: "Please enter your name:",
//             inputDefault: "Sophia",
//             varName: "name",
//             printLabel: "You entered:",
//             hudMarkdown: String.raw`
// **input() + variables**
//
// Typical pattern:
//
// \[
// \texttt{name = input("...")}
// \]
// \[
// \texttt{print("You entered:", name)}
// \]
//
// - \(\texttt{input()}\) reads **one line** of text
// - the value is stored in a **variable**
// - later, \(\texttt{print()}\) can use that variable
// `.trim(),
//         },
//     },
//
//     "py.docs": {
//         kind: "archetype",
//         spec: {
//             archetype: "tabs",
//             specVersion: 1,
//             title: "Comments vs docstrings examples",
//             tabs: [
//                 {
//                     key: "comments",
//                     label: "comments",
//                     code: `# Display the menu options
// print("Lunch Menu")
// print("----------")
// print("Burrito")
// print("Taco")
// print("Salad")
// print()  # End of menu
//
// # Get the user's preferences
// item1 = input("Item #1: ")
// item2 = input("Item #2: ")`,
//                 },
//                 {
//                     key: "docstring",
//                     label: "docstring",
//                     code: `"""Gravity calculation.
//
// This program asks for a mass (in kg) and prints the weight on Earth.
// Author: Your Name
// """
//
// mass = float(input("Mass (kg): "))
// g = 9.81
// weight = mass * g
// print("Weight (N):", weight)`,
//                 },
//             ],
//             initialKey: "comments",
//             hudMarkdown: String.raw`
// **Comments vs docstrings**
//
// - **Comments** start with \(\#\) and explain code *for readers*
// - **Docstrings** are documentation strings (often triple quotes) used to describe a module/function
//
// Good comments:
// - explain **purpose**, not just repeat the line
// - separate logical sections with blank lines
// `.trim(),
//         },
//     },
//
//     "py.errors": {
//         kind: "archetype",
//         spec: {
//             archetype: "error_gallery",
//             specVersion: 1,
//             title: "Pick an error and see the fix",
//             errors: [
//                 {
//                     key: "name",
//                     label: "NameError",
//                     title: "NameError (misspelled name)",
//                     badCode: `print("You typed:", wird)`,
//                     fix: `print("You typed:", word)`,
//                     traceback: `Traceback (most recent call last):
//   File "example.py", line 1, in <module>
//     print("You typed:", wird)
// NameError: name 'wird' is not defined`,
//                     why: "Python only knows names you defined (or built-ins). Spelling matters.",
//                 },
//                 {
//                     key: "syntax_paren",
//                     label: "Syntax: missing )",
//                     title: "SyntaxError (missing parenthesis)",
//                     badCode: `print("Have a nice day!"`,
//                     fix: `print("Have a nice day!")`,
//                     traceback: `Traceback (most recent call last):
//   File "example.py", line 1
//     print("Have a nice day!"
//                           ^
// SyntaxError: unexpected EOF while parsing`,
//                     why: "Python reached the end of the line/file before your statement finished.",
//                 },
//                 {
//                     key: "syntax_quote",
//                     label: "Syntax: missing quote",
//                     title: "SyntaxError (unterminated string)",
//                     badCode: `word = input("Type a word: )`,
//                     fix: `word = input("Type a word: ")`,
//                     traceback: `Traceback (most recent call last):
//   File "example.py", line 1
//     word = input("Type a word: )
//                  ^
// SyntaxError: EOL while scanning string literal`,
//                     why: "Strings must start and end with matching quotes.",
//                 },
//                 {
//                     key: "indent",
//                     label: "Indentation",
//                     title: "IndentationError (unexpected indent)",
//                     badCode: ` print("Hello")`,
//                     fix: `print("Hello")`,
//                     traceback: `Traceback (most recent call last):
//   File "example.py", line 1
//     print("Hello")
// IndentationError: unexpected indent`,
//                     why: "At the top-level, extra leading spaces can be illegal.",
//                 },
//             ],
//             initialKey: "name",
//             hudMarkdown: String.raw`
// **How to read errors**
//
// Look for:
//
// 1. **File + line number**
// 2. **Error type** (SyntaxError, NameError, IndentationError)
// 3. The **caret** \(\hat{}\) that points near the problem
//
// Common beginner pattern:
// - fix **one** error
// - run again
// - repeat
// `.trim(),
//         },
//     },
//
//     // ---------- VIDEO (GENERIC) ----------
//     "video.embed": {
//         kind: "archetype",
//         spec: {
//             archetype: "video_lesson",
//             specVersion: 1,
//             title: "Video",
//             url: "https://youtu.be/VSeADGG7d6U?si=BiSbfvQK2NV3qu5h",
//             provider: "auto",
//             captionMarkdown: String.raw`Watch this, then try the playground sketch below.`.trim(),
//             hudMarkdown: String.raw`
// **Video lesson**
//
// Watch the clip, then come back and continue the cards.
// `.trim(),
//         },
//     },
//
//     // ---------- CUSTOM (CodeRunner lab) ----------
//     "py.arith": {
//         kind: "custom",
//         Component: ArithmeticPrecedenceCustom as any,
//         defaultState: {
//             version: 1,
//             updatedAt: new Date().toISOString(),
//             data: { x: 4, y: 3, z: 4, expr: "expr1", code: "" },
//         } as SavedSketchState,
//     },
};
