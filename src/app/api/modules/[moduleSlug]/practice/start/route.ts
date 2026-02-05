// src/app/api/modules/[moduleSlug]/practice/start/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActor, ensureGuestId, attachGuestCookie } from "@/lib/practice/actor";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ moduleSlug: string }> }
) {
  const { moduleSlug } = await params;
  const body = await _req.json().catch(() => ({} as any));
const raw = typeof body?.returnUrl === "string" ? body.returnUrl : null;

// only allow internal paths
const returnUrl =
  raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : null;

  const actor0 = await getActor();
  const ensured = ensureGuestId(actor0);
  const actor = ensured.actor;
  const setGuestId = ensured.setGuestId ?? null;

  const ownerWhere =
    actor.userId ? { userId: actor.userId } :
    actor.guestId ? { guestId: actor.guestId } :
    null;

  if (!ownerWhere) {
    const res = NextResponse.json({ message: "Missing actor." }, { status: 400 });
    return attachGuestCookie(res, setGuestId);
  }

  const mod = await prisma.practiceModule.findUnique({
    where: { slug: moduleSlug },
    select: {
      id: true,
      slug: true,
      sections: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          slug: true,
          topics: {
            orderBy: { order: "asc" },
            select: { topic: { select: { slug: true } } },
          },
        },
      },
    },
  });

  if (!mod) {
    const res = NextResponse.json({ message: "Module not found." }, { status: 404 });
    return attachGuestCookie(res, setGuestId);
  }

  const sectionIds = mod.sections.map((s) => s.id);
  const homeSection = mod.sections[0] ?? null;

  if (!homeSection) {
    const res = NextResponse.json({ message: "Module has no sections." }, { status: 400 });
    return attachGuestCookie(res, setGuestId);
  }

  const topicSlugs = Array.from(
    new Set(
      mod.sections
        .flatMap((s) => s.topics ?? [])
        .map((x) => x.topic?.slug)
        .filter(Boolean)
    )
  ) as string[];

  const payload = {
    topicSlugs,
    difficulty: "hard" as const,
    questionCount: 15,
    allowReveal: false,
    showDebug: false,
  };

  const existing = await prisma.practiceSession.findFirst({
    where: {
      status: "active",
      assignmentId: null,
      sectionId: { in: sectionIds }, // ✅ resume anywhere in module
      ...ownerWhere,
    },
    orderBy: { startedAt: "desc" },
    select: { id: true },
  });

if (existing) {
  if (returnUrl) {
    await prisma.practiceSession.update({
      where: { id: existing.id },
      data: { returnUrl },
    });
  }

  const res = NextResponse.json({ sessionId: existing.id, resumed: true, ...payload });
  return attachGuestCookie(res, setGuestId);
}

  const created = await prisma.practiceSession.create({
    data: {
      status: "active",
      assignmentId: null,

      // “home” anchor section (still OK even if module has many sections)
      sectionId: homeSection.id,

      difficulty: "hard",
      targetCount: 15,

      userId: actor.userId ?? null,
      guestId: actor.userId ? null : actor.guestId ?? null,
      returnUrl: returnUrl ? String(returnUrl) : null,
    },
    select: { id: true },
  });

  const res = NextResponse.json({ sessionId: created.id, resumed: false, ...payload });
  return attachGuestCookie(res, setGuestId);
}
