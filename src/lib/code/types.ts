export type Lang = "python" | "java" | "javascript" | "c" | "cpp";

export type FileEntry = { path: string; content: string };

// Backward compatible:
// - old: { language, code, stdin }
// - new: { language, entry, files, stdin }
export type RunReq =
    | { language: Lang; code: string; stdin?: string }
    | { language: Lang; entry: string; files: FileEntry[]; stdin?: string };

export type RunResult = {
    ok: boolean;
    status?: string;
    stdout?: string | null;
    stderr?: string | null;
    compile_output?: string | null;
    message?: string | null;
    time?: number | string | null;
    memory?: number | null; // KB (Judge0)
    error?: string;
};
