// src/app/api/billing/status/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  billingConfig,
  getPricePresentation,
  syncSubscriptionsForUser,
} from "@/lib/billing/stripeService";
import { getEntitlementForUser } from "@/lib/billing/entitlement";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  const pricing = await getPricePresentation();
  const { monthlyPriceId, yearlyPriceId } = billingConfig();

  if (!session?.user) {
    return NextResponse.json({
      isAuthenticated: false,
      isSubscribed: false,

      // NEW (for UI)
      stripeStatus: null,
      subscriptionId: null,
      priceId: null,

      currentPlan: null,
      trialEligible: false,
      trialEndsAt: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,

      ...pricing,
    });
  }

  const userId = (session.user as any).id as string;

  // Stripe-first freshness
  await syncSubscriptionsForUser(userId).catch(() => {});

  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { trialUsedAt: true },
  });

  const ent = await getEntitlementForUser(userId);

  const isSubscribed = ent.ok;

  // plan mapping MUST use priceId (returned by entitlement)
  const currentPlan =
    ent.priceId === monthlyPriceId
      ? "monthly"
      : ent.priceId === yearlyPriceId
      ? "yearly"
      : null;

  return NextResponse.json({
    isAuthenticated: true,
    isSubscribed,

    // ✅ NEW: raw Stripe status + ids for display
    stripeStatus: ent.status ?? null,                // "trialing" | "active" | ...
    subscriptionId: ent.subscriptionId ?? null,      // stripeSubscriptionId
    priceId: ent.priceId ?? null,

    currentPlan,
    trialEligible: !u?.trialUsedAt,

    // ✅ IMPORTANT: return dates whether or not entitled
    trialEndsAt: ent.trialEnd ? ent.trialEnd.toISOString() : null,
    currentPeriodEnd: ent.currentPeriodEnd ? ent.currentPeriodEnd.toISOString() : null,
    cancelAtPeriodEnd: Boolean(ent.cancelAtPeriodEnd),

    ...pricing,
  });
}
