import { zipProject } from "./projectZip";
import { postJudge0 } from "./judge0";
import { getSingleFileLanguageId } from "./langIds";
import type { RunReq, RunResult } from "./types";

export * from "./types";

function b64(s: string) {
  return Buffer.from(String(s ?? ""), "utf8").toString("base64");
}
function recordToFileEntries(files: Record<string, string>) {
  return Object.entries(files).map(([path, content]) => ({
    path,
    content,
  }));
}
export async function runCode(req: RunReq): Promise<RunResult> {
  const base = process.env.JUDGE0_URL;
  if (!base) return { ok: false, error: "Missing JUDGE0_URL env var." };

  const url = base.replace(/\/$/, "");
  const stdinRaw = ("stdin" in req && req.stdin ? req.stdin : "") ?? "";
  const stdin = b64(stdinRaw);

  const limits = (req as any).limits ?? undefined;

  // ---- Multi-file workspace mode ----
  if ("files" in req) {
    const fileEntries = Array.isArray(req.files)
        ? req.files
        : recordToFileEntries(req.files as Record<string, string>);

    const additional_files = await zipProject(req.language, req.entry, fileEntries);

    return postJudge0(`${url}/submissions?base64_encoded=true&wait=true`, {
      language_id: 89,
      additional_files,
      stdin,
      ...(limits ?? {}),
    });
  }

  // ---- Single-file mode ----
  const language_id = getSingleFileLanguageId(req.language);

  return postJudge0(`${url}/submissions?base64_encoded=true&wait=true`, {
    language_id,
    source_code: b64(req.code),
    stdin,
    ...(limits ?? {}),
  });
}

