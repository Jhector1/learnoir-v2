// src/components/SubjectPicker.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import SubjectTile from "./SubjectTile";
import Pill from "./Pill";
import {ROUTES} from "@/utils";

export type SubjectCard = {
  slug: string;
  title: string;
  description: string;
  defaultModuleSlug: string | null;

  imagePublicId: string | null;
  imageAlt: string | null;
};

export default function SubjectPicker({
  initialSubjects,
}: {
  initialSubjects: SubjectCard[];
}) {
  const router = useRouter();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return initialSubjects;
    return initialSubjects.filter(
      (x) =>
        x.title.toLowerCase().includes(s) ||
        x.slug.toLowerCase().includes(s) ||
        x.description.toLowerCase().includes(s),
    );
  }, [q, initialSubjects]);

  function pickSubject(s: SubjectCard) {
    if (!s.defaultModuleSlug) return;
    router.push(ROUTES.subjectModules(encodeURIComponent(s.slug)));
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-4">
      {/* page surface */}
      <div className="ui-surface">
        {/* soft background glow */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-400/10" />
          <div className="absolute top-24 right-[-120px] h-[360px] w-[360px] rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-400/10" />
          {/* gentle noise */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] [background-image:radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.9)_1px,transparent_0)] [background-size:18px_18px]" />
        </div>

        {/* header */}
        <div className="ui-surface-head">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs font-extrabold tracking-wide text-neutral-500 dark:text-white/60">
                Practice
              </div>
              <div className="mt-1 text-xl font-black tracking-tight text-neutral-900 dark:text-white">
                Choose a subject
              </div>
              <div className="mt-1 text-sm text-neutral-600 dark:text-white/70">
                Pick what you want to practice.
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Pill tone="good">Progress stays separate per subject</Pill>
                <Pill>Works with existing practice flow</Pill>
              </div>
            </div>

            {/* search */}
            <div className="mt-4 w-full sm:mt-0 sm:w-[360px]">
              <div className="relative">
                <div
                  aria-hidden
                  className="ui-search-overlay bg-gradient-to-b from-white/70 to-white/40 dark:from-white/10 dark:to-white/[0.04]"
                />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search subjects…"
                  className="ui-search-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* content */}
        <div className="relative p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((s) => (
              <SubjectTile key={s.slug} s={s} onPick={pickSubject} />
            ))}
          </div>

          {!filtered.length ? (
            <div className="mt-4 text-sm text-neutral-600 dark:text-white/60">
              No subjects found.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
