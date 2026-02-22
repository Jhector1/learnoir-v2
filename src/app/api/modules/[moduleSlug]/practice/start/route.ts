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
  const returnUrl = raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : null;

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

  // ✅ FORCE quiz for this start route
  const preferPurpose = "quiz" as const;

  const mod = await prisma.practiceModule.findUnique({
    where: { slug: moduleSlug },
    select: {
      id: true,
      slug: true,
      practicePresetId: true,
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

  const presetId = mod.practicePresetId ?? null;

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
    preferPurpose, // ✅ return to client too (handy for debugging)
  };

  const existing = await prisma.practiceSession.findFirst({
    where: {
      status: "active",
      assignmentId: null,
      sectionId: { in: sectionIds },
      ...ownerWhere,
    },
    orderBy: { startedAt: "desc" },
    select: { id: true, preferPurpose: true }, // ✅
  });

  if (existing) {
    const data: any = {};

    if (returnUrl) data.returnUrl = returnUrl;
    if (presetId) data.presetId = presetId;

    // ✅ ensure quiz on resume too
    if (existing.preferPurpose !== preferPurpose) data.preferPurpose = preferPurpose;

    if (Object.keys(data).length) {
      await prisma.practiceSession.update({
        where: { id: existing.id },
        data,
      });
    }

    const res = NextResponse.json({ sessionId: existing.id, resumed: true, ...payload });
    return attachGuestCookie(res, setGuestId);
  }

  const created = await prisma.practiceSession.create({
    data: {
      status: "active",
      assignmentId: null,
      sectionId: homeSection.id,

      difficulty: "hard",
      targetCount: 15,

      userId: actor.userId ?? null,
      guestId: actor.userId ? null : actor.guestId ?? null,
      returnUrl: returnUrl ? String(returnUrl) : null,
      presetId,

      preferPurpose, // ✅ FORCE quiz
    },
    select: { id: true },
  });

  const res = NextResponse.json({ sessionId: created.id, resumed: false, ...payload });
  return attachGuestCookie(res, setGuestId);
}