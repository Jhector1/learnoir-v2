"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useReviewProgressMany } from "@/components/review/module/hooks/useReviewProgressMany";
import { ROUTES } from "@/utils";

type ModuleMeta = {
    outcomes?: string[];
    why?: string[];
    prereqs?: string[];
    videoUrl?: string | null;
    estimatedMinutes?: number;
};

type Props = {
    locale: string;
    subject: {
        slug: string;
        title: string;
        description: string | null;
        imagePublicId: string | null;
        imageAlt: string | null;
    };
    module: {
        id: string;
        slug: string;
        title: string;
        description: string | null;
        order: number;
        weekStart: number | null;
        weekEnd: number | null;
        meta?: ModuleMeta | null; // ✅ NEW
    };
    stats: { sectionsCount: number; topicsCount: number };
};

function Kicker({ children }: { children: React.ReactNode }) {
    return (
        <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-neutral-500 dark:text-white/45">
            {children}
        </div>
    );
}

function StatPill({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div
            className={cn(
                "inline-flex items-center gap-2 rounded-full px-3 py-1.5",
                "bg-white/70 ring-1 ring-black/5",
                "dark:bg-white/[0.06] dark:ring-white/10",
            )}
        >
      <span className="text-[11px] font-extrabold tracking-wide text-neutral-500 dark:text-white/45">
        {label}
      </span>
            <span className="text-sm font-black tabular-nums">{value}</span>
        </div>
    );
}

function Card({
                  title,
                  icon,
                  children,
              }: {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div
            className={cn(
                "rounded-3xl p-4 md:p-6",
                "bg-white/70 ring-1 ring-black/5 shadow-[0_14px_50px_-26px_rgba(0,0,0,0.22)]",
                "backdrop-blur-xl",
                "dark:bg-white/[0.06] dark:ring-white/10 dark:shadow-none",
            )}
        >
            <div className="flex items-center gap-2">
                <Kicker>{title}</Kicker>
                {icon ? <span className="opacity-80">{icon}</span> : null}
            </div>
            <div className="mt-3">{children}</div>
        </div>
    );
}

function BulletList({
                        items,
                        marker = "✓",
                    }: {
    items: string[];
    marker?: "✓" | "•" | "→";
}) {
    return (
        <ul className="grid gap-2 text-sm text-neutral-700 dark:text-white/75">
            {items.map((x) => (
                <li key={x} className="flex gap-2">
                    <span className="mt-[2px]">{marker}</span>
                    <span>{x}</span>
                </li>
            ))}
        </ul>
    );
}

