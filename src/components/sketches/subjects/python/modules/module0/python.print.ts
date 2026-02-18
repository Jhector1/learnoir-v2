import {SketchEntry} from "../../.";
import {PY_INTRO_TOPICS} from "@/components/sketches/subjects/python/modules/module0/python.intro";

export const PY_PRINT_SKETCHES: Record<string, SketchEntry> = {

// ---------- SECTION I - Topic { print() complete + fun reading } ----------

    "py.print_intro": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "print() is your flashlight (it shows what’s happening)",
            bodyMarkdown: String.raw`
When you write code, you need a way to **see what your program is doing**.

Think of **\`print()\`** like a flashlight:
- your variables are “in the dark”
- \`print()\` shines light on them so you can see what they contain

### The simplest print
~~~python
print("Hello world")
~~~

That prints the text **exactly once**.

### Printing multiple things at once
You can give \`print()\` more than one value:

~~~python
print(1, 2, 3)
print("Score:", 99)
~~~

Python will:
1) turn each value into text  
2) put them together  
3) show them on the screen

### Why beginners use print a LOT
Because it helps you:
- confirm your code is running
- check variable values
- debug logic (“did this \`if\` run?”)
- understand loops (“what is \`i\` right now?”)

### Quick checkpoint (read + answer)
What will this show?

~~~python
print("A")
print("B")
~~~

✅ It prints on **two lines** because each \`print()\` ends with a newline by default.

### Bonus: the “full power” signature (don’t memorize)
~~~python
print(*objects, sep=" ", end="\\n", file=..., flush=False)
~~~

You’ll learn \`sep\` and \`end\` next — those are the ones you’ll use constantly.
`.trim(),
        },
    },

    "py.print_sep_end": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "sep and end are your formatting superpowers",
            bodyMarkdown: String.raw`
By default, \`print()\` behaves like this:

- between values, it uses a **space**
- after printing, it ends with a **newline** (moves to the next line)

That’s why:

~~~python
print("A", "B", "C")   # A B C
~~~

### \`sep=\` controls the separator
Want a different “glue” between items? Use \`sep\`.

~~~python
print("A", "B", "C", sep=" | ")
print(2026, 2, 16, sep="-")
~~~

Output becomes:
- \`A | B | C\`
- \`2026-2-16\`

### \`end=\` controls what happens at the end
Want to stay on the same line? Change \`end\`.

~~~python
print("Hi", end="")
print(" again")
~~~

That prints:
\`Hi again\`

### Tiny challenge
Try to make this output exactly:

\`Loading...done!\`

Hint: use \`end=""\` on the first print.

~~~python
print("Loading...", end="")
print("done!")
~~~

### Common beginner mistake
\`sep\` and \`end\` must be **strings**:

~~~python
# print("Hi", end=0)  # ❌ TypeError
print("Hi", end="")   # ✅
~~~
`.trim(),
        },
    },

    "py.print_fstrings": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Printing variables: f-strings make you look pro",
            bodyMarkdown: String.raw`
The most common next question is:

> “How do I print variables inside a sentence?”

You *can* do this:

~~~python
name = "Ada"
age = 12
print("Name:", name, "Age:", age)
~~~

But the cleanest way is **f-strings**:

~~~python
print(f"Name: {name}, Age: {age}")
~~~

### Why f-strings are amazing
- readable
- easy to edit
- less messy than mixing commas

### Debugging trick (Python 3.8+)
This one is *so good* for debugging:

~~~python
score = 97
print(f"{score=}")   # prints: score=97
~~~

### Quick practice
Predict the output:

~~~python
x = 4
y = 10
print(f"x + y = {x + y}")
~~~

✅ It prints: \`x + y = 14\`

### Alternative (older style)
You may see this in older tutorials:

~~~python
print("Name: {}, Age: {}".format(name, age))
~~~

It still works, but f-strings are usually best for beginners today.
`.trim(),
        },
    },

    "py.print_escapes": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Special characters: new lines, tabs, and quotes",
            bodyMarkdown: String.raw`
Sometimes you want your output to look “formatted” — like a mini-table or multiple lines.

Inside strings, Python lets you use **escape characters**.

### The most useful escapes
- \`\\n\` = new line  
- \`\\t\` = tab  
- \`\\\"\` = quote inside a double-quoted string

~~~python
print("Line1\\nLine2")
print("Name\\tScore")
print("Ada\\t99")
print("He said: \\"hello\\"")
~~~

### When raw strings help
If you’re writing Windows paths or patterns, raw strings avoid extra escaping:

~~~python
print(r"C:\\Users\\Name\\Desktop")
~~~

Raw strings keep backslashes “as-is”.
`.trim(),
        },
    },

    "py.print_none_return": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Important: print() returns None (don’t store it)",
            bodyMarkdown: String.raw`
A super common beginner mistake is thinking \`print()\` produces a value.

But \`print()\` is an **action**:
- it *shows output*
- it does **not** return useful data

~~~python
x = print("Hello")
print(x)
~~~

This prints:
- \`Hello\`
- \`None\`

### The right mental model
- Use \`print()\` to display.
- If you want a value, create it first, then print it.

~~~python
msg = "Hello"
print(msg)
~~~

### Quick check
Which one should you store in a variable?

A) \`x = print("Hi")\`  
B) \`x = "Hi"\`

✅ B
`.trim(),
        },
    },

    "py.print_unpack": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Printing lists nicely with * (unpacking)",
            bodyMarkdown: String.raw`
If you print a list directly, you get the “list look”:

~~~python
nums = [1, 2, 3]
print(nums)          # [1, 2, 3]
~~~

That’s not wrong — but sometimes you want the items printed like separate values.

### Use * to unpack
~~~python
print(*nums)                 # 1 2 3
print(*nums, sep=", ")       # 1, 2, 3
~~~

### Why this is useful
It’s perfect for:
- printing arrays cleanly
- showing results in a friendly format
- quickly debugging list contents without brackets

### Mini challenge
Make this print exactly:

\`A-B-C\`

~~~python
letters = ["A", "B", "C"]
# your code here
~~~

Hint: \`print(*letters, sep="-")\`
`.trim(),
        },
    },

    "py.print_file_flush": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Advanced but useful: file= and flush=",
            bodyMarkdown: String.raw`
These are not needed every day, but they’re part of what \`print()\` can do.

---

## \`file=\` (print somewhere else)
Normally print goes to the screen. But you can send output to another place.

A simple example using an “in-memory file”:

~~~python
import io

buf = io.StringIO()
print("Hello file!", file=buf)

text = buf.getvalue()
print("Saved text:", text)
~~~

In real projects, you might print into a real file to create logs.

---

## \`flush=\` (show output immediately)
Sometimes output is “buffered” (it waits a little).  
\`flush=True\` forces it to display right now.

~~~python
import time

print("Loading...", end="", flush=True)
time.sleep(1)
print(" done!")
~~~

### Same-line updates (cool trick)
This makes “progress” update on one line:

~~~python
import time

for i in range(6):
    print(f"Progress: {i}/5", end="\\r", flush=True)
    time.sleep(0.2)

print("Progress: done!   ")
~~~

(You don’t need this for beginner homework, but it’s fun and shows what \`end\` + \`flush\` can do.)
`.trim(),
        },
    },

    "py.video.embed.print": {
        kind: "archetype",
        spec: {
            archetype: "video_lesson",
            specVersion: 1,
            title: "Video",
            embedUrl: "https://youtu.be/QXeEoD0pB3E?si=uqlAuzd9PF9gmFCQ",
            provider: "auto",
            captionMarkdown: String.raw`Watch this, then do the playground challenges below.`.trim(),
            hudMarkdown: String.raw`
**Remember**
- \`sep\` controls the separator between values  
- \`end\` controls what prints at the end (default newline)  
- f-strings are the cleanest way to print variables  
`.trim(),
        },
    },

    "py.code_runner.print": {
        kind: "archetype",
        spec: {
            archetype: "code_runner",
            specVersion: 1,
            title: "print() playground (mini-missions)",
            language: "python",
            // specVersion: 1,
            instructionsMarkdown: String.raw`
Click **Run** and complete the mini-missions by editing the code.

**Mini-missions**
1) Make output: A|B|C
2) Print 1–5 on one line separated by ", "
3) Print "Loading..." and then "done!" on the same line
4) Print: Name: Ada, Age: 12 (use f-string)
5) Print a quote + a newline using escapes
6) Print list letters as A-B-C using * unpacking
`.trim(),
            starterCode: String.raw`
# --- print() playground (edit and run) ---

# 1) A|B|C
print("A", "B", "C", sep="|")

# 2) 1, 2, 3, 4, 5
nums = [1, 2, 3, 4, 5]
print(*nums, sep=", ")

# 3) Loading...done! (same line)
import time
print("Loading...", end="", flush=True)
time.sleep(0.4)
print("done!")

# 4) f-string
name = "Ada"
age = 12
print(f"Name: {name}, Age: {age}")

# 5) escapes
print("He said: \\"hello\\"\\nNext line")

# 6) unpack letters as A-B-C
letters = ["A", "B", "C"]
print(*letters, sep="-")
`.trim(),
        },
    },
}