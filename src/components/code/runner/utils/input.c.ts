export function extractCPrintfPrompts(code: string): string[] {
    const src = String(code ?? "");
    const out: string[] = [];
    const re = /\bprintf\s*\(\s*"([^"]*)"\s*(?:,|\))/g;

    for (const m of src.matchAll(re)) {
        const s = String(m[1] ?? "").replace(/\\n/g, "\n");
        if (/[?:]\s*$/.test(s.trim())) out.push(s.trimEnd());
    }
    return out;
}

export function countCInputs(code: string): number {
    const src = String(code ?? "");
    return (src.match(/\bscanf\s*\(/g) ?? []).length;
}
