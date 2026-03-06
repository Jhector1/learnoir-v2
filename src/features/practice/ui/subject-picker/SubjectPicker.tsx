"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import SubjectTile from "./SubjectTile";
import Pill from "./Pill";
import { ROUTES } from "@/utils";
import { cn } from "@/lib/cn";
import { useTaggedT } from "@/i18n/tagged";

export type SubjectCard = {
    slug: string;
    title: string;
    description: string;
    defaultModuleSlug: string | null;
    imagePublicId: string | null;
    imageAlt: string | null;
    enrolled: boolean;
    status: "active" | "coming_soon" | "disabled";
};

export default function SubjectPicker({
                                          initialSubjects,
                                      }: {
    initialSubjects: SubjectCard[];
}) {
    const router = useRouter();
    const { t } = useTaggedT("subjectsUi");

    const [q, setQ] = useState("");
    const [subjects, setSubjects] = useState<SubjectCard[]>(initialSubjects);
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
        if (s.status !== "active") return;
        if (!s.defaultModuleSlug) return;
        if (enrollingSlug) return;

        if (!s.enrolled) {
            setEnrollingSlug(s.slug);
            try {
                await enrollSubject(s.slug);
                setSubjects((prev) =>
                    prev.map((x) => (x.slug === s.slug ? { ...x, enrolled: true } : x)),
                );
            } catch {
                setEnrollingSlug(null);
                return;
            } finally {
                setEnrollingSlug(null);
            }
        } else {
            enrollSubject(s.slug).catch(() => {});
        }

        router.push(ROUTES.subjectModules(encodeURIComponent(s.slug)));
    }

    return (
        <div className="ui-container my-10 grid gap-4">
            <div className="ui-surface rounded-3xl border ui-border" style={{ boxShadow: "var(--ui-shadow-md)" }}>
                <div
                    className="border-b ui-border p-6 backdrop-blur-xl"
                    style={{ backgroundColor: "rgb(var(--ui-surface) / 0.7)" }}
                >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <div className="text-lg font-black tracking-tight ui-text">
                                {t("headerTitle")}
                            </div>

                            <div className="mt-1 text-sm ui-text-muted">
                                {t("headerSubtitle")}
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <Pill tone="neutral">
                                    {t("resultsCount", { count: filtered.length })}
                                </Pill>
                            </div>
                        </div>

                        <div className="w-full sm:w-[320px]">
                            <div className="relative">
                                <input
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder={t("searchPlaceholder")}
                                    className={cn(
                                        "ui-focus w-full rounded-2xl border px-4 py-2 pr-16 text-sm font-semibold",
                                        "ui-border ui-text",
                                    )}
                                    style={{
                                        backgroundColor: "rgb(var(--ui-surface) / 0.8)",
                                    }}
                                />

                                {q.trim() ? (
                                    <button
                                        type="button"
                                        onClick={() => setQ("")}
                                        className="ui-btn ui-btn-secondary absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-extrabold"
                                        aria-label={t("searchClear")}
                                    >
                                        {t("searchClear")}
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>

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
                        <div className="mt-4 text-sm ui-text-muted">
                            {t("noSubjectsFound")}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}