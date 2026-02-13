// src/components/code/runner/utils/input/input.java.ts
export function extractJavaPrintPrompts(code: string): string[] {
    const src = String(code ?? "");
    const out: string[] = [];

    const re = /System\.out\.print(?:ln)?\(\s*"([^"]*)"\s*\)\s*;/g;
    for (const m of src.matchAll(re)) {
        const s = String(m[1] ?? "");
        if (/[?:]\s*$/.test(s.trim())) out.push(s.trimEnd());
    }
    return out;
}

export function countJavaInputs(code: string): number {
    const src = String(code ?? "");
    // very common beginner patterns:
    // sc.nextLine(), sc.nextInt(), etc.
    const m = src.match(/\.\s*next(?:Line|Int|Long|Double|Float|Boolean)\s*\(/g);
    return m ? m.length : 0;
}
