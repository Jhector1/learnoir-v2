// src/lib/auth.ts
import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";
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
      authorization: { params: { scope: "openid profile email" } },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      if (user?.id) token.uid = user.id;

      // ✅ Save Keycloak id_token so we can call Keycloak end-session correctly
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
