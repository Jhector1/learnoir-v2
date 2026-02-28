// src/app/(public)/[locale]/(platform)/billing/success/BillingSuccessPageClient.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";

type ConfirmResp =
    | {
  ok: true;
  status: string;
  priceId: string | null;
  currentPeriodEnd: string | null;
  trialEnd: string | null;
  subscriptionId: string | null;
}
    | { ok: false; message: string };

function safeInternalPathOrNull(path?: string | null) {
  const raw = String(path ?? "").trim();
  if (!raw) return null;
  if (raw.startsWith("//")) return null;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(raw)) return null;
  return raw.startsWith("/") ? raw : `/${raw}`;
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

function Pill({ children }: { children: React.ReactNode }) {
  return (
      <span
          className={cn(
              "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-extrabold",
              "border border-neutral-200/70 bg-white/70 text-neutral-700",
              "dark:border-white/10 dark:bg-white/[0.04] dark:text-white/80",
          )}
      >
      {children}
    </span>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
      <div
          className={cn(
              "rounded-3xl border overflow-hidden shadow-sm",
              "border-neutral-200/70 bg-white/80",
              "dark:border-white/10 dark:bg-neutral-950/60 dark:shadow-none",
          )}
      >
        {children}
      </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
      <div
          className={cn(
              "rounded-2xl border shadow-sm",
              "border-neutral-200/70 bg-white/70",
              "dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none",
          )}
      >
        {children}
      </div>
  );
}

function Soft({ children }: { children: React.ReactNode }) {
  return (
      <div
          className={cn(
              "rounded-2xl border",
              "border-neutral-200/70 bg-neutral-50/80",
              "dark:border-white/10 dark:bg-black/20",
          )}
      >
        {children}
      </div>
  );
}

export default function BillingSuccessPageClient() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const sessionId = sp.get("session_id");
  const nextParam = sp.get("next");

  const [busy, setBusy] = useState(true);
  const [data, setData] = useState<ConfirmResp | null>(null);
