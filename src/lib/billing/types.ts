export type BillingStatus = {
    isAuthenticated: boolean;
    isSubscribed: boolean;

    // Stripe details for display
    stripeStatus: string | null; // "trialing" | "active" | "past_due" | ...
    subscriptionId: string | null;
    priceId: string | null;

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
