"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import SubjectTile from "./SubjectTile";
import Pill from "./Pill";

export type SubjectCard = {
  slug: string;
  title: string;
  description: string;
  defaultModuleSlug: string | null;

  // ✅ NEW
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
    return initialSubjects.filter((x) =>
      x.title.toLowerCase().includes(s) ||
      x.slug.toLowerCase().includes(s) ||
      x.description.toLowerCase().includes(s)
    );
  }, [q, initialSubjects]);

  function pickSubject(s: SubjectCard) {
    if (!s.defaultModuleSlug) return; // no modules yet
    router.push(
      `/subjects/${encodeURIComponent(s.slug)}/modules`
    );
  }

  return (
    <div className="mx-auto max-w-5xl grid gap-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden">
        <div className="border-b border-white/10 bg-black/20 p-5">
          <div className="text-xs font-extrabold text-white/60">Practice</div>
          <div className="mt-1 text-lg font-black tracking-tight">Choose a subject</div>
          <div className="mt-1 text-sm text-white/70">Pick what you want to practice.</div>

          <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <div className="flex gap-2 items-center">
              <Pill tone="good">Progress stays separate per subject</Pill>
              <Pill>Works with existing practice flow</Pill>
            </div>

            <div className="relative w-full sm:w-[320px]">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search subjects…"
                className={[
                  "w-full rounded-xl border border-white/10 bg-black/20",
                  "px-3 py-2 text-sm font-extrabold text-white/90 outline-none",
                  "placeholder:text-white/35",
                  "focus:border-white/20 focus:bg-black/30 transition",
                ].join(" ")}
              />
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((s) => (
              <SubjectTile key={s.slug} s={s} onPick={pickSubject} />
            ))}
          </div>

          {!filtered.length ? (
            <div className="mt-4 text-sm text-white/60">No subjects found.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
