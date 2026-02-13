import { zipProject } from "./projectZip";
import { postJudge0 } from "./judge0";
import { getSingleFileLanguageId } from "./langIds";
import type { RunReq, RunResult } from "./types";

export * from "./types";

export async function runCode(req: RunReq): Promise<RunResult> {
  const base = process.env.JUDGE0_URL;
  if (!base) return { ok: false, error: "Missing JUDGE0_URL env var." };

  const url = base.replace(/\/$/, "");
  const stdin = ("stdin" in req && req.stdin ? req.stdin : "") ?? "";

  // ---- Multi-file workspace mode ----
  if ("files" in req) {
    const additional_files = await zipProject(req.language, req.entry, req.files);

    // Judge0 CE uses language_id=89 for multi-file zip runner
    return postJudge0(`${url}/submissions?base64_encoded=false&wait=true`, {
      language_id: 89,
      additional_files,
      stdin,
    });
  }

  // ---- Single-file mode ----
  const language_id = getSingleFileLanguageId(req.language);

  return postJudge0(`${url}/submissions?base64_encoded=false&wait=true`, {
    language_id,
    source_code: req.code,
    stdin,
  });
}
