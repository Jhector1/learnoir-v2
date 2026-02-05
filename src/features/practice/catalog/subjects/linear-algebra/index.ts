import { vectorsLanding } from "./m0-vectors/landing";
import { matricesPart1Landing } from "./m2-matrices-part1/landing";
import { matricesPart2Landing } from "./m3-matrices-part2/landing";

export const linearAlgebraLandings = [
  vectorsLanding,
  matricesPart1Landing,
  matricesPart2Landing,
] as const;



import { LA_TOPICS } from "./topics";
import { LA_GENKEY_TO_DB } from "./genKeyMap";
import { LA_MATRIX_PART1_VARIANTS, LA_MATRIX_PART2_VARIANTS } from "./variants";
import { SubjectConfig } from "../../types";

export const LINEAR_ALGEBRA_SUBJECT: SubjectConfig = {
  slug: "linear-algebra",
  title: "Linear Algebra",
  topics: LA_TOPICS,
  genKeyToDb: LA_GENKEY_TO_DB,
  variants: {
    matrices_part1: LA_MATRIX_PART1_VARIANTS,
    matrices_part2: LA_MATRIX_PART2_VARIANTS,
  },
};
