// src/components/review/module/ReviewModuleNavBar.tsx
"use client";

import React from "react";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

export default function ReviewModuleNavBar({
  locale,
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
    router.push(`/subjects/${encodeURIComponent(subjectSlug)}/review/${encodeURIComponent(mid)}`);
    router.refresh();
  };

  const showNext = Boolean(nextModuleId) && canGoNext;

  return (
    <div className="sticky bottom-0 z-30  mt-6 text-neutral-900 dark:text-white/90">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className={cn("ui-card", "bg-white/70 backdrop-blur-xl dark:bg-black/55 px-3 py-3")}>
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={!prevModuleId}
              onClick={() => prevModuleId && go(prevModuleId)}
              className={cn(
                "ui-btn ui-btn-secondary",
                "px-4 py-3 text-sm font-extrabold",
                !prevModuleId && "opacity-50 cursor-not-allowed",
              )}
            >
              <span aria-hidden>←</span>
              <span>Prev module</span>
            </button>

            {showNext ? (
              <button
                type="button"
                onClick={() => nextModuleId && go(nextModuleId)}
                className={cn(
                  "ui-btn",
                  "px-4 py-3 text-sm font-extrabold",
                  "border border-emerald-600/25 bg-emerald-500/10 text-emerald-900 hover:bg-emerald-500/15",
                  "dark:border-emerald-300/30 dark:bg-emerald-300/10 dark:text-white/90 dark:hover:bg-emerald-300/15",
                )}
              >
                <span>Next module</span>
                <span aria-hidden>→</span>
              </button>
            ) : null}
          </div>

          {!canGoNext && nextModuleId ? (
            <div className="mt-2 text-xs text-neutral-600 dark:text-white/60">
              Complete this module to unlock <span className="font-black">Next</span>.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
