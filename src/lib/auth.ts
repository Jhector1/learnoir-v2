// src/lib/auth.ts
import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },

  providers: [
    Keycloak({
      issuer: process.env.KEYCLOAK_ISSUER!,
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      authorization: {
        params: { scope: "openid profile email" },
      },
    }),

    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allow safe relative redirects only
      if (url.startsWith("/") && !url.startsWith("//")) {
        return `${baseUrl}${url}`;
      }

      // Allow same-origin absolute URLs only
      try {
        const parsed = new URL(url);
        if (parsed.origin === baseUrl) return url;
      } catch {
        // Ignore parse errors and fall back safely
      }

      // Fallback to a safe internal page
      return `${baseUrl}/en`;
    },

    async jwt({ token, user, account }) {
      if (user?.id) token.uid = user.id;

      // Store Keycloak id_token for proper RP-initiated logout if needed
      if (account?.provider === "keycloak" && account?.id_token) {
        (token as any).kc_id_token = account.id_token;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && (token as any).uid) {
        (session.user as any).id = (token as any).uid as string;
      }

      return session;
    },
  },
});