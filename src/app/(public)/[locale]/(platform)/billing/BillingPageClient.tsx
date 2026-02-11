"use client";

import React from "react";
import { StripeStatusPanel } from "@/components/billing/StripeStatusPanel";
import { cn } from "@/lib/cn";

import { CARD } from "@/components/billing/styles";
import BillingShell from "@/components/billing/BillingShell";
import BillingHeader from "@/components/billing/BillingHeader";
import BillingError from "@/components/billing/BillingError";
import PlanCard from "@/components/billing/PlanCard";
// import InfoRow from "./_components/InfoRow";

import { useBillingStatus } from "@/components/billing/hooks/useBillingStatus";
import { useBillingActions } from "@/components/billing/hooks/useBillingActions";
import InfoRow from "@/components/billing/InfoRow";

export default function BillingPageClient({ callbackUrl }: { callbackUrl: string }) {
    const { status, loading, error, setError, trialState, canUseTrial, headlineBadge } =
        useBillingStatus();

    const { busy, authRedirect, openPortal, startCheckout } = useBillingActions({
        status,
        callbackUrl,
        onError: setError,
    });

    return (
        <BillingShell>
            <div className="relative mx-auto max-w-5xl grid gap-4">
                {/* Header */}
                <div className={CARD}>
                    <BillingHeader
                        busy={busy}
                        loading={loading}
                        status={status}
                        headlineBadge={headlineBadge}
                        onManageBilling={openPortal}
                        onSignIn={authRedirect}
                    />

                    {error ? (
                        <div className="p-5">
                            <BillingError message={error} />
                        </div>
                    ) : null}
                </div>

                {/* Main */}
                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Plans */}
                    <div className={cn(CARD, "lg:col-span-2")}>
                        <div className="border-b border-neutral-200/70 bg-white/70 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-black/20">
                            <div className="text-sm font-black tracking-tight">Plans</div>
                            <div className="mt-1 text-xs text-neutral-500 dark:text-white/60">
                                {status?.trialDays
                                    ? `${status.trialDays}-day free trial if eligible.`
                                    : "Trial available if eligible."}
                            </div>
                        </div>

                        {/* Stripe status panel */}
                        {!loading && status ? (
                            <div className="p-5 pt-4">
                                <StripeStatusPanel
                                    status={status.stripeStatus ?? "none"}
                                    plan={status.currentPlan ?? "unknown"}
                                    trialEnd={status.trialEndsAt}
                                    currentPeriodEnd={status.currentPeriodEnd}
                                    cancelAtPeriodEnd={status.cancelAtPeriodEnd}
                                    priceId={status.priceId}
                                    subscriptionId={status.subscriptionId}
                                    showIds={false}
                                />
                            </div>
                        ) : null}

                        {loading || !status ? (
                            <div className="p-5 text-sm text-neutral-600 dark:text-white/70">
                                Loading plans…
                            </div>
                        ) : (
                            <div className="p-5 grid gap-3 md:grid-cols-2">
                                <PlanCard
                                    title="Monthly"
                                    price={status.monthlyPriceLabel}
                                    subtitle="Flexible month-to-month. Cancel anytime."
                                    recommended={false}
                                    highlight={status.currentPlan === "monthly"}
                                    features={[
                                        "Unlimited practice sessions",
                                        "Assignments access",
                                        "Progress tracking",
                                        "Premium review modules",
                                    ]}
                                    ctaLabel={
                                        status.isSubscribed && status.currentPlan === "monthly"
                                            ? "Current plan"
                                            : "Subscribe monthly"
                                    }
                                    ctaDisabled={busy || status.isSubscribed}
                                    onCta={() => startCheckout("monthly", false)}
                                    trialLabel={
                                        canUseTrial
                                            ? `Start ${status.trialDays}-day trial`
                                            : trialState.inTrial
                                                ? "Trial active"
                                                : "Trial unavailable"
                                    }
                                    trialDisabled={busy || !canUseTrial || status.isSubscribed}
                                    onTrial={() => startCheckout("monthly", true)}
                                    trialNote={
                                        !status.trialEligible
                                            ? "Trial already used on this account."
                                            : trialState.trialEnded
                                                ? "Trial period has ended."
                                                : "No charge today. Cancel before trial ends."
                                    }
                                />

                                <PlanCard
                                    title="Yearly"
                                    price={status.yearlyPriceLabel}
                                    subtitle="Best value for consistent learners."
                                    recommended
                                    highlight={status.currentPlan === "yearly"}
                                    savings={status.yearlySavingsLabel ?? "Save vs monthly"}
                                    features={[
                                        "Everything in Monthly",
                                        "Lower effective monthly cost",
                                        "Fewer billing interruptions",
                                        "Best for cohorts & schools",
                                    ]}
                                    ctaLabel={
                                        status.isSubscribed && status.currentPlan === "yearly"
                                            ? "Current plan"
                                            : "Subscribe yearly"
                                    }
                                    ctaDisabled={busy || status.isSubscribed}
                                    onCta={() => startCheckout("yearly", false)}
                                    trialLabel={
                                        canUseTrial
                                            ? `Start ${status.trialDays}-day trial`
                                            : trialState.inTrial
                                                ? "Trial active"
                                                : "Trial unavailable"
                                    }
                                    trialDisabled={busy || !canUseTrial || status.isSubscribed}
                                    onTrial={() => startCheckout("yearly", true)}
                                    trialNote={
                                        !status.trialEligible
                                            ? "Trial already used on this account."
                                            : trialState.trialEnded
                                                ? "Trial period has ended."
                                                : "No charge today. Cancel before trial ends."
                                    }
                                />
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className={CARD}>
                        <div className="border-b border-neutral-200/70 bg-white/70 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-black/20">
                            <div className="text-sm font-black tracking-tight">What you get</div>
                            <div className="mt-1 text-xs text-neutral-500 dark:text-white/60">
                                Premium features included with any plan.
                            </div>
                        </div>

                        <div className="p-5 grid gap-3 text-sm">
                            <InfoRow
                                title="Assignments"
                                desc="Teacher/admin assignments with session tracking and completion flow."
                            />
                            <InfoRow
                                title="Unlimited practice"
                                desc="Generate questions across topics and difficulty with instant feedback."
                            />
                            <InfoRow
                                title="Progress history"
                                desc="Track accuracy, missed items, and review progress by subject."
                            />
                            <InfoRow
                                title="Multi-language"
                                desc="Use Learnoir in English, French, and Haitian Creole."
                            />

                            <div className="rounded-2xl border border-neutral-200/70 bg-white/70 p-4 text-xs text-neutral-600 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70 dark:shadow-none">
                                Tip: If an assignment is locked, subscribing here will unlock it immediately.
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-xs text-neutral-500 dark:text-white/55">
                    Payments are handled by Stripe. Manage or cancel anytime from the billing
                    portal.
                </div>
            </div>
        </BillingShell>
    );
}
