// src/lib/code/runCode.ts
// ✅ server-safe runner used by BOTH /api/run and /api/practice/validate
export type Lang = "python" | "java";

export type RunResult = {
  ok: boolean;
  status?: string;
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  time?: string | null;
  memory?: number | null;
  error?: string;
};

export async function runCode(args: { language: Lang; code: string; stdin?: string }): Promise<RunResult> {
  const { language, code, stdin = "" } = args;

  // Map your app language to Judge0 language IDs (adjust if yours differ)
  const language_id = language === "python" ? 71 : 62; // 71=Python(3), 62=Java (example)

  const url = process.env.JUDGE0_URL;
  if (!url) {
    return { ok: false, error: "Missing JUDGE0_URL env var." };
  }

  try {
    const res = await fetch(
      `${url.replace(/\/$/, "")}/submissions?base64_encoded=false&wait=true`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language_id,
          source_code: code,
          stdin,
        }),
      }
    );

    const text = await res.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      return { ok: false, error: `Non-JSON response (${res.status}): ${text.slice(0, 300)}` };
    }

    // Judge0 "Accepted" status id is typically 3; treat others as not ok
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
      error: accepted ? undefined : undefined,
    };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Run failed." };
  }
}
