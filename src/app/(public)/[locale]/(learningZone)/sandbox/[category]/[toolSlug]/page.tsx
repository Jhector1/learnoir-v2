import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo/buildMetadata";
import { getRouteSeo, getSharedSeo } from "@/lib/seo/getSeo";
import type { AppLocale } from "@/lib/seo/types";
import { resolveSandboxToolEntry } from "@/lib/sandbox/toolRegistry";
import SandboxToolClient from "./SandboxToolClient";

type PageProps = {
    params: Promise<{
        locale: string;
        category: string;
        toolSlug: string;
    }>;
};

export async function generateMetadata(
    { params }: PageProps
): Promise<Metadata> {
    const { locale, category, toolSlug } = await params;
    const l = locale as AppLocale;

    const entry = resolveSandboxToolEntry(category, toolSlug);
    if (!entry) notFound();

    const seo = await getRouteSeo(l, entry.seoKey);
    const shared = await getSharedSeo(l);

    return buildMetadata({
        locale: l,
        path: `/sandbox/${category}/${toolSlug}`,
        title: seo.title,
        description: seo.description,
        keywords: shared.keywords,
        ogTitle: seo.ogTitle,
        ogDescription: seo.ogDescription,
        twitterTitle: seo.twitterTitle,
        twitterDescription: seo.twitterDescription,
        imageAlt: shared.defaultOgAlt,
        noIndex: false,
    });
}

export default async function SandboxToolPage({
                                                  params,
                                              }: PageProps) {
    const { locale, category, toolSlug } = await params;

    const entry = resolveSandboxToolEntry(category, toolSlug);
    if (!entry) notFound();

    return <SandboxToolClient locale={locale} entry={entry} />;
}