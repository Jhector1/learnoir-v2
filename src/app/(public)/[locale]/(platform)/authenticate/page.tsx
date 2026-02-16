"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";

function safeCallbackUrl(raw: string | null | undefined, fallback: string) {
  const v = String(raw ?? "").trim();
  // allow only relative paths like "/en/profile?x=1"
  if (!v.startsWith("/")) return fallback;
  // block protocol-relative redirects like "//evil.com"
  if (v.startsWith("//")) return fallback;
  // (extra) block weird attempts with "http:" inside
  if (v.includes("://")) return fallback;
  return v;
}

export default function AuthenticatePage() {
  const locale = useLocale();
  const sp = useSearchParams();

  const fallback = `/${locale}`;
  const callbackUrl = safeCallbackUrl(sp.get("callbackUrl"), fallback);

  return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(1200px_700px_at_20%_0%,#151a2c_0%,#0b0d12_55%)] text-white/90">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden shadow-2xl">
          <div className="border-b border-white/10 bg-black/20 p-5">
            <div className="text-lg font-black tracking-tight">Sign in</div>
            <div className="mt-1 text-sm text-white/70">
              Continue to Zile Universe
              {/*to choose Google or any other sign-in method.*/}
            </div>
          </div>

          <div className="p-5 grid gap-3">
            <button
                onClick={() => signIn("keycloak", { callbackUrl })}
                className="
              group relative w-full rounded-xl
              border border-white/10
              bg-gradient-to-b from-white/10 to-white/5
              px-4 py-3
              text-sm font-extrabold text-white/90
              shadow-[0_10px_30px_rgba(0,0,0,0.35)]
              transition
              hover:border-white/20 hover:from-white/15 hover:to-white/10
              active:scale-[0.99]
              focus:outline-none focus:ring-2 focus:ring-emerald-300/40
            "
            >
            <span
                className="
                pointer-events-none absolute inset-0 rounded-xl
                opacity-0 blur-xl transition
                group-hover:opacity-100
                bg-[radial-gradient(600px_140px_at_50%_0%,rgba(16,185,129,0.20),transparent)]
              "
            />
              <span className="relative flex items-center justify-center gap-2">
              <KeycloakIcon className="h-4 w-4 opacity-90" />
              Continue
              <span className="ml-1 text-white/50 transition group-hover:text-white/70">
                →
              </span>
            </span>
            </button>

            <div className="text-xs text-white/50">
              You’ll be redirected back after login.
            </div>
          </div>
        </div>
      </main>
  );
}

function KeycloakIcon({ className = "" }: { className?: string }) {
  return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
            d="M12 2.75c2.6 2.1 5.3 2.9 8 3.35v6.3c0 4.8-3.2 8.8-8 9.9-4.8-1.1-8-5.1-8-9.9V6.1c2.7-.45 5.4-1.25 8-3.35Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
        />
        <path
            d="M9.2 12.2 11 14l4-4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
      </svg>
  );
}
