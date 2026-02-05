// src/components/review/module/hooks/useModuleNav.ts
"use client";

import { useEffect, useState } from "react";

export type ModuleNavInfo = {
  prevModuleId: string | null;
  nextModuleId: string | null;
  index: number;
  total: number;
} | null;

export function useModuleNav(args: { subjectSlug: string; moduleId: string }) {
  const { subjectSlug, moduleId } = args;
  const [nav, setNav] = useState<ModuleNavInfo>(null);

  useEffect(() => {
    if (!subjectSlug || !moduleId) return;

    fetch(
      `/api/review/module-nav?subjectSlug=${encodeURIComponent(subjectSlug)}&moduleId=${encodeURIComponent(
        moduleId,
      )}`,
      { cache: "no-store" },
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setNav(d))
      .catch(() => setNav(null));
  }, [subjectSlug, moduleId]);

  return nav;
}
