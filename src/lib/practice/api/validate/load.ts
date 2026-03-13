import type { PrismaClient } from "@prisma/client";

export async function loadInstance(prisma: PrismaClient, instanceId: string) {
  return prisma.practiceQuestionInstance.findUnique({
    where: { id: instanceId },
    select: {
      id: true,
      kind: true,
      title: true,
      prompt: true,
      answeredAt: true,
      publicPayload: true,
      secretPayload: true,
      sessionId: true,
      session: {
        select: {
          id: true,
          status: true,
          mode: true,         // ✅ add
          meta: true,         // ✅ optional but useful for future-proofing
          userId: true,
          guestId: true,
          assignmentId: true,
          targetCount: true,
          total: true,
          correct: true,
          returnUrl: true,
          assignment: {
            select: {
              id: true,
              allowReveal: true,
              maxAttempts: true,
              difficulty: true,
              showDebug: true,
            },
          },
        },
      },
    },
  });
}

export type LoadedInstance = NonNullable<
    Awaited<ReturnType<typeof loadInstance>>
>;