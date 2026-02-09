import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toDate(sec: number | null | undefined) {
  return typeof sec === "number" ? new Date(sec * 1000) : null;
}

function customerIdOf(sub: Stripe.Subscription) {
  return typeof sub.customer === "string" ? sub.customer : sub.customer.id;
}

async function upsertFromStripeSubscription(sub: Stripe.Subscription, hintedUserId?: string | null) {
  const customerId = customerIdOf(sub);

  const user =
    (hintedUserId
      ? await prisma.user.findUnique({ where: { id: hintedUserId }, select: { id: true, trialUsedAt: true, stripeCustomerId: true } })
      : null) ??
    (await prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
      select: { id: true, trialUsedAt: true, stripeCustomerId: true },
    }));

  if (!user) return null;

  // keep user.stripeCustomerId aligned
  if (!user.stripeCustomerId) {
    await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }

  const priceId = sub.items.data[0]?.price?.id ?? null;

  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: sub.id },
    create: {
      userId: user.id,
      stripeCustomerId: customerId,
      stripeSubscriptionId: sub.id,
      status: sub.status as any, // your enum matches Stripe strings
      priceId,
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

  // mark trial once (don’t overwrite)
  if (!user.trialUsedAt && sub.status === "trialing") {
    await prisma.user.update({ where: { id: user.id }, data: { trialUsedAt: new Date() } });
  }

  return {
    userId: user.id,
    status: sub.status,
    priceId,
    currentPeriodEnd: toDate(sub.current_period_end),
    trialEnd: toDate(sub.trial_end),
    customerId,
    subscriptionId: sub.id,
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
    return NextResponse.json({ ok: false, message: "Not a subscription Checkout Session." }, { status: 400 });
  }

  const subId = typeof cs.subscription === "string" ? cs.subscription : cs.subscription?.id ?? null;
  if (!subId) {
    return NextResponse.json({ ok: false, message: "Checkout session has no subscription yet." }, { status: 409 });
  }

  // user mapping: prefer metadata.userId, else signed-in user, else reject
  const metaUserId = (cs.metadata?.userId ?? null) as string | null;
  const targetUserId = metaUserId ?? signedInUserId ?? null;

  if (!targetUserId) {
    return NextResponse.json({ ok: false, message: "Not signed in and no userId in session metadata." }, { status: 401 });
  }

  // security: if signed in and metadata exists, they must match
  if (signedInUserId && metaUserId && signedInUserId !== metaUserId) {
    return NextResponse.json({ ok: false, message: "Forbidden." }, { status: 403 });
  }

  const sub = await stripe.subscriptions.retrieve(subId);

  const saved = await upsertFromStripeSubscription(sub, targetUserId);
  if (!saved) {
    return NextResponse.json({ ok: false, message: "Could not map subscription to a user." }, { status: 404 });
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
