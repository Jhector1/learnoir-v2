// src/lib/practice/api/validate/policies.ts
import type { PrismaClient } from "@prisma/client";
import {
  computeMaxAttemptsCore,
  type RunMode,
} from "@/lib/practice/policies/attempts";

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
 * Attempts policy (server truth):
 * - assignment: finite (default 3, override by assignment.maxAttempts)
 * - session: finite (default 3) [optionally override later]
 * - practice: unlimited (null)
 */
export function computeMaxAttempts(args: {
  mode: RunMode;
  assignmentMaxAttempts?: any; // number | null | string
  sessionMaxAttempts?: any;
  practiceMaxAttempts?: any;
}) {
  return computeMaxAttemptsCore(args);
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

export type { RunMode };