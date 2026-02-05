// src/lib/practice/generator/engines/python/python_part1.ts
import type {
  CodeInputExercise,
  CodeLanguage,
  Difficulty,
  ExerciseKind,
  SingleChoiceExercise,
} from "../../../types";
import type { GenOut } from "../../shared/expected";
import type { RNG } from "../../shared/rng";
import type { TopicContext } from "../../generatorTypes";

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
function pickWord(rng: RNG) {
  return rng.pick(["piano", "tacos", "coding", "soccer", "mystery", "coffee"] as const);
}
function safeInt(rng: RNG, lo: number, hi: number) {
  return rng.int(lo, hi);
}
function pickName(rng: RNG) {
  return rng.pick(["alex", "sam", "jordan", "taylor", "maria", "leo"] as const);
}
function pickSnakeCandidate(rng: RNG) {
  return rng.pick(["user_name", "total_score", "my_var", "age_years", "first_name"] as const);
}

// ------------------------------------------------------------
// Canonical expected shape for code_input
// ------------------------------------------------------------
type CodeTest = {
  stdin?: string;
  stdout: string;
  match?: "exact" | "includes";
};

type CodeExpected = {
  kind: "code_input";
  language?: CodeLanguage;

  /**
   * Canonical: validator should ONLY need this.
   * Always include at least one test.
   */
  tests: CodeTest[];

  /**
   * Optional convenience (legacy/back-compat); do not rely on it.
   */
  stdin?: string;
  stdout?: string;
    solutionCode?: string;

};

function makeCodeExpected(args: {
  language?:CodeLanguage;
  stdin?: string;
  stdout?: string;
  match?: "exact" | "includes";
  tests?: CodeTest[];
   solutionCode?: string;
}): CodeExpected {
  const lang = args.language ?? "python";

  // If tests are provided, use them; otherwise, synthesize from stdin/stdout.
  const tests: CodeTest[] =
    Array.isArray(args.tests) && args.tests.length
      ? args.tests.map((t) => ({
          stdin: typeof t.stdin === "string" ? t.stdin : "",
          stdout: String(t.stdout ?? ""),
          match: t.match ?? "exact",
        }))
      : [
          {
            stdin: typeof args.stdin === "string" ? args.stdin : "",
            stdout: String(args.stdout ?? ""),
            match: args.match ?? "exact",
          },
        ];

  // Guard: never allow empty stdout (that causes your “missing tests/stdout” bug in validator)
  for (const t of tests) {
    if (typeof t.stdout !== "string") t.stdout = String(t.stdout ?? "");
  }

  return {
    kind: "code_input",
    language: lang,
    tests,
    // legacy convenience fields:
    stdin: typeof args.stdin === "string" ? args.stdin : tests[0]?.stdin ?? "",
    stdout: typeof args.stdout === "string" ? args.stdout : tests[0]?.stdout ?? "",
        solutionCode: typeof args.solutionCode === "string" ? args.solutionCode : undefined,

  };
}

// ------------------------------------------------------------
// Pool helpers
// ------------------------------------------------------------
// type PoolItem = { key: string; w: number };
type HandlerArgs = { rng: RNG; diff: Difficulty; id: string; topic: string };
type Handler = (args: HandlerArgs) => GenOut<ExerciseKind>;

import type { PracticeKind } from "@prisma/client";

type PoolItem = { key: string; w: number; kind?: PracticeKind };

function readPoolFromMeta(meta: any): PoolItem[] {
  const pool = meta?.pool;
  if (!Array.isArray(pool)) return [];
  return pool
    .map((p: any) => ({
      key: String(p?.key ?? "").trim(),
      w: Number(p?.w ?? 0),
      kind: p?.kind ? (String(p.kind).trim() as PracticeKind) : undefined,
    }))
    .filter((p) => p.key && Number.isFinite(p.w) && p.w > 0);
}
function weightedKey(rng: RNG, pool: PoolItem[]): string {
  const picked = rng.weighted(pool.map((p) => ({ value: p.key, w: p.w })));
  return String(picked);
}

