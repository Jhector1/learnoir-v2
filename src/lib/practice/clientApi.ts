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

type SeedPolicy = "actor" | "global";

function buildPracticeUrl(args: {
  subject?: string;
  module?: string;
  topic?: string;
  difficulty?: string;
  section?: string;
  allowReveal?: boolean;
  sessionId?: string;
  preferKind?: string;

  // determinism knobs
  salt?: string;
  exerciseKey?: string;
  seedPolicy?: SeedPolicy;

  // optional extras you may use elsewhere
  statusOnly?: boolean;
  includeMissed?: boolean;
  includeHistory?: boolean;
}) {
  const sp = new URLSearchParams();

  const set = (k: string, v: any) => {
    if (v === undefined || v === null) return;
    const s = String(v).trim();
    if (!s) return;
    sp.set(k, s);
  };

  set("subject", args.subject);
  set("module", args.module);
  set("section", args.section);
  set("topic", args.topic);
  set("difficulty", args.difficulty);

  if (args.allowReveal !== undefined) {
    sp.set("allowReveal", args.allowReveal ? "true" : "false");
  }

  set("sessionId", args.sessionId);
  set("preferKind", args.preferKind);

  // ✅ REQUIRED FOR PROJECT DETERMINISM (your server uses these)
  set("salt", args.salt);
  set("exerciseKey", args.exerciseKey);
  set("seedPolicy", args.seedPolicy);

  // optional extras
  if (args.statusOnly !== undefined) sp.set("statusOnly", args.statusOnly ? "true" : "false");
  if (args.includeMissed !== undefined) sp.set("includeMissed", args.includeMissed ? "true" : "false");
  if (args.includeHistory !== undefined) sp.set("includeHistory", args.includeHistory ? "true" : "false");

  const qs = sp.toString();
  return `/api/practice${qs ? `?${qs}` : ""}`;
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

  // ✅ determinism
  salt?: string;
  exerciseKey?: string;
  seedPolicy?: SeedPolicy;

  // optional extras
  statusOnly?: boolean;
  includeMissed?: boolean;
  includeHistory?: boolean;
}) {
  const url = buildPracticeUrl(args);

  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
    signal: args.signal,
  });

  const data = await readJsonSafe(res);
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
