"use client";

import React, { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";

import SubjectPicker, { type SubjectCard } from "./subject-picker/SubjectPicker";
import SubjectLandings from "./subject-landings/SubjectLandings";

const LS_KEY = "practice.subject";

export default function SectionShell({
  initialSubjects,
  initialSubjectFromUrl,
}: {
  initialSubjects: SubjectCard[];
  initialSubjectFromUrl: string;
}) {
  const router = useRouter();
  const sp = useSearchParams();

  // URL is the source of truth
  const subject = (sp.get("subject") ?? initialSubjectFromUrl ?? "").trim();

  // 1) first load restore
  useEffect(() => {
    if (subject) return;
    try {
      const saved = localStorage.getItem(LS_KEY)?.trim();
      if (saved) router.replace(`/practice/sections?subject=${encodeURIComponent(saved)}`);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) persist subject
  useEffect(() => {
    if (!subject) return;
    try {
      localStorage.setItem(LS_KEY, subject);
    } catch {}
  }, [subject]);

  const subjectRow = useMemo(
    () => initialSubjects.find((s) => s.slug === subject) ?? null,
    [initialSubjects, subject]
  );

  function clearSubject() {
    try {
      localStorage.removeItem(LS_KEY);
    } catch {}
    router.push("/practice/sections");
  }

  return (
    <div className="min-h-screen p-4 md:p-6 bg-[radial-gradient(1200px_700px_at_20%_0%,#151a2c_0%,#0b0d12_50%)] text-white/90">
      {!subject ? (
        <SubjectPicker initialSubjects={initialSubjects} />
      ) : (
        <SubjectLandings
          subject={subject}
          subjectCard={subjectRow}
          onBack={clearSubject}
        />
      )}
    </div>
  );
}
