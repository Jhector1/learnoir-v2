// src/app/api/billing/checkout/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { billingConfig, createCheckoutSession } from "@/lib/billing/stripeService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;

  if (!userId) {
    return NextResponse.json(
      { message: "Not signed in.", redirectTo: "/authenticate?callbackUrl=/billing" },
      { status: 401 }
    );
  }

  const body = (await req.json().catch(() => null)) as
    | { plan?: "monthly" | "yearly"; useTrial?: boolean }
    | null;

  const { monthlyPriceId, yearlyPriceId } = billingConfig();

  const requested =
    body?.plan === "yearly" ? yearlyPriceId : monthlyPriceId;

  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { trialUsedAt: true },
  });

  const useTrial = Boolean(body?.useTrial) && !u?.trialUsedAt;

  const { url } = await createCheckoutSession({
    userId,
    priceId: requested,
    useTrial,
  });

  return NextResponse.json({ url });
}
