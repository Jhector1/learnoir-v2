import type { LandingPageConfig } from "../../types";
import type { ReviewModule } from "@/lib/subjects/types";

import { pythonBasicsLanding } from "./basics/landing";
import { pythonModule0 } from "@/lib/subjects/python/modules/module0/pythonModule0";

// ✅ Practice landing configs (for /practice UI)
export const pythonLandings: LandingPageConfig[] = [pythonBasicsLanding];

// ✅ Review modules (for /practice/review/*)
export const pythonReviewModules: ReviewModule[] = [pythonModule0];


import type { SubjectConfig } from "../../types";
import { PY_TOPICS } from "./topics";
import { PY_GENKEY_TO_DB } from "./genKeyMap";

export const PYTHON_SUBJECT: SubjectConfig = {
  slug: "python",
  title: "Python",
  topics: PY_TOPICS,
  genKeyToDb: PY_GENKEY_TO_DB,
};
