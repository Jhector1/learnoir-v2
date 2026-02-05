// src/lib/practice/validate/persist.ts
import type { PrismaClient, Prisma } from "@prisma/client";
import type { LoadedInstance } from "./load";

export async function persistAttemptAndFinalize(
  prisma: PrismaClient,
  args: {
    instance: LoadedInstance;
    actor: { userId?: string | null; guestId?: string | null };
    isReveal: boolean;
    answerPayload: Prisma.InputJsonValue;
    ok: boolean;
    finalized: boolean;
  },
) {
  const instance = args.instance;

  return prisma.$transaction(async (tx) => {
    // 1) persist attempt
    await tx.practiceAttempt.create({
      data: {
        sessionId: instance.sessionId ?? null,
        instanceId: instance.id,
        userId: args.actor.userId ?? null,
        guestId: args.actor.guestId ?? null,
        answerPayload: args.answerPayload,
        ok: args.ok,
        revealUsed: args.isReveal,
      },
    });

    // 2) mark answeredAt only on first finalize
    const shouldMarkAnswered = !instance.answeredAt && args.finalized;

    if (shouldMarkAnswered) {
      await tx.practiceQuestionInstance.update({
        where: { id: instance.id },
        data: { answeredAt: new Date() },
      });
    }

    // 3) only count toward session totals once, when first finalized
    const shouldCountTowardSession =
      Boolean(instance.sessionId) && args.finalized && !instance.answeredAt;

    let sessionComplete = false;
    let sessionSummary: null | {
      correct: number;
      total: number;
      missed: Array<any>;
      answeredCount: number;
      targetCount: number;
    } = null;

    if (shouldCountTowardSession && instance.sessionId) {
      // increment totals (these are “nice to have” counters for UI)
      const updated = await tx.practiceSession.update({
        where: { id: instance.sessionId },
        data: {
          total: { increment: 1 },
          correct: { increment: args.ok ? 1 : 0 },
        },
        select: { id: true, total: true, correct: true, targetCount: true, status: true },
      });

      // ✅ canonical: count finalized questions by answeredAt
      const answeredCount = await tx.practiceQuestionInstance.count({
        where: { sessionId: updated.id, answeredAt: { not: null } },
      });

      if (answeredCount >= updated.targetCount) {
        if (updated.status !== "completed") {
          await tx.practiceSession.update({
            where: { id: updated.id },
            data: { status: "completed", completedAt: new Date() },
          });
        }

        sessionComplete = true;

        // missed summary (NO expected leakage)
        const missedAttempts = await tx.practiceAttempt.findMany({
          where: { sessionId: updated.id, ok: false, revealUsed: false },
          distinct: ["instanceId"],
          include: { instance: true },
          orderBy: { createdAt: "asc" },
        });

        sessionSummary = {
          correct: updated.correct,
          total: updated.total,
          answeredCount,
          targetCount: updated.targetCount,
          missed: missedAttempts.map((a) => ({
            title: a.instance.title,
            prompt: a.instance.prompt,
            yourAnswer: a.answerPayload,
            // expected: (a.instance.secretPayload as any)?.expected ?? null, // ❌ DO NOT LEAK
          })),
        };
      }
    }

    return { sessionComplete, sessionSummary };
  });
}
