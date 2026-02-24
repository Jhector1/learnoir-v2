import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActor, ensureGuestId, attachGuestCookie, actorKeyOf } from "@/lib/practice/actor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(body: any, status = 200, setGuestId?: string) {
    const res = NextResponse.json(body, { status });
    return attachGuestCookie(res, setGuestId);
}

export async function POST(req: Request, ctx: { params: Promise<{ subjectSlug: string }> }) {
    const {subjectSlug} = await ctx.params;

    const slug = decodeURIComponent(subjectSlug);

    const subject = await prisma.practiceSubject.findUnique({
        where: { slug },
        select: { id: true, slug: true },
    });
    if (!subject) return json({ message: "Subject not found" }, 404);

    const actor = await getActor();
    const { guestId, setGuestId } = await ensureGuestId(actor.guestId);

    const actorKey = actorKeyOf({ userId: actor.userId ?? null, guestId });

    await prisma.subjectEnrollment.upsert({
        where: { actorKey_subjectId: { actorKey, subjectId: subject.id } },
        create: {
            actorKey,
            userId: actor.userId ?? null,
            subjectId: subject.id,
            source: "self",
            lastSeenAt: new Date(),
        },
        update: {
            lastSeenAt: new Date(),
            status: "enrolled",
            archivedAt: null,
        },
    });

    // Optional: compute access (if you’re using SubjectAccessGrant gating)
    const now = new Date();
    const hasAccess = await prisma.subjectAccessGrant.findFirst({
        where: {
            actorKey,
            subjectId: subject.id,
            revokedAt: null,
            OR: [{ startsAt: null }, { startsAt: { lte: now } }],
            OR: [{ endsAt: null }, { endsAt: { gt: now } }],
        },
        select: { id: true },
    });

    return json({ ok: true, hasAccess: !!hasAccess }, 200, setGuestId);
}