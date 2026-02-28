// src/app/api/practice/route.ts
import { prisma } from "@/lib/prisma";
import { attachGuestCookie } from "@/lib/practice/actor";

import { GetParamsSchema } from "@/lib/practice/api/practiceGet/schemas";
import { withGuestCookie } from "@/lib/practice/api/practiceGet/response";
import { getActorWithGuest } from "@/lib/practice/api/practiceGet/actor";
import { handlePracticeGet } from "@/lib/practice/api/practiceGet/handler";

import { gatePracticeModuleAccess } from "@/lib/billing/gatePracticeModuleAccess";
import { getLocaleFromCookie } from "@/serverUtils";
import { rateLimit } from "@/lib/security/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* --------------------------------- helpers -------------------------------- */

function hardenResponse(res: Response) {
    // Prevent caching of gated/personalized content
    res.headers.set("Cache-Control", "no-store, max-age=0");
    res.headers.set("Pragma", "no-cache");

    // Basic hardening
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("Referrer-Policy", "same-origin");
    res.headers.set("Cross-Origin-Resource-Policy", "same-origin");

    // API responses don’t need to load anything
    res.headers.set("Content-Security-Policy", "default-src 'none'");

    return res;
}

function getClientIp(req: Request) {
    // Works behind Vercel/most proxies
    const xff = req.headers.get("x-forwarded-for");
    if (xff) return xff.split(",")[0]?.trim() ?? "unknown";
    return req.headers.get("x-real-ip") ?? "unknown";
}

function safeSameOriginReturnUrl(req: Request, input: string | null | undefined) {
    if (!input) return null;

    // Always allow relative paths
    if (input.startsWith("/")) return input;

    // Prefer a configured canonical origin if you have multiple domains
    // e.g. APP_ORIGIN=https://learnoir.com
    const allowedOrigin = process.env.APP_ORIGIN ?? new URL(req.url).origin;

    try {
        const u = new URL(input);
        if (u.origin !== allowedOrigin) return null;
        return u.pathname + u.search + u.hash;
    } catch {
        return null;
    }
}

function actorKey(actor: { userId: string | null; guestId: string | null }) {
    if (actor.userId) return `u:${actor.userId}`;
    if (actor.guestId) return `g:${actor.guestId}`;
    return "g:missing";
}

/* ---------------------------------- route --------------------------------- */

export async function GET(req: Request) {
    const requestId = crypto.randomUUID();

    // 1) Actor + guest cookie handling
    const { actor, setGuestId } = await getActorWithGuest();

    // 2) Production-safe abuse limiting (shared store)
    // Key by actor + IP to reduce NAT collateral without being purely per-IP
    const ip = getClientIp(req);
    const rlKey = `practice:${actorKey(actor)}:${ip}`;

    try {
        const rl = await rateLimit(rlKey);
        if (!rl.ok) {
            const res = withGuestCookie({ message: "Too many requests", requestId }, 429, setGuestId);

            // Retry-After expects seconds
            const retryAfterSeconds = Math.max(1, Math.ceil((rl.resetMs - Date.now()) / 1000));
            res.headers.set("Retry-After", String(retryAfterSeconds));

            // Useful debugging headers
            res.headers.set("X-RateLimit-Limit", String(rl.limit));
            res.headers.set("X-RateLimit-Remaining", String(rl.remaining));
            res.headers.set("X-RateLimit-Reset", String(rl.resetMs));

            res.headers.set("X-Request-Id", requestId);
            return hardenResponse(res);
        }
    } catch (e) {
        // If limiter misconfigured in prod, fail closed (don’t silently remove protection)
        console.error("[/api/practice] ratelimit error", { requestId, e });
        const res = withGuestCookie({ message: "Service unavailable", requestId }, 503, setGuestId);
        res.headers.set("X-Request-Id", requestId);
        return hardenResponse(res);
    }

    // 3) Validate query params
    const url = new URL(req.url);
    const rawParams = Object.fromEntries(url.searchParams.entries());
    const parsed = GetParamsSchema.safeParse(rawParams);

    if (!parsed.success) {
        const res = withGuestCookie(
            { message: "Invalid query params", issues: parsed.error.issues, requestId },
            400,
            setGuestId,
        );
        res.headers.set("X-Request-Id", requestId);
        return hardenResponse(res);
    }

    const params = parsed.data;

    // 4) Locale
    const locale = await getLocaleFromCookie();

    // 5) Prevent open redirects via returnUrl/returnTo
    const safeReturnUrl = safeSameOriginReturnUrl(req, params.returnUrl ?? null);
    const safeReturnTo = safeSameOriginReturnUrl(req, params.returnTo ?? null);

    // 6) Access gate (billing/entitlement)
    const gate = await gatePracticeModuleAccess({
        prisma,
        actor,
        locale,
        subject: params.subject ?? null,
        module: params.module ?? null,
        sessionId: params.sessionId ?? null,
        returnUrl: safeReturnUrl,
        returnTo: safeReturnTo,
        bypass: false,
    });

    if (!gate.ok) {
        const res = attachGuestCookie(gate.res, setGuestId);
        res.headers.set("X-Request-Id", requestId);
        return hardenResponse(res);
    }

    // 7) Handler (defense-in-depth: handler must still scope DB reads/writes by actor)
    try {
        const out = await handlePracticeGet({ prisma, actor, params });

        const res =
            out.kind === "res"
                ? attachGuestCookie(out.res, setGuestId)
                : withGuestCookie(out.body, out.status, setGuestId);

        res.headers.set("X-Request-Id", requestId);
        return hardenResponse(res);
    } catch (err: any) {
        console.error("[/api/practice] ERROR", { requestId, err });

        // Don’t leak internals in prod
        const body =
            process.env.NODE_ENV === "development"
                ? {
                    message: "Practice API failed",
                    explanation: err?.message ?? String(err),
                    stack: err?.stack,
                    requestId,
                }
                : {
                    message: "Practice API failed",
                    requestId,
                };

        const res = withGuestCookie(body, 500, setGuestId);
        res.headers.set("X-Request-Id", requestId);
        return hardenResponse(res);
    }
}