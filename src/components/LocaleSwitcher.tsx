// src/components/LocaleSwitcher.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { routing } from "@/i18n/routing";
import { stripLocale } from "@/i18n/stripLocale";
import { cn } from "@/lib/cn";
import ConfirmResetModal from "./practice/ConfirmResetModal";

// ✅ change this import to your actual path
// import ConfirmResetModal from "@/components/review/quiz/quiz/components/ConfirmResetModal";

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

  // ✅ confirm modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingLocale, setPendingLocale] = useState<string | null>(null);

  const title = "Switch language?";
  const description = useMemo(() => {
    if (!pendingLocale) return "";
    return (
      `Your current progress is saved for ${String(locale).toUpperCase()}, ` +
      `but you’ll start a separate progress/session for ${String(pendingLocale).toUpperCase()}. ` +
      `You can switch back anytime.`
    );
  }, [pendingLocale, locale]);

  const requestChangeTo = (nextLocale: string) => {
    if (nextLocale === locale) return;

    // If you only want this modal on certain pages, add a guard here:
    // const path = typeof window !== "undefined" ? window.location.pathname : "";
    // const shouldConfirm = path.includes("/review") || path.includes("/practice");
    // if (!shouldConfirm) { persistLocale(nextLocale); router.replace(href, { locale: nextLocale }); return; }

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
    <div className="ui-switcher">
      {confirmOpen ? (
        <ConfirmResetModal
          open={confirmOpen}
          title={title}
          description={description}
          confirmText="Switch"
          cancelText="Stay"
          danger={false}
          onConfirm={confirm}
          onClose={cancel}
        />
      ) : null}

      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => requestChangeTo(l)}
          className={cn("ui-switcher-btn", l === locale ? "ui-switcher-btn--active" : "ui-switcher-btn--idle")}
          aria-pressed={l === locale}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
