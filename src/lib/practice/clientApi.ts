// src/lib/practice/clientApi.ts
export type PracticeGetResponse = any;

async function readJsonSafe(res: Response) {
  const text = await res.text();
  if (!text) throw new Error(`Empty response body (status ${res.status})`);
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON response (status ${res.status}): ${text.slice(0, 200)}`);
  }
}

export async function fetchPracticeExercise(args: {
  subject?: string;
  module?: string;
  topic?: string;
  difficulty?: string;
  section?: string;
  allowReveal?: boolean;
  sessionId?: string;
  signal?: AbortSignal;
  preferKind?: string;
  genKey?: string;

  // ✅ IMPORTANT: keep this
  salt?: string;
}) {
  const qs = new URLSearchParams();
  if (args.subject) qs.set("subject", args.subject);
  if (args.module) qs.set("module", args.module);
  if (args.topic) qs.set("topic", args.topic);
  if (args.difficulty) qs.set("difficulty", args.difficulty);
  if (args.section) qs.set("section", args.section);
  if (args.allowReveal) qs.set("allowReveal", "true");
  if (args.sessionId) qs.set("sessionId", args.sessionId);
  if (args.preferKind) qs.set("preferKind", args.preferKind);
  if (args.genKey) qs.set("genKey", args.genKey);

  // ✅ THIS is what makes refresh deterministic
  if (args.salt) qs.set("salt", args.salt);

  const res = await fetch(`/api/practice?${qs.toString()}`, {
    method: "GET",
    cache: "no-store",
    signal: args.signal,
  });

  const data = await readJsonSafe(res);
  console.log(data);
  if (!res.ok) throw new Error(data?.explanation ?? data?.message ?? `Failed (${res.status})`);
  return data as PracticeGetResponse;
}

export async function submitPracticeAnswer(args: {
  key: string;
  answer?: any;
  reveal?: boolean;
  signal?: AbortSignal;
}) {
  const res = await fetch(`/api/practice/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    signal: args.signal,
    body: JSON.stringify({
      key: args.key,
      reveal: args.reveal ? true : undefined,
      answer: args.reveal ? undefined : args.answer,
    }),
  });

  const data = await readJsonSafe(res);
  if (!res.ok) throw new Error(data?.explanation ?? data?.message ?? `Failed (${res.status})`);
  return data;
}
