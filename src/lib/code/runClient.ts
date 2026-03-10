import type { RunPollResult, RunReq, RunResult, RunSubmitResult } from "@/lib/code/runCode";

function sleep(ms: number, signal?: AbortSignal) {
    return new Promise<void>((resolve, reject) => {
        const cleanup = () => signal?.removeEventListener("abort", onAbort);

        const id = window.setTimeout(() => {
            cleanup();
            resolve();
        }, ms);

        const onAbort = () => {
            window.clearTimeout(id);
            cleanup();
            reject(new DOMException("Aborted", "AbortError"));
        };

        signal?.addEventListener("abort", onAbort);
    });
}

export async function runViaApi(req: RunReq, signal?: AbortSignal): Promise<RunResult> {
    try {
        const submitRes = await fetch("/api/run", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req),
            signal,
        });

        const submitText = await submitRes.text();

        let submitData: RunSubmitResult;
        try {
            submitData = JSON.parse(submitText) as RunSubmitResult;
        } catch {
            return {
                ok: false,
                status: "Error",
                error: `Non-JSON submit response (${submitRes.status}): ${submitText.slice(0, 300)}`,
            };
        }

        if (!submitData.ok) {
            return {
                ok: false,
                status: "Error",
                error: submitData.error,
            };
        }

        const maxPolls = 120;

        for (let i = 0; i < maxPolls; i++) {
            const pollRes = await fetch(`/api/run/${encodeURIComponent(submitData.token)}`, {
                method: "GET",
                signal,
            });

            const pollText = await pollRes.text();

            let pollData: RunPollResult;
            try {
                pollData = JSON.parse(pollText) as RunPollResult;
            } catch {
                return {
                    ok: false,
                    status: "Error",
                    error: `Non-JSON poll response (${pollRes.status}): ${pollText.slice(0, 300)}`,
                };
            }

            if (pollData.done) return pollData;

            await sleep(250, signal);
        }

        return {
            ok: false,
            status: "Timeout",
            error: "Execution timed out while waiting for Judge0.",
        };
    } catch (e: any) {
        if (e?.name === "AbortError") {
            return {
                ok: false,
                status: "Canceled",
                error: "Run canceled by user.",
            };
        }

        return {
            ok: false,
            status: "Error",
            error: e?.message ?? "Run failed.",
        };
    }
}