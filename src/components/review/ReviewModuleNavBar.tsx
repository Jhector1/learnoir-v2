"use client";

import React from "react";
import { useRouter } from "@/i18n/navigation";

export default function ReviewModuleNavBar({
  locale, // you can keep it, but we won't prefix it in the pathname
  subjectSlug,
  prevModuleId,
  nextModuleId,
  canGoNext,
}: {
  locale: string;
  subjectSlug: string;
  prevModuleId: string | null;
  nextModuleId: string | null;
  canGoNext: boolean;
}) {
  const router = useRouter();

  const go = (mid: string) => {
    // ✅ DO NOT prefix /${locale} — next-intl router adds locale automatically
    router.push(
      `/subjects/${encodeURIComponent(subjectSlug)}/review/${encodeURIComponent(mid)}`,
      // If your next-intl router supports it, you can force locale explicitly:
      // { locale }
    );

    // ✅ helps ensure the next module data is fetched immediately
    router.refresh();
  };

  const showNext = Boolean(nextModuleId) && canGoNext;

  return (
    <div className="sticky bottom-0 z-30 mt-6 text-white/90">
      <div className="mx-auto max-w-6xl px-4 md:px-6 pb-4">
        <div className="rounded-2xl border border-white/10 bg-black/60 backdrop-blur px-3 py-3">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={!prevModuleId}
              onClick={() => prevModuleId && go(prevModuleId)}
              className={[
                "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-extrabold transition",
                "text-white/90",
                prevModuleId
                  ? "border-white/10 bg-white/10 hover:bg-white/15"
                  : "border-white/10 bg-white/5 text-white/50 opacity-50 cursor-not-allowed",
              ].join(" ")}
            >
              <span aria-hidden>←</span>
              <span>Prev module</span>
            </button>

            {/* ✅ Only show Next when unlocked */}
            {showNext ? (
              <button
                type="button"
                onClick={() => nextModuleId && go(nextModuleId)}
                className={[
                  "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-extrabold transition",
                  "border-emerald-300/30 bg-emerald-300/10 hover:bg-emerald-300/15 text-emerald-50",
                ].join(" ")}
              >
                <span>Next module</span>
                <span aria-hidden>→</span>
              </button>
            ) : null}
          </div>

          {/* ✅ show lock message only if there's a next module but it's locked */}
          {!canGoNext && nextModuleId ? (
            <div className="mt-2 text-xs text-white/60">
              Complete this module to unlock{" "}
              <span className="font-black">Next</span>.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
