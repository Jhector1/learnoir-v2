// src/app/api/practice/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { attachGuestCookie } from "@/lib/practice/actor";

import { GetParamsSchema } from "@/lib/practice/api/practiceGet/schemas";
import { withGuestCookie } from "@/lib/practice/api/practiceGet/response";
import { getActorWithGuest } from "@/lib/practice/api/practiceGet/actor";
import { handlePracticeGet } from "@/lib/practice/api/practiceGet/handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { actor, setGuestId } = await getActorWithGuest();

  const url = new URL(req.url);
  const rawParams = Object.fromEntries(url.searchParams.entries());
  const parsed = GetParamsSchema.safeParse(rawParams);

  if (!parsed.success) {
    return withGuestCookie(
      { message: "Invalid query params", issues: parsed.error.issues },
      400,
      setGuestId,
    );
  }

  try {
    const out = await handlePracticeGet({
      prisma,
      actor,
      params: parsed.data,
    });

    // allow handler to return a prebuilt NextResponse (e.g. entitlement gate)
    if (out.kind === "res") {
      return attachGuestCookie(out.res, setGuestId);
    }

    return withGuestCookie(out.body, out.status, setGuestId);
  } catch (err: any) {
    console.error("[/api/practice] ERROR", err);

    return withGuestCookie(
      {
        message: "Practice API failed",
        explanation: err?.message ?? String(err),
        stack: process.env.NODE_ENV === "development" ? err?.stack : undefined,
      },
      500,
      setGuestId,
    );
  }
}


