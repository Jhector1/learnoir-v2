"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type ConfirmResp =
  | {
      ok: true;
      status: string;
      priceId: string | null;
      currentPeriodEnd: string | null;
      trialEnd: string | null;
      customerId: string | null;
      subscriptionId: string | null;
    }
  | { ok: false; message: string };

function cn(...cls: Array<string | false | undefined | null>) {
  return cls.filter(Boolean).join(" ");
}

const CARD =
  "rounded-3xl border border-neutral-200/70 bg-white/80 shadow-sm overflow-hidden " +
  "dark:border-white/10 dark:bg-neutral-950/60 dark:shadow-none";

const PANEL =
  "rounded-2xl border border-neutral-200/70 bg-white/70 shadow-sm " +
  "dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none";

const SOFT =
  "rounded-2xl border border-neutral-200/70 bg-neutral-50/80 " +
  "dark:border-white/10 dark:bg-black/20";

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-extrabold",
        "border-neutral-200/70 bg-white/70 text-neutral-700",
        "dark:border-white/10 dark:bg-white/[0.04] dark:text-white/80",
      )}
    >
      {children}
    </span>
  );
}

function formatWhen(x: string | null) {
  if (!x) return "—";
  const d = new Date(x);
  if (Number.isNaN(d.getTime())) return x;
  return d.toLocaleString();
}

function planFromPriceId(priceId: string | null) {
  const id = (priceId ?? "").toLowerCase();
  if (id.includes("year") || id.includes("annual")) return "Yearly";
  if (id.includes("month") || id.includes("monthly")) return "Monthly";
  return "Subscription";
}

