"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";

import ReviewModuleNavBar from "@/components/review/ReviewModuleNavBar";
import ReviewModuleNavBarSkeleton from "@/components/review/ReviewModuleNavBarSkeleton";

import type { ReviewModule } from "@/lib/subjects/types";
import { getReviewModule } from "@/lib/subjects/registry";
import ReviewModuleView from "@/components/review/module/ReviewModuleView";

type NavInfo = {
    prevModuleId: string | null;
    nextModuleId: string | null;
    index: number;
    total: number;
};

export default function ReviewModulePageClient({ canUnlockAll }: { canUnlockAll: boolean }) {
    const params = useParams<{ locale: string; subjectSlug: string; moduleSlug: string }>();

    const locale = params?.locale ?? "en";
    const subjectSlug = params?.subjectSlug ?? "";
    const moduleId = params?.moduleSlug ?? "";

    const mod: ReviewModule | null = useMemo(() => {
        if (!subjectSlug || !moduleId) return null;
        return getReviewModule(subjectSlug, moduleId);
    }, [subjectSlug, moduleId]);

    const [nav, setNav] = useState<NavInfo | null | undefined>(undefined);
    const [moduleComplete, setModuleComplete] = useState(false);

    const navLoading = nav === undefined;
    const isLastModule = Boolean(nav && !nav.nextModuleId);
    const canGetCertificate = isLastModule && (canUnlockAll ? true : moduleComplete);

    useEffect(() => {
        if (!subjectSlug || !moduleId) return;

        setNav(undefined);

        fetch(
            `/api/review/module-nav?subjectSlug=${encodeURIComponent(subjectSlug)}&moduleId=${encodeURIComponent(moduleId)}`,
            { cache: "no-store" },
        )
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => setNav(d ?? null))
            .catch(() => setNav(null));
    }, [subjectSlug, moduleId]);

    useEffect(() => {
        setModuleComplete(false);
    }, [subjectSlug, moduleId, locale]);

    // ✅ measure footer height (skeleton + real)
    const footerRef = useRef<HTMLDivElement | null>(null);
    const [footerH, setFooterH] = useState(0);

    useLayoutEffect(() => {
        const el = footerRef.current;
        if (!el) return;

        const measure = () => setFooterH(Math.ceil(el.getBoundingClientRect().height));
        measure();

        if (typeof ResizeObserver === "undefined") {
            window.addEventListener("resize", measure);
            return () => window.removeEventListener("resize", measure);
        }

        const ro = new ResizeObserver(() => measure());
        ro.observe(el);
        return () => ro.disconnect();
    }, [navLoading]);

    if (!mod) {
        return (
            <div className="min-h-screen p-6 bg-[radial-gradient(1200px_700px_at_20%_0%,#151a2c_0%,#0b0d12_50%)] text-white/90">
                <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                    <div className="text-lg font-black">Review module not found</div>
                    <div className="mt-2 text-sm text-white/70">
                        Subject <code className="text-white/90">{subjectSlug}</code>, module{" "}
                        <code className="text-white/90">{moduleId}</code> is not registered.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen overflow-hidden flex flex-col">
            <div className="flex-1 min-h-0">
                <ReviewModuleView
                    key={`${locale}:${subjectSlug}:${moduleId}`}
                    mod={mod}
                    canUnlockAll={canUnlockAll}
                    onModuleCompleteChange={setModuleComplete}
                    footerInsetPx={footerH}
                />
            </div>

            {/*{navLoading ? (*/}
            {/*    <ReviewModuleNavBarSkeleton ref={footerRef} />*/}
            {/*) : (*/}
            {/*    <ReviewModuleNavBar*/}
            {/*        ref={footerRef}*/}
            {/*        locale={locale}*/}
            {/*        subjectSlug={subjectSlug}*/}
            {/*        prevModuleId={nav?.prevModuleId ?? null}*/}
            {/*        nextModuleId={nav?.nextModuleId ?? null}*/}
            {/*        canGoNext={canUnlockAll ? true : moduleComplete}*/}
            {/*        isLastModule={isLastModule}*/}
            {/*        canGetCertificate={canGetCertificate}*/}
            {/*    />*/}
            {/*)}*/}
        </div>
    );
}