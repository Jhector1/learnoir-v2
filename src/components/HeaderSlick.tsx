// src/components/HeaderSlick.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import UserMenuSlick from "./UserMenuSlick";

import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import LocaleSwitcher from "./LocaleSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { Settings } from "lucide-react";
import { cn } from "@/lib/cn";

type NavItem = { href: string; label: string };

function SettingsMenu({ title = "Settings" }: { title?: string }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        className="ui-gearbtn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open settings"
        onClick={() => setOpen((v) => !v)}
      >
        <Settings className="h-4 w-4" />
      </button>

      {open ? (
        <div role="menu" className="ui-menu-panel">
          <div className="border-b border-neutral-200 px-4 py-3 dark:border-white/10">
            <div className="text-sm font-black tracking-tight text-neutral-900 dark:text-white">
              {title}
            </div>
            <div className="mt-0.5 text-xs text-neutral-600 dark:text-white/60">
              Appearance & language
            </div>
          </div>

          <div className="grid gap-3 p-3">
            <div className="ui-menu-section">
              <div className="ui-menu-label">Theme</div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="text-xs text-neutral-600 dark:text-white/60">
                  Light / Dark
                </div>
                <ThemeToggle />
              </div>
            </div>

            <div className="ui-menu-section">
              <div className="ui-menu-label">Language</div>
              <div className="mt-2">
                <LocaleSwitcher />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="ui-menu-closebtn"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function HeaderSlick({
  brand = "Learnoir",
  badge = "BETA",

  // ✅ default true
  isNav = true,
  isUser = true,
  isSetting = true,
}: {
  brand?: string;
  badge?: string;

  // ✅ add these to props type
  isNav?: boolean;
  isUser?: boolean;
  isSetting?: boolean;
}) {
  const t = useTranslations("Header");
  const locale = useLocale();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const user = session?.user;
  const isAuthed = !!user;

  const NAV: NavItem[] = useMemo(
    () => [
      { href: "/", label: t("home") },
      { href: "/subjects", label: t("subjects") },
      { href: "/billing", label: t("billing") },
    ],
    [t],
  );

  const [open, setOpen] = useState(false);
  const [elevated, setElevated] = useState(false);

  useEffect(() => {
    const onScroll = () => setElevated(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const activeIndex = useMemo(() => {
    const idx = NAV.findIndex((n) =>
      n.href === "/" ? pathname === "/" : pathname?.startsWith(n.href),
    );
    return idx < 0 ? 0 : idx;
  }, [pathname, NAV]);

  const navWrapRef = useRef<HTMLDivElement | null>(null);
  const labelRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [marker, setMarker] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });

  useEffect(() => {
    if (!isNav) return; // ✅ don't measure if nav hidden

    const wrap = navWrapRef.current;
    const labelEl = labelRefs.current[activeIndex];
    if (!wrap || !labelEl) return;

    let raf = 0;

    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const wrap = navWrapRef.current;
        const labelEl = labelRefs.current[activeIndex];
        if (!wrap || !labelEl) return;

        const pill = labelEl.parentElement as HTMLElement | null;
        if (!pill) return;

        const left = pill.offsetLeft;
        const width = pill.offsetWidth;

        if (width > 0) setMarker({ left, width });
      });
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(wrap);
    ro.observe(labelEl);

    window.addEventListener("resize", update);

    const fontSet: FontFaceSet | undefined = (document as any)?.fonts;
    let cancelled = false;
    if (fontSet?.ready) {
      fontSet.ready.then(() => !cancelled && update()).catch(() => {});
    }

    return () => {
      cancelled = true;
      ro.disconnect();
      window.removeEventListener("resize", update);
      cancelAnimationFrame(raf);
    };
  }, [activeIndex, locale, pathname, NAV.length, isNav]);

  const headerShell = cn(
    "ui-header-shell",
    elevated && "ui-header-shell--elevated",
  );

  const mobileItem = (isActive: boolean) =>
    cn(
      "ui-mobileitem",
      isActive ? "ui-mobileitem--active" : "ui-mobileitem--idle",
    );

  return (
    <header className="sticky top-0 z-50">
      <div className={headerShell}>
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex h-16 items-center justify-between gap-3">
            {/* Brand */}
            <Link href="/" className="group flex items-center gap-2">
              <div className="relative grid h-9 w-9 place-items-center rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
                <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(120%_120%_at_30%_20%,rgba(122,162,255,0.18)_0%,rgba(255,107,214,0.08)_35%,transparent_70%)] opacity-80" />
                <span className="relative text-sm font-black tracking-tight text-neutral-900 dark:text-white">
                  L
                </span>
              </div>

              <div className="leading-tight">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black tracking-tight text-neutral-900 dark:text-white/90">
                    {brand}
                  </span>
                  <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-[2px] text-[10px] font-extrabold text-neutral-700 dark:border-white/10 dark:bg-white/10 dark:text-white/70">
                    {badge}
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-neutral-500 dark:text-white/55">
                  {t("tagline")}
                </div>
              </div>
            </Link>

            {/* Desktop */}
            <nav className="hidden items-center gap-2 md:flex">
              {/* ✅ NAV conditional */}
              {isNav && (
                <div className="ui-navcard">
                  <div className="ui-navglow" />
                  <div ref={navWrapRef} className="relative flex items-center gap-1">
                    <div
                      className="ui-navmarker"
                      style={{
                        width: marker.width ? `${marker.width}px` : undefined,
                        transform: `translate3d(${marker.left}px, 0, 0)`,
                      }}
                    />
                    {NAV.map((n, i) => {
                      const isActive =
                        n.href === "/" ? pathname === "/" : pathname?.startsWith(n.href);
                      return (
                        <Link
                          key={n.href}
                          href={n.href}
                          className={cn(
                            "ui-navlink",
                            isActive ? "ui-navlink--active" : "ui-navlink--inactive",
                          )}
                        >
                          <span
                            ref={(el) => {
                              labelRefs.current[i] = el;
                            }}
                            className="inline-block"
                          >
                            {n.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* optional CTA can be tied to nav too (keep as-is or gate it) */}
              {isNav && (
                <Link href="/practice" className="ui-cta">
                  {t("startSession")}
                </Link>
              )}

              {/* ✅ SETTINGS conditional (fixed) */}
              {isSetting && (
                <SettingsMenu title={(t as any)("settings") ?? "Settings"} />
              )}

              {/* ✅ USER conditional */}
              {isUser &&
                status !== "loading" &&
                (isAuthed ? (
                  <UserMenuSlick
                    name={user?.name ?? "User"}
                    email={user?.email}
                    image={user?.image}
                    profileHref="/profile"
                    onSignOut={() => signOut({ callbackUrl: `/${locale}` })}
                  />
                ) : (
                  <button type="button" onClick={() => signIn()} className="ui-authbtn">
                    {t("signIn")}
                  </button>
                ))}
            </nav>

            {/* Mobile */}
            <div className="flex items-center gap-2 md:hidden">
              {/* ✅ settings respects flag */}
              {isSetting && <SettingsMenu title={(t as any)("settings") ?? "Settings"} />}

              {/* ✅ only show menu toggle if there is something to show */}
              {(isNav || isUser) && (
                <button
                  className="ui-mobilebtn"
                  onClick={() => setOpen((v) => !v)}
                  aria-expanded={open}
                  aria-label="Toggle menu"
                >
                  {open ? t("close") : t("menu")}
                </button>
              )}
            </div>
          </div>

          {/* Mobile panel */}
          {(isNav || isUser) && (
            <div
              className={cn(
                "md:hidden overflow-hidden transition-[max-height,opacity] duration-300",
                open ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0",
              )}
            >
              <div className="pb-4">
                <div className="mt-2 grid gap-2">
                  {/* ✅ mobile NAV */}
                  {isNav &&
                    NAV.map((n) => {
                      const isActive =
                        n.href === "/" ? pathname === "/" : pathname?.startsWith(n.href);
                      return (
                        <Link key={n.href} href={n.href} className={mobileItem(isActive)}>
                          {n.label}
                        </Link>
                      );
                    })}

                  {isNav && (
                    <Link href="/practice" className={cn("ui-cta", "px-3 py-3 text-sm")}>
                      {t("startSession")}
                    </Link>
                  )}

                  {/* ✅ mobile USER */}
                  {isUser &&
                    status !== "loading" &&
                    (isAuthed ? (
                      <>
                        <Link
                          href="/profile"
                          className={mobileItem(Boolean(pathname?.startsWith("/profile")))}
                        >
                          {t("profile")}
                        </Link>
                        <button
                          type="button"
                          onClick={() => signOut({ callbackUrl: `/${locale}` })}
                          className={mobileItem(false)}
                        >
                          {t("logout")}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => signIn()}
                        className={mobileItem(false)}
                      >
                        {t("signIn")}
                      </button>
                    ))}

                  {(isNav || isUser) && (
                    <div className="mt-3 text-[11px] text-neutral-500 dark:text-white/55">
                      {t("tip")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="ui-bottomline" />
    </header>
  );
}


export function LearnHeaderSlick() {

  return (
           <HeaderSlick brand="Learnoir" badge="MVP" isUser={false} isNav={false} />

  );
}
