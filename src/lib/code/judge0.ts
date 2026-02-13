// src/lib/code/judge0.ts
import type { RunResult } from "./types";

function fromB64(s: any): string | null {
    if (s == null) return null;
    if (typeof s !== "string") return String(s);
    try {
        return Buffer.from(s, "base64").toString("utf8");
    } catch {
        return s;
    }
}

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
        return { ok: false, error: `Non-JSON response (${res.status}): ${text.slice(0, 300)}` };
    }

    const statusId = Number(data?.status?.id ?? 0);
    const accepted = statusId === 3;

    return {
        ok: accepted,
        status: data?.status?.description ?? (accepted ? "Accepted" : "Not Accepted"),
        stdout: fromB64(data?.stdout),
        stderr: fromB64(data?.stderr),
        compile_output: fromB64(data?.compile_output),
        message: fromB64(data?.message),
        time: data?.time ?? null,
        memory: data?.memory ?? null,
        error: data?.error ?? undefined,
    };
}
