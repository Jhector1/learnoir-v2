import type { RunResult } from "./types";

export async function postJudge0(url: string, body: any): Promise<RunResult> {
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const text = await res.text();
    let data: any;
    try {
        data = JSON.parse(text);
    } catch {
        return {
            ok: false,
            error: `Non-JSON response (${res.status}): ${text.slice(0, 300)}`,
        };
    }

    const statusId = Number(data?.status?.id ?? 0);
    const accepted = statusId === 3;

    return {
        ok: accepted,
        status: data?.status?.description ?? (accepted ? "Accepted" : "Not Accepted"),
        stdout: data?.stdout ?? null,
        stderr: data?.stderr ?? null,
        compile_output: data?.compile_output ?? null,
        message: data?.message ?? null,
        time: data?.time ?? null,
        memory: data?.memory ?? null,
        error: data?.error ?? undefined,
    };
}
