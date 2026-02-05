import type { LandingPageConfig } from "../../../types";

export const matricesPart1Landing: LandingPageConfig = {
  id: "la.m2.matrices-part1",
  subjectSlug: "linear-algebra",

  namespace: "MatricesPart1Landing",
  pageTitleKey: "pageTitle",
  pageIntroKey: "pageIntro",

  quickStarts: [
    {
      labelKey: "quickStartEasy",
      href: "/practice?section=module-2-matrices-part-1&difficulty=easy&topic=m2.matrices_intro",
      accent: "violet",
    },
  ],

  parts: [
    {
      id: "part-1",
      badgeKey: "parts.part1.badge",
      titleKey: "parts.part1.title",
      subtitleKey: "parts.part1.subtitle",
      learnHref: "/practice/review/matrices_part1",
      practiceHref: "/practice?section=module-2-matrices-part-1&difficulty=all&topic=m2.matrices_intro",
      bulletsCount: 8,
      accent: "violet",
    },
  ],

  recommended: { titleKey: "recommendedPathTitle", itemsCount: 3 },
  routeHintKey: "routeHint",
};
