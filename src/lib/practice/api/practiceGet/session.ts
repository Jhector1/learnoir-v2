// src/lib/practice/api/practiceGet/session.ts
import type { PrismaClient } from "@prisma/client";
import { requireEntitledUser } from "@/lib/billing/requireEntitledUser";
import type { Difficulty } from "@/lib/practice/types";

// src/lib/practice/api/practiceGet/session.ts
// import type { PrismaClient } from "@prisma/client";
// import { requireEntitledUser } from "@/lib/billing/requireEntitledUser";
// import type { Difficulty } from "@/lib/practice/types";

export async function loadSession(prisma: PrismaClient, sessionId?: string) {
  if (!sessionId) return null;

  return prisma.practiceSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      status: true,
      userId: true,
      guestId: true,

      // ✅ FIX: include preferPurpose so handler.ts can read it
      preferPurpose: true,

      difficulty: true,
      targetCount: true,
      total: true,
      correct: true,
      returnUrl: true,

      presetId: true,
      preset: {
        select: {
          id: true,
          key: true,
          allowedKinds: true,
          allowedPurposes: true,
          lockDifficulty: true,
          lockTopic: true,
          allowReveal: true,
        },
      },

      assignmentId: true,
      assignment: {
        select: {
          allowReveal: true,
          maxAttempts: true,
          difficulty: true,
          showDebug: true,
          questionCount: true,
        },
      },

      section: {
        select: {
          subjectId: true,
          slug: true,
          moduleId: true,
          module: {
            select: {
              id: true,
              practicePresetId: true,
              practicePreset: {
                select: {
                  id: true,
                  key: true,
                  allowedKinds: true,
                  allowedPurposes: true,
                  lockDifficulty: true,
                  lockTopic: true,
                  allowReveal: true,
                },
              },
            },
          },
        },
      },
    },
  });
}
export function assertSessionActive(session: any) {
  if (!session) return;
  if (session.status !== "active") {
    const err = new Error("Session is not active.");
    (err as any).status = 400;
    throw err;
  }
}

export function assertSessionOwnership(
  session: any,
  actor: { userId?: string | null; guestId?: string | null },
) {
  if (!session) return;

  if (session.userId) {
    if (!actor.userId || actor.userId !== session.userId) {
      const err = new Error("Forbidden.");
      (err as any).status = 403;
      throw err;
    }
    return;
  }

  if (session.guestId) {
    if (!actor.guestId || actor.guestId !== session.guestId) {
      const err = new Error("Forbidden.");
      (err as any).status = 403;
      throw err;
    }
    return;
  }

  const err = new Error("Session has no owner.");
  (err as any).status = 500;
  throw err;
}

export async function enforceAssignmentEntitlement(session: any) {
  if (!session?.assignmentId) return { kind: "ok" as const };

  const gate = await requireEntitledUser();
  if (!gate.ok) return { kind: "res" as const, res: gate.res };

  if (!session.userId || session.userId !== gate.userId) {
    const err = new Error("Forbidden.");
    (err as any).status = 403;
    throw err;
  }

  return { kind: "ok" as const };
}

export function computeAllowRevealEffective(
  session: any,
  allowRevealParam?: "true" | "false",
) {
  const requested = allowRevealParam === "true";

  if (session?.assignmentId) {
    return Boolean(session.assignment?.allowReveal) && requested;
  }

  if (session) return false;

  return requested;
}

export function getAssignmentDifficulty(session: any): Difficulty | null {
  const d = session?.assignment?.difficulty;
  return d ? (d as Difficulty) : null;
}
