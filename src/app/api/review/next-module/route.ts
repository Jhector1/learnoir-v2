import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // adjust if needed

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const subjectSlug = (searchParams.get("subjectSlug") ?? "").trim();
  const moduleId = (searchParams.get("moduleId") ?? "").trim(); // this is your [moduleid]

  if (!subjectSlug || !moduleId) {
    return NextResponse.json({ nextModuleId: null }, { status: 400 });
  }

  const current = await prisma.practiceModule.findFirst({
    where: {
      subject: { slug: subjectSlug },
      OR: [{ id: moduleId }, { slug: moduleId }],
    },
    select: { order: true },
  });

  if (!current) {
    return NextResponse.json({ nextModuleId: null }, { status: 404 });
  }

  const next = await prisma.practiceModule.findFirst({
    where: {
      subject: { slug: subjectSlug },
      order: { gt: current.order },
    },
    orderBy: { order: "asc" },
    select: { id: true, slug: true },
  });

  return NextResponse.json({
    // ✅ return slug if your route uses slug in [moduleid]
    nextModuleId: next?.slug ?? null,

    // If your route actually uses DB id instead, switch to:
    // nextModuleId: next?.id ?? null,
  });
}
