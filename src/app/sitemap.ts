import type { MetadataRoute } from "next";
import { ROUTES } from "@/utils";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zoeskoul.com";
const LOCALES = ["en", "fr", "ht"] as const;

// Only truly public, indexable pages
const PUBLIC_ROUTES = [
    ROUTES.home,
    ROUTES.pricing,
    ROUTES.sandbox,
] as const;

// Add only routes that are public without auth
const PUBLIC_SUBJECTS: string[] = [
    // ROUTES.subject("python"), // example if you add a helper later
    // "/subjects/python",
    // "/subjects/linear-algebra",
];

function absoluteUrl(path: string) {
    return `${SITE_URL}${path}`;
}

function localizedPath(locale: string, path: string) {
    return path === "/" || path === "" ? `/${locale}` : `/${locale}${path}`;
}

function makeEntry(
    locale: (typeof LOCALES)[number],
    path: string
): MetadataRoute.Sitemap[number] {
    return {
        url: absoluteUrl(localizedPath(locale, path)),
        lastModified: new Date(),
        changeFrequency: path === "/" || path === "" ? "weekly" : "monthly",
        priority: path === "/" || path === "" ? 1 : 0.8,
        alternates: {
            languages: Object.fromEntries(
                LOCALES.map((altLocale) => [
                    altLocale,
                    absoluteUrl(localizedPath(altLocale, path)),
                ])
            ),
        },
    };
}

export default function sitemap(): MetadataRoute.Sitemap {
    const allPaths = [...PUBLIC_ROUTES, ...PUBLIC_SUBJECTS];

    return allPaths.flatMap((path) =>
        LOCALES.map((locale) => makeEntry(locale, path))
    );
}