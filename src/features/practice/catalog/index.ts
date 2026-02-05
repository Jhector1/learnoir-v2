import type { LandingPageConfig } from "./types";
import { LINEAR_ALGEBRA_SUBJECT, linearAlgebraLandings } from "./subjects/linear-algebra";
import { PYTHON_SUBJECT, pythonLandings } from "./subjects/python";
// later: import { pythonLandings } from "./subjects/python";

export const ALL_LANDINGS: LandingPageConfig[] = [
  ...linearAlgebraLandings,
   ...pythonLandings,
];

export function bySubject(subjectSlug: string) {
  return ALL_LANDINGS.filter((x) => x.subjectSlug === subjectSlug);
}

export function byId(id: string) {
  return ALL_LANDINGS.find((x) => x.id === id);
}


import type { SubjectConfig } from "./types";


export const SUBJECTS: readonly SubjectConfig[] = [
  LINEAR_ALGEBRA_SUBJECT,
  PYTHON_SUBJECT,
] as const;

export function getSubject(slug: string | null | undefined): SubjectConfig | null {
  const s = String(slug ?? "").trim();
  if (!s) return null;
  return SUBJECTS.find((x) => x.slug === s) ?? null;
}

export function getTopicOptionsForSubject(subjectSlug: string) {
  const s = getSubject(subjectSlug);
  const topics = s?.topics ?? [];
  return [
    { id: "all" as const, label: "All topics" },
    ...topics.map((t) => ({ id: t.slug, label: t.label, group: t.group })),
  ];
}
