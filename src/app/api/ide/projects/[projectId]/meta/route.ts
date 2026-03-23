import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// import { getCurrentActor } from "@/lib/auth/getCurrentActor";
import { checkIdeCapability } from "@/lib/access/ideCapabilityServer";
import {getActor} from "@/lib/practice/actor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonNoStore(body: unknown, status = 200) {
    return NextResponse.json(body, {
        status,
        headers: {
            "Cache-Control": "no-store, max-age=0",
        },
    });
}

function parseBody(raw: unknown) {
    const body = (raw ?? {}) as Record<string, unknown>;

    const title =
        typeof body.title === "string" && body.title.trim()
            ? body.title.trim()
            : null;

    const description =
        typeof body.description === "string"
            ? body.description
            : body.description === null
                ? null
                : undefined;

    if (!title) {
        throw new Error("Project title is required.");
    }

    return {
        title,
        description,
    };
}

export async function PATCH(
    req: Request,
    ctx: { params: Promise<{ projectId: string }> },
) {
    try {
        const actor = await getActor();

        const gate = await checkIdeCapability(prisma, {
            actor,
            capability: "save_cloud",
        });

        if (!gate.ok) {
            return jsonNoStore(
                {
                    ok: false,
                    paywall: true,
                    reason: gate.reason,
                    error:
                        gate.reason === "requires_login"
                            ? "Sign in to manage saved projects."
                            : "Your plan does not include saved projects.",
                },
                gate.reason === "requires_login" ? 401 : 402,
            );
        }

        if (!actor.userId) {
            return jsonNoStore(
                { ok: false, error: "Sign in required." },
                401,
            );
        }

        const { projectId } = await ctx.params;
        const body = parseBody(await req.json());

        const project = await prisma.codeProject.updateMany({
            where: {
                id: projectId,
                ownerId: actor.userId,
                archivedAt: null,
            },
            data: {
                title: body.title,
                ...(body.description !== undefined
                    ? { description: body.description }
                    : {}),
            },
        });

        if (!project.count) {
            return jsonNoStore(
                { ok: false, error: "Project not found." },
                404,
            );
        }

        const updated = await prisma.codeProject.findUnique({
            where: { id: projectId },
            select: {
                id: true,
                title: true,
                description: true,
                updatedAt: true,
            },
        });

        return jsonNoStore({
            ok: true,
            project: {
                id: updated?.id,
                title: updated?.title,
                description: updated?.description ?? null,
                updatedAt: updated?.updatedAt.toISOString(),
            },
        });
    } catch (e: any) {
        return jsonNoStore(
            {
                ok: false,
                error: e?.message ?? "Failed to update project metadata.",
            },
            400,
        );
    }
}