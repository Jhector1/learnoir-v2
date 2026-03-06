"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import type { SubjectCard } from "./SubjectPicker";
import { cloudinaryImageUrl } from "@/lib/cloudinary/url";
import { cn } from "@/lib/cn";
import Pill from "./Pill";
import { useTaggedT } from "@/i18n/tagged";

function publicIdFallback(slug: string) {
  const map: Record<string, string> = {
    "linear-algebra": "learnoir/subjects/linear-algebra",
    python: "learnoir/subjects/python",
  };
  return map[slug] ?? "learnoir/subjects/_default";
}

export default function SubjectTile({
                                      s,
                                      onPick,
                                      enrolling,
                                    }: {
  s: SubjectCard;
  onPick: (s: SubjectCard) => void;
  enrolling: boolean;
}) {
  const { t } = useTaggedT("subjectsUi");

  const isComingSoon = s.status === "coming_soon";
  const disabled = !s.defaultModuleSlug || enrolling || isComingSoon;

  const publicId = s.imagePublicId ?? publicIdFallback(s.slug);

  const url = cloudinaryImageUrl(publicId, {
    w: 1200,
    h: 320,
    crop: "fill",
    gravity: "auto",
    quality: "auto",
    format: "auto",
    dpr: "auto",
  });

  const imgSrc = url || "/subjects/_default.png";

  const accent =
      s.slug === "linear-algebra"
          ? "from-emerald-400/25 to-indigo-400/10"
          : s.slug === "python"
              ? "from-indigo-400/25 to-fuchsia-400/10"
              : "from-neutral-400/20 to-neutral-400/10";

  const cta = useMemo(() => {
    if (isComingSoon) return t("comingSoon");
    if (enrolling) return t("enrolling");
    if (s.enrolled) return t("continue");
    return t("openModules");
  }, [enrolling, isComingSoon, s.enrolled, t]);

  return (
      <button
          type="button"
          disabled={disabled}
          aria-busy={enrolling}
          onClick={() => onPick(s)}
          className={cn(
              "group overflow-hidden rounded-3xl border text-left transition",
              "ui-border ui-focus",
              disabled ? "cursor-not-allowed opacity-70" : "hover:-translate-y-0.5",
          )}
          style={{
            backgroundColor: "rgb(var(--ui-surface) / 0.92)",
            boxShadow: "var(--ui-shadow-md)",
          }}
      >
        <div className="relative h-28 w-full">
          <Image
              src={imgSrc}
              alt={s.imageAlt ?? s.title}
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          <div className={cn("absolute inset-0 bg-gradient-to-br", accent)} />
          <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/20 to-transparent opacity-60 dark:from-white/10" />

          <div className="absolute right-3 top-3 flex flex-wrap items-center gap-2">
            {isComingSoon ? <Pill tone="warn">{t("comingSoon")}</Pill> : null}
            {s.enrolled && !enrolling && !isComingSoon ? <Pill tone="good">{t("enrolled")}</Pill> : null}
            {enrolling ? <Pill tone="neutral">{t("enrolling")}</Pill> : null}
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-black tracking-tight ui-text">
                {s.title}
              </div>

              <div className="mt-1 text-xs font-semibold ui-text-muted">
                {s.slug}
              </div>
            </div>

            <div
                className="h-10 w-10 shrink-0 rounded-2xl"
                style={{ backgroundColor: "rgb(var(--ui-surface-2) / 0.65)" }}
            >
              <div className={cn("h-full w-full rounded-2xl bg-gradient-to-br", accent)} />
            </div>
          </div>

          <div className="mt-3 text-sm leading-6 ui-text-muted">
            {s.description}
          </div>

          {!s.defaultModuleSlug ? (
              <div className="mt-4 text-[11px] font-extrabold ui-text-warn">
                {t("noModulesYet")}
              </div>
          ) : (
              <div className="mt-4 inline-flex items-center gap-2 text-[11px] font-extrabold ui-text">
                {!isComingSoon ? (
                    <span className="h-1.5 w-1.5 rounded-full ui-bg-accent" />
                ) : (
                    <span className="h-1.5 w-1.5 rounded-full ui-bg-warn" />
                )}

                {cta}

                {!isComingSoon ? (
                    <span className={cn("transition", !enrolling && "group-hover:translate-x-0.5")}>
                →
              </span>
                ) : null}
              </div>
          )}
        </div>
      </button>
  );
}