// src/lib/practice/validate/policies.ts
import type { PrismaClient } from "@prisma/client";

export function computeCanReveal(args: {
  isAssignment: boolean;
  allowRevealFromKey: boolean;
  allowRevealFromAssignment: boolean;
}) {
  return args.isAssignment
    ? args.allowRevealFromAssignment && args.allowRevealFromKey
    : args.allowRevealFromKey;
}

/**
 * Attempts policy:
 * - locked runs (assignment OR session): default 3 (assignment may override)
 * - free practice: default 5
 */
export function computeMaxAttempts(args: {
  isLockedRun: boolean;
  assignmentMaxAttempts: number | null;
}) {
  if (args.isLockedRun) {
    return args.assignmentMaxAttempts ?? 3;
  }
  return 5;
}

export async function countPriorNonRevealAttempts(
  prisma: PrismaClient,
  args: {
    instanceId: string;
    actor: { userId?: string | null; guestId?: string | null };
  },
) {
  const OR = [
    args.actor.userId ? { userId: args.actor.userId } : null,
    args.actor.guestId ? { guestId: args.actor.guestId } : null,
  ].filter(Boolean) as any[];

  return prisma.practiceAttempt.count({
    where: {
      instanceId: args.instanceId,
      revealUsed: false,
      OR,
    },
  });
}
