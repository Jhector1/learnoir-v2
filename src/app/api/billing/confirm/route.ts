// src/app/api/billing/confirm/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toDate(sec: number | null | undefined) {
  return typeof sec === "number" ? new Date(sec * 1000) : null;
}

function customerIdOf(sub: Stripe.Subscription) {
  return typeof sub.customer === "string" ? sub.customer : sub.customer.id;
}

/**
 * Stripe removed subscription.current_period_end.
 * Use the earliest item current_period_end as the "next renewal" boundary.
 * (For normal single-item subs, this is just that item's end.)
 */
function minItemPeriodEndSec(sub: Stripe.Subscription): number | null {
  const secs =
      sub.items?.data
          ?.map((it: any) => it?.current_period_end)
          ?.filter((x: any): x is number => typeof x === "number") ?? [];
  if (!secs.length) return null;
  return Math.min(...secs);
}

async function upsertFromStripeSubscription(
    stripeSub: Stripe.Subscription,
    hintedUserId?: string | null,
) {
  const customerId = customerIdOf(stripeSub);

  const user =
      (hintedUserId
          ? await prisma.user.findUnique({
            where: { id: hintedUserId },
            select: { id: true, trialUsedAt: true, stripeCustomerId: true },
          })
          : null) ??
      (await prisma.user.findUnique({
        where: { stripeCustomerId: customerId },
        select: { id: true, trialUsedAt: true, stripeCustomerId: true },
      }));

  if (!user) return null;

  // keep user.stripeCustomerId aligned
  if (!user.stripeCustomerId) {
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const priceId = stripeSub.items.data[0]?.price?.id ?? null;

  const currentPeriodEnd = toDate(minItemPeriodEndSec(stripeSub));

  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: stripeSub.id },
    create: {
      userId: user.id,
      stripeCustomerId: customerId,
      stripeSubscriptionId: stripeSub.id,
      status: stripeSub.status as any,
      priceId,
      currentPeriodEnd, // ✅ derived from items
      cancelAtPeriodEnd: Boolean(stripeSub.cancel_at_period_end),
      trialEnd: toDate(stripeSub.trial_end),
    },
    update: {
      userId: user.id,
      stripeCustomerId: customerId,
      status: stripeSub.status as any,
      priceId,
      currentPeriodEnd, // ✅ derived from items
      cancelAtPeriodEnd: Boolean(stripeSub.cancel_at_period_end),
      trialEnd: toDate(stripeSub.trial_end),
    },
  });

  // mark trial once (don’t overwrite)
  if (!user.trialUsedAt && stripeSub.status === "trialing") {
    await prisma.user.update({
      where: { id: user.id },
      data: { trialUsedAt: new Date() },
    });
  }

  return {
    userId: user.id,
    status: stripeSub.status,
    priceId,
    currentPeriodEnd,
    trialEnd: toDate(stripeSub.trial_end),
    customerId,
    subscriptionId: stripeSub.id,
  };
}

export async function POST(req: Request) {
  const session = await auth().catch(() => null);
  const signedInUserId = (session?.user as any)?.id as string | undefined;

  const body = (await req.json().catch(() => null)) as { sessionId?: string } | null;
  const sessionId = body?.sessionId;

  if (!sessionId) {
    return NextResponse.json({ ok: false, message: "Missing sessionId" }, { status: 400 });
  }

  // Pull the checkout session from Stripe (truth)
  const cs = await stripe.checkout.sessions.retrieve(sessionId);

  if (cs.mode !== "subscription") {
    return NextResponse.json(
        { ok: false, message: "Not a subscription Checkout Session." },
        { status: 400 },
    );
  }

  const subId =
      typeof cs.subscription === "string" ? cs.subscription : cs.subscription?.id ?? null;

  if (!subId) {
    return NextResponse.json(
        { ok: false, message: "Checkout session has no subscription yet." },
        { status: 409 },
    );
  }

  // user mapping: prefer metadata.userId, else signed-in user, else reject
  const metaUserId = (cs.metadata?.userId ?? null) as string | null;
  const targetUserId = metaUserId ?? signedInUserId ?? null;

  if (!targetUserId) {
    return NextResponse.json(
        { ok: false, message: "Not signed in and no userId in session metadata." },
        { status: 401 },
    );
  }

  // security: if signed in and metadata exists, they must match
  if (signedInUserId && metaUserId && signedInUserId !== metaUserId) {
    return NextResponse.json({ ok: false, message: "Forbidden." }, { status: 403 });
  }

  const stripeSub = await stripe.subscriptions.retrieve(subId);

  const saved = await upsertFromStripeSubscription(stripeSub, targetUserId);
  if (!saved) {
    return NextResponse.json(
        { ok: false, message: "Could not map subscription to a user." },
        { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    status: saved.status,
    priceId: saved.priceId,
    currentPeriodEnd: saved.currentPeriodEnd ? saved.currentPeriodEnd.toISOString() : null,
    trialEnd: saved.trialEnd ? saved.trialEnd.toISOString() : null,
    customerId: saved.customerId,
    subscriptionId: saved.subscriptionId,
  });
}