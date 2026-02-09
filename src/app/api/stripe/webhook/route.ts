// src/app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";
import { upsertFromStripeSubscription } from "@/lib/billing/stripeService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { message: "Missing STRIPE_WEBHOOK_SECRET" },
      { status: 500 },
    );
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ message: "Missing signature" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err: any) {
    return NextResponse.json(
      { message: `Webhook error: ${err?.message ?? "Invalid signature"}` },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      // Checkout completion can be useful, but sometimes subscription isn't attached yet.
      case "checkout.session.completed": {
        const cs = event.data.object as Stripe.Checkout.Session;
        if (cs.mode !== "subscription") break;

        const subId =
          typeof cs.subscription === "string"
            ? cs.subscription
            : cs.subscription?.id ?? null;

        if (!subId) break;

        const sub = await stripe.subscriptions.retrieve(subId);

        // Hint userId if present, but NOT required (upsert can map via customerId).
        const hintedUserId =
          (cs.metadata?.userId as string | undefined) ??
          (sub.metadata?.userId as string | undefined) ??
          null;

        await upsertFromStripeSubscription(sub, hintedUserId);
        break;
      }

      // These are the most important ones for keeping your DB in sync.
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;

        // Hint userId if present, otherwise upsert will map by stripeCustomerId.
        const hintedUserId = (sub.metadata?.userId as string | undefined) ?? null;

        await upsertFromStripeSubscription(sub, hintedUserId);
        break;
      }

      // Optional: invoice events (can help if you ever miss subscription.updated)
      case "invoice.paid":
      case "invoice.payment_failed": {
        const inv = event.data.object as Stripe.Invoice;
        const subId =
          typeof inv.subscription === "string"
            ? inv.subscription
            : inv.subscription?.id ?? null;

        if (!subId) break;

        const sub = await stripe.subscriptions.retrieve(subId);
        const hintedUserId = (sub.metadata?.userId as string | undefined) ?? null;

        await upsertFromStripeSubscription(sub, hintedUserId);
        break;
      }

      default:
        break;
    }
  } catch (e: any) {
    // Returning 500 tells Stripe to retry (good if DB/Stripe temporary issue)
    return NextResponse.json(
      { message: e?.message ?? "Webhook handler failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
