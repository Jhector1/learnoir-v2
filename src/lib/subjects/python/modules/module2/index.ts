// src/lib/subjects/python/modules/module2/pythonModule2.ts
import type { ReviewModule } from "@/lib/subjects/types";

import { PY_SECTION_PART2 } from "@/lib/practice/catalog/subjects/python/slugs";
import { PY_MOD2 } from "../../../../../../prisma/seed/data/subjects/python/constants";

import { PY_CONDITIONALS } from "@/lib/subjects/python/modules/module2/topics/conditionals.topics";
import { PY_LOOPS } from "@/lib/subjects/python/modules/module2/topics/loops.topics";
import { PY_LISTS } from "@/lib/subjects/python/modules/module2/topics/lists.topics";
import { PY_FUNCTIONS } from "@/lib/subjects/python/modules/module2/topics/functions.topics";

export const pythonModule2: ReviewModule = {
    id: PY_MOD2,

    title: "Python 2 — Control Flow + Collections",
    subtitle:
        "Conditionals, loops, lists, and functions — stitched into story-based mini-projects.",

    // Optional (keep only if ReviewModule has it)
    // summary:
    //   "Teach your programs to decide (if), repeat (loops), store many values (lists), and reuse logic (functions).",

    startPracticeHref: (topicSlug) =>
        `/practice?section=${PY_SECTION_PART2}&difficulty=easy&topic=${encodeURIComponent(
            topicSlug,
        )}`,

    topics: [
        // ✅ Control flow first
        PY_CONDITIONALS.topic,
        PY_LOOPS.topic,

        // ✅ Collections
        PY_LISTS.topic,

        // ✅ Abstraction / reuse
        PY_FUNCTIONS.topic,
    ],
};