// src/lib/billing/stripeService.ts
import "server-only";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";
import type { StripeSubscriptionStatus } from "@prisma/client";

export function billingConfig() {
  const monthlyPriceId = process.env.STRIPE_PRICE_MONTHLY_ID!;
  const yearlyPriceId = process.env.STRIPE_PRICE_YEARLY_ID!;
  const trialDays = Number(process.env.TRIAL_DAYS ?? 7);
  const appUrl = process.env.AUTH_URL!;
  if (!monthlyPriceId || !yearlyPriceId || !appUrl) {
    throw new Error("Missing STRIPE_PRICE_*_ID or AUTH_URL");
  }
  return { monthlyPriceId, yearlyPriceId, trialDays, appUrl };
}

function toDate(sec?: number | null) {
  return typeof sec === "number" ? new Date(sec * 1000) : null;
}

function mapStatus(s: Stripe.Subscription.Status): StripeSubscriptionStatus {
  // Stripe status strings match your Prisma enum names
  switch (s) {
    case "trialing":
    case "active":
    case "past_due":
    case "unpaid":
    case "canceled":
    case "incomplete":
    case "incomplete_expired":
    case "paused":
      return s;
    default:
      return "incomplete";
  }
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function getPricePresentation() {
  const { monthlyPriceId, yearlyPriceId, trialDays } = billingConfig();

  // defaults
  let monthlyPriceLabel = "$10 / mo";
  let yearlyPriceLabel = "$100 / yr";
  let yearlySavingsLabel: string | null = null;

  try {
    const [pM, pY] = await Promise.all([
      stripe.prices.retrieve(monthlyPriceId),
      stripe.prices.retrieve(yearlyPriceId),
    ]);

    const mAmt = (pM.unit_amount ?? 0) / 100;
    const yAmt = (pY.unit_amount ?? 0) / 100;
    const cur = pM.currency ?? "usd";

    monthlyPriceLabel = `${formatMoney(mAmt, cur)} / mo`;
    yearlyPriceLabel = `${formatMoney(yAmt, cur)} / yr`;

    if (mAmt > 0 && yAmt > 0) {
      const impliedYear = mAmt * 12;
      const pct = Math.round(((impliedYear - yAmt) / impliedYear) * 100);
      if (Number.isFinite(pct) && pct > 0) yearlySavingsLabel = `Save ${pct}%`;
    }
  } catch {
    // keep fallback
  }

  return {
    monthlyPriceId,
    yearlyPriceId,
    monthlyPriceLabel,
    yearlyPriceLabel,
    yearlySavingsLabel,
    trialDays,
  };
}

export async function ensureStripeCustomer(userId: string) {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, stripeCustomerId: true },
  });
  if (!u) throw new Error("User not found");

  if (u.stripeCustomerId) return u.stripeCustomerId;

  const customer = await stripe.customers.create({
    email: u.email ?? undefined,
    metadata: { userId },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

export async function createCheckoutSession(args: {
  userId: string;
  priceId: string;
  useTrial: boolean;
}) {
  const { appUrl, trialDays } = billingConfig();
  const customerId = await ensureStripeCustomer(args.userId);

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: args.priceId, quantity: 1 }],

    // ✅ CRITICAL: subscription metadata = mapping for future portal changes
    subscription_data: {
      ...(args.useTrial ? { trial_period_days: trialDays } : {}),
      metadata: { userId: args.userId, priceId: args.priceId },
    },

    // helpful extra mapping
    client_reference_id: args.userId,

    allow_promotion_codes: true,
   success_url: `${appUrl}/billing?success=1&session_id={CHECKOUT_SESSION_ID}`,
cancel_url: `${appUrl}/billing?canceled=1`,

    // ok to keep session metadata too
    metadata: { userId: args.userId, priceId: args.priceId, useTrial: String(args.useTrial) },
  });

  return { url: checkout.url };
}

export async function createBillingPortalSession(userId: string) {
  const { appUrl } = billingConfig();

  const customerId = await ensureStripeCustomer(userId);

  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}/billing`,
  });

  return { url: portal.url };
}

export async function upsertFromStripeSubscription(sub: Stripe.Subscription, userId?: string | null) {
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  const user =
    (userId
      ? await prisma.user.findUnique({ where: { id: userId }, select: { id: true, trialUsedAt: true } })
      : null) ??
    (await prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
      select: { id: true, trialUsedAt: true },
    }));

  if (!user) return;

  const priceId = sub.items.data[0]?.price?.id ?? null;

  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: sub.id },
    create: {
      userId: user.id,
      stripeCustomerId: customerId,
      stripeSubscriptionId: sub.id,
      status: sub.status as any,
      priceId,
      // ✅ correct field for access window
      currentPeriodEnd: toDate(sub.current_period_end),
      cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
      trialEnd: toDate(sub.trial_end),
    },
    update: {
      userId: user.id,
      stripeCustomerId: customerId,
      status: sub.status as any,
      priceId,
      currentPeriodEnd: toDate(sub.current_period_end),
      cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
      trialEnd: toDate(sub.trial_end),
    },
  });

  // ✅ mark trial usage once (don’t overwrite)
  if (!user.trialUsedAt && sub.status === "trialing") {
    await prisma.user.update({
      where: { id: user.id },
      data: { trialUsedAt: new Date() },
    });
  }
}


/**
 * Optional but recommended: “sync-on-read”
 * Pull Stripe subscriptions and upsert them so UI/entitlement reflects Stripe immediately
 * even if webhook is delayed.
 */
export async function syncSubscriptionsForUser(userId: string) {
  const customerId = await ensureStripeCustomer(userId);

  const list = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 10,
    expand: ["data.items.data.price"],
  });

  for (const sub of list.data) {
    await upsertFromStripeSubscription(sub, userId);
  }
}

