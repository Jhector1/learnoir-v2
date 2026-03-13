import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActor, ensureGuestId, attachGuestCookie } from "@/lib/practice/actor";
import { difficultyFromLevel, getTrialSectionForSubject } from "@/lib/onboarding/trialPolicy";
import { rateLimit } from "@/lib/security/ratelimit";
import { buildTrialReturnUrl } from "@/lib/onboarding/client";
import { ownerWhereForActor } from "@/lib/practice/sessionStart";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function harden(res: NextResponse) {
    res.headers.set("Cache-Control", "no-store, max-age=0");
    res.headers.set("Pragma", "no-cache");
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("Referrer-Policy", "same-origin");
    res.headers.set("Cross-Origin-Resource-Policy", "same-origin");
    res.headers.set("Content-Security-Policy", "default-src 'none'");
    return res;
}

function getClientIp(req: Request) {
    const real = req.headers.get("x-real-ip");
    if (real) return real.trim() || "unknown";

    const xff = req.headers.get("x-forwarded-for");
    if (xff) return xff.split(",")[0]?.trim() || "unknown";

    return "unknown";
}

function safeJson(req: Request) {
    return req.json().catch(() => null);
}

export async function POST(req: Request) {
    const requestId = crypto.randomUUID();

    const actor0 = await getActor();
    const ensured = ensureGuestId(actor0);
    const actor = ensured.actor;
    const setGuestId = ensured.setGuestId ?? null;

    const ip = getClientIp(req);
    const rl = await rateLimit(`practice-trial-start:${ip}`);
    if (!rl.ok) {
        const res = NextResponse.json(
            { message: "Too many requests.", requestId },
            { status: 429 },
        );
        return attachGuestCookie(harden(res), setGuestId);
    }

    const body = await safeJson(req);
    const subject = String(body?.subject ?? "").trim();
    const level = String(body?.level ?? "").trim();
    const locale = String(body?.locale ?? "en").trim();

    if (!subject) {
        const res = NextResponse.json(
            { message: "Missing subject.", requestId },
            { status: 400 },
        );
        return attachGuestCookie(harden(res), setGuestId);
    }

    try {
        const ownerWhere = ownerWhereForActor(actor);
        if (!ownerWhere) {
            const res = NextResponse.json(
                { message: "Missing actor.", requestId },
                { status: 400 },
            );
            return attachGuestCookie(harden(res), setGuestId);
        }

        const section = await getTrialSectionForSubject(subject);
        const difficulty = difficultyFromLevel(level);
        const returnUrl = buildTrialReturnUrl({ locale, subject });
console.log(returnUrl, locale, subject, difficulty)
        const meta = {
            kind: "onboarding_trial",
            subjectSlug: subject,
            levelChosen: level || "beginner",
            locale,
        };

        // 1) Resume unfinished active trial first
        const active = await prisma.practiceSession.findFirst({
            where: {
                ...ownerWhere,
                status: "active",
                mode: "onboarding_trial",
                sectionId: section.id,
            },
            orderBy: { startedAt: "desc" },
            select: { id: true },
        });

        if (active) {
            await prisma.practiceSession.update({
                where: { id: active.id },
                data: {
                    difficulty,
                    returnUrl,
                    meta,
                },
            });

            const res = NextResponse.json({
                ok: true,
                resumed: true,
                completed: false,
                sessionId: active.id,
                requestId,
            });

            return attachGuestCookie(harden(res), setGuestId);
        }

        // 2) If trial was already completed, reopen same completed session
        //    so user lands back on summary instead of silently getting a fresh trial
        const completed = await prisma.practiceSession.findFirst({
            where: {
                ...ownerWhere,
                status: "completed",
                mode: "onboarding_trial",
                sectionId: section.id,
            },
            orderBy: { completedAt: "desc" },
            select: { id: true },
        });

        if (completed) {
            await prisma.practiceSession.update({
                where: { id: completed.id },
                data: {
                    returnUrl,
                    meta,
                },
            });

            const res = NextResponse.json({
                ok: true,
                resumed: true,
                completed: true,
                sessionId: completed.id,
                requestId,
            });

            return attachGuestCookie(harden(res), setGuestId);
        }

        // 3) Otherwise create a brand-new trial
        const created = await prisma.practiceSession.create({
            data: {
                userId: actor.userId ?? null,
                guestId: actor.userId ? null : actor.guestId ?? null,
                status: "active",
                mode: "onboarding_trial",
                preferPurpose: "quiz",
                sectionId: section.id,
                moduleId: section.moduleId ?? null,
                difficulty,
                targetCount: 3,
                returnUrl,
                meta,
            },
            select: { id: true },
        });

        const res = NextResponse.json({
            ok: true,
            resumed: false,
            completed: false,
            sessionId: created.id,
            requestId,
        });

        return attachGuestCookie(harden(res), setGuestId);
    } catch (err: any) {
        const res = NextResponse.json(
            { message: err?.message ?? "Could not start trial session.", requestId },
            { status: 400 },
        );
        return attachGuestCookie(harden(res), setGuestId);
    }
}