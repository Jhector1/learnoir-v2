"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { LandingPageConfig } from "@/features/practice/catalog/types";
import { ACCENT } from "../styles";
import CollapsibleSection from "./CollapsibleSection";
import PartCard from "./PartCard";

export default function LandingSection({ cfg }: { cfg: LandingPageConfig }) {
  const t = useTranslations(cfg.namespace);
  const safeT = (key: string) => (t.has(key as any) ? t(key as any) : key);

  const right = !!cfg.quickStarts?.length ? (
    <div className="flex flex-wrap gap-2">
      {cfg.quickStarts.map((q) => (
        <Link
          key={q.href}
          href={q.href}
          className={["rounded-xl border px-3 py-2 text-xs font-extrabold text-white transition", ACCENT[q.accent]].join(" ")}
        >
          {safeT(q.labelKey)}
        </Link>
      ))}
    </div>
  ) : null;

  return (
    <CollapsibleSection title={safeT(cfg.pageTitleKey)} subtitle={safeT(cfg.pageIntroKey)} right={right} defaultOpen={false}>
      <div className="grid gap-3 md:grid-cols-2">
        {cfg.parts.map((p) => <PartCard key={`${cfg.namespace}:${p.id}`} cfg={cfg} part={p} />)}
      </div>

      {!!cfg.recommended && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:p-5">
          <div className="text-sm font-black text-white/90">{safeT(cfg.recommended.titleKey)}</div>

          <ol className="mt-3 space-y-2 text-sm text-white/70">
            {Array.from({ length: cfg.recommended.itemsCount }, (_, i) => (
              <li key={i} className="flex gap-2">
                <span className="font-extrabold text-white/90">{i + 1}.</span>
                <span>{safeT(`recommended.${i}`)}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {!!cfg.routeHintKey && <div className="mt-4 text-xs text-white/50">{safeT(cfg.routeHintKey)}</div>}
    </CollapsibleSection>
  );
}
