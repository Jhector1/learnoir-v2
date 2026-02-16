"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { BillingStatus } from "@/lib/billing/types";
import { fmtShortDate } from "@/lib/billing/format";

export function useBillingStatus() {
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<BillingStatus | null>(null);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const r = await fetch("/api/billing/status", { cache: "no-store" });
            const data = await r.json();
            if (!r.ok) throw new Error(data?.message ?? "Failed to load billing status");
            setStatus(data as BillingStatus);
        } catch (e: any) {
            setError(e?.message ?? "Failed to load billing status");
            setStatus(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let dead = false;
        (async () => {
            if (dead) return;
            await load();
        })();
        return () => {
            dead = true;
        };
    }, [load]);

    const trialState = useMemo(() => {
        const ends = status?.trialEndsAt ? new Date(status.trialEndsAt) : null;
        const now = new Date();
        const inTrial = !!ends && ends.getTime() > now.getTime();
        const trialEnded = !!ends && ends.getTime() <= now.getTime();
        return { ends, inTrial, trialEnded };
    }, [status?.trialEndsAt]);

    const canUseTrial = Boolean(status?.trialEligible) && !trialState.trialEnded;

    const headlineBadge = useMemo(() => {
        if (!status) return null;

        // if (!status.isAuthenticated) {
        //     return { tone: "warn" as const, text: "Sign in required" };
        // }

        if (status.stripeStatus === "trialing") {
            return {
                tone: "good" as const,
                text: `🕒 Trialing • ends ${fmtShortDate(status.trialEndsAt)}`,
            };
        }

        if (status.stripeStatus === "active") {
            return { tone: "good" as const, text: "✅ Active subscription" };
        }

        if (status.stripeStatus === "past_due") {
            return { tone: "warn" as const, text: "⚠️ Past due — update payment method" };
        }

        if (status.stripeStatus === "unpaid") {
            return { tone: "warn" as const, text: "⚠️ Unpaid — update payment method" };
        }

        if (status.stripeStatus === "canceled") {
            return { tone: "neutral" as const, text: "Canceled" };
        }

        return { tone: "neutral" as const, text: "Not subscribed" };
    }, [status]);

    return {
        status,
        loading,
        error,
        setError,
        reload: load,
        trialState,
        canUseTrial,
        headlineBadge,
    };
}
