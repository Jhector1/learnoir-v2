import {
    HC_PRONOUNS_SECTION
} from "@/components/sketches/subjects/haitian-creole/modules/module0/sections/section0/pronouns.section";
import {
    HC_SENTENCES_SECTION
} from "@/components/sketches/subjects/haitian-creole/modules/module0/sections/section0/sentences.section";
import {
    HC_QUESTIONS_SECTION
} from "@/components/sketches/subjects/haitian-creole/modules/module0/sections/section0/questions.section";
import {
    HC_NUMBERS_SECTION
} from "@/components/sketches/subjects/haitian-creole/modules/module0/sections/section0/numbers.section";
import {
    HC_GREETINGS_SECTION
} from "@/components/sketches/subjects/haitian-creole/modules/module0/sections/section0/greetings.section";
import {SketchEntry} from "@/components/sketches/subjects";

export const HC_SECTION0: Record<string, SketchEntry> = {
    ...HC_GREETINGS_SECTION,
    ...HC_PRONOUNS_SECTION,
    ...HC_SENTENCES_SECTION,
    ...HC_QUESTIONS_SECTION,
    ...HC_NUMBERS_SECTION,
};