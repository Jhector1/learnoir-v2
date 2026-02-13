import type { Lang } from "@/lib/code/runCode";

export function monacoLang(l: Lang) {
    if (l === "python") return "python";
    if (l === "java") return "java";
    if (l === "javascript") return "javascript";
    return "cpp";
}
