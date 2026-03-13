import type { SaveOnboardingInput } from "@/lib/onboarding/schema";

export async function saveOnboarding(input: SaveOnboardingInput) {
    const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(input),
    });

    if (!res.ok) throw new Error("Failed to save onboarding.");
    return res.json();
}

export async function claimGuestOnboarding() {
    const res = await fetch("/api/onboarding/claim", {
        method: "POST",
        credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to claim guest onboarding.");
    return res.json();
}






export async function startTrialSession(input: {
    subject: string;
    level: string;
    locale?: string;
}) {
    const res = await fetch("/api/practice/trial/start", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify(input),
    });

    if (!res.ok) {
        throw new Error("Failed to start trial session.");
    }

    return res.json() as Promise<{
        ok: true;
        resumed?: boolean;
        sessionId: string;
        requestId: string;
    }>;
}
export function buildTrialReturnUrl(args: {
    locale: string;
    subject?: string | null;
}) {
    const { locale, subject } = args;

    if (subject) return `/${encodeURIComponent(locale)}/subjects/${encodeURIComponent(subject)}/modules`;

    return `/${encodeURIComponent(locale)}/subjects`;
}
export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}