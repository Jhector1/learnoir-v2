import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: {
  images: { remotePatterns: { protocol: string; hostname: string }[] };
  serverExternalPackages: string[];
  experimental: { outputFileTracingIncludes: { "/api/certificates/subject/pdf": string[] } }
} = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  // keep pdfkit external so it can read its runtime files
  serverExternalPackages: ["pdfkit"],

  experimental: {
    outputFileTracingIncludes: {
      // IMPORTANT: must match your route path exactly
      "/api/certificates/subject/pdf": ["./node_modules/pdfkit/js/data/**"],
    },
  },
};

const withNextIntl = createNextIntlPlugin();

// ✅ wrap it, don’t replace it
export default withNextIntl(nextConfig);
