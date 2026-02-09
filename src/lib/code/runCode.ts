// src/lib/code/runCode.ts
import JSZip from "jszip";

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
  time?: string | null;
  memory?: number | null;
  error?: string;
};

function assertSafeRelPath(p: string) {
  if (!p || p.startsWith("/") || p.includes("..")) {
    throw new Error(`Unsafe path: ${p}`);
  }
}

function pickJavaMainClass(entryPath: string, files: FileEntry[]): string {
  const src = files.find((f) => f.path === entryPath)?.content ?? "";
  const pkg = /package\s+([a-zA-Z0-9_.]+)\s*;/.exec(src)?.[1];
  const cls =
    /public\s+(?:final\s+|abstract\s+)?class\s+([A-Za-z0-9_]+)/.exec(src)?.[1] ??
    /class\s+([A-Za-z0-9_]+)/.exec(src)?.[1];

  if (!cls) {
    // fallback convention
    return "Main";
  }
  return pkg ? `${pkg}.${cls}` : cls;
}

function scriptsFor(lang: Lang, entry: string, files: FileEntry[]) {
  // put user files anywhere they want; we will run by explicit entry path
  const mainClass = lang === "java" ? pickJavaMainClass(entry, files) : "";

  const run = (() => {
    switch (lang) {
case "python":
  return `#!/usr/bin/env bash
set -euo pipefail
ENTRY="${entry}"
# helpful defaults if you use /src convention:
export PYTHONPATH="$(pwd):$(pwd)/src:\${PYTHONPATH:-}"
python3 "$ENTRY"
`;

      case "javascript":
        return `#!/usr/bin/env bash
set -euo pipefail
ENTRY="${entry}"
node "$ENTRY"
`;
      case "java":
        return `#!/usr/bin/env bash
set -euo pipefail
java -cp build "${mainClass}"
`;
      case "c":
      case "cpp":
        return `#!/usr/bin/env bash
set -euo pipefail
./build/app
`;
    }
  })();

  const compile = (() => {
    switch (lang) {
      case "java":
        return `#!/usr/bin/env bash
set -euo pipefail
mkdir -p build
# compile everything (excluding build/)
FILES=$(find . -name "*.java" -not -path "./build/*")
javac -d build $FILES
`;
      case "c":
        return `#!/usr/bin/env bash
set -euo pipefail
mkdir -p build
FILES=$(find . -name "*.c" -not -path "./build/*")
gcc -O2 -std=c11 -I. -o build/app $FILES
`;
      case "cpp":
        return `#!/usr/bin/env bash
set -euo pipefail
mkdir -p build
FILES=$(find . -name "*.cpp" -not -path "./build/*")
g++ -O2 -std=c++17 -I. -o build/app $FILES
`;
      case "python":
      case "javascript":
        return null; // no compilation step needed
    }
  })();

  return { compile, run };
}

async function zipProject(lang: Lang, entry: string, files: FileEntry[]) {
  assertSafeRelPath(entry);
  const zip = new JSZip();

  for (const f of files) {
    assertSafeRelPath(f.path);
    zip.file(f.path, f.content ?? "");
  }

  const { compile, run } = scriptsFor(lang, entry, files);

  // Judge0 CE docs expect scripts named `compile` and `run` in zip root. :contentReference[oaicite:1]{index=1}
  if (compile) {
    zip.file("compile", compile);
    // optional compatibility (some docs mention compile.sh/run.sh)
    zip.file("compile.sh", compile);
  }
  zip.file("run", run);
  zip.file("run.sh", run);

  const buf = await zip.generateAsync({ type: "nodebuffer" });
  return buf.toString("base64");
}

export async function runCode(req: RunReq): Promise<RunResult> {
  const url = process.env.JUDGE0_URL;
  if (!url) return { ok: false, error: "Missing JUDGE0_URL env var." };

  const stdin = ("stdin" in req && req.stdin) ? req.stdin : "";

  // ---- NEW: multi-file workspace mode (recommended for IDE) ----
  if ("files" in req) {
    const additional_files = await zipProject(req.language, req.entry, req.files);

    const res = await fetch(
      `${url.replace(/\/$/, "")}/submissions?base64_encoded=false&wait=true`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language_id: 89,            // Multi-file program :contentReference[oaicite:2]{index=2}
          additional_files,           // base64 zip :contentReference[oaicite:3]{index=3}
          stdin,
        }),
      }
    );

    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); }
    catch { return { ok: false, error: `Non-JSON response (${res.status}): ${text.slice(0, 300)}` }; }

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
    };
  }

  // ---- OLD: single-file mode (your current flow) ----
  const language_id =
    req.language === "python" ? 71 :
    req.language === "java" ? 62 :
    req.language === "javascript" ? 63 :
    req.language === "c" ? 50 :
    54; // cpp (example IDs — ideally fetch from /languages in your instance)

  const res = await fetch(
    `${url.replace(/\/$/, "")}/submissions?base64_encoded=false&wait=true`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language_id,
        source_code: req.code,
        stdin,
      }),
    }
  );

  const text = await res.text();
  let data: any;
  try { data = JSON.parse(text); }
  catch { return { ok: false, error: `Non-JSON response (${res.status}): ${text.slice(0, 300)}` }; }

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
  };
}
