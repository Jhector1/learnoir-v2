import type { SubjectTopic } from "../../types";

export const PY_TOPICS: readonly SubjectTopic[] = [
  { slug: "py0.print", label: "Printing output: print(), sep, end", group: "Basics" },
  { slug: "py0.io_vars", label: "Input + variables", group: "Basics" },
  { slug: "py0.strings", label: "Strings", group: "Basics" },
  { slug: "py0.math_precedence", label: "Math + precedence", group: "Basics" },
  { slug: "py0.comments_errors", label: "Comments + reading errors", group: "Basics" },
] as const;
