// src/app/billing/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StripeStatusPanel } from "@/components/billing/StripeStatusPanel";

type BillingStatus = {
  isAuthenticated: boolean;
  isSubscribed: boolean;

  // Stripe details for display
  stripeStatus: string | null;       // "trialing" | "active" | "past_due" | ...
  subscriptionId: string | null;     // Stripe subscription id
  priceId: string | null;            // Stripe price id

  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;

  monthlyPriceLabel: string;
  yearlyPriceLabel: string;
  yearlySavingsLabel?: string | null;

  trialDays: number;
  trialEligible: boolean;
  trialEndsAt: string | null;

  currentPlan?: "monthly" | "yearly" | null;
};

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

const CARD =
  "rounded-3xl border border-neutral-200/70 bg-white/80 shadow-sm overflow-hidden " +
  "dark:border-white/10 dark:bg-neutral-950/60 dark:shadow-none";

const PANEL =
  "rounded-2xl border border-neutral-200/70 bg-white/70 shadow-sm " +
  "dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none";

function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "good" | "warn";
}) {
  const cls =
    tone === "good"
      ? "border-emerald-300/40 bg-emerald-300/15 text-emerald-900 dark:text-emerald-100"
      : tone === "warn"
        ? "border-rose-300/40 bg-rose-300/15 text-rose-900 dark:text-rose-100"
        : "border-neutral-200/70 bg-white/70 text-neutral-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/80";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-extrabold",
        cls,
      )}
    >
      {children}
    </span>
  );
}

function fmtShortDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function BillingPage() {
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const router = useRouter();
  const sp = useSearchParams();
  const callbackUrl = sp.get("callbackUrl") || "/";

  // ---- load status ----
  useEffect(() => {
    let dead = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const r = await fetch("/api/billing/status", { cache: "no-store" });
        const data = await r.json();
        if (!r.ok) throw new Error(data?.message ?? "Failed to load billing status");
        if (!dead) setStatus(data as BillingStatus);
      } catch (e: any) {
        if (!dead) setErr(e?.message ?? "Failed to load billing status");
      } finally {
        if (!dead) setLoading(false);
      }
    })();
    return () => {
      dead = true;
    };
  }, []);

  const trialState = useMemo(() => {
    const ends = status?.trialEndsAt ? new Date(status.trialEndsAt) : null;
    const now = new Date();
    const inTrial = !!ends && ends.getTime() > now.getTime();
    const trialEnded = !!ends && ends.getTime() <= now.getTime();
    return { ends, inTrial, trialEnded };
  }, [status?.trialEndsAt]);

  function authRedirect() {
    router.push(`/authenticate?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  async function startCheckout(plan: "monthly" | "yearly", useTrial = false) {
    if (!status?.isAuthenticated) {
      authRedirect();
      return;
    }

    setBusy(true);
    setErr(null);

    try {
      const r = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, useTrial, callbackUrl }),
      });

      const data = await r.json();
      if (!r.ok) throw new Error(data?.message ?? "Checkout failed");

      window.location.href = data.url;
    } catch (e: any) {
      setErr(e?.message ?? "Checkout failed");
    } finally {
      setBusy(false);
    }
  }

  async function openPortal() {
    if (!status?.isAuthenticated) {
      authRedirect();
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch("/api/billing/portal", { method: "POST" });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.message ?? "Portal failed");
      window.location.href = data.url;
    } catch (e: any) {
      setErr(e?.message ?? "Portal failed");
    } finally {
      setBusy(false);
    }
  }

  const canUseTrial = Boolean(status?.trialEligible) && !trialState.trialEnded;

  // Helpful banner state:
  const headlineBadge = useMemo(() => {
    if (!status) return null;
    if (!status.isAuthenticated) return { tone: "warn" as const, text: "Sign in required" };
    if (status.stripeStatus === "trialing")
      return { tone: "good" as const, text: `🕒 Trialing • ends ${fmtShortDate(status.trialEndsAt)}` };
    if (status.stripeStatus === "active") return { tone: "good" as const, text: "✅ Active subscription" };
    if (status.stripeStatus === "past_due") return { tone: "warn" as const, text: "⚠️ Past due — update payment method" };
    if (status.stripeStatus === "unpaid") return { tone: "warn" as const, text: "⚠️ Unpaid — update payment method" };
    if (status.stripeStatus === "canceled") return { tone: "neutral" as const, text: "Canceled" };
    return { tone: "neutral" as const, text: "Not subscribed" };
  }, [status]);

  return (
    <div className="relative min-h-screen p-4 md:p-6 bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white">
      {/* homepage-style glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute top-[28%] right-[-140px] h-[460px] w-[460px] rounded-full bg-indigo-400/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] [background-image:radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.9)_1px,transparent_0)] [background-size:18px_18px]" />
      </div>

      <div className="relative mx-auto max-w-5xl grid gap-4">
        {/* Header */}
        <div className={CARD}>
          <div className="border-b border-neutral-200/70 bg-white/70 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-black/20">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-xs font-extrabold tracking-wide text-neutral-500 dark:text-white/60">
                  Pricing
                </div>

                <div className="mt-1 text-lg font-black tracking-tight">
                  Unlock assignments + premium practice
                </div>

                <div className="mt-1 text-sm text-neutral-600 dark:text-white/70">
                  Choose a plan that matches your learning pace. Cancel anytime from the portal.
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {headlineBadge ? <Badge tone={headlineBadge.tone}>{headlineBadge.text}</Badge> : null}
                  {status?.isAuthenticated ? <Badge>Signed in</Badge> : <Badge tone="warn">Sign in required</Badge>}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={openPortal}
                  disabled={busy || loading || !status?.isAuthenticated}
                  className={cn(
                    "rounded-2xl border px-4 py-2 text-sm font-extrabold transition disabled:opacity-50 disabled:cursor-not-allowed",
                    "border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900",
                    "dark:border-white/10 dark:bg-white/10 dark:text-white/90 dark:hover:bg-white/15",
                  )}
                >
                  Manage billing
                </button>

                {!status?.isAuthenticated ? (
                  <button
                    onClick={authRedirect}
                    disabled={busy || loading}
                    className={cn(
                      "rounded-2xl border px-4 py-2 text-sm font-extrabold transition disabled:opacity-50",
                      "border-neutral-200 bg-white/70 hover:bg-white text-neutral-900",
                      "dark:border-white/10 dark:bg-white/[0.04] dark:text-white/85 dark:hover:bg-white/[0.08]",
                    )}
                  >
                    Sign in
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {err ? (
            <div className="p-5">
              <div
                className={cn(
                  "rounded-2xl border p-4",
                  "border-rose-300/40 bg-rose-100/60 text-neutral-900",
                  "dark:border-rose-300/30 dark:bg-rose-300/10 dark:text-white/90",
                )}
              >
                <div className="font-black">⚠️ Something went wrong</div>
                <div className="mt-1 text-xs opacity-80">{err}</div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Main */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Pricing cards */}
          <div className={cn(CARD, "lg:col-span-2")}>
            <div className="border-b border-neutral-200/70 bg-white/70 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-black/20">
              <div className="text-sm font-black tracking-tight">Plans</div>
              <div className="mt-1 text-xs text-neutral-500 dark:text-white/60">
                {status?.trialDays ? `${status.trialDays}-day free trial if eligible.` : "Trial available if eligible."}
              </div>
            </div>

            {/* ✅ Stripe status panel (reusable component) */}
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
              <div className="p-5 text-sm text-neutral-600 dark:text-white/70">Loading plans…</div>
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

          {/* Sidebar info */}
          <div className={CARD}>
            <div className="border-b border-neutral-200/70 bg-white/70 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-black/20">
              <div className="text-sm font-black tracking-tight">What you get</div>
              <div className="mt-1 text-xs text-neutral-500 dark:text-white/60">
                Premium features included with any plan.
              </div>
            </div>

            <div className="p-5 grid gap-3 text-sm">
              <InfoRow title="Assignments" desc="Teacher/admin assignments with session tracking and completion flow." />
              <InfoRow title="Unlimited practice" desc="Generate questions across topics and difficulty with instant feedback." />
              <InfoRow title="Progress history" desc="Track accuracy, missed items, and review progress by subject." />
              <InfoRow title="Multi-language" desc="Use Learnoir in English, French, and Haitian Creole." />

              <div className={cn(PANEL, "p-4 text-xs text-neutral-600 dark:text-white/70")}>
                Tip: If an assignment is locked, subscribing here will unlock it immediately.
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-neutral-500 dark:text-white/55">
          Payments are handled by Stripe. Manage or cancel anytime from the billing portal.
        </div>
      </div>
    </div>
  );
}

function PlanCard(props: {
  title: string;
  price: string;
  subtitle: string;
  features: string[];

  recommended?: boolean;
  savings?: string;

  highlight?: boolean;

  ctaLabel: string;
  ctaDisabled?: boolean;
  onCta: () => void;

  trialLabel: string;
  trialDisabled?: boolean;
  onTrial: () => void;
  trialNote?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border p-5",
        "border-neutral-200/70 bg-white/70 shadow-sm",
        "dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none",
        props.recommended ? "ring-1 ring-emerald-400/20" : "",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-black text-neutral-900 dark:text-white/90">{props.title}</div>
          <div className="mt-1 text-xs text-neutral-500 dark:text-white/60">{props.subtitle}</div>
        </div>

        <div className="flex flex-col items-end gap-1">
          {props.recommended ? (
            <span className="rounded-full border border-emerald-300/40 bg-emerald-300/15 px-2 py-1 text-[11px] font-extrabold text-emerald-900 dark:border-emerald-300/20 dark:bg-emerald-300/10 dark:text-emerald-100">
              Recommended
            </span>
          ) : null}

          {props.savings ? (
            <span className="rounded-full border border-neutral-200/70 bg-white/60 px-2 py-1 text-[11px] font-extrabold text-neutral-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/80">
              {props.savings}
            </span>
          ) : null}
        </div>
      </div>

      <div className={cn("mt-4 rounded-2xl border border-neutral-200/70 bg-neutral-50/80 p-4 dark:border-white/10 dark:bg-black/20")}>
        <div className="text-[11px] font-extrabold text-neutral-500 dark:text-white/60">Price</div>
        <div className="mt-1 text-2xl font-black tracking-tight text-neutral-950 dark:text-white">
          {props.price}
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-sm">
        {props.features.map((f) => (
          <div key={f} className="flex items-start gap-2">
            <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-emerald-500/80 dark:bg-emerald-300/90" />
            <span className="text-neutral-700 dark:text-white/80">{f}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-2">
        <button
          onClick={props.onCta}
          disabled={props.ctaDisabled}
          className={cn(
            "rounded-2xl border px-4 py-2 text-sm font-extrabold transition disabled:opacity-50 disabled:cursor-not-allowed",
            "border-emerald-300/50 bg-emerald-400 text-neutral-950 hover:bg-emerald-300",
            "dark:border-emerald-300/30 dark:bg-emerald-300/15 dark:text-white/90 dark:hover:bg-emerald-300/20",
          )}
        >
          {props.ctaLabel}
        </button>

        <button
          onClick={props.onTrial}
          disabled={props.trialDisabled}
          className={cn(
            "rounded-2xl border px-4 py-2 text-sm font-extrabold transition disabled:opacity-50 disabled:cursor-not-allowed",
            "border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900",
            "dark:border-white/10 dark:bg-white/10 dark:text-white/90 dark:hover:bg-white/15",
          )}
        >
          {props.trialLabel}
        </button>

        {props.trialNote ? (
          <div className="text-[11px] text-neutral-500 dark:text-white/55">{props.trialNote}</div>
        ) : null}
      </div>
    </div>
  );
}

function InfoRow({ title, desc }: { title: string; desc: string }) {
  return (
    <div className={cn(PANEL, "p-4")}>
      <div className="text-sm font-black text-neutral-900 dark:text-white/85">{title}</div>
      <div className="mt-1 text-xs text-neutral-600 dark:text-white/65">{desc}</div>
    </div>
  );
}