const COUNT_NUM = 10;
  // auto-redirect controls
  const [auto, setAuto] = useState(true);
  const [countdown, setCountdown] = useState(COUNT_NUM);
  const redirectedRef = useRef(false);
  const cancelAutoRef = useRef(false);

  const locale = useMemo(() => {
    const seg = (pathname ?? "").split("/").filter(Boolean)[0];
    return seg && seg.length === 2 ? seg : "en";
  }, [pathname]);

  const nextSafe = useMemo(() => {
    const p = safeInternalPathOrNull(nextParam);
    if (p) return p;
    return `/${locale}/billing`;
  }, [nextParam, locale]);

  const ok = data?.ok === true;

  const planName = useMemo(
      () => (ok ? planFromPriceId((data as any).priceId ?? null) : "Subscription"),
      [ok, data],
  );

  // confirm subscription
  useEffect(() => {
    let alive = true;

    (async () => {
      if (!sessionId || sessionId.includes("CHECKOUT_SESSION_ID")) {
        if (!alive) return;
        setData({ ok: false, message: "Missing/invalid session_id in URL." });
        setBusy(false);
        return;
      }

      setBusy(true);

      try {
        const r = await fetch("/api/billing/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ sessionId }),
        });

        const j = (await r.json().catch(() => null)) as ConfirmResp | null;
        if (!alive) return;

        if (!r.ok || !j) setData({ ok: false, message: (j as any)?.message ?? "Confirm failed." });
        else setData(j);
      } catch (e: any) {
        if (!alive) return;
        setData({ ok: false, message: e?.message ?? "Confirm failed." });
      } finally {
        if (!alive) return;
        setBusy(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [sessionId]);

  // auto-redirect with countdown + cancel
  useEffect(() => {
    if (busy) return;
    if (!ok) return;
    if (!auto) return;
    if (redirectedRef.current) return;
    if (cancelAutoRef.current) return;

    setCountdown(COUNT_NUM);

    const tick = setInterval(() => setCountdown((s) => Math.max(0, s - 1)), 1000);

    const go = setTimeout(() => {
      if (cancelAutoRef.current) return;
      redirectedRef.current = true;
      router.replace(nextSafe);
    }, 4000);

    return () => {
      clearInterval(tick);
      clearTimeout(go);
    };
  }, [busy, ok, auto, nextSafe, router]);

  return (
      <div
          className={cn(
              "relative min-h-screen text-neutral-900 dark:text-white",
              "bg-[radial-gradient(1200px_700px_at_20%_0%,#eafff5_0%,#ffffff_52%,#f6f7ff_100%)]",
              "dark:bg-[radial-gradient(1200px_700px_at_20%_0%,#151a2c_0%,#0b0d12_52%)]",
          )}
      >
        <div
            aria-hidden
            className={cn(
                "pointer-events-none absolute inset-x-0 top-0 h-48 opacity-70 blur-2xl",
                "bg-[linear-gradient(90deg,rgba(16,185,129,0.10),rgba(59,130,246,0.06),rgba(236,72,153,0.05))]",
                "dark:bg-[linear-gradient(90deg,rgba(110,231,183,0.08),rgba(147,197,253,0.05),rgba(251,113,133,0.04))]",
            )}
        />

        <div className="ui-container py-6 md:py-10 relative">
          <div className="mx-auto max-w-2xl grid gap-4">
            <Card>
              <div className="border-b border-neutral-200/70 bg-white/70 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-black/20">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <div className="text-xs font-extrabold tracking-wide text-neutral-500 dark:text-white/60">
                      Billing
                    </div>

                    <div className="mt-1 text-lg md:text-xl font-black tracking-tight">
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
                              ? "All set. We’ll take you back in a moment."
                              : "We couldn’t confirm the subscription yet."}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Pill>Plan: {planName}</Pill>
                    {ok ? <Pill>Status: {(data as any).status}</Pill> : null}
                  </div>
                </div>
              </div>

              <div className="p-6 grid gap-4">
                {!busy && !ok ? (
                    <Panel>
                      <div
                          className={cn(
                              "p-5 rounded-2xl",
                              "border border-rose-300/40 bg-rose-100/60 text-neutral-900",
                              "dark:border-rose-300/30 dark:bg-rose-300/10 dark:text-white/90",
                          )}
                      >
                        <div className="font-black">Error</div>
                        <div className="mt-1 text-xs opacity-80">{(data as any)?.message ?? "Unknown error."}</div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <button className="ui-btn ui-btn-secondary" onClick={() => window.location.reload()}>
                            Retry
                          </button>
                          <button className="ui-btn ui-btn-primary" onClick={() => router.push(`/${locale}/billing`)}>
                            Go to Billing
                          </button>
                        </div>
                      </div>
                    </Panel>
                ) : null}

                {!busy && ok ? (
                    <div className="grid gap-4">
                      <div className="flex flex-wrap gap-2">
                        <Pill>Status: {(data as any).status}</Pill>
                        {(data as any).trialEnd ? <Pill>Trial ends: {formatWhen((data as any).trialEnd)}</Pill> : null}
                        {(data as any).currentPeriodEnd ? (
                            <Pill>Renews: {formatWhen((data as any).currentPeriodEnd)}</Pill>
                        ) : null}
                      </div>

                      <Panel>
                        <div className="p-5 grid gap-3">
                          <div className="text-xs font-extrabold tracking-wide text-neutral-500 dark:text-white/60">
                            What’s now unlocked
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <Soft>
                              <div className="p-4">
                                <div className="text-sm font-black text-neutral-900 dark:text-white/90">Practice + Feedback</div>
                                <div className="mt-1 text-sm text-neutral-600 dark:text-white/70">
                                  Interactive exercises, instant checks, and targeted review.
                                </div>
                              </div>
                            </Soft>

                            <Soft>
                              <div className="p-4">
                                <div className="text-sm font-black text-neutral-900 dark:text-white/90">Assignments + Progress</div>
                                <div className="mt-1 text-sm text-neutral-600 dark:text-white/70">
                                  Track progress by subject and keep learning consistent.
                                </div>
                              </div>
                            </Soft>
                          </div>
                        </div>
                      </Panel>

                      <Panel>
                        <div className="p-5 grid gap-3">
                          <div className="text-xs font-extrabold tracking-wide text-neutral-500 dark:text-white/60">Next</div>

                          <div className="text-sm text-neutral-700 dark:text-white/80">
                            {auto ? (
                                <>
                                  Continuing in <span className="font-black tabular-nums">{countdown}</span>s…
                                </>
                            ) : (
                                <>Choose what to do next.</>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button className="ui-btn ui-btn-primary" onClick={() => router.replace(nextSafe)}>
                              Continue
                            </button>

                            {auto ? (
                                <button
                                    className="ui-btn ui-btn-secondary"
                                    onClick={() => {
                                      cancelAutoRef.current = true;
                                      setAuto(false);
                                    }}
                                >
                                  Stay here
                                </button>
                            ) : null}

                            <button className="ui-btn ui-btn-secondary" onClick={() => router.push(`/${locale}/billing`)}>
                              Manage billing
                            </button>
                          </div>
                        </div>
                      </Panel>
                    </div>
                ) : null}

                {busy ? (
                    <Panel>
                      <div className="p-5">
                        <div className="text-sm font-black text-neutral-900 dark:text-white/90">Syncing your plan…</div>
                        <div className="mt-1 text-sm text-neutral-600 dark:text-white/70">
                          We’re confirming your Stripe subscription and enabling premium features.
                        </div>

                        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-white/10">
                          <div className="h-full w-1/2 rounded-full bg-emerald-400/70" />
                        </div>

                        <div className="mt-3 text-xs text-neutral-500 dark:text-white/60">This usually takes a few seconds.</div>
                      </div>
                    </Panel>
                ) : null}

                <div className="pt-1 text-xs text-neutral-500 dark:text-white/55">
                  Tip: If you’re still seeing a lock, refresh once — subscription sync may have just finished.
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
  );
}