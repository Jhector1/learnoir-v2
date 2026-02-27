// SubjectPicker.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import SubjectTile from "./SubjectTile";
import Pill from "./Pill";
import { ROUTES } from "@/utils";

export type SubjectCard = {
  slug: string;
  title: string;
  description: string;
  defaultModuleSlug: string | null;
  imagePublicId: string | null;
  imageAlt: string | null;

  enrolled: boolean; // ✅ NEW
};

export default function SubjectPicker({ initialSubjects }: { initialSubjects: SubjectCard[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");

  // ✅ local copy so we can flip enrolled -> true after API returns
  const [subjects, setSubjects] = useState<SubjectCard[]>(initialSubjects);

  // ✅ track which tile is enrolling
  const [enrollingSlug, setEnrollingSlug] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return subjects;
    return subjects.filter(
        (x) =>
            x.title.toLowerCase().includes(s) ||
            x.slug.toLowerCase().includes(s) ||
            x.description.toLowerCase().includes(s),
    );
  }, [q, subjects]);

  async function enrollSubject(slug: string) {
    const res = await fetch(`/api/subjects/${encodeURIComponent(slug)}/enroll`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Enroll failed");
    return res;
  }

  async function pickSubject(s: SubjectCard) {
    if (!s.defaultModuleSlug) return;

    // prevent double clicks
    if (enrollingSlug) return;

    // ✅ If NOT enrolled yet: wait so guest cookie is set before routing
    if (!s.enrolled) {
      setEnrollingSlug(s.slug);
      try {
        await enrollSubject(s.slug);

        // mark enrolled in UI (instant badge)
        setSubjects((prev) =>
            prev.map((x) => (x.slug === s.slug ? { ...x, enrolled: true } : x)),
        );
      } catch {
        // stay on page; tile will re-enable
        setEnrollingSlug(null);
        return;
      }
    } else {
      // ✅ Already enrolled: don't block navigation.
      // (optional) update lastSeen in background
      enrollSubject(s.slug).catch(() => {});
    }

    router.push(ROUTES.subjectModules(encodeURIComponent(s.slug)));
  }

  return (
      <div className="mx-auto my-10 grid max-w-5xl gap-4">
        <div className="ui-surface">
          {/* ... your header/search unchanged ... */}

          <div className="relative p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map((s) => (
                  <SubjectTile
                      key={s.slug}
                      s={s}
                      onPick={pickSubject}
                      enrolling={enrollingSlug === s.slug}
                  />
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