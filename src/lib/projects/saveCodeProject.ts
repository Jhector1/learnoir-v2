import "server-only";

import { createHash } from "node:crypto";
import {
    CodeProjectScopeKind,
    CodeProjectVisibility,
    Prisma,
    type PrismaClient,
} from "@prisma/client";

type SaveProjectScopeInput = {
    kind?: CodeProjectScopeKind;
    subjectId?: string | null;
    moduleId?: string | null;
    assignmentId?: string | null;
    scopeKey?: string | null;
};

export type SaveCodeProjectInput = {
    projectId?: string;
    ownerId: string;

    title: string;
    description?: string | null;
    language: string;

    workspace: Prisma.InputJsonValue;
    settings?: Prisma.InputJsonValue | null;
    meta?: Prisma.InputJsonValue | null;

    entryPath?: string | null;
    activePath?: string | null;

    visibility?: CodeProjectVisibility;
    shareToken?: string | null;

    scope?: SaveProjectScopeInput;

    createRevision?: boolean;
    revisionNote?: string | null;
    createdById?: string | null;
};

function hashSnapshot(value: unknown) {
    return createHash("sha256")
        .update(JSON.stringify(value ?? null))
        .digest("hex");
}

function normalizeScope(scope?: SaveProjectScopeInput) {
    return {
        scopeKind: scope?.kind ?? CodeProjectScopeKind.personal,
        subjectId: scope?.subjectId ?? null,
        moduleId: scope?.moduleId ?? null,
        assignmentId: scope?.assignmentId ?? null,
        scopeKey: scope?.scopeKey ?? null,
    };
}

export async function saveCodeProject(
    prisma: PrismaClient,
    input: SaveCodeProjectInput,
) {
    const normalizedScope = normalizeScope(input.scope);

    const snapshotForHash = {
        language: input.language,
        entryPath: input.entryPath ?? null,
        activePath: input.activePath ?? null,
        workspace: input.workspace ?? null,
        settings: input.settings ?? null,
    };

    const workspaceHash = hashSnapshot(snapshotForHash);

    return prisma.$transaction(async (tx) => {
        const existing = input.projectId
            ? await tx.codeProject.findFirst({
                where: {
                    id: input.projectId,
                    ownerId: input.ownerId,
                },
                select: {
                    id: true,
                    currentVersion: true,
                    workspaceHash: true,
                },
            })
            : null;

        if (input.projectId && !existing) {
            throw new Error("Project not found or not owned by user.");
        }

        const hasSnapshotChanged = existing
            ? existing.workspaceHash !== workspaceHash
            : true;

        const nextVersion = existing
            ? hasSnapshotChanged
                ? existing.currentVersion + 1
                : existing.currentVersion
            : 1;

        const projectData = {
            title: input.title.trim(),
            description: input.description ?? null,
            language: input.language,

            ...normalizedScope,

            visibility: input.visibility ?? CodeProjectVisibility.private,
            shareToken:
                input.visibility === CodeProjectVisibility.private
                    ? null
                    : input.shareToken ?? null,

            entryPath: input.entryPath ?? null,
            activePath: input.activePath ?? null,

            workspaceHash,
            workspace: input.workspace,
            settings: input.settings ?? Prisma.JsonNull,
            meta: input.meta ?? Prisma.JsonNull,

            currentVersion: nextVersion,
            lastOpenedAt: new Date(),
        };

        const project = existing
            ? await tx.codeProject.update({
                where: { id: existing.id },
                data: projectData,
            })
            : await tx.codeProject.create({
                data: {
                    ownerId: input.ownerId,
                    schemaVersion: 1,
                    ...projectData,
                },
            });

        const shouldCreateRevision =
            !existing ||
            (Boolean(input.createRevision) && hasSnapshotChanged);

        if (shouldCreateRevision) {
            await tx.codeProjectRevision.create({
                data: {
                    projectId: project.id,
                    version: nextVersion,
                    workspaceHash,
                    snapshot: input.workspace,
                    settings: input.settings ?? Prisma.JsonNull,
                    note: input.revisionNote ?? null,
                    meta: input.meta ?? Prisma.JsonNull,
                    createdById: input.createdById ?? input.ownerId,
                },
            });
        }

        return {
            project,
            changed: hasSnapshotChanged,
            version: nextVersion,
        };
    });
}