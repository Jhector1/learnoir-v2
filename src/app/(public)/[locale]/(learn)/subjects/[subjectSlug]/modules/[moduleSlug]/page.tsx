// src/app/(public)/[locale]/subjects/[subjectSlug]/modules/[moduleSlug]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ModuleIntroClient from "./ModuleIntroClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// import { notFound } from "next/navigation";

export default async function ModuleIntroPage({ params }: Promise<{ params: any }>) {
    const {locale} = await params
    const {subjectSlug} =await  params
    const {moduleSlug} = await  params

    if (!subjectSlug || !moduleSlug) notFound();

    const subject = await prisma.practiceSubject.findUnique({
        where: { slug: subjectSlug },
        select: { slug: true, title: true, description: true, imagePublicId: true, imageAlt: true },
    });
    console.log(subject,subjectSlug, moduleSlug)

    if (!subject) notFound();

    const module = await prisma.practiceModule.findFirst({
        where: { slug: moduleSlug, subject: { slug: subjectSlug } },
        select: {
            id: true,
            slug: true,
            title: true,
            description: true,
            order: true,
            weekStart: true,
            weekEnd: true,
            // If you later add meta Json? on PracticeModule, include it here:
             meta: true,
        },
    });
    if (!module) notFound();

    const [sectionsCount, topicsCount] = await Promise.all([
        prisma.practiceSection.count({ where: { moduleId: module.id } }),
        prisma.practiceTopic.count({ where: { moduleId: module.id } }),
    ]);

    return (
        <ModuleIntroClient
            locale={locale}
            subject={{
                slug: subject.slug,
                title: subject.title,
                description: subject.description ?? null,
                imagePublicId: subject.imagePublicId ?? null,
                imageAlt: subject.imageAlt ?? null,
            }}
            module={{
                id: module.id,
                slug: module.slug,
                title: module.title,
                description: module.description ?? null,
                order: module.order ?? 0,
                weekStart: module.weekStart ?? null,
                weekEnd: module.weekEnd ?? null,
                meta: module.meta?? null
            }}
            stats={{ sectionsCount, topicsCount }}
        />
    );
}
