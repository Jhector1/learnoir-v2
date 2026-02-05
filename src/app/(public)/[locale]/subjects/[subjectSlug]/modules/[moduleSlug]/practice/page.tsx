// src/app/(public)/[locale]/subjects/[subjectSlug]/modules/[moduleSlug]/practice/page.tsx
import PracticeClient from "./practice-client";

export default async function ModulePracticePage({
  params,
}: {
  params: Promise<{ locale: string; subjectSlug: string; moduleSlug: string }>;
}) {
  const { subjectSlug, moduleSlug } = await params;

  return <PracticeClient subjectSlug={subjectSlug} moduleSlug={moduleSlug} />;
}
