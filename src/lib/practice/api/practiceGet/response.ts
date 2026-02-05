// src/lib/practice/api/practiceGet/response.ts
import { NextResponse } from "next/server";
import { attachGuestCookie } from "@/lib/practice/actor";

export function withGuestCookie<T>(body: T, status: number, setGuestId?: string) {
  const res = NextResponse.json(body as any, { status });
  return attachGuestCookie(res, setGuestId);
}
