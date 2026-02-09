import { prisma } from "@/lib/prisma";
import SubjectPicker from "@/features/practice/ui/subject-picker/SubjectPicker";

export default async function PracticePage() {
  const subjects = await prisma.practiceSubject.findMany({
    orderBy: { order: "asc" },
    select: {
      slug: true,
      title: true,
      description: true,

      // ✅ NEW
      imagePublicId: true,
      imageAlt: true,

      modules: {
        orderBy: { order: "asc" },
        select: { slug: true, title: true, order: true },
      },
    },
  });

  const cards = subjects
    .map((s) => ({
      slug: s.slug,
      title: s.title,
      description: s.description ?? "",
      defaultModuleSlug: s.modules[0]?.slug ?? null,

      // ✅ NEW
      imagePublicId: s.imagePublicId ?? null,
      imageAlt: s.imageAlt ?? null,
    }))
    .filter((s) => !!s.slug);
console.log(cards)
  return <SubjectPicker initialSubjects={cards} />;
}
