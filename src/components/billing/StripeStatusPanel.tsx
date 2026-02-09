"use client";

import React, { useMemo } from "react";

export type StripeSubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "unpaid"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "paused"
  | "none";

export type BillingPlan = "monthly" | "yearly" | "unknown";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

const PILL_BASE =
  "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-extrabold";
const PILL_NEUTRAL =
  "border-neutral-200/70 bg-white/70 text-neutral-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/80";
const PILL_GOOD =
  "border-emerald-300/40 bg-emerald-300/15 text-emerald-900 dark:border-emerald-300/20 dark:bg-emerald-300/10 dark:text-emerald-100";
const PILL_WARN =
  "border-amber-300/40 bg-amber-300/15 text-amber-900 dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-100";
const PILL_BAD =
  "border-rose-300/40 bg-rose-300/15 text-rose-900 dark:border-rose-300/20 dark:bg-rose-300/10 dark:text-rose-100";

function formatWhen(x: string | null | undefined) {
  if (!x) return "—";
  const d = new Date(x);
  if (Number.isNaN(d.getTime())) return String(x);
  return d.toLocaleString();
}

function toneForStatus(s: StripeSubscriptionStatus) {
  switch (s) {
    case "active":
    case "trialing":
      return "good";
    case "past_due":
    case "incomplete":
    case "paused":
      return "warn";
    case "unpaid":
    case "canceled":
    case "incomplete_expired":
      return "bad";
    default:
      return "neutral";
  }
}

function labelForStatus(s: StripeSubscriptionStatus) {
  switch (s) {
    case "trialing":
      return "Trialing";
    case "active":
      return "Active";
    case "past_due":
      return "Past due";
    case "unpaid":
      return "Unpaid";
    case "canceled":
      return "Canceled";
    case "incomplete":
      return "Incomplete";
    case "incomplete_expired":
      return "Incomplete expired";
    case "paused":
      return "Paused";
    case "none":
    default:
      return "No subscription";
  }
}

function pillClass(tone: ReturnType<typeof toneForStatus>) {
  if (tone === "good") return cn(PILL_BASE, PILL_GOOD);
  if (tone === "warn") return cn(PILL_BASE, PILL_WARN);
  if (tone === "bad") return cn(PILL_BASE, PILL_BAD);
  return cn(PILL_BASE, PILL_NEUTRAL);
}

function planLabel(plan: BillingPlan) {
  if (plan === "monthly") return "Monthly";
  if (plan === "yearly") return "Yearly";
  return "Subscription";
}

export function StripeStatusPanel(props: {
  // Status from Stripe/DB
  status?: StripeSubscriptionStatus | string | null;

  // Prefer passing plan from the server; don't infer from priceId
  plan?: BillingPlan | null;

  // Dates
  trialEnd?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean | null;

  // Optional identifiers
  priceId?: string | null;
  subscriptionId?: string | null;

  // UI controls
  showIds?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const s = (props.status ?? "none") as StripeSubscriptionStatus;
  const tone = toneForStatus(s);

  const pills = useMemo(() => {
    const out: Array<{ k: string; text: string; tone?: "good" | "warn" | "bad" | "neutral" }> = [];

    out.push({ k: "status", text: `Status: ${labelForStatus(s)}`, tone });

    if (props.plan) out.push({ k: "plan", text: `Plan: ${planLabel(props.plan)}` });

    // trial end only makes sense if status is trialing OR trialEnd exists
    if (props.trialEnd) out.push({ k: "trialEnd", text: `Trial ends: ${formatWhen(props.trialEnd)}` });

    if (props.currentPeriodEnd) out.push({ k: "renews", text: `Renews: ${formatWhen(props.currentPeriodEnd)}` });

    if (props.cancelAtPeriodEnd) out.push({ k: "cancel", text: "Canceling at period end", tone: "warn" });

    return out;
  }, [s, tone, props.plan, props.trialEnd, props.currentPeriodEnd, props.cancelAtPeriodEnd]);

  const compact = Boolean(props.compact);

  return (
    <div className={cn("grid gap-3", props.className)}>
      <div className={cn("flex flex-wrap gap-2", compact ? "text-[11px]" : "")}>
        {pills.map((p) => (
          <span key={p.k} className={pillClass(p.tone ?? "neutral")}>
            {p.text}
          </span>
        ))}
      </div>

      {props.showIds ? (
        <div
          className={cn(
            "rounded-2xl border p-4",
            "border-neutral-200/70 bg-white/70",
            "dark:border-white/10 dark:bg-white/[0.04]",
          )}
        >
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <div className="text-[11px] font-extrabold text-neutral-500 dark:text-white/60">Price ID</div>
              <div className="mt-1 text-xs break-all text-neutral-700 dark:text-white/80">{props.priceId ?? "—"}</div>
            </div>
            <div>
              <div className="text-[11px] font-extrabold text-neutral-500 dark:text-white/60">Subscription ID</div>
              <div className="mt-1 text-xs break-all text-neutral-700 dark:text-white/80">
                {props.subscriptionId ?? "—"}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
