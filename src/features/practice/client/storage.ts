// src/features/practice/client/storage.ts
import { QItem } from "@/components/practice/practiceType";
import { STORAGE_VERSION } from "./constants";

/** canonical: no n in key (recommended) */
export function storageKeyV6(args: {
  subjectSlug: string;
  moduleSlug: string;
  section: string | null;
  topic: string;       // TopicSlug | "all"
  difficulty: string;  // Difficulty | "all"
}) {
  const { subjectSlug, moduleSlug, section, topic, difficulty } = args;
  return `practice:v${STORAGE_VERSION}:${subjectSlug}:${moduleSlug}:${section ?? "no-section"}:${topic}:${difficulty}`;
}

/** legacy: includes n */
export function storageKeyV6Legacy(args: {
  subjectSlug: string;
  moduleSlug: string;
  section: string | null;
  topic: string;
  difficulty: string;
  n: number;
}) {
  const { subjectSlug, moduleSlug, section, topic, difficulty, n } = args;
  return `practice:v${STORAGE_VERSION}:${subjectSlug}:${moduleSlug}:${section ?? "no-section"}:${topic}:${difficulty}:n=${n}`;
}

export function storageKeyForState(args: {
  subjectSlug: string;
  moduleSlug: string;
  section: string | null;
  topic: string;
  difficulty: string;
  n: number;
  sessionId: string | null;
}) {
  if (args.sessionId) return `practice:v${STORAGE_VERSION}:session:${args.sessionId}`;
  return storageKeyV6(args);
}

export function lastSessionKey(subjectSlug: string, moduleSlug: string) {
  return `practice:v${STORAGE_VERSION}:lastSession:${subjectSlug}:${moduleSlug}`;
}

// export function loadSavedState(args: {
//   subjectSlug: string;
//   moduleSlug: string;
//   section: string | null;
//   topic: string;
//   difficulty: string;
//   n: number;
//   sessionId: string | null;
// }) {
//   const keysToTry: string[] = [];

//   if (args.sessionId) keysToTry.push(`practice:v${STORAGE_VERSION}:session:${args.sessionId}`);

//   const canonical = storageKeyV6(args);
//   keysToTry.push(canonical);

//   const legacy = storageKeyV6Legacy(args);
//   keysToTry.push(legacy);

//   for (const k of keysToTry) {
//     const raw = sessionStorage.getItem(k);
//     if (!raw) continue;
//     try {
//       const parsed = JSON.parse(raw);
//       if (parsed?.v === STORAGE_VERSION) {
//         return { key: k, payload: parsed, canonicalKey: canonical };
//       }
//     } catch {}
//   }
//   return null;
// }

/* ---------------- Expiry pruning (safe no-op if not JWT-like) ---------------- */

function base64UrlToJson(part: string) {
  const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : "";
  const b64p = b64 + pad;

  const atobFn =
    typeof globalThis.atob === "function"
      ? globalThis.atob
      : (s: string) => Buffer.from(s, "base64").toString("binary");

  const txt = atobFn(b64p);
  return JSON.parse(txt);
}

function isExpiredKey(k: unknown) {
  if (typeof k !== "string") return false;

  const parts = k.split(".");
  const payloadPart =
    parts.length >= 3 ? parts[1] : parts.length >= 2 ? parts[0] : null;

  if (!payloadPart) return false;

  try {
    const json = base64UrlToJson(payloadPart);
    const exp = Number(json?.exp);
    if (!Number.isFinite(exp)) return false;

    const now = Math.floor(Date.now() / 1000);
    return exp <= now;
  } catch {
    return false;
  }
}
// import type { QItem } from "@/components/practice/practiceType";
// import { isExpiredKey } from "./whatever-your-exp-check-is"; // adjust import

