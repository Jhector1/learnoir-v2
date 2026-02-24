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
        <body className="min-h-screen bg-white text-neutral-900 dark:bg-black dark:text-white">
        <Providers session={session}>
            <NextIntlClientProvider messages={messages}>
                <SfxProvider>
                    {children}
                </SfxProvider>
            </NextIntlClientProvider>
        </Providers>
        </body>
        </html>
    );
}
