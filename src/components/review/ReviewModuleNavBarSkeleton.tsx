"use client";

import React from "react";
import { cn } from "@/lib/cn";
const ReviewModuleNavBarSkeleton = React.forwardRef<HTMLDivElement, {}>(
    function ReviewModuleNavBarSkeleton(_props, ref) {
        return (
            <div
                ref={ref}
                className="fixed inset-x-0 bottom-0 z-50 text-neutral-900 dark:text-white/90"
            >
                <div className="mx-auto max-w-6xl px-4 md:px-6 pb-[max(env(safe-area-inset-bottom),0px)]">
                    <div
                        className={cn(
                            "ui-card",
                            "bg-white/70 backdrop-blur-xl dark:bg-black/55 px-3 py-3",
                            "shadow-none",
                            "border-t border-black/10 dark:border-white/10",
                        )}
                    >
                        <div className="flex items-center justify-between gap-3">
                            <div className="ui-skel h-[44px] w-[150px] rounded-xl" />
                            <div className="ui-skel h-[44px] w-[170px] rounded-xl" />
                        </div>
                        <div className="mt-2 ui-skel h-3 w-72 rounded-lg opacity-70" />
                    </div>
                </div>
            </div>
        );
    },
);

export default ReviewModuleNavBarSkeleton;