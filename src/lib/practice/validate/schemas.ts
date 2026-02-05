// src/lib/practice/validate/schemas.ts
import { z } from "zod";

const Vec3Schema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number().optional(),
});

const CodeTestSchema = z.object({
  stdin: z.string().optional().default(""),
  stdout: z.string().optional().default(""),
  match: z.enum(["exact", "includes"]).optional(),
});

// expected schema used only inside the grader (code_input)
export const CodeExpectedSchema = z
  .object({
    kind: z.literal("code_input"),
    language: z.enum(["python", "java"]).optional(),
    stdout: z.string().optional(),
    stdin: z.string().optional(),
    tests: z.array(CodeTestSchema).optional(),
    solutionCode: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    const hasStdout = typeof v.stdout === "string" && v.stdout.length > 0;
    const hasTests = Array.isArray(v.tests) && v.tests.length > 0;
    if (!hasStdout && !hasTests) {
      ctx.addIssue({
        code: "custom",
        path: ["stdout"],
        message: "code_input expected must include stdout or tests[]",
      });
    }
  });

// accept key as string OR wrapped object (token/key/value)
const KeySchema = z.union([
  z.string().min(10),
  z.object({ token: z.string().min(10) }).passthrough(),
  z.object({ key: z.string().min(10) }).passthrough(),
  z.object({ value: z.string().min(10) }).passthrough(),
]);

const SubmitAnswerSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("single_choice"), optionId: z.string().min(1) }),
  z.object({
    kind: z.literal("multi_choice"),
    optionIds: z.array(z.string().min(1)).min(1),
  }),
  z.object({ kind: z.literal("numeric"), value: z.number() }),
  z.object({
    kind: z.literal("vector_drag_target"),
    a: Vec3Schema,
    b: Vec3Schema.optional(),
  }),
  z.object({ kind: z.literal("vector_drag_dot"), a: Vec3Schema }),
  z.object({
    kind: z.literal("matrix_input"),
    values: z.array(z.array(z.number())),
  }),

  // code input: accept code or source
  z
    .object({
      kind: z.literal("code_input"),
      language: z.enum(["python", "java"]).optional(),
      code: z.string().optional(),
      source: z.string().optional(),
      stdin: z.string().optional(),
    })
    .superRefine((v, ctx) => {
      const code = (v.code ?? v.source ?? "").trim();
      if (!code) {
        ctx.addIssue({
          code: "custom",
          path: ["code"],
          message: "Missing code.",
        });
      }
    }),
]);

export const BodySchema = z
  .object({
    key: KeySchema,
    reveal: z.boolean().optional(),
    answer: SubmitAnswerSchema.optional(),
  })
  .superRefine((val, ctx) => {
    if (!val.reveal && !val.answer) {
      ctx.addIssue({
        code: "custom",
        path: ["answer"],
        message: "Missing answer.",
      });
    }
  });

export type ValidateBody = z.infer<typeof BodySchema>;
export type SubmitAnswer = z.infer<typeof SubmitAnswerSchema>;

export function normalizeKey(input: unknown): string | null {
  if (typeof input === "string") return input;
  if (input && typeof input === "object") {
    const any = input as any;
    if (typeof any.token === "string") return any.token;
    if (typeof any.key === "string") return any.key;
    if (typeof any.value === "string") return any.value;
  }
  return null;
}