function VideoEmbed({
                        url,
                        title,
                    }: {
    url: string;
    title: string;
}) {
    // supports YouTube / Vimeo / direct mp4
    const isYouTube =
        /youtube\.com\/watch\?v=|youtu\.be\//.test(url) ||
        /youtube\.com\/embed\//.test(url);
    const isVimeo = /vimeo\.com\/\d+/.test(url) || /player\.vimeo\.com\/video\//.test(url);
    const isMp4 = /\.mp4(\?|#|$)/i.test(url);

    const embedUrl = (() => {
        if (isYouTube) {
            // normalize to embed
            if (url.includes("youtube.com/embed/")) return url;
            const m = url.match(/v=([^&]+)/);
            const vid = m?.[1] ?? url.split("youtu.be/")[1]?.split(/[?&]/)[0];
            return vid ? `https://www.youtube.com/embed/${vid}` : url;
        }
        if (isVimeo) {
            if (url.includes("player.vimeo.com/video/")) return url;
            const id = url.match(/vimeo\.com\/(\d+)/)?.[1];
            return id ? `https://player.vimeo.com/video/${id}` : url;
        }
        return url;
    })();

    return (
        <div
            className={cn(
                "rounded-3xl overflow-hidden",
                "bg-white/70 ring-1 ring-black/5 shadow-[0_14px_50px_-26px_rgba(0,0,0,0.22)]",
                "backdrop-blur-xl",
                "dark:bg-white/[0.06] dark:ring-white/10 dark:shadow-none",
            )}
        >
            <div className="p-4 md:p-6 pb-3">
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <Kicker>Intro video</Kicker>
                        <div className="mt-1 text-base font-black tracking-tight truncate">
                            {title}
                        </div>
                        <div className="mt-1 text-xs text-neutral-600 dark:text-white/60">
                            Watch first if you want the big picture before practice.
                        </div>
                    </div>

                    <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(
                            "shrink-0 inline-flex items-center justify-center rounded-2xl px-3 py-2 text-xs font-extrabold",
                            "bg-neutral-900 text-white shadow-sm hover:shadow-md active:scale-[0.99] transition",
                            "dark:bg-white/10 dark:text-white/90 dark:hover:bg-white/12",
                        )}
                    >
                        Open ↗
                    </a>
                </div>
            </div>

            <div className="px-4 md:px-6 pb-4">
                <div className="relative w-full overflow-hidden rounded-2xl ring-1 ring-black/5 dark:ring-white/10">
                    <div className="aspect-video">
                        {isMp4 ? (
                            <video className="h-full w-full" controls preload="metadata">
                                <source src={embedUrl} />
                            </video>
                        ) : (
                            <iframe
                                className="h-full w-full"
                                src={embedUrl}
                                title={title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ModuleIntroClient({ locale, subject, module, stats }: Props) {
    const { byModuleId, loading } = useReviewProgressMany({
        subjectSlug: subject.slug,
        locale,
        moduleIds: [module.slug],
        enabled: true,
        refreshMs: 0,
    });

    const mp = byModuleId[module.slug];
    const completed = Boolean(mp?.moduleCompleted);
    const hasAnyProgress = (mp?.completedTopicKeys?.size ?? 0) > 0;

    const ctaLabel = completed ? "Review module →" : hasAnyProgress ? "Continue →" : "Start module →";

    const learnHref = `/${encodeURIComponent(locale)}/${ROUTES.learningPath(
        encodeURIComponent(subject.slug),
        encodeURIComponent(module.slug),
    )}`;

    const practiceHref = `/${encodeURIComponent(locale)}/${ROUTES.practicePath(
        encodeURIComponent(subject.slug),
        encodeURIComponent(module.slug),
    )}`;

    const backHref = `/${encodeURIComponent(locale)}/subjects/${encodeURIComponent(subject.slug)}/modules`;

    const meta = (module.meta ?? {}) as ModuleMeta;

    const outcomes = useMemo(() => {
        const xs = meta.outcomes?.filter(Boolean) ?? [];
        return xs.length
            ? xs
            : [
                "Learn the core ideas with clear, guided examples",
                "Practice with interactive questions and instant feedback",
                "Build confidence to use this in the next modules",
            ];
    }, [meta.outcomes]);

    const why = useMemo(() => {
        const xs = meta.why?.filter(Boolean) ?? [];
        return xs.length
            ? xs
            : [
                "This module unlocks skills you’ll reuse constantly",
                "It improves speed and accuracy on real problems",
                "It’s a foundation for interviews and real-world projects",
            ];
    }, [meta.why]);

    const prereqs = useMemo(() => (meta.prereqs?.filter(Boolean) ?? []), [meta.prereqs]);
    const est = meta.estimatedMinutes ?? null;
    const videoUrl = meta.videoUrl ?? null;

    return (
        <div
            className={cn(
                "min-h-screen text-neutral-900 dark:text-white/90",
                "bg-[radial-gradient(1200px_700px_at_20%_0%,#eafff5_0%,#ffffff_52%,#f6f7ff_100%)]",
                "dark:bg-[radial-gradient(1200px_700px_at_20%_0%,#151a2c_0%,#0b0d12_52%)]",
            )}
        >
            <div
                className={cn(
                    "pointer-events-none absolute inset-x-0 top-0 h-48",
                    "bg-[linear-gradient(90deg,rgba(16,185,129,0.10),rgba(59,130,246,0.06),rgba(236,72,153,0.05))]",
                    "dark:bg-[linear-gradient(90deg,rgba(110,231,183,0.08),rgba(147,197,253,0.05),rgba(251,113,133,0.04))]",
                    "opacity-70 blur-2xl",
                )}
                aria-hidden
            />

            <div className="ui-container py-6 md:py-10 grid gap-4 md:gap-6 relative">
                {/* hero */}
                <div
                    className={cn(
                        "rounded-3xl p-4 md:p-6",
                        "bg-white/70 ring-1 ring-black/5 shadow-[0_14px_50px_-20px_rgba(0,0,0,0.25)]",
                        "backdrop-blur-xl",
                        "dark:bg-white/[0.06] dark:ring-white/10 dark:shadow-none",
                    )}
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <Kicker>
                                {subject.title} • Module {module.order + 1}
                            </Kicker>
                            <div className="mt-1 text-2xl md:text-3xl font-black tracking-tight">
                                {module.title}
                            </div>

                            {module.description ? (
                                <div className="mt-2 text-sm md:text-base text-neutral-600 dark:text-white/70">
                                    {module.description}
                                </div>
                            ) : null}

                            <div className="mt-4 flex flex-wrap gap-2">
                                <StatPill label="Sections" value={stats.sectionsCount} />
                                <StatPill label="Topics" value={stats.topicsCount} />
                                {module.weekStart != null || module.weekEnd != null ? (
                                    <StatPill
                                        label="Weeks"
                                        value={
                                            <span className="tabular-nums">
                        {module.weekStart ?? "?"}–{module.weekEnd ?? "?"}
                      </span>
                                        }
                                    />
                                ) : null}
                                {est != null ? <StatPill label="Est." value={`${est} min`} /> : null}
                                <StatPill
                                    label="Status"
                                    value={
                                        loading
                                            ? "Syncing…"
                                            : completed
                                                ? "Completed"
                                                : hasAnyProgress
                                                    ? "In progress"
                                                    : "New"
                                    }
                                />
                            </div>
                        </div>

                        <Link
                            href={backHref}
                            className={cn(
                                "shrink-0 inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-extrabold",
                                "bg-neutral-900 text-white shadow-sm hover:shadow-md active:scale-[0.99] transition",
                                "dark:bg-white/10 dark:text-white/90 dark:hover:bg-white/12",
                            )}
                        >
                            ← Back
                        </Link>
                    </div>

                    <div className="mt-5 justify-center flex flex-col sm:flex-row gap-2">
                        <Link
                            href={learnHref}
                            className={cn(
                                "inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-extrabold",
                                "bg-neutral-900 text-white shadow-sm hover:shadow-md active:scale-[0.99] transition",
                                "dark:bg-white/10 dark:text-white/90 dark:hover:bg-white/12",
                            )}
                        >
                            {ctaLabel}
                        </Link>

                        {/*<Link*/}
                        {/*    href={practiceHref}*/}
                        {/*    className={cn(*/}
                        {/*        "inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-extrabold",*/}
                        {/*        "bg-white/70 text-neutral-900 ring-1 ring-black/5 hover:bg-white/80 transition",*/}
                        {/*        "dark:bg-white/[0.06] dark:text-white/90 dark:ring-white/10 dark:hover:bg-white/[0.08]",*/}
                        {/*    )}*/}
                        {/*>*/}
                        {/*    Practice →*/}
                        {/*</Link>*/}
                    </div>

                    {prereqs.length ? (
                        <div className="mt-5 pt-4 border-t border-black/5 dark:border-white/10">
                            <Kicker>Prereqs</Kicker>
                            <div className="mt-2">
                                <BulletList items={prereqs} marker="→" />
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* optional video */}
                {videoUrl ? <VideoEmbed url={videoUrl} title={`${module.title} — Introduction`} /> : null}

                {/* content */}
                <div className="grid gap-3 md:gap-4 md:grid-cols-2">
                    <Card title="What you’ll learn">
                        <BulletList items={outcomes} marker="✓" />
                    </Card>

                    <Card title="Why it matters">
                        <BulletList items={why} marker="•" />
                    </Card>
                </div>
            </div>
        </div>
    );
}
