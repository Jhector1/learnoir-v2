// SubjectTile.tsx
"use client";

import React from "react";
import Image from "next/image";
import type { SubjectCard } from "./SubjectPicker";
import { cloudinaryImageUrl } from "@/lib/cloudinary/url";
import { cn } from "@/lib/cn";

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
  const disabled = !s.defaultModuleSlug || enrolling;

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

  const cta = enrolling ? "Enrolling…" : s.enrolled ? "Continue" : "Open modules";

  return (
      <button
          type="button"
          disabled={disabled}
          aria-busy={enrolling}
          onClick={() => onPick(s)}
          className={cn("group ui-tile", disabled && "ui-tile--disabled")}
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

          {/* ✅ Enrolled badge */}
          {s.enrolled && !enrolling ? (
              <div className="absolute right-3 top-3 rounded-full bg-black/40 px-2 py-1 text-[10px] font-extrabold tracking-wide text-white backdrop-blur">
                Enrolled
              </div>
          ) : null}

          {/* ✅ Enrolling badge */}
          {enrolling ? (
              <div className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-full bg-black/50 px-2 py-1 text-[10px] font-extrabold tracking-wide text-white backdrop-blur">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
                Enrolling…
              </div>
          ) : null}
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-black tracking-tight text-neutral-900 dark:text-white/90">
                {s.title}
              </div>
              <div className="mt-1 text-xs font-semibold text-neutral-500 dark:text-white/60">
                {s.slug}
              </div>
            </div>

            <div className="ui-tile-chip">
              <div className={cn("h-full w-full rounded-2xl bg-gradient-to-br", accent)} />
            </div>
          </div>

          <div className="mt-3 text-sm leading-6 text-neutral-600 dark:text-white/70">
            {s.description}
          </div>

          {(!s.defaultModuleSlug) ? (
              <div className="mt-4 text-[11px] font-extrabold text-amber-700 dark:text-amber-200/70">
                No modules yet
              </div>
          ) : (
              <div className="mt-4 inline-flex items-center gap-2 text-[11px] font-extrabold text-neutral-700 dark:text-white/70">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/70 dark:bg-emerald-300/70" />
                {cta}
                <span className={cn("transition", !enrolling && "group-hover:translate-x-0.5")}>→</span>
              </div>
          )}
        </div>
      </button>
  );
}