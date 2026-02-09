// src/lib/practice/validate/grade/codeInput.ts
import type { GradeResult } from ".";
import type { LoadedInstance } from "../load";
import type { SubmitAnswer } from "../schemas";
import { CodeExpectedSchema } from "../schemas";
import { normOut } from "../utils/output";

// ✅ recommended: move runner to lib (server-safe)
import { runCode } from "@/lib/code/runCode";
import type { CodeLanguage } from "@/lib/practice/types";

export async function gradeCodeInput(args: {
  instance: LoadedInstance;
  expectedCanon: any;
  answer: SubmitAnswer | null;
  isReveal: boolean;
}): Promise<GradeResult> {
  const expParsed = CodeExpectedSchema.safeParse(args.expectedCanon);
  if (!expParsed.success) {
    return {
      ok: false,
      revealAnswer: null,
      explanation: "Server bug: code_input missing tests/stdout.",
    };
  }

  const exp = expParsed.data;
  const expLang = exp.language ?? "python";

  const normLinewise = (s: string) =>
    String(s ?? "")
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+\n/g, "\n");

  const matchOutput = (
    got: string,
    want: string,
    mode: "exact" | "includes" = "exact",
  ) => {
    const G = normLinewise(normOut(got));
    const W = normLinewise(normOut(want));
    return mode === "includes" ? G.includes(W.trim()) : G === W;
  };

  if (args.isReveal) {
    return {
      ok: false,
      revealAnswer: {
        kind: "code_input",
        language: expLang,
        solutionCode: exp.solutionCode ?? "",
        stdin: exp.stdin ?? "",
        stdout: exp.stdout ?? undefined,
        tests: exp.tests ?? undefined,
      },
      explanation: "Solution shown.",
    };
  }

  const gotLang = String((args.answer as any)?.language ?? expLang) as CodeLanguage;
  const gotCode = String((args.answer as any)?.code ?? "");
  if (!gotCode.trim()) {
    return { ok: false, revealAnswer: null, explanation: "Missing code." };
  }

  // grade by tests[] first
  if (exp.tests?.length) {
    const results: any[] = [];
    let allPass = true;

    for (const [i, tc] of exp.tests.entries()) {
      const run = await runCode({
        language: gotLang,
        code: gotCode,
        stdin: tc.stdin ?? "",
      });

      const pass =
        Boolean(run?.ok) &&
        matchOutput(run.stdout ?? "", tc.stdout, tc.match ?? "exact");

      results.push({
        i,
        ok: Boolean(run?.ok),
        pass,
        stdout: run?.stdout ?? "",
        stderr: run?.stderr ?? "",
        compile_output: run?.compile_output ?? "",
      });

      if (!pass) allPass = false;
    }

    return {
      ok: allPass,
      revealAnswer: null,
      explanation: allPass ? "Correct." : "Some tests failed.",
    };
  }

  // stdout-only grading
  const run = await runCode({
    language: gotLang,
    code: gotCode,
    stdin: exp.stdin ?? "",
  });

  if (!run?.ok) {
    const err =
      (run?.error ??
        run?.message ??
        String(run?.compile_output ?? "").trim()) ||
      String(run?.stderr ?? "").trim() ||
      "Run failed.";

    return { ok: false, revealAnswer: null, explanation: err };
  }

  const ok = matchOutput(run.stdout ?? "", exp.stdout ?? "", "exact");

  return {
    ok,
    revealAnswer: null,
    explanation: ok ? "Correct." : "Output didn't match expected.",
  };
}
