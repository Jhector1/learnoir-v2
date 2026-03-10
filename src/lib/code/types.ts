






import { CodeLanguage } from "@/lib/practice/types";

export type FileEntry = { path: string; content: string };

export type RunLimits = {
    cpu_time_limit?: number;
    wall_time_limit?: number;
    memory_limit?: number;
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
    files: Record<string, string> | FileEntry[];
    stdin?: string;
    limits?: RunLimits;
};

export type RunResult = {
    ok: boolean;
    status?: string;
    stdout?: string | null;
    stderr?: string | null;
    compile_output?: string | null;
    message?: string | null;
    time?: number | string | null;
    memory?: number | null;
    error?: string;
};

export type RunSubmitResult =
    | { ok: true; token: string }
    | { ok: false; error: string };

export type RunPollResult = RunResult & {
    done: boolean;
    token?: string;
    statusId?: number;
};