export default function BillingSuccessPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const sessionId = sp.get("session_id");

  const [busy, setBusy] = useState(true);
  const [data, setData] = useState<ConfirmResp | null>(null);

  useEffect(() => {
    (async () => {
      if (!sessionId) {
        setData({ ok: false, message: "Missing session_id in URL." });
        setBusy(false);
        return;
      }

      setBusy(true);
      try {
        const r = await fetch("/api/billing/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const j = (await r.json().catch(() => null)) as ConfirmResp | null;

        if (!r.ok || !j) {
          setData({
            ok: false,
            message: (j as any)?.message ?? "Confirm failed.",
          });
        } else {
          setData(j);
        }
      } catch (e: any) {
        setData({ ok: false, message: e?.message ?? "Confirm failed." });
      } finally {
        setBusy(false);
      }
    })();
  }, [sessionId]);

  const ok = data?.ok === true;

  const planName = useMemo(
    () => (ok ? planFromPriceId((data as any).priceId ?? null) : "Subscription"),
    [ok, data],
  );

  return (
    <div className="relative min-h-screen p-6 bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white">
      {/* Elegant background (matches homepage vibe) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute top-[25%] right-[-120px] h-[420px] w-[420px] rounded-full bg-indigo-400/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] [background-image:radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.9)_1px,transparent_0)] [background-size:18px_18px]" />
      </div>

      <div className="relative mx-auto grid max-w-2xl gap-4">
        <div className={CARD}>
          {/* Header */}
          <div className="border-b border-neutral-200/70 bg-white/70 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-black/20">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-extrabold tracking-wide text-neutral-500 dark:text-white/60">
                  Billing
                </div>

                <div className="mt-1 text-lg font-black tracking-tight">
                  {busy
                    ? "Finalizing subscription…"
                    : ok
                      ? "✅ Subscription active"
                      : "⚠️ Subscription not confirmed"}
                </div>

                <div className="mt-1 text-sm text-neutral-600 dark:text-white/70">
                  {busy
                    ? "One moment — we’re syncing your plan."
                    : ok
                      ? "You’re all set. Your learning experience is unlocked."
                      : "We couldn’t confirm the subscription yet."}
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <Pill>Plan: {planName}</Pill>
                {ok ? <Pill>Status: {(data as any).status}</Pill> : null}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 grid gap-4">
            {/* Error state */}
            {!busy && !ok ? (
              <div
                className={cn(
                  "rounded-2xl border p-5",
                  "border-rose-300/40 bg-rose-100/60 text-neutral-900",
                  "dark:border-rose-300/30 dark:bg-rose-300/10 dark:text-white/90",
                )}
              >
                <div className="font-black">Error</div>
                <div className="mt-1 text-xs opacity-80">
                  {(data as any)?.message ?? "Unknown error."}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => window.location.reload()}
                    className={cn(
                      "rounded-xl border px-4 py-2 text-xs font-extrabold transition",
                      "border-neutral-200 bg-white hover:bg-neutral-50",
                      "dark:border-white/10 dark:bg-white/10 dark:text-white/90 dark:hover:bg-white/15",
                    )}
                  >
                    Retry
                  </button>
                  <button
                    onClick={() => router.push("/billing")}
                    className={cn(
                      "rounded-xl border px-4 py-2 text-xs font-extrabold transition",
                      "border-neutral-200 bg-white/70 text-neutral-800 hover:bg-white",
                      "dark:border-white/10 dark:bg-white/[0.04] dark:text-white/80 dark:hover:bg-white/[0.08]",
                    )}
                  >
                    Go to Billing
                  </button>
                </div>
              </div>
            ) : null}

            {/* Success state */}
            {!busy && ok ? (
              <div className="grid gap-4">
                {/* Summary chips */}
                <div className="flex flex-wrap gap-2">
                  <Pill>Status: {(data as any).status}</Pill>
                  {(data as any).trialEnd ? (
                    <Pill>Trial ends: {formatWhen((data as any).trialEnd)}</Pill>
                  ) : null}
                  {(data as any).currentPeriodEnd ? (
                    <Pill>Renews: {formatWhen((data as any).currentPeriodEnd)}</Pill>
                  ) : null}
                </div>

                {/* “What this unlocks” (reflect homepage promise) */}
                <div className={PANEL + " p-5"}>
                  <div className="text-xs font-extrabold tracking-wide text-neutral-500 dark:text-white/60">
                    What’s now unlocked
                  </div>

                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <div className={SOFT + " p-4"}>
                      <div className="text-sm font-black text-neutral-900 dark:text-white/90">
                        Practice + Feedback
                      </div>
                      <div className="mt-1 text-sm text-neutral-600 dark:text-white/70">
                        Interactive exercises, instant checks, and targeted review.
                      </div>
                    </div>

                    <div className={SOFT + " p-4"}>
                      <div className="text-sm font-black text-neutral-900 dark:text-white/90">
                        Assignments + Progress
                      </div>
                      <div className="mt-1 text-sm text-neutral-600 dark:text-white/70">
                        Track progress by subject and keep learning consistent.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Plan details */}
                <div className={PANEL + " p-5"}>
                  <div className="text-xs font-extrabold tracking-wide text-neutral-500 dark:text-white/60">
                    Plan
                  </div>
                  <div className="mt-1 text-sm font-black text-neutral-900 dark:text-white/90">
                    {planName}
                  </div>

                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <div className={cn(SOFT, "p-4")}>
                      <div className="text-[11px] font-extrabold text-neutral-500 dark:text-white/60">
                        Price ID
                      </div>
                      <div className="mt-1 text-xs break-all text-neutral-700 dark:text-white/80">
                        {(data as any).priceId ?? "—"}
                      </div>
                    </div>
                    <div className={cn(SOFT, "p-4")}>
                      <div className="text-[11px] font-extrabold text-neutral-500 dark:text-white/60">
                        Subscription ID
                      </div>
                      <div className="mt-1 text-xs break-all text-neutral-700 dark:text-white/80">
                        {(data as any).subscriptionId ?? "—"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => router.push("/practice")}
                    className={cn(
                      "rounded-2xl border px-4 py-2 text-sm font-extrabold transition",
                      "border-emerald-300/50 bg-emerald-400 text-neutral-950 hover:bg-emerald-300",
                      "dark:border-emerald-300/30 dark:bg-emerald-300/15 dark:text-white/90 dark:hover:bg-emerald-300/20",
                    )}
                  >
                    Continue learning
                  </button>

                  <button
                    onClick={() => router.push("/billing")}
                    className={cn(
                      "rounded-2xl border px-4 py-2 text-sm font-extrabold transition",
                      "border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900",
                      "dark:border-white/10 dark:bg-white/10 dark:text-white/90 dark:hover:bg-white/15",
                    )}
                  >
                    Manage billing
                  </button>
                </div>
              </div>
            ) : null}

            {/* Loading */}
            {busy ? (
              <div className={PANEL + " p-5"}>
                <div className="text-sm font-black text-neutral-900 dark:text-white/90">
                  Syncing your plan…
                </div>
                <div className="mt-1 text-sm text-neutral-600 dark:text-white/70">
                  We’re confirming your Stripe subscription and enabling premium features.
                </div>
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-white/10">
                  <div className="h-full w-1/2 rounded-full bg-emerald-400/70" />
                </div>
                <div className="mt-3 text-xs text-neutral-500 dark:text-white/60">
                  This usually takes a few seconds.
                </div>
              </div>
            ) : null}

            {/* Footer note */}
            <div className="pt-2 text-xs text-neutral-500 dark:text-white/55">
              Need help? Contact support from the Billing page.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
