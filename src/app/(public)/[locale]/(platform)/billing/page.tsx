// src/app/(public)/[locale]/billing/page.tsx
import React from "react";
import BillingPageClient from "./BillingPageClient";

type SearchParams = Record<string, string | string[] | undefined>;

function pickString(sp: SearchParams, key: string) {
    const v = sp[key];
    return typeof v === "string" ? v : undefined;
}

function safeInternalPath(path?: string) {
    const raw = String(path ?? "").trim();
    if (!raw) return "/";
    if (raw.startsWith("//")) return "/";
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(raw)) return "/";
    return raw.startsWith("/") ? raw : `/${raw}`;
}

export default async function BillingPage({
                                              searchParams,
                                          }: {
    searchParams?: SearchParams | Promise<SearchParams>;
}) {
    const sp = await Promise.resolve(searchParams ?? {});

    const next = pickString(sp, "next");
    const callbackUrl = safeInternalPath(next ?? pickString(sp, "callbackUrl") ?? "/");

    const paywall = {
        reason: pickString(sp, "reason") ?? null,
        subject: pickString(sp, "subject") ?? null,
        module: pickString(sp, "module") ?? null,
        next: next ? safeInternalPath(next) : null,
        back: pickString(sp, "back") ? safeInternalPath(pickString(sp, "back")!) : null, // ✅ NEW
    };
    console.log(paywall)

    return <BillingPageClient callbackUrl={callbackUrl} paywall={paywall} />;
}