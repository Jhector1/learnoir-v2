// src/lib/practice/actor.ts
import "server-only";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { createHmac, timingSafeEqual } from "node:crypto";

export type Actor = { userId: string | null; guestId: string | null };

// Keep name if you already rely on it.
// Optional hardening: rename to "__Host-guest" (requires Secure + path="/" + no domain).
const GUEST_COOKIE = "guestId";
const ONE_YEAR = 60 * 60 * 24 * 365;

// ---- signing ----
function getGuestSecrets(): string[] {
  // Rotation support: keep OLD set for a bit after changing SECRET
  const cur = process.env.GUEST_COOKIE_SECRET;
  const old = process.env.GUEST_COOKIE_SECRET_OLD;

  const secrets = [cur, old].filter(Boolean) as string[];

  if (process.env.NODE_ENV === "production" && secrets.length === 0) {
    // Fail hard in prod so you don’t accidentally run unsigned
    throw new Error("Missing GUEST_COOKIE_SECRET in production.");
  }

  // In dev, allow missing secret (cookie will be treated invalid -> new guest each time)
  return secrets;
}

function b64url(buf: Buffer) {
  return buf
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
}

function signGuestId(id: string, secret: string) {
  const mac = createHmac("sha256", secret).update(id, "utf8").digest();
  return b64url(mac);
}

function safeEqual(a: string, b: string) {
  // constant-time compare
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

function encodeGuestCookie(id: string) {
  const secrets = getGuestSecrets();
  if (secrets.length === 0) {
    // dev fallback: unsigned (not recommended). Better to set the env var.
    return id;
  }
  const sig = signGuestId(id, secrets[0]);
  return `${id}.${sig}`;
}

function decodeGuestCookie(value: string | undefined | null): string | null {
  if (!value) return null;

  const secrets = getGuestSecrets();
  if (secrets.length === 0) return null;

  // Expect: "<uuid>.<sig>"
  const dot = value.lastIndexOf(".");
  if (dot <= 0) return null;

  const id = value.slice(0, dot);
  const sig = value.slice(dot + 1);

  // Basic sanity check for UUID-ish values (optional but helpful)
  if (id.length < 10 || sig.length < 20) return null;

  for (const secret of secrets) {
    const expected = signGuestId(id, secret);
    if (safeEqual(sig, expected)) return id;
  }

  return null;
}

// ---- actor ----

export async function getActor(): Promise<Actor> {
  const session = await auth();
  const userId = (session?.user as any)?.id ?? null;

  const jar = await cookies();
  const raw = jar.get(GUEST_COOKIE)?.value ?? null;
  const guestId = decodeGuestCookie(raw);

  return { userId, guestId };
}

/**
 * ✅ Returns:
 * - { actor } if user is logged in OR guestId already exists
 * - { actor, setGuestId } if we created a new guest id
 */
export function ensureGuestId(actor: Actor): { actor: Actor; setGuestId?: string } {
  if (actor.userId) return { actor };
  if (actor.guestId) return { actor };

  const newId = crypto.randomUUID();
  return { actor: { ...actor, guestId: newId }, setGuestId: newId };
}

/**
 * ✅ Accepts null safely (common when values come from DB/state)
 */
export function attachGuestCookie(res: NextResponse, setGuestId?: string | null) {
  if (setGuestId) {
    res.cookies.set(GUEST_COOKIE, encodeGuestCookie(setGuestId), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ONE_YEAR,
    });
  }
  return res;
}

export function actorKeyOf(actor: Actor): string {
  if (actor.userId) return `u:${actor.userId}`;
  if (actor.guestId) return `g:${actor.guestId}`;
  return "g:missing";
}