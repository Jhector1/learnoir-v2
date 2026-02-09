"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import ReviewModuleView from "@/components/review/ReviewModuleView";
import ReviewModuleNavBar from "@/components/review/ReviewModuleNavBar";

import type { ReviewModule } from "@/lib/review/types";
import { getReviewModule } from "@/lib/review/registry";

type NavInfo = {
  prevModuleId: string | null;
  nextModuleId: string | null;
  index: number;
  total: number;
};

export default function ReviewModulePage() {
  const params = useParams<{
    locale: string;
    subjectSlug: string;
    moduleId: string;
  }>();

  const locale = params?.locale ?? "en";
  const subjectSlug = params?.subjectSlug ?? "";
  const moduleId = params?.moduleId ?? "";

  const mod: ReviewModule | null = useMemo(() => {
    if (!subjectSlug || !moduleId) return null;
    return getReviewModule(subjectSlug, moduleId);
  }, [subjectSlug, moduleId]);

  const [nav, setNav] = useState<NavInfo | null>(null);

  // ✅ this is now LIVE (fed by ReviewModuleView)
  const [moduleComplete, setModuleComplete] = useState(false);

  // DB order -> prev/next
  useEffect(() => {
    if (!subjectSlug || !moduleId) return;

    fetch(
      `/api/review/module-nav?subjectSlug=${encodeURIComponent(subjectSlug)}&moduleId=${encodeURIComponent(moduleId)}`,
      { cache: "no-store" },
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setNav(d))
      .catch(() => setNav(null));
  }, [subjectSlug, moduleId]);

  // optional: reset local moduleComplete immediately when switching modules
  useEffect(() => {
    setModuleComplete(false);
  }, [subjectSlug, moduleId, locale]);

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
    <div className="min-h-screen">
      <ReviewModuleView
        key={`${locale}:${subjectSlug}:${moduleId}`} // ✅ forces clean remount on route change
        mod={mod}
        onModuleCompleteChange={setModuleComplete} // ✅ live unlock
      />

      <ReviewModuleNavBar
        locale={locale}
        subjectSlug={subjectSlug}
        prevModuleId={nav?.prevModuleId ?? null}
        nextModuleId={nav?.nextModuleId ?? null}
        canGoNext={moduleComplete}
      />
    </div>
  );
}
