export type Accent = "emerald" | "sky" | "violet" | "amber";

export type LandingPart = {
  id: string;
  badgeKey: string;
  titleKey: string;
  subtitleKey: string;
  learnHref: string;
  practiceHref: string;
  bulletsCount: number;
  accent: Accent;
};

export type LandingPageConfig = {
  id: string;            // ✅ stable id for debugging (e.g. "la.m2.matrices-part1")
  subjectSlug: string;   // "linear-algebra"
  namespace: string;     // next-intl namespace

  pageTitleKey: string;
  pageIntroKey: string;

  quickStarts?: Array<{
    labelKey: string;
    href: string;
    accent: Accent;
  }>;

  parts: LandingPart[];

  recommended?: {
    titleKey: string;
    itemsCount: number;
  };

  routeHintKey?: string;
};







import type { GenKey, TopicSlug } from "@/lib/practice/types";

export type SubjectSlug = string;

export type SubjectTopic = {
  slug: TopicSlug;      // "m2.matmul" etc OR "py.print" etc
  label: string;
  group?: string;       // "Module 0", "Basics", "Matrices Part 1"
  genKey?: GenKey;      // optional override for DB / generator selection
};

export type SubjectConfig = {
  slug: SubjectSlug;          // "linear-algebra", "python"
  title: string;
  topics: readonly SubjectTopic[];

  // maps generator engine keys -> DB topic slugs (canonical)
  genKeyToDb: Record<GenKey, TopicSlug>;

  // optional: for “mixed generator keys” that accept variants (matrices_part1 etc)
  variants?: Partial<Record<GenKey, readonly TopicSlug[]>>;
};
