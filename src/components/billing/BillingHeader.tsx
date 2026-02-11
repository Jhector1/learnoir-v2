import React from "react";
import { cn } from "@/lib/cn";
import type { BillingStatus } from "@/lib/billing/types";
import Badge from "./Badge";

export default function BillingHeader({
                                          busy,
                                          loading,
                                          status,
                                          headlineBadge,
                                          onManageBilling,
                                          onSignIn,
                                      }: {
    busy: boolean;
    loading: boolean;
    status: BillingStatus | null;
    headlineBadge: { tone: "neutral" | "good" | "warn"; text: string } | null;
    onManageBilling: () => void;
    onSignIn: () => void;
}) {
    return (
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
                        Choose a plan that matches your learning pace. Cancel anytime from the
                        portal.
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                        {headlineBadge ? <Badge tone={headlineBadge.tone}>{headlineBadge.text}</Badge> : null}
                        {status?.isAuthenticated ? <Badge>Signed in</Badge> : <Badge tone="warn">Sign in required</Badge>}
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={onManageBilling}
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
                            onClick={onSignIn}
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
    );
}
