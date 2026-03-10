import { zipProject } from "./projectZip";
import { createJudge0Submission, getJudge0Submission } from "./judge0";
import { getSingleFileLanguageId } from "./langIds";
import type {RunPollResult, RunReq, RunResult, RunSubmitResult} from "./types";

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

function getJudge0BaseUrl() {
  const base = process.env.JUDGE0_URL;
  if (!base) return null;
  return base.replace(/\/$/, "");
}

async function buildSubmissionBody(req: RunReq) {
  const stdinRaw = ("stdin" in req && req.stdin ? req.stdin : "") ?? "";
  const stdin = b64(stdinRaw);
  const limits = (req as any).limits ?? undefined;

  if ("files" in req) {
    const fileEntries = Array.isArray(req.files)
        ? req.files
        : recordToFileEntries(req.files as Record<string, string>);

    const additional_files = await zipProject(req.language, req.entry, fileEntries);

    return {
      language_id: 89,
      additional_files,
      stdin,
      ...(limits ?? {}),
    };
  }

  const language_id = getSingleFileLanguageId(req.language);

  return {
    language_id,
    source_code: b64(req.code),
    stdin,
    ...(limits ?? {}),
  };
}

export async function submitRun(req: RunReq): Promise<RunSubmitResult> {
  const base = getJudge0BaseUrl();
  if (!base) return { ok: false, error: "Missing JUDGE0_URL env var." };

  const body = await buildSubmissionBody(req);
  return createJudge0Submission(`${base}/submissions?base64_encoded=true`, body);
}

export async function pollRun(token: string): Promise<RunPollResult> {
  const base = getJudge0BaseUrl();
  if (!base) {
    return {
      ok: false,
      done: true,
      status: "Error",
      error: "Missing JUDGE0_URL env var.",
    };
  }

  const safeToken = encodeURIComponent(token);
  return getJudge0Submission(`${base}/submissions/${safeToken}?base64_encoded=true`);
}

// ✅ server-side convenience helper for grading / validation
export async function runCode(req: RunReq): Promise<RunResult> {
  const submit = await submitRun(req);
  if (!submit.ok) {
    return {
      ok: false,
      status: "Error",
      error: submit.error,
    };
  }

  const maxPolls = 120;

  for (let i = 0; i < maxPolls; i++) {
    const polled = await pollRun(submit.token);
    if (polled.done) return polled;

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  return {
    ok: false,
    status: "Timeout",
    error: "Execution timed out while waiting for Judge0.",
  };
}