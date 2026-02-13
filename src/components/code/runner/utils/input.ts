// src/components/code/runner/utils/input/index.ts
import type { Lang } from "@/lib/code/runCode";
import { extractInputPromptsPython, countPythonInputs } from "./input.python";
import { extractJavaPrintPrompts, countJavaInputs } from "./input.java";
import { extractCPrintfPrompts, countCInputs } from "./input.c";
import { extractCppCoutPrompts, countCppInputs } from "./input.cpp";

export function inferInputPlan(lang: Lang, code: string) {
    if (lang === "python") {
        const prompts = extractInputPromptsPython(code);
        const expected = Math.max(countPythonInputs(code), prompts.length);
        return { expected, prompts };
    }

    if (lang === "java") {
        const prompts = extractJavaPrintPrompts(code);
        const expected = Math.max(countJavaInputs(code), prompts.length);
        return { expected, prompts };
    }

    if (lang === "c") {
        const prompts = extractCPrintfPrompts(code);
        const expected = Math.max(countCInputs(code), prompts.length);
        return { expected, prompts };
    }

    if (lang === "cpp") {
        const prompts = extractCppCoutPrompts(code);
        const expected = Math.max(countCppInputs(code), prompts.length);
        return { expected, prompts };
    }

    return { expected: 0, prompts: [] as string[] };
}
