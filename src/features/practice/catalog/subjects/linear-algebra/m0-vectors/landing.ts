import { LandingPageConfig } from "../../../types";


// ✅ Vectors landing config
export const vectorsLanding: LandingPageConfig = {
     id: "la.m2.vectors",
  subjectSlug: "linear-algebra",

  namespace: "VectorsLanding",
  pageTitleKey: "pageTitle",
  pageIntroKey: "pageIntro",
  quickStarts: [
    {
      labelKey: "quickStartPart1Easy",
      href: "/practice?section=module-0-vectors-part-1&difficulty=easy&topic=vectors_part1",
      accent: "emerald",
    },
    {
      labelKey: "jumpPart2Easy",
      href: "/practice?section=module-0-vectors-part-2&difficulty=easy&topic=vectors_part2",
      accent: "sky",
    },
  ],
  parts: [
    {
      id: "part-1",
      badgeKey: "parts.part1.badge",
      titleKey: "parts.part1.title",
      subtitleKey: "parts.part1.subtitle",
      learnHref: "/practice/review/vectors_part1",
      practiceHref: "/practice?section=module-0-vectors-part-1&difficulty=all&topic=vectors_part1",
      bulletsCount: 8,
      accent: "emerald",
    },
    {
      id: "part-2",
      badgeKey: "parts.part2.badge",
      titleKey: "parts.part2.title",
      subtitleKey: "parts.part2.subtitle",
      learnHref: "/practice/review/vectors_part2",
      practiceHref: "/practice?section=module-0-vectors-part-2&difficulty=all&topic=vectors_part2",
      bulletsCount: 8,
      accent: "sky",
    },
  ],
  recommended: { titleKey: "recommendedPathTitle", itemsCount: 3 },
  routeHintKey: "routeHint",
};
