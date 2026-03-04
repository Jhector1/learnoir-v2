import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";
import "../../globals.css";

import React from "react";
import type {Metadata} from "next";
import Providers from "../../providers";
import {auth} from "@/lib/auth";

import {NextIntlClientProvider} from "next-intl";
import {getMessages, setRequestLocale} from "next-intl/server";
import {hasLocale} from "next-intl";
import {routing} from "@/i18n/routing";
import {notFound} from "next/navigation";
import {inter, playfair, greatVibes} from "@/app/fonts";
import {SfxProvider} from "@/lib/sfx/SfxProvider";

export default async function LocaleLayout({
                                               children,
                                               params,
                                           }: Readonly<{
    children: React.ReactNode;
    params: Promise<{ locale: string }>
}>) {
    const {locale} = await params;

    if (!hasLocale(routing.locales, locale)) notFound();
    setRequestLocale(locale);

    const session = await auth();
    const messages = await getMessages();

    return (
        <html className={`${inter.variable} ${playfair.variable} ${greatVibes.variable}`} lang={locale}
              suppressHydrationWarning>
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
