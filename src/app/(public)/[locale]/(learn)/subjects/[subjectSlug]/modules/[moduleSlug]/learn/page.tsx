import ReviewModulePageClient from "./ReviewModulePageClient";
import { prisma } from "@/lib/prisma";

// If you're using NextAuth v5 `auth()` export:
import { auth } from "@/lib/auth"; // adjust path if yours differs

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await auth();

  // Prefer DB truth (since session may not include roles yet)
  const userId = (session?.user as any)?.id ?? null;

  let canUnlockAll = false;

  if (userId) {
    const u = await prisma.user.findUnique({
      where: { id: userId },
      select: { roles: true },
    });

    const roles = u?.roles ?? [];
    canUnlockAll = roles.includes("admin") || roles.includes("teacher");
  }

  return <ReviewModulePageClient canUnlockAll={canUnlockAll} />;
}
