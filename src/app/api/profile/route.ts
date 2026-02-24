// src/app/api/profile/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// ✅ Adjust this import to your project.
// Common patterns:
// - "@/lib/auth" exporting authOptions
// - "@/app/api/auth/[...nextauth]/route" exporting authOptions
import { auth } from "@/lib/auth";
// import { getServerSession } from "next-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------------------- helpers -------------------------------- */

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

function isHttpUrl(s: string) {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

const UpdateProfileSchema = z.object({
  name: z
      .string()
      .transform((s) => s.trim())
      .refine((s) => s.length > 0, "Display name is required.")
      .refine((s) => s.length <= 60, "Display name must be 60 characters or fewer."),
  image: z
      .union([z.string(), z.null()])
      .transform((v) => {
        if (v === null) return null;
        const s = String(v).trim();
        return s.length ? s : null;
      })
      .refine((v) => v === null || (v.length <= 400 && isHttpUrl(v)), "Avatar must be a valid http(s) URL."),
});

async function requireUser() {
  const session = await auth();
  const email = session?.user?.email ?? null;

  if (!session || !email) {
    return { session: null, user: null };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, image: true },
  });

  return { session, user };
}

/* -------------------------------- handlers -------------------------------- */

export async function GET() {
  const { user } = await requireUser();
  if (!user) return json({ error: "Unauthorized" }, 401);
  return json({ user });
}

export async function PUT(req: Request) {
  const { user } = await requireUser();
  if (!user) return json({ error: "Unauthorized" }, 401);

  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const parsed = UpdateProfileSchema.safeParse(body);
  if (!parsed.success) {
    // Match your client’s error mapping style: issues.fieldErrors
    return json(
        {
          error: "Validation failed",
          issues: parsed.error.flatten(),
        },
        400
    );
  }

  const { name, image } = parsed.data;

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { name, image },
    select: { id: true, name: true, email: true, image: true },
  });

  return json({ user: updated });
}