// ------------------------------------------------------------
// Handlers
// ------------------------------------------------------------
const HANDLERS: Record<string, Handler> = {
  // ---------------- PRINT ----------------
  print_basic: ({ diff, id, topic }) => {
    const exercise: SingleChoiceExercise = {
      id,
      topic,
      difficulty: diff,
      kind: "single_choice",
      title: "print() basics",
      prompt: `Which line correctly prints the message **Hello, world!** ?`,
      options: [
        { id: "a", text: `print(Hello, world!)` },
        { id: "b", text: `print("Hello, world!")` },
        { id: "c", text: `print["Hello, world!"]` },
      ],
      hint: "Strings need quotes, and print uses parentheses.",
    };
    return { archetype: "print_basic", exercise, expected: { kind: "single_choice", optionId: "b" } };
  },

  print_sep: ({ rng, diff, id, topic }) => {
    const a = safeInt(rng, 10, 99);
    const b = safeInt(rng, 100, 999);

    const exercise: SingleChoiceExercise = {
      id,
      topic,
      difficulty: diff,
      kind: "single_choice",
      title: "sep option",
      prompt: String.raw`
What is the output of this code?

~~~python
print("${a}", "${b}", sep=":")
~~~
`.trim(),
      options: [
        { id: "a", text: `${a} ${b}` },
        { id: "b", text: `${a}:${b}` },
        { id: "c", text: `${a}${b}:` },
      ],
      hint: "`sep` controls what goes between comma-separated values.",
    };

    return { archetype: "print_sep", exercise, expected: { kind: "single_choice", optionId: "b" } };
  },

  print_end: ({ rng, diff, id, topic }) => {
    const a = pickWord(rng);
    const b = pickWord(rng);

    const exercise: SingleChoiceExercise = {
      id,
      topic,
      difficulty: diff,
      kind: "single_choice",
      title: "end option",
      prompt: String.raw`
What is the output?

~~~python
print("${a}", end="!")
print("${b}")
~~~
`.trim(),
      options: [
        { id: "a", text: `${a}!\n${b}` },
        { id: "b", text: `${a}!${b}` },
        { id: "c", text: `${a} ${b}` },
      ],
      hint: "`end` changes what print adds at the end (default is a newline).",
    };

    return { archetype: "print_end", exercise, expected: { kind: "single_choice", optionId: "b" } };
  },

  // ---------------- IO + VARS ----------------
  input_stores_string: ({ rng, diff, id, topic }) => {
    const n = safeInt(rng, 2, 9);

    const exercise: SingleChoiceExercise = {
      id,
      topic,
      difficulty: diff,
      kind: "single_choice",
      title: "input() returns a string",
      prompt: String.raw`
User types **${n}**. What prints?

~~~python
x = input()
print(x + "1")
~~~
`.trim(),
      options: [
        { id: "a", text: String(n + 1) },
        { id: "b", text: `${n}1` },
        { id: "c", text: `TypeError` },
      ],
      hint: "input() returns a string unless you convert it.",
    };

    return { archetype: "input_stores_string", exercise, expected: { kind: "single_choice", optionId: "b" } };
  },

  predict_simple_output_with_input: ({ rng, diff, id, topic }) => {
    const word = pickWord(rng);

    const exercise: SingleChoiceExercise = {
      id,
      topic,
      difficulty: diff,
      kind: "single_choice",
      title: "predict output with input()",
      prompt: String.raw`
User types **${word}**. What prints?

~~~python
x = input()
print("You typed:", x)
~~~
`.trim(),
      options: [
        { id: "a", text: `You typed: x` },
        { id: "b", text: `You typed: ${word}` },
        { id: "c", text: `You typed:, ${word}` },
      ],
      hint: "print shows the variable’s value. The comma adds a space by default.",
    };

    return { archetype: "predict_simple_output_with_input", exercise, expected: { kind: "single_choice", optionId: "b" } };
  },

  assignment_direction: ({ rng, diff, id, topic }) => {
    const name = pickName(rng);
    const exercise: SingleChoiceExercise = {
      id,
      topic,
      difficulty: diff,
      kind: "single_choice",
      title: "assignment direction",
      prompt: String.raw`
After this runs, what is the value of **x**?

~~~python
x = "${name}"
~~~
`.trim(),
      options: [
        { id: "a", text: `"${name}"` },
        { id: "b", text: `x` },
        { id: "c", text: `name` },
      ],
      hint: "Assignment copies the value on the right into the variable on the left.",
    };
    return { archetype: "assignment_direction", exercise, expected: { kind: "single_choice", optionId: "a" } };
  },

  variable_reuse: ({ rng, diff, id, topic }) => {
    const a = safeInt(rng, 1, 9);
    const b = safeInt(rng, 1, 9);

    const exercise: SingleChoiceExercise = {
      id,
      topic,
      difficulty: diff,
      kind: "single_choice",
      title: "variable reuse",
      prompt: String.raw`
What prints?

~~~python
x = ${a}
x = x + ${b}
print(x)
~~~
`.trim(),
      options: [
        { id: "a", text: String(a) },
        { id: "b", text: String(a + b) },
        { id: "c", text: String(b) },
      ],
      hint: "The second line updates x using its old value.",
    };

    return { archetype: "variable_reuse", exercise, expected: { kind: "single_choice", optionId: "b" } };
  },

  valid_variable_name: ({ diff, id, topic }) => {
    const exercise: SingleChoiceExercise = {
      id,
      topic,
      difficulty: diff,
      kind: "single_choice",
      title: "valid variable names",
      prompt: `Which is a valid Python variable name?`,
      options: [
        { id: "a", text: `2cool` },
        { id: "b", text: `my-var` },
        { id: "c", text: `my_var` },
      ],
      hint: "Variable names can’t start with a number and can’t contain dashes.",
    };
    return { archetype: "valid_variable_name", exercise, expected: { kind: "single_choice", optionId: "c" } };
  },

  snake_case_style: ({ rng, diff, id, topic }) => {
    const good = pickSnakeCandidate(rng);
    const exercise: SingleChoiceExercise = {
      id,
      topic,
      difficulty: diff,
      kind: "single_choice",
      title: "snake_case style",
      prompt: `Which name follows **snake_case** style?`,
      options: [
        { id: "a", text: `TotalScore` },
        { id: "b", text: `${good}` },
        { id: "c", text: `total-score` },
      ],
      hint: "snake_case uses lowercase letters and underscores.",
    };
    return { archetype: "snake_case_style", exercise, expected: { kind: "single_choice", optionId: "b" } };
  },

  // ---------------- STRINGS ----------------
  string_quotes_valid: ({ diff, id, topic }) => {
    const exercise: SingleChoiceExercise = {
      id,
      topic,
      difficulty: diff,
      kind: "single_choice",
      title: "string quotes",
      prompt: `Which is a valid string literal in Python?`,
      options: [
        { id: "a", text: `"hello"` },
        { id: "b", text: `hello` },
        { id: "c", text: `{hello}` },
      ],
      hint: "Strings must use straight quotes: '...' or \"...\"",
    };
    return { archetype: "string_quotes_valid", exercise, expected: { kind: "single_choice", optionId: "a" } };
  },

  len_basic: ({ rng, diff, id, topic }) => {
    const s = rng.pick(["hi!", "code", "python"] as const);
    const exercise: SingleChoiceExercise = {
      id,
      topic,
      difficulty: diff,
      kind: "single_choice",
      title: "len() basics",
      prompt: String.raw`
What does this print?

~~~python
print(len("${s}"))
~~~
`.trim(),
      options: [
        { id: "a", text: String(s.length) },
        { id: "b", text: String(s.length - 1) },
        { id: "c", text: `len("${s}")` },
      ],
      hint: "len() counts characters.",
    };
    return { archetype: "len_basic", exercise, expected: { kind: "single_choice", optionId: "a" } };
  },

  concat_basic: ({ rng, diff, id, topic }) => {
    const a = pickWord(rng);
    const b = pickWord(rng);
    const exercise: SingleChoiceExercise = {
      id,
      topic,
      difficulty: diff,
      kind: "single_choice",
      title: "string concatenation",
      prompt: String.raw`
What is the value of **x**?

~~~python
x = "${a}" + "${b}"
~~~
`.trim(),
      options: [
        { id: "a", text: `${a}${b}` },
        { id: "b", text: `${a} ${b}` },
        { id: "c", text: `${a}+${b}` },
      ],
      hint: "Using + with strings concatenates without adding spaces.",
    };
    return { archetype: "concat_basic", exercise, expected: { kind: "single_choice", optionId: "a" } };
  },

  // ---------------- MATH + PRECEDENCE ----------------
  type_int_float_string: ({ diff, id, topic }) => {
    const exercise: SingleChoiceExercise = {
      id,
      topic,
      difficulty: diff,
      kind: "single_choice",
      title: "types: int vs float vs str",
      prompt: `Which value is a **string**?`,
      options: [
        { id: "a", text: `42` },
        { id: "b", text: `3.14` },
        { id: "c", text: `"42"` },
      ],
      hint: "Quotes make it a string.",
    };
    return { archetype: "type_int_float_string", exercise, expected: { kind: "single_choice", optionId: "c" } };
  },

  division_is_float: ({ rng, diff, id, topic }) => {
    const a = safeInt(rng, 2, 9);
    const b = safeInt(rng, 2, 9);
    const exercise: SingleChoiceExercise = {
      id,
      topic,
      difficulty: diff,
      kind: "single_choice",
      title: "division produces float",
      prompt: String.raw`
What is the type of this expression in Python?

~~~python
${a} / ${b}
~~~
`.trim(),
      options: [
        { id: "a", text: "int" },
        { id: "b", text: "float" },
        { id: "c", text: "string" },
      ],
      hint: "In Python, / always produces a float.",
    };
    return { archetype: "division_is_float", exercise, expected: { kind: "single_choice", optionId: "b" } };
  },

  precedence_parentheses: ({ diff, id, topic }) => {
    const exercise: SingleChoiceExercise = {
      id,
      topic,
      difficulty: diff,
      kind: "single_choice",
      title: "operator precedence",
      prompt: String.raw`
What is the value of **x**?

~~~python
x = 2 + 3 * 4
~~~
`.trim(),
      options: [
        { id: "a", text: "20" },
        { id: "b", text: "14" },
        { id: "c", text: "24" },
      ],
      hint: "Multiplication happens before addition.",
    };
    return { archetype: "precedence_parentheses", exercise, expected: { kind: "single_choice", optionId: "b" } };
  },

  precedence_power_vs_negative: ({ diff, id, topic }) => {
    const exercise: SingleChoiceExercise = {
      id,
      topic,
      difficulty: diff,
      kind: "single_choice",
      title: "power vs negative",
      prompt: String.raw`
What is the value of **x**?

~~~python
x = -2 ** 2
~~~
`.trim(),
      options: [
        { id: "a", text: "-4" },
        { id: "b", text: "4" },
        { id: "c", text: "-2" },
      ],
      hint: "** happens before the unary minus.",
    };
    return { archetype: "precedence_power_vs_negative", exercise, expected: { kind: "single_choice", optionId: "a" } };
  },

  // ---------------- COMMENTS + ERRORS ----------------
  hash_comment: ({ diff, id, topic }) => {
    const exercise: SingleChoiceExercise = {
      id,
      topic,
      difficulty: diff,
      kind: "single_choice",
      title: "comments",
      prompt: `Which symbol starts a single-line comment in Python?`,
      options: [
        { id: "a", text: "//" },
        { id: "b", text: "#" },
        { id: "c", text: "/* */" },
      ],
      hint: "Python uses # for single-line comments.",
    };
    return { archetype: "hash_comment", exercise, expected: { kind: "single_choice", optionId: "b" } };
  },

  comment_best: ({ diff, id, topic }) => {
    const exercise: SingleChoiceExercise = {
      id,
      topic,
      difficulty: diff,
      kind: "single_choice",
      title: "good comments",
      prompt: `Which is the best reason to write a comment?`,
      options: [
        { id: "a", text: "To repeat exactly what the code already says" },
        { id: "b", text: "To explain intent or tricky logic" },
        { id: "c", text: "To make the file longer" },
      ],
      hint: "Good comments explain why, not what.",
    };
    return { archetype: "comment_best", exercise, expected: { kind: "single_choice", optionId: "b" } };
  },

  docstring_purpose: ({ diff, id, topic }) => {
    const exercise: SingleChoiceExercise = {
      id,
      topic,
      difficulty: diff,
      kind: "single_choice",
      title: "docstrings",
      prompt: `What is a docstring mainly used for?`,
      options: [
        { id: "a", text: "To store secret passwords" },
        { id: "b", text: "To document what a module/function/class does" },
        { id: "c", text: "To speed up Python code" },
      ],
      hint: "Docstrings are documentation strings.",
    };
    return { archetype: "docstring_purpose", exercise, expected: { kind: "single_choice", optionId: "b" } };
  },

  error_type_nameerror: ({ diff, id, topic }) => {
    const exercise: SingleChoiceExercise = {
      id,
      topic,
      difficulty: diff,
      kind: "single_choice",
      title: "NameError",
      prompt: String.raw`
What error happens?

~~~python
print(x)
~~~
`.trim(),
      options: [
        { id: "a", text: "SyntaxError" },
        { id: "b", text: "NameError" },
        { id: "c", text: "TypeError" },
      ],
      hint: "NameError happens when a variable name isn’t defined.",
    };
    return { archetype: "error_type_nameerror", exercise, expected: { kind: "single_choice", optionId: "b" } };
  },

  error_type_syntaxerror_quote: ({ diff, id, topic }) => {
    const exercise: SingleChoiceExercise = {
      id,
      topic,
      difficulty: diff,
      kind: "single_choice",
      title: "SyntaxError: quotes",
      prompt: String.raw`
What error happens?

~~~python
print("hi)
~~~
`.trim(),
      options: [
        { id: "a", text: "IndentationError" },
        { id: "b", text: "NameError" },
        { id: "c", text: "SyntaxError" },
      ],
      hint: "Unclosed quotes cause SyntaxError.",
    };
    return { archetype: "error_type_syntaxerror_quote", exercise, expected: { kind: "single_choice", optionId: "c" } };
  },

  error_type_indentation: ({ diff, id, topic }) => {
    const exercise: SingleChoiceExercise = {
      id,
      topic,
      difficulty: diff,
      kind: "single_choice",
      title: "IndentationError",
      prompt: `Which error is commonly caused by incorrect indentation in Python?`,
      options: [
        { id: "a", text: "IndentationError" },
        { id: "b", text: "ImportError" },
        { id: "c", text: "ValueError" },
      ],
      hint: "Python uses indentation as syntax.",
    };
    return { archetype: "error_type_indentation", exercise, expected: { kind: "single_choice", optionId: "a" } };
  },

  read_error_line_number: ({ diff, id, topic }) => {
    const exercise: SingleChoiceExercise = {
      id,
      topic,
      difficulty: diff,
      kind: "single_choice",
      title: "reading tracebacks",
      prompt: `In a Python traceback, what does the line number usually tell you?`,
      options: [
        { id: "a", text: "The exact line where Python noticed the error" },
        { id: "b", text: "The number of variables in your program" },
        { id: "c", text: "The amount of RAM used" },
      ],
      hint: "It points to where the error was detected.",
    };
    return { archetype: "read_error_line_number", exercise, expected: { kind: "single_choice", optionId: "a" } };
  },

  // ---------------- CODE INPUT ----------------
  code_print_hello: ({ diff, id, topic }) => {
    const exercise: CodeInputExercise = {
      id,
      topic,
      difficulty: diff,
      kind: "code_input",
      title: "CodeInput: print()",
      prompt: String.raw`
Write code that prints **Hello, world!** exactly.

~~~python
# Write your code below
~~~
`.trim(),
      language: "python",
      starterCode: `# TODO: print Hello, world! exactly\n`,
      hint: `Use print("...") with quotes.`,
    };

    const expected = makeCodeExpected({
      language: "python",
      tests: [{ stdin: "", stdout: "Hello, world!\n", match: "exact" }],
        solutionCode: `print("Hello, world!")\n`,

    });

    return { archetype: "code_print_hello", exercise, expected };
  },

  code_input_echo: ({ rng, diff, id, topic }) => {
    const w = pickWord(rng);

    const exercise: CodeInputExercise = {
      id,
      topic,
      difficulty: diff,
      kind: "code_input",
      title: "CodeInput: input() + print()",
      prompt: String.raw`
The user will type **${w}**.

Write code that reads one line and prints:

\`You typed: <word>\`

Example output for input \`${w}\`:

\`You typed: ${w}\`

~~~python
# Read input and print the required message
~~~
`.trim(),
      language: "python",
      starterCode: `x = input()\n# TODO: print "You typed: <x>"\n`,
      hint: `Use print("You typed:", x) or f-strings.`,
    };

    // ✅ Use exact match: expected output is fully specified
    const expected = makeCodeExpected({
      language: "python",
      tests: [{ stdin: `${w}\n`, stdout: `You typed: ${w}\n`, match: "exact" }],
        solutionCode: `x = input()\nprint("You typed:", x)\n`,

    });

    return { archetype: "code_input_echo", exercise, expected };
  },

  code_numbers_sum: ({ rng, diff, id, topic }) => {
    const a = safeInt(rng, 2, 9);
    const b = safeInt(rng, 2, 9);

    const exercise: CodeInputExercise = {
      id,
      topic,
      difficulty: diff,
      kind: "code_input",
      title: "CodeInput: int conversion",
      prompt: String.raw`
The user will type **two lines**:

First: **${a}**
Second: **${b}**

Write code that reads both, converts to integers, and prints their sum.

Expected output:
\`${a + b}\`

~~~python
# Read two lines and print the sum
~~~
`.trim(),
      language: "python",
      starterCode: `# TODO: read two lines\nx = input()\ny = input()\n# TODO: convert and print sum\n`,
      hint: `Use int(input()) to convert.`,
    };

    const expected = makeCodeExpected({
      language: "python",
      tests: [{ stdin: `${a}\n${b}\n`, stdout: `${a + b}\n`, match: "exact" }],
        solutionCode: `
        ~~~python
        x = int(input())\ny = int(input())\nprint(x + y)\n
        ~~~
        `.trim() ,
    });

    return { archetype: "code_numbers_sum", exercise, expected };
  },

  // ultimate fallback (should be rare now)
  fallback: ({ rng, diff, id, topic }) => {
    const word = pickWord(rng);
    const exercise: SingleChoiceExercise = {
      id,
      topic,
      difficulty: diff,
      kind: "single_choice",
      title: "Python basics (fallback)",
      prompt: String.raw`
A user types **${word}**.

What prints?

~~~python
x = input()
print("You typed:", x)
~~~
`.trim(),
      options: [
        { id: "a", text: `You typed: x` },
        { id: "b", text: `You typed: ${word}` },
        { id: "c", text: `You typed:, ${word}` },
      ],
      hint: "print shows the variable’s value.",
    };
    return { archetype: "fallback", exercise, expected: { kind: "single_choice", optionId: "b" } };
  },
};

// Safe “mixed” = only implemented handlers (excluding fallback)
const SAFE_MIXED_POOL: PoolItem[] = Object.keys(HANDLERS)
  .filter((k) => k !== "fallback")
  .map((k) => ({ key: k, w: 1 }));


export function makeGenPythonStatementsPart1(ctx: TopicContext) {
  return (rng: RNG, diff: Difficulty, id: string): GenOut<ExerciseKind> => {
    const R: RNG = (ctx as any).rng ?? rng; // 👈 prefer ctx.rng if provided by /api/practice
    const topic = String(ctx.topicSlug);

    const base = readPoolFromMeta(ctx.meta).filter((p) => p.key in HANDLERS);

    const preferKind = (ctx.preferKind ?? ctx.meta?.preferKind ?? null) as PracticeKind | null;

    const filtered = preferKind ? base.filter((p) => !p.kind || p.kind === preferKind) : base;

    const pool =
      (filtered.length ? filtered : base).length
        ? (filtered.length ? filtered : base)
        : SAFE_MIXED_POOL;

    const key = weightedKey(R, pool);
    const handler = HANDLERS[key] ?? HANDLERS.fallback;

    return handler({ rng: R, diff, id, topic });
  };
}


