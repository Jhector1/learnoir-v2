import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth"; // from your src/lib/auth.ts

export type Actor = { userId: string | null; guestId: string | null };

const GUEST_COOKIE = "guestId";
const ONE_YEAR = 60 * 60 * 24 * 365;

export async function getActor(): Promise<Actor> {
  const session = await auth(); // ✅ reads NextAuth session (JWT)
  const userId = (session?.user as any)?.id ?? null;

  const jar = await cookies();
  const guestId = jar.get(GUEST_COOKIE)?.value ?? null;

  // ✅ IMPORTANT: even if guest cookie exists, user wins if logged in
  return { userId, guestId };
}

export function ensureGuestId(actor: Actor) {
  // ✅ if logged in, do NOT force/assign guest id
  if (actor.userId) return { actor, setGuestId: undefined as string | undefined };

  if (actor.guestId) return { actor, setGuestId: undefined as string | undefined };

  const newId = crypto.randomUUID(); // ✅ unique per guest
  return { actor: { ...actor, guestId: newId }, setGuestId: newId };
}

export function attachGuestCookie(res: NextResponse, setGuestId?: string) {
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
