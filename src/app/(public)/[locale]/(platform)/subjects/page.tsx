import { prisma } from "@/lib/prisma";
import SubjectPicker from "@/features/practice/ui/subject-picker/SubjectPicker";
import { headers } from "next/headers";
import { getActor, actorKeyOf } from "@/lib/practice/actor";
import { getTranslations } from "next-intl/server";

export default async function PracticePage() {
    const h = await headers();

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

    // ✅ Translator for current locale (with your en->fr/ht fallback merge)
    const t = await getTranslations();

    // ✅ Safe translation helper:
    // - In prod, missing key returns "" (your getMessageFallback) → fallback to DB
    // - In dev, missing key returns the key string → fallback to DB

// ✅ Never throws, always falls back to DB
    const tMaybe = (key: string, fallback: string) => {
        try {
            // next-intl supports `.has` on the translator
            const has = (t as any).has?.(key);
            if (!has) return fallback;
            const out = t(key as any);
            return out || fallback;
        } catch {
            return fallback;
        }
    };

    const cards = subjects.map((s) => {
        const titleKey = `subjects.${s.slug}.title`;
        const descKey = `subjects.${s.slug}.description`;
        const altKey = `subjects.${s.slug}.imageAlt`;

        const title = tMaybe(titleKey, s.title);
        const description = tMaybe(descKey, s.description ?? "");
        const imageAlt = tMaybe(altKey, s.imageAlt ?? title);

        return {
            slug: s.slug,
            title,
            description,
            defaultModuleSlug: s.modules[0]?.slug ?? null,
            imagePublicId: s.imagePublicId ?? null,
            imageAlt,
            enrolled: enrolledSet.has(s.id),
        };
    });

    return <SubjectPicker initialSubjects={cards} />;
}