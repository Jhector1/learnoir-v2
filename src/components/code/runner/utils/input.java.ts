import type { RunResult } from "@/lib/code/runCode";
import { cleanTermText } from "./text";

export function extractJavaPrintPrompts(code: string): string[] {
    const src = String(code ?? "");
    const out: string[] = [];

    // matches: System.out.print("...") and println("...")
    const re = /System\.out\.print(?:ln)?\(\s*"([^"]*)"\s*\)\s*;/g;

    for (const m of src.matchAll(re)) {
        const s = String(m[1] ?? "");
        if (/[?:]\s*$/.test(s.trim())) out.push(s.trimEnd());
    }

    return out;
}

export function detectNeedsInputJava(r: RunResult) {
    const errBlob = cleanTermText(
        (r.compile_output ?? "") +
        "\n" +
        (r.stderr ?? "") +
        "\n" +
        (r.message ?? "") +
        "\n" +
        (r.error ?? ""),
    );

    const needs =
        /NoSuchElementException/.test(errBlob) ||
        /java\.util\.NoSuchElementException/.test(errBlob) ||
        /Scanner/.test(errBlob);

    return { needs };
}
