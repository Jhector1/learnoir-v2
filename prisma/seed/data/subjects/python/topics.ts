import { TopicDefCompat } from "../_types";
import { PY_MOD0 } from "./constants";

export const PY_TOPICS = {
  [PY_MOD0]: [
    {
      id: "print",
      meta: {
        label: "Printing output: print(), sep, end",
        minutes: 10,
        pool: [
          { key: "print_basic", w: 5, kind: "single_choice" },
          { key: "print_sep", w: 4, kind: "single_choice" },
          { key: "print_end", w: 3, kind: "single_choice" },

          // (optional) later you can add:
          // { key: "code_print_hello", w: 2, kind: "code_input" },
        ],
      },
    },

    {
      id: "io_vars",
      meta: {
        label: "Input + variables",
        minutes: 14,
        pool: [
          { key: "input_stores_string", w: 4, kind: "single_choice" },
          {
            key: "predict_simple_output_with_input",
            w: 3,
            kind: "single_choice",
          },
          { key: "assignment_direction", w: 4, kind: "single_choice" },
          { key: "variable_reuse", w: 3, kind: "single_choice" },
          { key: "valid_variable_name", w: 3, kind: "single_choice" },
          { key: "snake_case_style", w: 2, kind: "single_choice" },

          // ✅ code mode options (used when preferKind="code_input")
          { key: "code_input_echo", w: 3, kind: "code_input" },
          { key: "code_numbers_sum", w: 2, kind: "code_input" },
        ],
      },
    },

    {
      id: "strings",
      meta: {
        label: "Strings: quotes, len(), joining text",
        minutes: 12,
        pool: [
          { key: "string_quotes_valid", w: 4, kind: "single_choice" },
          { key: "len_basic", w: 4, kind: "single_choice" },
          { key: "concat_basic", w: 4, kind: "single_choice" },

          // optional:
          // { key: "code_string_concat", w: 2, kind: "code_input" },
        ],
      },
    },

    {
      id: "math_precedence",
      meta: {
        label: "Math + operator precedence",
        minutes: 14,
        pool: [
          { key: "type_int_float_string", w: 3, kind: "single_choice" },
          { key: "division_is_float", w: 3, kind: "single_choice" },
          { key: "precedence_parentheses", w: 4, kind: "single_choice" },
          { key: "precedence_power_vs_negative", w: 3, kind: "single_choice" },

          // optional:
          // { key: "code_precedence_print", w: 2, kind: "code_input" },
        ],
      },
    },

    {
      id: "comments_errors",
      meta: {
        label: "Comments + docstrings + reading errors",
        minutes: 16,
        pool: [
          { key: "hash_comment", w: 3, kind: "single_choice" },
          { key: "comment_best", w: 2, kind: "single_choice" },
          { key: "docstring_purpose", w: 2, kind: "single_choice" },
          { key: "error_type_nameerror", w: 4, kind: "single_choice" },
          { key: "error_type_syntaxerror_quote", w: 4, kind: "single_choice" },
          { key: "error_type_indentation", w: 3, kind: "single_choice" },
          { key: "read_error_line_number", w: 3, kind: "single_choice" },

          // optional:
          // { key: "code_fix_syntaxerror_quote", w: 2, kind: "code_input" },
        ],
      },
    },

    {
      id: "foundations",
      variant: null, // ✅ mixed
      meta: {
        label: "Python foundations (mixed)",
        minutes: 0,

        /**
         * ✅ DB-owned mixed pool (recommended).
         * If you really want to omit pool and rely on SAFE_MIXED_POOL, delete this.
         */
        pool: [
          // a few across categories
          { key: "print_basic", w: 2, kind: "single_choice" },
          { key: "input_stores_string", w: 2, kind: "single_choice" },
          { key: "len_basic", w: 2, kind: "single_choice" },
          { key: "precedence_parentheses", w: 2, kind: "single_choice" },
          { key: "hash_comment", w: 1, kind: "single_choice" },

          // and some code_input options
          { key: "code_print_hello", w: 2, kind: "code_input" },
          { key: "code_input_echo", w: 2, kind: "code_input" },
          { key: "code_numbers_sum", w: 1, kind: "code_input" },
        ],
      },
    },
  ],
} satisfies Record<string, TopicDefCompat[]>;
