// src/app/api/review/progress/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { attachGuestCookie, actorKeyOf, ensureGuestId, getActor } from "@/lib/practice/actor";
import type { ReviewProgressState } from "@/lib/subjects/progressTypes";

function jsonOk(data: any) {
  return NextResponse.json(data, { status: 200 });
}

function jsonErr(message: string, status = 400, detail?: any) {
  return NextResponse.json({ message, detail }, { status });
}

// Matches the quizKey format we recommended earlier:
// "review-quiz|subject=...|module=...|section=...|..."
function quizKeyPrefixForModule(subjectSlug: string, moduleId: string) {
  // NOTE: keep this consistent with buildQuizKey() used by /api/review/quiz
  return `review-quiz|subject=${subjectSlug}|module=${moduleId}`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const subjectSlug = (searchParams.get("subjectSlug") ?? "").trim();
  const moduleId = (searchParams.get("moduleId") ?? "").trim();
  const locale = (searchParams.get("locale") ?? "en").trim();

  if (!subjectSlug || !moduleId) return jsonErr("Missing subjectSlug/moduleId.", 400);

  const actor0 = await getActor();
  const { actor, setGuestId } = ensureGuestId(actor0);
  const actorKey = actorKeyOf(actor);

  const row = await prisma.reviewProgress.findUnique({
    where: {
      actorKey_subjectSlug_moduleId_locale: {
        actorKey,
        subjectSlug,
        moduleId,
        locale,
      },
    },
  });

  const res = jsonOk({ progress: (row?.state ?? null) as ReviewProgressState | null });
  return attachGuestCookie(res, setGuestId);
}


export async function POST(req: Request) {
  return PUT(req);
}


export async function PUT(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return jsonErr("Invalid JSON body.", 400);
  }

  const subjectSlug = String(body?.subjectSlug ?? "").trim();
  const moduleId = String(body?.moduleId ?? "").trim();
  const locale = String(body?.locale ?? "en").trim();
  const state = (body?.state ?? null) as ReviewProgressState | null;

  if (!subjectSlug || !moduleId) return jsonErr("Missing subjectSlug/moduleId.", 400);
  if (!state || typeof state !== "object") return jsonErr("Missing/invalid state.", 400);

  const actor0 = await getActor();
  const { actor, setGuestId } = ensureGuestId(actor0);
  const actorKey = actorKeyOf(actor);

  const saved = await prisma.reviewProgress.upsert({
    where: {
      actorKey_subjectSlug_moduleId_locale: {
        actorKey,
        subjectSlug,
        moduleId,
        locale,
      },
    },
    create: {
      actorKey,
      subjectSlug,
      moduleId,
      locale,
      state,
    },
    update: {
      state,
    },
    select: { id: true, updatedAt: true },
  });

  const res = jsonOk({ ok: true, saved });
  return attachGuestCookie(res, setGuestId);
}

/**
 * Reset module progress AND wipe frozen quiz instances for this module,
 * so the next render produces a new random quiz ONLY after reset.
 *
 * Call:
 *   DELETE /api/review/progress?subjectSlug=python&moduleId=python-0&locale=en
 */
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const subjectSlug = (searchParams.get("subjectSlug") ?? "").trim();
  const moduleId = (searchParams.get("moduleId") ?? "").trim();
  const locale = (searchParams.get("locale") ?? "en").trim();

  if (!subjectSlug || !moduleId) return jsonErr("Missing subjectSlug/moduleId.", 400);

  const actor0 = await getActor();
  const { actor, setGuestId } = ensureGuestId(actor0);
  const actorKey = actorKeyOf(actor);

  // 1) delete progress row (idempotent)
  await prisma.reviewProgress.deleteMany({
    where: { actorKey, subjectSlug, moduleId, locale },
  });

  // 2) delete frozen quiz instances for this module (so next load re-generates)
  // If your quizKey includes more fields (section/topic/etc), startsWith handles it.
  const prefix = quizKeyPrefixForModule(subjectSlug, moduleId);

  // Adjust model name if yours differs
  await prisma.reviewQuizInstance.deleteMany({
    where: {
      actorKey,
      quizKey: { startsWith: prefix },
    },
  });

  const res = jsonOk({ ok: true });
  return attachGuestCookie(res, setGuestId);
}
