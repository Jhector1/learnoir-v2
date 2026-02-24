// src/lib/practice/actor.ts
import "server-only";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export type Actor = { userId: string | null; guestId: string | null };

const GUEST_COOKIE = "guestId";
const ONE_YEAR = 60 * 60 * 24 * 365;

export async function getActor(): Promise<Actor> {
  const session = await auth();
  const userId = (session?.user as any)?.id ?? null;

  const jar = await cookies();
  const guestId = jar.get(GUEST_COOKIE)?.value ?? null;

  return { userId, guestId };
}

/**
 * ✅ Returns:
 * - { actor } if user is logged in OR guestId already exists
 * - { actor, setGuestId } if we created a new guest id
 */
export function ensureGuestId(actor: Actor): { actor: Actor; setGuestId?: string } {
  // logged in => no guest assignment
  if (actor.userId) return { actor };

  // already has guest id => no change
  if (actor.guestId) return { actor };

  const newId = crypto.randomUUID();
  return { actor: { ...actor, guestId: newId }, setGuestId: newId };
}

/**
 * ✅ Accepts null safely (common when values come from DB/state)
 */
export function attachGuestCookie(res: NextResponse, setGuestId?: string | null) {
  if (setGuestId) {
    res.cookies.set(GUEST_COOKIE, setGuestId, {
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