import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasReviewModule } from "@/lib/review/registry";

function jsonOk(data: any) {
  return NextResponse.json(data, { status: 200 });
}
function jsonErr(message: string, status = 400, detail?: any) {
  return NextResponse.json({ message, detail }, { status });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const subjectSlug = (searchParams.get("subjectSlug") ?? "").trim();
  const moduleId = (searchParams.get("moduleId") ?? "").trim();

  if (!subjectSlug || !moduleId) {
    return jsonErr("Missing subjectSlug/moduleId.", 400);
  }

  const subject = await prisma.practiceSubject.findUnique({
    where: { slug: subjectSlug },
    select: { id: true },
  });
  if (!subject) return jsonErr("Unknown subjectSlug.", 404, { subjectSlug });

  const dbModules = await prisma.practiceModule.findMany({
    where: { subjectId: subject.id },
    orderBy: { order: "asc" },
    select: { slug: true, order: true, title: true },
  });

  // DB order is authoritative; but only include modules that actually have ReviewModule content
  const reviewModules = dbModules.filter((m) => hasReviewModule(subjectSlug, m.slug));

  const idx = reviewModules.findIndex((m) => m.slug === moduleId);
  if (idx < 0) {
    return jsonErr("moduleId not found in review registry for this subject.", 404, {
      subjectSlug,
      moduleId,
      available: reviewModules.map((m) => m.slug),
    });
  }

  return jsonOk({
    index: idx,
    total: reviewModules.length,
    prevModuleId: idx > 0 ? reviewModules[idx - 1].slug : null,
    nextModuleId: idx < reviewModules.length - 1 ? reviewModules[idx + 1].slug : null,
  });
}
