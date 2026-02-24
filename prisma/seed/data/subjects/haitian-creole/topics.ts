import { PracticeKind } from "@prisma/client";
import type { TopicDefCompat } from "../_types";
import { HC_MOD0, HC_PREFIX0 } from "./constants";
import {HC_GREETINGS} from "@/lib/subjects/modules/haitian-creole/modules/module0/topics/greetings.topics";
import {HC_PRONOUNS} from "@/lib/subjects/modules/haitian-creole/modules/module0/topics/pronouns.topics";
import {HC_SENTENCES} from "@/lib/subjects/modules/haitian-creole/modules/module0/topics/sentences.topics";
import {HC_QUESTIONS} from "@/lib/subjects/modules/haitian-creole/modules/module0/topics/questions.topics";
import {HC_NUMBERS} from "@/lib/subjects/modules/haitian-creole/modules/module0/topics/numbers.topics";

export const HC_TOPICS = {
  [HC_MOD0]: [
    HC_GREETINGS.def,
    HC_PRONOUNS.def,
    HC_SENTENCES.def,
    HC_QUESTIONS.def,
    HC_NUMBERS.def,
  ],
} satisfies Record<string, TopicDefCompat[]>;
