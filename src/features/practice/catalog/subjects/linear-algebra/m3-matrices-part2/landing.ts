import { LandingPageConfig } from "../../../types";

// ✅ NEW: Matrices Part 2 landing config (Part 3 in catalog)
export const matricesPart2Landing: LandingPageConfig = {
    id: "la.m2.matrces-part1",
  namespace: "MatricesPart2Landing",
  subjectSlug: "linear-algebra",
  pageTitleKey: "pageTitle",
  pageIntroKey: "pageIntro",
  quickStarts: [
    {
      labelKey: "quickStartEasy",
      // start at a “first” part-2 topic (adjust to your actual m3 slug)
      href: "/practice?section=module-3-matrices-part-2&difficulty=easy&topic=m3.norms",
      accent: "amber",
    },
    {
      labelKey: "jumpRankEasy",
      href: "/practice?section=module-3-matrices-part-2&difficulty=easy&topic=m3.rank_tolerance",
      accent: "sky",
    },
  ],
  parts: [
    {
      id: "part-2",
      badgeKey: "parts.part2.badge",
      titleKey: "parts.part2.title",
      subtitleKey: "parts.part2.subtitle",
      learnHref: "/practice/review/matrices_part2",
      practiceHref: "/practice?section=module-3-matrices-part-2&difficulty=all&topic=m3.norms",
      bulletsCount: 8,
      accent: "amber",
    },
  ],
  recommended: { titleKey: "recommendedPathTitle", itemsCount: 3 },
  routeHintKey: "routeHint",
};

