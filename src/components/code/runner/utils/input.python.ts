// src/lib/code/utils/input.python.ts
import type { RunResult } from "@/lib/code/runCode";
import { cleanTermText, toLines } from "./text";

export function extractInputPromptsPython(src: string) {
    const s = String(src ?? "");
    const out: string[] = [];

    // input("...") or input('...') (string literals)
    const re = /\binput\s*\(\s*(['"])((?:\\.|(?!\1)[\s\S])*)\1\s*\)/g;

    for (const m of s.matchAll(re)) {
        out.push(unescapePyLike(m[2] ?? "").trimEnd());
    }
    return out;
}

function unescapePyLike(x: string) {
    return String(x)
        .replace(/\\\\/g, "\\")
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t")
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'");
}

export function extractFirstInputPrompt(src: string) {
    return extractInputPromptsPython(src)[0] ?? "";
}

// (you can keep findPromptSplit, but python won’t need it anymore)
export function findPromptSplit(stdout: string, prompt: string) {
    const out = String(stdout ?? "");
    const p = String(prompt ?? "");
    if (!out || !p) return { found: false, pre: out, post: "" };

    const cand = [p, p + " ", p.trimEnd(), p.trimEnd() + " "].filter(Boolean);

    // use lastIndexOf (safer)
    let bestIdx = -1;
    let bestLen = 0;

    for (const c of cand) {
        const idx = out.lastIndexOf(c);
        if (idx >= 0 && idx >= bestIdx) {
            bestIdx = idx;
            bestLen = c.length;
        }
    }

    if (bestIdx >= 0) {
        return { found: true, pre: out.slice(0, bestIdx), post: out.slice(bestIdx + bestLen) };
    }
    return { found: false, pre: out, post: "" };
}

export function detectNeedsInputPython(r: RunResult, srcCode?: string) {
    const errBlob = cleanTermText(
        (r.compile_output ?? "") +
        "\n" +
        (r.stderr ?? "") +
        "\n" +
        (r.message ?? "") +
        "\n" +
        (r.error ?? ""),
    );

    let needs =
        /\bEOFError\b/.test(errBlob) ||
        /EOFError: EOF when reading a line/.test(errBlob) ||
        /\binput\(\)/.test(errBlob);

    if (!needs && srcCode && /\binput\s*\(/.test(srcCode)) {
        const endedWithIssue =
            r.ok === false || !!r.compile_output || !!r.stderr || !!r.message || !!r.error;
        if (endedWithIssue) needs = true;
    }

    const outLines = toLines(r.stdout ?? "");
    const lastNonEmpty = [...outLines].reverse().find((l) => l.trim().length) ?? "";
    return { needs, prompt: lastNonEmpty };
}



// utils/input.python.ts
export function countPythonInputs(src: string) {
    const s = String(src ?? "");
    const m = s.match(/\binput\s*\(/g);
    return m ? m.length : 0;
}