export function pruneExpiredStack(stack: QItem[]) {
  const arr = Array.isArray(stack) ? stack : [];

  return arr.filter((q) => {
    if (!q) return false;

    // ✅ KEEP anything with progress (needed for summary after refresh)
    const hasProgress =
      Boolean(q.submitted) || Boolean(q.revealed) || Boolean(q.result);

    if (hasProgress) return true;

    // only remove expired *unanswered* drafts
    return !isExpiredKey((q as any).key);
  });
}

// export function pruneExpiredStack<T extends { key?: unknown }>(stack: T[]) {
//   const arr = Array.isArray(stack) ? stack : [];
//   return arr.filter((q) => !isExpiredKey(q?.key));
// }
// src/features/practice/client/storage.ts
// import { STORAGE_VERSION } from "./constants";

function tryParseV(raw: string | null) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.v === STORAGE_VERSION) return parsed;
  } catch {}
  return null;
}

function findBestLegacyAnyN(args: {
  subjectSlug: string;
  moduleSlug: string;
  section: string | null;
  topic: string;
  difficulty: string;
}) {
  // legacy keys look like:
  // practice:v6:subject:module:section:topic:difficulty:n=12
  const prefix = `practice:v${STORAGE_VERSION}:${args.subjectSlug}:${args.moduleSlug}:${args.section ?? "no-section"}:${args.topic}:${args.difficulty}:n=`;

  let bestKey: string | null = null;
  let bestPayload: any = null;
  let bestSavedAt = -1;

  try {
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (!k || !k.startsWith(prefix)) continue;

      const payload = tryParseV(sessionStorage.getItem(k));
      if (!payload) continue;

      const savedAt = Number(payload?.savedAt ?? 0);
      if (savedAt >= bestSavedAt) {
        bestSavedAt = savedAt;
        bestKey = k;
        bestPayload = payload;
      }
    }
  } catch {
    // ignore storage access issues
  }

  return bestKey && bestPayload ? { key: bestKey, payload: bestPayload } : null;
}

export function loadSavedState(args: {
  subjectSlug: string;
  moduleSlug: string;
  section: string | null;
  topic: string;
  difficulty: string;
  n: number;
  sessionId: string | null;
}) {
  const keysToTry: string[] = [];

  if (args.sessionId) keysToTry.push(`practice:v${STORAGE_VERSION}:session:${args.sessionId}`);

  const canonical = storageKeyV6(args);
  keysToTry.push(canonical);

  // legacy guess (may miss if user changed sessionSize)
  const legacyGuess = storageKeyV6Legacy(args);
  keysToTry.push(legacyGuess);

  for (const k of keysToTry) {
    const payload = tryParseV(sessionStorage.getItem(k));
    if (payload) return { key: k, payload, canonicalKey: canonical };
  }

  // ✅ NEW: search legacy keys for ANY n and pick the newest
  const bestLegacy = findBestLegacyAnyN({
    subjectSlug: args.subjectSlug,
    moduleSlug: args.moduleSlug,
    section: args.section,
    topic: args.topic,
    difficulty: args.difficulty,
  });

  if (bestLegacy) {
    return { key: bestLegacy.key, payload: bestLegacy.payload, canonicalKey: canonical };
  }

  return null;
}



















// src/features/practice/client/urls.ts
export function readReturnUrlFromSearchParams(sp: URLSearchParams): string | null {
  const raw =
    sp.get("returnTo") ||
    sp.get("callback") ||
    sp.get("callbackUrl") ||
    sp.get("returnUrl") ||
    null;

  if (!raw) return null;

  // if someone already passed a decoded URL, decodeURIComponent can throw,
  // so guard it.
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}




// src/features/practice/client/getEffectiveSid.ts
import type { MutableRefObject } from "react";

export function getEffectiveSid(args: {
  sessionId: string | null;
  resolvedSessionIdRef: MutableRefObject<string | null>;
}) {
  // URL always wins
  if (typeof window !== "undefined") {
    const fromUrl = new URLSearchParams(window.location.search).get("sessionId");
    if (fromUrl) return fromUrl;
  }

  // then state, then ref fallback
  return args.sessionId ?? args.resolvedSessionIdRef.current ?? null;
}
