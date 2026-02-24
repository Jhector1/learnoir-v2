import { prisma } from "@/lib/prisma";
import SubjectPicker from "@/features/practice/ui/subject-picker/SubjectPicker";
import { headers } from "next/headers";
import { getActor, actorKeyOf } from "@/lib/practice/actor";

export default async function PracticePage() {
    const h = await headers(); // ✅ safe in Next 16
    const req = new Request("http://local", {
        headers: Object.fromEntries(h.entries()), // ✅ plain HeadersInit
    });

    const actor = await getActor();

    const actorKey =
        actor.userId || actor.guestId
            ? actorKeyOf({ userId: actor.userId ?? null, guestId: actor.guestId ?? null })
            : null;

    const subjects = await prisma.practiceSubject.findMany({
        orderBy: { order: "asc" },
        select: {
            id: true,
            slug: true,
            title: true,
            description: true,
            imagePublicId: true,
            imageAlt: true,
            modules: {
                orderBy: { order: "asc" },
                select: { slug: true, title: true, order: true },
            },
        },
    });

    const enrolledSet = new Set<string>();
    if (actorKey) {
        const rows = await prisma.subjectEnrollment.findMany({
            where: {
                actorKey,
                subjectId: { in: subjects.map((s) => s.id) },
                status: { in: ["enrolled", "completed"] },
            },
            select: { subjectId: true },
        });
        rows.forEach((r) => enrolledSet.add(r.subjectId));
    }

    const cards = subjects.map((s) => ({
        slug: s.slug,
        title: s.title,
        description: s.description ?? "",
        defaultModuleSlug: s.modules[0]?.slug ?? null,
        imagePublicId: s.imagePublicId ?? null,
        imageAlt: s.imageAlt ?? null,
        enrolled: enrolledSet.has(s.id),
    }));

    return <SubjectPicker initialSubjects={cards} />;
}