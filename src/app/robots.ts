import type { MetadataRoute } from "next";
import { ROUTES } from "@/utils";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://zoeskoul.com";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: [
                    ROUTES.home,
                    ROUTES.catalog,
                    ROUTES.pricing,
                    ROUTES.contact,
                    ROUTES.privacy,
                    ROUTES.terms,
                    ROUTES.sandbox,
                ],
                disallow: [
                    "/api/",
                    "/admin",
                    "/profile",
                    "/assignments",
                    ROUTES.signIn,
                    ROUTES.review,
                    ROUTES.authenticate,
                ],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}