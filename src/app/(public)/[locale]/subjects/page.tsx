

import SubjectPicker from "@/features/practice/ui/subject-picker/SubjectPicker";

import { prisma } from "@/lib/prisma";


export default async function ChooseSubjectPage() {
 const subjects = await prisma.practiceSubject.findMany({
    orderBy: { order: "asc" },
    include: {
      modules: { orderBy: { order: "asc" }, select: { slug: true, title: true, order: true } },
      sections: { orderBy: { order: "asc" }, select: { slug: true, title: true, order: true, moduleId: true } },
    },
  });

  const initialSubjects = subjects.map((s) => ({
    slug: s.slug,
    title: s.title,
    description: s.description ?? "",
    defaultModuleSlug: s.modules[0]?.slug ?? null,
  }));


  return (
    <SubjectPicker initialSubjects={initialSubjects}/>
    // <div className="min-h-screen p-4 md:p-6 bg-[radial-gradient(1200px_700px_at_20%_0%,#151a2c_0%,#0b0d12_50%)] text-white/90">
      
    // </div>
  );
}
