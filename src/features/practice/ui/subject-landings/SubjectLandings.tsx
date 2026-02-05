"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import SubjectHeader from "./SubjectHeader";

type ModuleDto = { slug: string; title: string; order: number };
type SectionDto = { slug: string; title: string; order: number; moduleId: string | null };

type SubjectDto = {
  slug: string;
  title: string;
  description?: string | null;
  modules: ModuleDto[];
  sections: SectionDto[];
};

type ApiSubjectsResponse = { subjects: SubjectDto[] };

function groupSectionsByModuleId(sections: SectionDto[]) {
  const map = new Map<string, SectionDto[]>();
  for (const s of sections) {
    const key = String(s.moduleId ?? "no-module");
    const arr = map.get(key) ?? [];
    arr.push(s);
    map.set(key, arr);
  }
  for (const [k, arr] of map) {
    arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.slug.localeCompare(b.slug));
    map.set(k, arr);
  }
  return map;
}

export default function SubjectLandings({
  subject, // subject slug
  onBack,
}: {
  subject: string;
  onBack: () => void;
}) {
  const router = useRouter();

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [row, setRow] = useState<SubjectDto | null>(null);

  useEffect(() => {
    let alive = true;
    const ctrl = new AbortController();

    async function run() {
      setBusy(true);
      setErr(null);

      try {
        const res = await fetch(`/api/catalog/subjects`, {
          cache: "no-store",
          signal: ctrl.signal,
        });

        if (!res.ok) throw new Error(`Failed to load subjects (${res.status})`);
        const data = (await res.json()) as ApiSubjectsResponse;

        const found = (data.subjects ?? []).find((s) => s.slug === subject) ?? null;
        if (!alive) return;

        setRow(found);
        if (!found) setErr(`Subject "${subject}" not found.`);
      } catch (e: any) {
        if (!alive) return;
        if (e?.name === "AbortError") return;
        setErr(e?.message ?? "Failed to load.");
      } finally {
        if (alive) setBusy(false);
      }
    }

    run();

    return () => {
      alive = false;
      ctrl.abort();
    };
  }, [subject]);

  const modules = row?.modules ?? [];
  const sections = row?.sections ?? [];

  const sectionByModuleId = useMemo(() => groupSectionsByModuleId(sections), [sections]);

  function goModule(moduleSlug: string) {
    router.push(
      `/subjects/${encodeURIComponent(subject)}/modules/${encodeURIComponent(moduleSlug)}/practice`
    );
  }

  function goSection(moduleSlug: string, sectionSlug: string) {
    router.push(
      `/subjects/${encodeURIComponent(subject)}/modules/${encodeURIComponent(
        moduleSlug
      )}/practice?section=${encodeURIComponent(sectionSlug)}`
    );
  }

  return (
    <>
      <SubjectHeader subject={subject} onBack={onBack} />

      <div className="mx-auto max-w-5xl">
        {busy ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:p-5">
            <div className="text-sm font-extrabold text-white/70">Loading…</div>
          </div>
        ) : err ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:p-5">
            <div className="text-lg font-black tracking-tight text-white/90">Couldn’t load</div>
            <div className="mt-2 text-sm text-white/70">{err}</div>
          </div>
        ) : !row ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:p-5">
            <div className="text-lg font-black tracking-tight text-white/90">
              No content yet for “{subject}”
            </div>
            <div className="mt-2 text-sm text-white/70">
              Seed the subject/modules/sections, then this page will populate automatically.
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:p-5">
              <div className="text-xs font-extrabold text-white/60">Subject</div>
              <div className="mt-1 text-xl font-black tracking-tight text-white/90">{row.title}</div>
              {row.description ? (
                <div className="mt-2 text-sm text-white/70">{row.description}</div>
              ) : null}
            </div>

            {modules.length ? (
              <div className="grid gap-3">
                {modules
                  .slice()
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.slug.localeCompare(b.slug))
                  .map((m) => {
                    // IMPORTANT: your /api/catalog/subjects returns sections with moduleId, not moduleSlug.
                    // We can only group by moduleId if we can map moduleSlug -> moduleId.
                    // Since the API currently returns moduleId but modules do NOT include id,
                    // we’ll show "Start module" and list ALL sections (fallback) unless you extend the API.
                    //
                    // ✅ Minimal fix below: just show Start Module button (no section grouping)
                    // ✅ Recommended: update /api/catalog/subjects to include module.id + section.moduleId (then grouping works perfectly).

                    return (
                      <div
                        key={m.slug}
                        className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden"
                      >
                        <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <div>
                            <div className="text-xs font-extrabold text-white/60">Module</div>
                            <div className="mt-1 text-lg font-black tracking-tight text-white/90">
                              {m.title}
                            </div>
                            <div className="mt-1 text-xs text-white/50">{m.slug}</div>
                          </div>

                          <button
                            onClick={() => goModule(m.slug)}
                            className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm font-extrabold text-white/90 hover:bg-black/30 transition"
                          >
                            Start module →
                          </button>
                        </div>

                        {/* OPTIONAL: Section list (works best once API includes module.id) */}
                        {/* If you add module.id to the API, uncomment and it’ll group perfectly. */}
                        {/* 
                        <div className="border-t border-white/10 p-4 md:p-5">
                          <div className="text-xs font-extrabold text-white/60">Sections</div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {(sectionByModuleId.get(String((m as any).id)) ?? []).map((s) => (
                              <button
                                key={s.slug}
                                onClick={() => goSection(m.slug, s.slug)}
                                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm font-extrabold text-white/85 hover:bg-black/30 transition"
                              >
                                {s.title}
                              </button>
                            ))}
                          </div>
                        </div>
                        */}
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:p-5">
                <div className="text-lg font-black tracking-tight text-white/90">
                  No modules yet for “{row.title}”
                </div>
                <div className="mt-2 text-sm text-white/70">
                  Seed at least one module for this subject to enable navigation.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
