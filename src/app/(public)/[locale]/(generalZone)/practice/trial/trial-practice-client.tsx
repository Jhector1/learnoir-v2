"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import PracticeShell from "@/components/practice/PracticeShell";
import { usePracticeController } from "@/features/practice/client/usePracticeController";
import {buildTrialReturnUrl, startTrialSession} from "@/lib/onboarding/client";

type TrialPracticeClientProps = {
    locale: string;
    sessionId: string | null;
    subject: string | null;
    level: string | null;
};

type GateState = "checking" | "recovering" | "ready" | "error";

function clearStalePracticePointers() {
    if (typeof window === "undefined") return;

    for (let i = window.localStorage.length - 1; i >= 0; i--) {
        const key = window.localStorage.key(i);
        if (!key) continue;

        if (key.startsWith("practice:v6:lastSession:")) {
            window.localStorage.removeItem(key);
        }
    }
}

function buildTrialHref(args: {
    locale: string;
    sessionId: string;
    subject?: string | null;
    level?: string | null;
}) {
    const qs = new URLSearchParams();

    const returnTo = buildTrialReturnUrl({locale: args.locale, subject: args.subject});

    qs.set("sessionId", args.sessionId);
    qs.set("returnTo", returnTo);

    if (args.subject) qs.set("subject", args.subject);
    if (args.level) qs.set("level", args.level);

    return `/${encodeURIComponent(args.locale)}/practice/trial?${qs.toString()}`;
}

function TrialShellInner({ sessionId }: { sessionId: string }) {
    const t = useTranslations("Practice");

    const { shellProps } = usePracticeController({
        sessionId,
        subjectSlug: undefined,
        moduleSlug: undefined,
        isTrial: true,
    });

    return <PracticeShell {...shellProps} t={t} />;
}

function getRecoveryStorageKey(subject: string | null, level: string | null) {
    return `zoeskoul.trial.recovery:${subject ?? "none"}:${level ?? "none"}`;
}

function getRecoveryCount(subject: string | null, level: string | null) {
    if (typeof window === "undefined") return 0;
    const raw = window.sessionStorage.getItem(getRecoveryStorageKey(subject, level));
    const n = Number(raw ?? "0");
    return Number.isFinite(n) ? n : 0;
}

function setRecoveryCount(subject: string | null, level: string | null, value: number) {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(getRecoveryStorageKey(subject, level), String(value));
}

function clearRecoveryCount(subject: string | null, level: string | null) {
    if (typeof window === "undefined") return;
    window.sessionStorage.removeItem(getRecoveryStorageKey(subject, level));
}

async function preflightTrialSession(sessionId: string) {
    const qs = new URLSearchParams({
        sessionId,
        statusOnly: "true",
    });

    const res = await fetch(`/api/practice?${qs.toString()}`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
    });

    const data = await res.json().catch(() => null);

    return { res, data };
}

async function wait(ms: number) {
    await new Promise((resolve) => setTimeout(resolve, ms));
}

async function verifyRecoveredSession(sessionId: string) {
    // Retry a few times in case the fresh guest cookie needs a moment
    // to become visible to the following request in the browser.
    for (let i = 0; i < 5; i++) {
        const { data } = await preflightTrialSession(sessionId);

        if (data?.code !== "SESSION_RECOVERY_REQUIRED") {
            return true;
        }

        await wait(150);
    }

    return false;
}

export default function TrialPracticeClient({
                                                locale,
                                                sessionId,
                                                subject,
                                                level,
                                            }: TrialPracticeClientProps) {
    const router = useRouter();

    const [gateState, setGateState] = useState<GateState>(
        sessionId ? "checking" : "error",
    );
    const [gateErr, setGateErr] = useState<string | null>(
        sessionId ? null : "We could not find your trial session.",
    );

    const missingRecoveryInputs = useMemo(
        () => !subject || !level,
        [subject, level],
    );

    useEffect(() => {
        let cancelled = false;

        async function run() {
            if (!sessionId) {
                setGateState("error");
                setGateErr("We could not find your trial session.");
                return;
            }

            setGateState("checking");
            setGateErr(null);

            const { data } = await preflightTrialSession(sessionId);

            if (cancelled) return;

            if (data?.code === "SESSION_RECOVERY_REQUIRED") {
                if (missingRecoveryInputs) {
                    setGateState("error");
                    setGateErr(
                        "Your previous guest trial expired after cookies were cleared. Start a new trial from the home page.",
                    );
                    return;
                }

                const attempts = getRecoveryCount(subject, level);

                // hard stop to prevent infinite flashing loops
                if (attempts >= 1) {
                    clearStalePracticePointers();
                    setGateState("error");
                    setGateErr(
                        "We could not restore your previous guest trial automatically. Please go back home and start a new trial.",
                    );
                    return;
                }

                setRecoveryCount(subject, level, attempts + 1);
                setGateState("recovering");

                clearStalePracticePointers();

                const out = await startTrialSession({
                    subject: subject!,
                    level: level!,
                    locale,
                });

                if (cancelled) return;

                const ok = await verifyRecoveredSession(out.sessionId);

                if (cancelled) return;

                if (!ok) {
                    setGateState("error");
                    setGateErr(
                        "We started a fresh trial, but your browser session is still not ready. Please return home and try again.",
                    );
                    return;
                }

                clearRecoveryCount(subject, level);

                router.replace(
                    buildTrialHref({
                        locale,
                        sessionId: out.sessionId,
                        subject,
                        level,
                    }),
                );
                return;
            }

            clearRecoveryCount(subject, level);
            setGateState("ready");
        }

        run().catch((err) => {
            if (cancelled) return;
            console.error("[trial preflight]", err);
            setGateState("error");
            setGateErr("Could not prepare your trial session.");
        });

        return () => {
            cancelled = true;
        };
    }, [sessionId, subject, level, locale, router, missingRecoveryInputs]);

    if (!sessionId) {
        return (
            <div className="ui-container py-10">
                <div className="ui-card p-6">
                    <h1 className="text-lg font-bold">Missing trial session</h1>
                    <p className="mt-2 text-sm text-neutral-600 dark:text-white/70">
                        We could not find your trial session.
                    </p>
                </div>
            </div>
        );
    }

    if (gateState === "checking" || gateState === "recovering") {
        return (
            <div className="ui-container py-10">
                <div className="ui-card p-6">
                    <h1 className="text-lg font-bold">
                        {gateState === "recovering"
                            ? "Restoring your trial"
                            : "Preparing your trial"}
                    </h1>
                    <p className="mt-2 text-sm text-neutral-600 dark:text-white/70">
                        {gateState === "recovering"
                            ? "Your previous guest session is no longer valid, so we’re starting a fresh trial for you."
                            : "Please wait a moment while we check your session."}
                    </p>
                </div>
            </div>
        );
    }

    if (gateState === "error") {
        return (
            <div className="ui-container py-10">
                <div className="ui-card p-6">
                    <h1 className="text-lg font-bold">Trial unavailable</h1>
                    <p className="mt-2 text-sm text-neutral-600 dark:text-white/70">
                        {gateErr ?? "We could not open your trial session."}
                    </p>

                    <div className="mt-4">
                        <button
                            type="button"
                            onClick={() => router.replace(`/${encodeURIComponent(locale)}`)}
                            className="ui-btn ui-btn-primary"
                        >
                            Go to home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return <TrialShellInner sessionId={sessionId} />;
}