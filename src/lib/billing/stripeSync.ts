import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import type { StripeSubscriptionStatus } from "@prisma/client";

function toDate(sec?: number | null) {
  return sec ? new Date(sec * 1000) : null;
}

export async function syncSubscriptionsFromStripe(userId: string) {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });
  if (!u?.stripeCustomerId) return;

  const subs = await stripe.subscriptions.list({
    customer: u.stripeCustomerId,
    status: "all",
    limit: 10,
  });

  for (const sub of subs.data) {
    const priceId = sub.items.data[0]?.price?.id ?? null;

    await prisma.subscription.upsert({
      where: { stripeSubscriptionId: sub.id },
      update: {
        userId,
        stripeCustomerId: u.stripeCustomerId,
        status: sub.status as StripeSubscriptionStatus,
        priceId,
        currentPeriodEnd: toDate(sub.current_period_end),
        cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
        trialEnd: toDate(sub.trial_end),
      },
      create: {
        userId,
        stripeCustomerId: u.stripeCustomerId,
        stripeSubscriptionId: sub.id,
        status: sub.status as StripeSubscriptionStatus,
        priceId,
        currentPeriodEnd: toDate(sub.current_period_end),
        cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
        trialEnd: toDate(sub.trial_end),
      },
    });
  }
}
