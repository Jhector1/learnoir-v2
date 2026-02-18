"use client";

import React, { useMemo, useState } from "react";
import MathMarkdown from "@/components/markdown/MathMarkdown";

type Mode = "comments" | "docstring";

export default function CommentsDocstringsSketch() {
  const [mode, setMode] = useState<Mode>("comments");

  const code = useMemo(() => {
    if (mode === "comments") {
      return `# Display the menu options
print("Lunch Menu")
print("----------")
print("Burrito")
print("Taco")
print("Salad")
print()  # End of menu

# Get the user's preferences
item1 = input("Item #1: ")
item2 = input("Item #2: ")`;
    }
    return `"""Gravity calculation.

This program asks for a mass (in kg) and prints the weight on Earth.
Author: Your Name
"""

mass = float(input("Mass (kg): "))
g = 9.81
weight = mass * g
print("Weight (N):", weight)`;
  }, [mode]);

  const hud = useMemo(() => {
    return String.raw`
**Comments vs docstrings**

- **Comments** start with \(\#\) and explain code *for readers*
- **Docstrings** are documentation strings (often triple quotes) used to describe a module/function

Good comments:
- explain **purpose**, not just repeat the line
- separate logical sections with blank lines
`.trim();
  }, []);

  return (
    <div className="w-full">
      <div className="grid gap-3 md:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center gap-2">
            <div className="text-xs font-extrabold text-white/70">Mode</div>
            {(["comments", "docstring"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={[
                  "rounded-xl border px-3 py-1 text-xs font-extrabold transition",
                  mode === m
                    ? "border-sky-300/30 bg-sky-300/10 text-white/90"
                    : "border-white/10 bg-white/5 text-white/75 hover:bg-white/10",
                ].join(" ")}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-3">
            <div className="text-xs font-extrabold text-white/70">Example</div>
            <pre className="mt-2 whitespace-pre-wrap text-xs text-white/85">{code}</pre>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <MathMarkdown className="text-sm text-white/80 [&_.katex]:text-white/90" content={hud} />
        </div>
      </div>
    </div>
  );
}
