// src/lib/access/accessSnapshot.ts
import type { PrismaClient } from "@prisma/client";
import {Actor, actorKeyOf} from "@/lib/practice/actor";
// import { toActorKey, type Actor } from "./actorKey";

function isWithinWindow(now: Date, startsAt?: Date | null, endsAt?: Date | null) {
    if (startsAt && startsAt > now) return false;
    if (endsAt && endsAt <= now) return false;
    return true;
}

export type AccessSnapshot = {
    actorKey: string;
    hasUser: boolean;
    isSubscribed: boolean;
    subjectAccess: Set<string>; // subjectId
    moduleAccess: Set<string>;  // moduleId
};

export async function getAccessSnapshot(prisma: PrismaClient, actor: Actor, args?: {
    subjectIds?: string[];
    moduleIds?: string[];
}) : Promise<AccessSnapshot> {
    const now = new Date();
    const actorKey = actorKeyOf(actor);
    const hasUser = Boolean(actor.userId);

    // global subscription
    let isSubscribed = false;
    if (actor.userId) {
        const sub = await prisma.subscription.findFirst({
            where: {
                userId: actor.userId,
                status: { in: ["active", "trialing"] },
            },
            select: { currentPeriodEnd: true, status: true },
            orderBy: { updatedAt: "desc" },
        });

        if (sub) {
            // treat active/trialing as entitled; optionally ensure currentPeriodEnd not past
            if (!sub.currentPeriodEnd || sub.currentPeriodEnd > now) isSubscribed = true;
        }
    }

    const subjectAccess = new Set<string>();
    const moduleAccess = new Set<string>();

    // subject grants
    const subjectIds = args?.subjectIds?.length ? args.subjectIds : null;
    if (subjectIds) {
        const grants = await prisma.subjectAccessGrant.findMany({
            where: {
                actorKey,
                subjectId: { in: subjectIds },
                revokedAt: null,
            },
            select: { subjectId: true, startsAt: true, endsAt: true },
        });

        for (const g of grants) {
            if (isWithinWindow(now, g.startsAt, g.endsAt)) subjectAccess.add(g.subjectId);
        }
    }

    // module grants
    const moduleIds = args?.moduleIds?.length ? args.moduleIds : null;
    if (moduleIds) {
        const grants = await prisma.moduleAccessGrant.findMany({
            where: {
                actorKey,
                moduleId: { in: moduleIds },
                revokedAt: null,
            },
            select: { moduleId: true, startsAt: true, endsAt: true },
        });

        for (const g of grants) {
            if (isWithinWindow(now, g.startsAt, g.endsAt)) moduleAccess.add(g.moduleId);
        }
    }

    return { actorKey, hasUser, isSubscribed, subjectAccess, moduleAccess };
}