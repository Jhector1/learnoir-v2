// src/components/SubjectTile.tsx
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
}: {
  s: SubjectCard;
  onPick: (s: SubjectCard) => void;
}) {
  const disabled = !s.defaultModuleSlug;

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

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onPick(s)}
className={cn("group ui-tile", disabled && "ui-tile--disabled")}    >
      {/* Image header */}
      <div className="relative h-28 w-full">
        <Image
          src={imgSrc}
          alt={s.imageAlt ?? s.title}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-cover"
        />

        {/* elegant overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className={cn("absolute inset-0 bg-gradient-to-br", accent)} />

        {/* top shimmer */}
        <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/20 to-transparent opacity-60 dark:from-white/10" />
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

          {/* tiny accent chip */}
          <div className="ui-tile-chip">
            <div className={cn("h-full w-full rounded-2xl bg-gradient-to-br", accent)} />
          </div>
        </div>

        <div className="mt-3 text-sm leading-6 text-neutral-600 dark:text-white/70">
          {s.description}
        </div>

        {disabled ? (
          <div className="mt-4 text-[11px] font-extrabold text-amber-700 dark:text-amber-200/70">
            No modules yet
          </div>
        ) : (
          <div className="mt-4 inline-flex items-center gap-2 text-[11px] font-extrabold text-neutral-700 dark:text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/70 dark:bg-emerald-300/70" />
            Open modules
            <span className="transition group-hover:translate-x-0.5">→</span>
          </div>
        )}
      </div>
    </button>
  );
}
