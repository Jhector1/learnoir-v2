// export type Actor = { userId: string | null; guestId: string | null };

// export async function getActor(): Promise<Actor> {
//   return { userId: null, guestId: null };
// }

export function ensureGuestId(actor: Actor) {
  return { actor: { ...actor, guestId: actor.guestId ?? "guest" }, setGuestId: actor.guestId ? undefined : "guest" };
}

export function attachGuestCookie(res: any, _setGuestId?: string) {
  return res;
}
export function actorKeyOf(actor: Actor): string {
  if (actor.userId) return `u:${actor.userId}`;
  if (actor.guestId) return `g:${actor.guestId}`;
  return "g:missing";
}

import "server-only";
import { cookies } from "next/headers";

const GUEST_COOKIE = "guestId"; // or whatever you use

export type Actor = { userId: string | null; guestId: string | null };

export async function getActor(): Promise<Actor> {
  const jar = await cookies(); // ✅ IMPORTANT
  const guestId = jar.get(GUEST_COOKIE)?.value ?? null;
  return { userId: null, guestId };
}