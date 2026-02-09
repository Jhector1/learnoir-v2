// src/components/LocaleSwitcher.tsx
"use client";

import React from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { routing } from "@/i18n/routing";
import { stripLocale } from "@/i18n/stripLocale";
import { cn } from "@/lib/cn";

function persistLocale(nextLocale: string) {
  try {
    localStorage.setItem("learnoir:locale", nextLocale);
  } catch {}
  document.cookie = `NEXT_LOCALE=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const sp = useSearchParams();

  const rawPath = typeof window !== "undefined" ? window.location.pathname : "/";
  const basePath = stripLocale(rawPath);

  const search = sp.toString();
  const href = search ? `${basePath}?${search}` : basePath;

  const changeTo = (nextLocale: string) => {
    if (nextLocale === locale) return;
    persistLocale(nextLocale);
    router.replace(href, { locale: nextLocale });
  };

  return (
    <div className="ui-switcher">
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => changeTo(l)}
          className={cn(
            "ui-switcher-btn",
            l === locale ? "ui-switcher-btn--active" : "ui-switcher-btn--idle",
          )}
          aria-pressed={l === locale}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
