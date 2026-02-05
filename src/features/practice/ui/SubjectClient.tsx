"use client";

import React, { useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";

export default function SubjectLandingClient({
  subject,
}: {
  subject: {
    slug: string;
    title: string;
    description: string | null;
    modules: { id: string; slug: string; title: string; description: string | null; order: number }[];
    sections: { id: string; slug: string; title: string; description: string | null; order: number; moduleId: string | null; meta: any }[];
  };
}) {
  const router = useRouter();

  const sectionsByModule = useMemo(() => {
    const m = new Map<string, typeof subject.sections>();
    for (const sec of subject.sections) {
      const key = sec.moduleId ?? "no-module";
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(sec);
    }
    return m;
  }, [subject.sections]);

  return (
    <div className="min-h-screen p-4 md:p-6 bg-[radial-gradient(1200px_700px_at_20%_0%,#151a2c_0%,#0b0d12_50%)] text-white/90">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xl font-black tracking-tight">{subject.title}</div>
            <div className="mt-1 text-sm text-white/70">{subject.description}</div>
          </div>

          <button
            className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-extrabold hover:bg-white/15"
            onClick={() => router.push("/subjects")}
          >
            Back
          </button>
        </div>

        <div className="mt-6 grid gap-3">
          {subject.modules.map((mod) => {
            const secs = sectionsByModule.get(mod.id) ?? [];
            return (
              <div key={mod.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="text-sm font-black">{mod.title}</div>
                {mod.description ? <div className="mt-1 text-xs text-white/60">{mod.description}</div> : null}

                <div className="mt-3 grid gap-2">
                  {secs.map((sec) => (
                    <div key={sec.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
                      <div>
                        <div className="text-sm font-extrabold">{sec.title}</div>
                        {sec.description ? <div className="text-xs text-white/60">{sec.description}</div> : null}
                      </div>

                      {/* ✅ This is the “lands you into practice” link */}
                      <Link
                        href={`/subjects/${encodeURIComponent(subject.slug)}/practice?section=${encodeURIComponent(sec.slug)}`}
                        className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-extrabold hover:bg-white/15"
                      >
                        Start →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
