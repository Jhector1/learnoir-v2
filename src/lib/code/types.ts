import {CodeLanguage} from "@/lib/practice/types";

export type FileEntry = { path: string; content: string };

// Backward compatible:
// - old: { language, code, stdin }
// - new: { language, entry, files, stdin }
// export type RunReq =
export type RunLimits = {
    cpu_time_limit?: number;   // seconds
    wall_time_limit?: number;  // seconds
    memory_limit?: number;     // KB
};
export type RunReq =
    | {
    language: CodeLanguage;
    code: string;
    stdin?: string;
    limits?: RunLimits;
}
    | {
    language: CodeLanguage;
    entry: string;
    files: Record<string, string>;
    stdin?: string;
    limits?: RunLimits;
};

export type RunResult = {
    ok: boolean;
    // error: string;
    status?: string;
    stdout?: string | null;
    stderr?: string | null;
    compile_output?: string | null;
    message?: string | null;
    time?: number | string | null;
    memory?: number | null; // KB (Judge0)
    error?: string;
};
