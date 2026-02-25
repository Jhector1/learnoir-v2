"use client";

import React, { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { routing } from "@/i18n/routing";
import { stripLocale } from "@/i18n/stripLocale";
import { cn } from "@/lib/cn";
import ConfirmResetModal from "./practice/ConfirmResetModal";

function persistLocale(nextLocale: string) {
  try {
    localStorage.setItem("learnoir:locale", nextLocale);
  } catch {}
  document.cookie = `NEXT_LOCALE=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export default function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const sp = useSearchParams();

  const rawPath = typeof window !== "undefined" ? window.location.pathname : "/";
  const basePath = stripLocale(rawPath);

  const search = sp.toString();
  const href = search ? `${basePath}?${search}` : basePath;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingLocale, setPendingLocale] = useState<string | null>(null);

  const title = t("confirm.title");

  const description = useMemo(() => {
    if (!pendingLocale) return "";
    return t("confirm.description", {
      from: String(locale).toUpperCase(),
      to: String(pendingLocale).toUpperCase(),
    });
  }, [pendingLocale, locale, t]);

  const requestChangeTo = (nextLocale: string) => {
    if (nextLocale === locale) return;
    setPendingLocale(nextLocale);
    setConfirmOpen(true);
  };

  const cancel = () => {
    setConfirmOpen(false);
    setPendingLocale(null);
  };

  const confirm = () => {
    if (!pendingLocale) return cancel();

    persistLocale(pendingLocale);
    router.replace(href, { locale: pendingLocale });

    setConfirmOpen(false);
    setPendingLocale(null);
  };

  return (
      <div
          className={cn(
              // ✅ key: no clipping in tight headers
              "relative inline-flex items-center gap-1 overflow-visible",
              "rounded-full border border-neutral-200 bg-white/80 p-1 shadow-sm backdrop-blur",
              "dark:border-white/10 dark:bg-white/5 dark:shadow-none"
          )}
          aria-label={t("ariaLabel")}

      >
        {confirmOpen ? (
            <ConfirmResetModal
                open={confirmOpen}
                title={t("confirm.title")}
                description={description}
                confirmText={t("confirm.confirmText")}
                cancelText={t("confirm.cancelText")}
                danger={false}
                onConfirm={confirm}
                onClose={cancel}
                panelClassName="max-w-[20rem]" // 👈 fixed-ish panel width (optional)

            />
        ) : null}

        {routing.locales.map((l) => {
          const active = l === locale;

          return (
              <button
                  key={l}
                  type="button"
                  onClick={() => requestChangeTo(l)}
                  className={cn(
                      // ✅ height + leading-none prevents “top cut”
                      "inline-flex h-8 items-center justify-center rounded-full px-2.5 text-xs font-semibold leading-none",
                      "transition focus:outline-none focus:ring-2 focus:ring-emerald-300/50",
                      active
                          ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                          : "text-neutral-700 hover:bg-neutral-100 dark:text-white/80 dark:hover:bg-white/10"
                  )}
                  aria-pressed={active}
                  aria-label={t("switchTo", { locale: l.toUpperCase() })}
              >
                {l.toUpperCase()}
              </button>
          );
        })}
      </div>
  );
}