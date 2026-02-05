"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

function cn(...cls: Array<string | false | undefined | null>) {
  return cls.filter(Boolean).join(" ");
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isLight = theme === "light";
  const next = isLight ? "dark" : "light";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className={cn(
        // ✅ dark-first (matches your header)
        "rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-extrabold text-white/85",
        "hover:bg-white/[0.10] transition",

        // ✅ light overrides when <html class="light">
        "[.light_&]:border-black/10 [.light_&]:bg-black/[0.04] [.light_&]:text-black/85",
        "[.light_&]:hover:bg-black/[0.08]"
      )}
      aria-label="Toggle theme"
    >
      {isLight ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}
