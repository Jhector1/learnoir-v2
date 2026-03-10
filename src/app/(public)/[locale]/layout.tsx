import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";
import "../../globals.css";

import React from "react";
import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";

import Providers from "../../providers";
import { auth } from "@/lib/auth";

import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";

import { inter, playfair, greatVibes } from "@/app/fonts";
import { SfxProvider } from "@/lib/sfx/SfxProvider";

type LayoutProps = Readonly<{
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}>;

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "ZoeSkoul";
const DEFAULT_SITE_URL = "https://zoeskoul.com";

function getSiteUrl() {
    const raw = process.env.NEXT_PUBLIC_APP_URL || DEFAULT_SITE_URL;

    try {
        return new URL(raw);
    } catch {
        return new URL(DEFAULT_SITE_URL);
    }
}

function getOgLocale(locale: string) {
    switch (locale) {
        case "fr":
            return "fr_FR";
        case "ht":
            return "ht_HT";
        default:
            return "en_US";
    }
}

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    colorScheme: "light dark",
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
        { media: "(prefers-color-scheme: dark)", color: "#070A12" },
    ],
};

export async function generateMetadata(
    { params }: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
    const { locale } = await params;

    const metadata: Metadata = {
        metadataBase: getSiteUrl(),

        title: {
            default: `${APP_NAME} — Learn programming, math, AI, languages, and more`,
            template: `%s | ${APP_NAME}`,
        },

        description:
            "ZoeSkoul is a multilingual learning platform for programming, math, AI, cybersecurity, and language practice with interactive lessons, practice modules, and guided learning paths.",

        applicationName: APP_NAME,
        creator: "Jean Hector",
        publisher: APP_NAME,
        keywords: [
            "ZoeSkoul",
            "Learnoir",
            "programming",
            "python",
            "linear algebra",
            "AI",
            "cybersecurity",
            "languages",
            "interactive learning",
        ],
        classification: "Education",
        referrer: "origin-when-cross-origin",
        manifest: "/site.webmanifest",

        alternates: {
            canonical: `/${locale}`,
            languages: {
                en: "/en",
                fr: "/fr",
                ht: "/ht",
            },
        },

        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                noimageindex: false,
                "max-video-preview": -1,
                "max-image-preview": "large",
                "max-snippet": -1,
            },
        },

        openGraph: {
            type: "website",
            url: `/${locale}`,
            siteName: APP_NAME,
            locale: getOgLocale(locale),
            title: `${APP_NAME} — Learn programming, math, AI, languages, and more`,
            description:
                "Multilingual learning platform with interactive lessons and guided practice.",
            images: [
                {
                    url: "/og/zoeskoul-og.png",
                    width: 1200,
                    height: 630,
                    alt: `${APP_NAME} learning platform`,
                },
            ],
        },

        twitter: {
            card: "summary_large_image",
            title: `${APP_NAME} — Learn programming, math, AI, languages, and more`,
            description:
                "Multilingual learning platform with interactive lessons and guided practice.",
            images: ["/og/zoeskoul-og.png"],
        },

        icons: {
            icon: [
                { url: "/favicon.ico" },
                { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
                { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
            ],
            shortcut: "/favicon.ico",
            apple: [
                {
                    url: "/icons/apple-touch-icon.png",
                    sizes: "180x180",
                    type: "image/png",
                },
            ],
        },

        appleWebApp: {
            capable: true,
            statusBarStyle: "default",
            title: APP_NAME,
        },

        formatDetection: {
            telephone: false,
            address: false,
            email: false,
        },
    };

    return metadata;
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
    const { locale } = await params;

    if (!hasLocale(routing.locales, locale)) notFound();
    setRequestLocale(locale);

    const session = await auth();
    const messages = await getMessages();

    return (
        <html
            lang={locale}
            className={`${inter.variable} ${playfair.variable} ${greatVibes.variable}`}
            suppressHydrationWarning
        >
        <body
            className="
          min-h-screen text-neutral-900 dark:text-white
          bg-[var(--app-bg)]
        "
        >
        <div
            className="
            min-h-screen
            bg-[radial-gradient(1200px_700px_at_20%_0%,var(--app-bg-ink)_0%,transparent_60%)]
          "
        >
            <Providers session={session}>
                <NextIntlClientProvider messages={messages}>
                    <SfxProvider>{children}</SfxProvider>
                </NextIntlClientProvider>
            </Providers>
        </div>
        </body>
        </html>
    );
}