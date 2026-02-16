// src/app/[locale]/subjects/[subjectSlug]/certificate/CertificateClient.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

type Status = {
    eligible: boolean;
    requireAssignment: boolean;
    subject: { slug: string; title: string };
    completedAt: string | null;
    modules: Array<{
        moduleId: string;
        title: string;
        moduleCompleted: boolean;
        assignmentCompleted: boolean;
    }>;
};

export default function CertificateClient() {
    const params = useParams<{ locale: string; subjectSlug: string }>();
    const router = useRouter();

    const locale = params?.locale ?? "en";
    const subjectSlug = params?.subjectSlug ?? "";

    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<Status | null>(null);
    const [err, setErr] = useState<string | null>(null);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        let alive = true;

        async function run() {
            setLoading(true);
            setErr(null);

            const r = await fetch(
                `/api/certificates/subject?subjectSlug=${encodeURIComponent(subjectSlug)}&locale=${encodeURIComponent(locale)}`,
                { cache: "no-store" },
            );
            const data = await r.json().catch(() => null);

            if (!alive) return;

            if (!r.ok) {
                setErr(data?.message ?? "Unable to load certificate status.");
                setStatus(null);
            } else {
                setStatus(data);
            }
            setLoading(false);
        }

        if (subjectSlug) void run();
        return () => {
            alive = false;
        };
    }, [subjectSlug, locale]);

    const nextSteps = useMemo(() => {
        // You can make this dynamic per subject later
        return [
            { title: "Start the next course", body: "Keep momentum — pick your next module set and continue practicing." },
            { title: "Practice for 10 minutes/day", body: "Consistency beats cramming. Build a daily streak." },
            { title: "Do a project", body: "Use what you learned in a small real project and ship it." },
        ];
    }, []);

    async function downloadPdf() {
        if (!status?.eligible) return;

        try {
            setDownloading(true);

            const r = await fetch(
                `/api/certificates/subject/pdf?subjectSlug=${encodeURIComponent(subjectSlug)}&locale=${encodeURIComponent(locale)}`,
                { cache: "no-store" },
            );

            if (!r.ok) {
                const data = await r.json().catch(() => null);
                throw new Error(data?.message ?? "Download failed.");
            }

            const blob = await r.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = `${subjectSlug}-certificate.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();

            window.URL.revokeObjectURL(url);
        } catch (e: any) {
            alert(e?.message ?? "Unable to download certificate.");
        } finally {
            setDownloading(false);
        }
    }

    if (loading) {
        return <div className="p-6 text-sm text-neutral-600 dark:text-white/70">Loading…</div>;
    }

    if (err) {
        return (
            <div className="min-h-screen p-6">
                <div className="ui-card p-5">
                    <div className="text-lg font-black">Certificate</div>
                    <div className="mt-2 text-sm text-rose-700 dark:text-rose-200">{err}</div>
                    <div className="mt-4">
                        <button className="ui-btn ui-btn-secondary" onClick={() => router.back()}>
                            ← Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const eligible = Boolean(status?.eligible);

    return (
        <div className="min-h-screen bg-[radial-gradient(1200px_700px_at_20%_0%,#eafff5_0%,#ffffff_55%,#f6f7ff_100%)] dark:bg-[radial-gradient(1200px_700px_at_20%_0%,#151a2c_0%,#0b0d12_50%)] text-neutral-900 dark:text-white/90">
            <div className="ui-container py-6 grid gap-4">
                <div className={cn("ui-card p-5 md:p-6", eligible ? "border-emerald-600/25" : "border-neutral-200")}>
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                            <div className="text-sm font-black text-neutral-600 dark:text-white/60">Course Certificate</div>
                            <div className="mt-1 text-2xl font-black tracking-tight">
                                {eligible ? "🎉 Congratulations!" : "Almost there"}
                            </div>

                            <div className="mt-2 text-sm text-neutral-700 dark:text-white/70">
                                {eligible ? (
                                    <>
                                        You completed <span className="font-extrabold">{status?.subject.title}</span>. Download your
                                        certificate and keep going.
                                    </>
                                ) : (
                                    <>
                                        Finish all modules{status?.requireAssignment ? " + module assignments" : ""} to unlock your
                                        certificate for <span className="font-extrabold">{status?.subject.title}</span>.
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                            <button className="ui-btn ui-btn-secondary" onClick={() => router.back()}>
                                ← Back
                            </button>

                            <button
                                className={cn("ui-btn ui-btn-primary", (!eligible || downloading) && "opacity-60 cursor-not-allowed")}
                                disabled={!eligible || downloading}
                                onClick={downloadPdf}
                            >
                                {downloading ? "Preparing…" : "Download PDF"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="ui-card p-5">
                    <div className="text-lg font-black">Checklist</div>
                    <div className="mt-3 grid gap-2">
                        {status?.modules?.map((m) => {
                            const ok = m.moduleCompleted && (!status.requireAssignment || m.assignmentCompleted);
                            return (
                                <div
                                    key={m.moduleId}
                                    className={cn(
                                        "rounded-xl border px-3 py-2 text-sm flex items-center justify-between gap-2",
                                        ok
                                            ? "border-emerald-600/25 bg-emerald-500/10 dark:border-emerald-300/30 dark:bg-emerald-300/10"
                                            : "border-neutral-200 bg-white dark:border-white/10 dark:bg-white/[0.04]",
                                    )}
                                >
                                    <div className="min-w-0">
                                        <div className="font-extrabold truncate">{m.title}</div>
                                        {status.requireAssignment ? (
                                            <div className="text-xs text-neutral-600 dark:text-white/60">
                                                Topics: {m.moduleCompleted ? "done" : "not done"} • Assignment:{" "}
                                                {m.assignmentCompleted ? "done" : "not done"}
                                            </div>
                                        ) : null}
                                    </div>
                                    <div className={cn("text-xs font-black", ok ? "text-emerald-700 dark:text-emerald-200" : "text-neutral-500 dark:text-white/60")}>
                                        {ok ? "✓ Complete" : "In progress"}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="ui-card p-5">
                    <div className="text-lg font-black">Next steps</div>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                        {nextSteps.map((s) => (
                            <div key={s.title} className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
                                <div className="font-extrabold">{s.title}</div>
                                <div className="mt-1 text-sm text-neutral-600 dark:text-white/60">{s.body}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
