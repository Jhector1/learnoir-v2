"use client";

import React from "react";
import Image from "next/image";
import type { SubjectCard } from "./SubjectPicker";
import { cloudinaryImageUrl } from "@/lib/cloudinary/url";

function publicIdFallback(slug: string) {
  // temporary fallback so you don’t need to backfill all subjects immediately
  const map: Record<string, string> = {
    "linear-algebra": "learnoir/subjects/linear-algebra",
    "python": "learnoir/subjects/python",
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

  // if env missing, you can fallback to a local placeholder
  const imgSrc ="/subjects/_default.png";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onPick(s)}
      className={[
        "text-left rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] transition overflow-hidden",
        disabled ? "opacity-50 cursor-not-allowed" : "",
      ].join(" ")}
    >
      {/* ✅ Image header */}
      <div className="relative h-24 w-full">
        <Image
          src={imgSrc}
          alt={s.imageAlt ?? s.title}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
      </div>

      <div className="p-4">
        <div className="text-sm font-black text-white/90">{s.title}</div>
        <div className="mt-1 text-xs text-white/60">{s.slug}</div>
        <div className="mt-2 text-sm text-white/70">{s.description}</div>

        {disabled ? (
          <div className="mt-3 text-[11px] text-amber-200/70 font-extrabold">
            No modules yet
          </div>
        ) : null}
      </div>
    </button>
  );
}
