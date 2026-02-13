import type { Lang, RunResult } from "@/lib/code/runCode";
import { toLines } from "./text";

import {
    countPythonInputs,
    detectNeedsInputPython,
    extractFirstInputPrompt, extractInputPromptsPython,
    findPromptSplit,
} from "./input.python";
import { detectNeedsInputJava, extractJavaPrintPrompts } from "./input.java";
import { extractCPrintfPrompts, countCInputs } from "./input.c";
import { extractCppCoutPrompts, countCppInputs } from "./input.cpp";
import { stripPromptsFromStdout } from "./input.shared";

export { stripPromptsFromStdout };
export { extractFirstInputPrompt, findPromptSplit };
export { extractJavaPrintPrompts };
export { extractCPrintfPrompts, countCInputs };
export { extractCppCoutPrompts, countCppInputs };

export function detectNeedsInput(lang: Lang, r: RunResult, srcCode?: string) {
    if (lang === "python") return detectNeedsInputPython(r, srcCode);
    if (lang === "java") {
        const { needs } = detectNeedsInputJava(r);
        const outLines = toLines(r.stdout ?? "");
        const lastNonEmpty = [...outLines].reverse().find((l) => l.trim().length) ?? "";
        return { needs, prompt: lastNonEmpty };
    }
    return { needs: false, prompt: "" };
}

export function inferInputPlan(lang: Lang, code: string) {
    if (lang === "python") {
        const prompts = extractInputPromptsPython(code);
        const expected = Math.max(countPythonInputs(code), prompts.length);
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
