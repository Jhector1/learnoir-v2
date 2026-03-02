// SubjectPicker.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import SubjectTile from "./SubjectTile";
import Pill from "./Pill";
import { ROUTES } from "@/utils";
import { cn } from "@/lib/cn";

export type SubjectCard = {
    slug: string;
    title: string;
    description: string;
    defaultModuleSlug: string | null;
    imagePublicId: string | null;
    imageAlt: string | null;
    enrolled: boolean;
};

export default function SubjectPicker({
                                          initialSubjects,
                                      }: {
    initialSubjects: SubjectCard[];
}) {
    const router = useRouter();
    const t = useTranslations("subjectsUi");

    const [q, setQ] = useState("");

    // local copy so we can flip enrolled -> true after API returns
    const [subjects, setSubjects] = useState<SubjectCard[]>(initialSubjects);

    // track which tile is enrolling
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

        // If NOT enrolled yet: wait so guest cookie is set before routing
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
            } finally {
                setEnrollingSlug(null);
            }
        } else {
            // Already enrolled: don't block navigation (optional update in background)
            enrollSubject(s.slug).catch(() => {});
        }

        router.push(ROUTES.subjectModules(encodeURIComponent(s.slug)));
    }

    return (
        <div className="mx-auto my-10 grid max-w-5xl gap-4">
            <div className="ui-surface">
                {/* Header + search */}
                <div className="border-b border-neutral-200/70 bg-white/70 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-black/20">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <div className="text-lg font-black tracking-tight text-neutral-900 dark:text-white/90">
                                {t("headerTitle")}
                            </div>
                            <div className="mt-1 text-sm text-neutral-600 dark:text-white/70">
                                {t("headerSubtitle")}
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <Pill>{t("resultsCount", { count: filtered.length })}</Pill>
                            </div>
                        </div>

                        <div className="w-full sm:w-[320px]">
                            <div className="relative">
                                <input
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder={t("searchPlaceholder")}
                                    className={cn(
                                        "w-full rounded-2xl border px-4 py-2 pr-16 text-sm font-semibold outline-none",
                                        "border-neutral-200/70 bg-white/80 text-neutral-900 placeholder:text-neutral-400",
                                        "dark:border-white/10 dark:bg-white/[0.04] dark:text-white/90 dark:placeholder:text-white/40",
                                    )}
                                />

                                {q.trim() ? (
                                    <button
                                        type="button"
                                        onClick={() => setQ("")}
                                        className={cn(
                                            "absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-3 py-1 text-xs font-extrabold",
                                            "border border-neutral-200/70 bg-white hover:bg-neutral-50 text-neutral-700",
                                            "dark:border-white/10 dark:bg-white/[0.06] dark:hover:bg-white/[0.10] dark:text-white/80",
                                        )}
                                        aria-label={t("searchClear")}
                                    >
                                        {t("searchClear")}
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tiles */}
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
                            {t("noSubjectsFound")}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}