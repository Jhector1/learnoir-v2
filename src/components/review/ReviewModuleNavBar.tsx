"use client";

import React from "react";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/utils";

type Props = {
    locale: string;
    subjectSlug: string;
    prevModuleId: string | null;
    nextModuleId: string | null;
    canGoNext: boolean;
    isLastModule: boolean;
    canGetCertificate: boolean;
};

const ReviewModuleNavBar = React.forwardRef<HTMLDivElement, Props>(function ReviewModuleNavBar(
    {
        locale,
        subjectSlug,
        prevModuleId,
        nextModuleId,
        canGoNext,
        isLastModule,
        canGetCertificate,
    },
    ref,
) {
    const router = useRouter();

    const goModule = (mid: string) => {
        router.push(ROUTES.moduleIntro(encodeURIComponent(subjectSlug), encodeURIComponent(mid)));
        router.refresh();
    };

    const goCertificate = () => {
        router.push(`/subjects/${encodeURIComponent(subjectSlug)}/certificate`);
        router.refresh();
    };

    const showNextModule = Boolean(nextModuleId) && canGoNext && !isLastModule;

    return (
        <div ref={ref} className="fixed inset-x-0 bottom-0 z-50 text-neutral-900 dark:text-white/90">
            <div className="mx-auto py-2 px-4 md:px-6 pb-[max(env(safe-area-inset-bottom),0px)]">
                <div
                    className={cn(
                        "ui-card",
                        "bg-white/70 py-2 backdrop-blur-xl dark:bg-black/55",
                        "!shadow-none !border-0", // ✅ no shadow/line
                    )}
                >
                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            disabled={!prevModuleId}
                            onClick={() => prevModuleId && goModule(prevModuleId)}
                            className={cn(
                                "ui-btn ui-btn-secondary",
                                "px-2 py-2 text-sm font-extrabold",
                                !prevModuleId && "opacity-50 cursor-not-allowed",
                            )}
                        >
                            <span aria-hidden>←</span>
                            <span>Prev module</span>
                        </button>

                        {isLastModule ? (
                            <button
                                type="button"
                                disabled={!canGetCertificate}
                                onClick={goCertificate}
                                className={cn(
                                    "ui-btn",
                                    "px-2 py-2 text-sm font-extrabold",
                                    canGetCertificate
                                        ? "ui-btn ui-btn-primary"
                                        : "ui-btn-secondary opacity-60 cursor-not-allowed",
                                )}
                            >
                                <span>Get certificate</span>
                                <span aria-hidden>→</span>
                            </button>
                        ) : showNextModule ? (
                            <button
                                type="button"
                                onClick={() => nextModuleId && goModule(nextModuleId)}
                                className={cn(
                                    "ui-btn",
                                    "px-2 py-2 text-sm font-extrabold",
                                    "border border-emerald-600/25 bg-emerald-500/10 text-emerald-900 hover:bg-emerald-500/15",
                                    "dark:border-emerald-300/30 dark:bg-emerald-300/10 dark:text-white/90 dark:hover:bg-emerald-300/15",
                                )}
                            >
                                <span>Next module</span>
                                <span aria-hidden>→</span>
                            </button>
                        ) : null}
                    </div>

                    {!isLastModule && !canGoNext && nextModuleId ? (
                        <div className="mt-2 text-xs text-neutral-600 dark:text-white/60">
                            Complete this module to unlock <span className="font-black">Next</span>.
                        </div>
                    ) : null}

                    {isLastModule && !canGetCertificate ? (
                        <div className="mt-2 text-xs text-neutral-600 dark:text-white/60">
                            Complete this module to unlock your <span className="font-black">certificate</span>.
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
});

ReviewModuleNavBar.displayName = "ReviewModuleNavBar";
export default ReviewModuleNavBar;