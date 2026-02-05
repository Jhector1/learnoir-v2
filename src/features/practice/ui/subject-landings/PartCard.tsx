"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { LandingPageConfig, LandingPart } from "@/features/practice/catalog/types";
import { ACCENT, BADGE } from "../styles";

export default function PartCard({ cfg, part }: { cfg: LandingPageConfig; part: LandingPart }) {
  const t = useTranslations(cfg.namespace);
  const safeT = (key: string) => (t.has(key as any) ? t(key as any) : key);

  const badge = safeT(part.badgeKey);
  const title = safeT(part.titleKey);
  const subtitle = safeT(part.subtitleKey);

  const bullets = Array.from({ length: part.bulletsCount }, (_, i) =>
    safeT(`parts.${part.id.replace("-", "")}.bullets.${i}`)
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:p-5">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-lg font-black tracking-tight text-white/90">{title}</div>
            <div className="mt-1 text-sm text-white/70">{subtitle}</div>
          </div>

          <span className={["shrink-0 rounded-full border px-3 py-1 text-[11px] font-extrabold", BADGE[part.accent]].join(" ")}>
            {badge}
          </span>
        </div>

        <div className="mt-2 rounded-xl border border-white/10 bg-black/20 p-3">
          <div className="text-xs font-extrabold text-white/70">{safeT("whatYouLearn")}</div>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-white/70">
            {bullets.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        </div>

        <div className="mt-1 flex flex-col gap-2 sm:flex-row">
          <Link
            href={part.learnHref}
            className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-extrabold hover:bg-white/15"
          >
            {safeT("readMaterial")}
          </Link>

          <Link
            href={part.practiceHref}
            className={["rounded-xl border px-3 py-2 text-xs font-extrabold transition", ACCENT[part.accent]].join(" ")}
          >
            {safeT("practiceNow")}
          </Link>
        </div>

        <div className="text-xs text-white/50">{safeT("practiceNowHint")}</div>
      </div>
    </div>
  );
}
