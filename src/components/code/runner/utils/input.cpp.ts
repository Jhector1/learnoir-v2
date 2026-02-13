export function extractCppCoutPrompts(code: string): string[] {
    const src = String(code ?? "");
    const out: string[] = [];

    const re = /\b(?:std::)?cout\s*<<\s*"([^"]*)"/g;
    for (const m of src.matchAll(re)) {
        const s = String(m[1] ?? "").replace(/\\n/g, "\n");
        if (/[?:]\s*$/.test(s.trim())) out.push(s.trimEnd());
    }
    return out;
}

export function countCppInputs(code: string): number {
    const src = String(code ?? "");
    const cin = (src.match(/\b(?:std::)?cin\s*>>/g) ?? []).length;
    const getline = (src.match(/\bgetline\s*\(/g) ?? []).length;
    return cin + getline;
}
