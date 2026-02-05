import type { LandingPageConfig } from "../../../types";

export const pythonBasicsLanding: LandingPageConfig = {
  id: "py.basics.part1",
  subjectSlug: "python",

  namespace: "PythonBasicsLanding", // ✅ create translations under this namespace
  pageTitleKey: "pageTitle",
  pageIntroKey: "pageIntro",

  quickStarts: [
    {
      labelKey: "quickStartEasy",
      href: "/practice?section=python-part-1&difficulty=easy&topic=py_print",
      accent: "emerald",
    },
    {
      labelKey: "jumpStringsEasy",
      href: "/practice?section=python-part-1&difficulty=easy&topic=py_strings",
      accent: "sky",
    },
  ],

  parts: [
    {
      id: "part-1",
      badgeKey: "parts.part1.badge",
      titleKey: "parts.part1.title",
      subtitleKey: "parts.part1.subtitle",

      // ✅ matches your ReviewModule id: python_part1
      learnHref: "/practice/review/python_part1",

      // ✅ matches your startPracticeHref section slug: python-part-1
      practiceHref: "/practice?section=python-part-1&difficulty=all&topic=py_print",

      bulletsCount: 6,
      accent: "emerald",
    },
  ],

  recommended: { titleKey: "recommendedPathTitle", itemsCount: 3 },
  routeHintKey: "routeHint",
};
