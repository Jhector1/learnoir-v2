// src/components/review/SketchHost.tsx
"use client";

import React from "react";
import SketchBlock from "@/components/sketches/subjects/SketchBlock";
import type { SavedSketchState } from "@/components/sketches/subjects/types";

export default function SketchHost(props: {
  cardId: string;
  title?: string;
  sketchId: string;
  height?: number;
  propsPatch?: Record<string, unknown>;

  initialState?: SavedSketchState | null;
  onStateChange?: (s: SavedSketchState) => void;

  done?: boolean;
  onMarkDone?: () => void;

  prereqsMet?: boolean;
  locked?: boolean;
}) {
  return <SketchBlock {...props} />;
}



// import React from "react";
//
// import VectorBasicsSketch from "@/components/review/sketches/linear_algebra/vectorpart1/VectorBasicsSketch";
// import DotProductSketch from "@/components/review/sketches/linear_algebra/vectorpart1/DotProductSketch";
// import ProjectionSketch from "@/components/review/sketches/linear_algebra/vectorpart1/ProjectionSketch";
// import IndependenceSketch from "@/components/review/sketches/linear_algebra/vectorpart2/IndependenceSketch";
// import SpanSketch from "@/components/review/sketches/linear_algebra/vectorpart2/SpanSketch";
// import BasisSketch from "@/components/review/sketches/linear_algebra/vectorpart2/BasisSketch";
//
// import NumpyShapesSketch from "@/components/review/sketches/linear_algebra/vectorpart1/NumpyShapesSketch";
// import HadamardOuterSketch from "@/components/review/sketches/linear_algebra/vectorpart1/HadamardOuterSketch";
// import MatrixAsImageSketch from "./sketches/linear_algebra/matrices/MatrixAsImageSketch";
// import MatrixSliceSketch from "./sketches/linear_algebra/matrices/MatrixSliceSketch";
// import SpecialMatricesSketch from "./sketches/linear_algebra/matrices/SpecialMatricesSketch";
// import HadamardShiftSketch from "./sketches/linear_algebra/matrices/HadamardShiftSketch";
// import MatMulExplorerSketch from "./sketches/linear_algebra/matrices/MatMulExplorerSketch";
// import LiveEvilSketch from "./sketches/linear_algebra/matrices/LiveEvilSketch";
// import SymmetricBuilderSketch from "./sketches/linear_algebra/matrices/SymmetricBuilderSketch";
// import Transform2DSketch from "./sketches/linear_algebra/matrices/Transform2DSketch";
// import MatrixNormsSketch from "./sketches/linear_algebra/matricespart2/MatrixNormsSketch";
// import ColumnSpaceSketch from "./sketches/linear_algebra/matricespart2/ColumnSpaceSketch";
// import NullSpaceSketch from "./sketches/linear_algebra/matricespart2/NullSpaceSketch";
// import RankToleranceSketch from "./sketches/linear_algebra/matricespart2/RankToleranceSketch";
// import DeterminantSketch from "./sketches/linear_algebra/matricespart2/DeterminantSketch";
// import CharacteristicPolynomialSketch from "./sketches/linear_algebra/matricespart2/CharacteristicPolynomialSketch";
// import Mat2RowSpaceSketch from "./sketches/linear_algebra/matricespart2/Mat2RowSpaceSketch";
// import Mat2LeftNullspaceSketch from "./sketches/linear_algebra/matricespart2/Mat2LeftNullspaceSketch";
// import AugmentedRankProofSketch from "./sketches/linear_algebra/matricespart2/AugmentedRankProofSketch";
// import LinearIndependenceRankSketch from "./sketches/linear_algebra/matricespart2/LinearIndependenceRankSketch";
// import Mat2IndependenceSketch from "./sketches/linear_algebra/matricespart2/Mat2IndependenceSketch";
// import Mat2ShiftRankSketch from "./sketches/linear_algebra/matricespart2/Mat2ShiftRankSketch";
// import Mat2AugmentedRankSketch from "./sketches/linear_algebra/matricespart2/Mat2AugmentedRankSketch";
// import Mat2RankOpsSketch from "./sketches/linear_algebra/matricespart2/Mat2RankOpsSketch";
// import Mat2OuterProductSketch from "./sketches/linear_algebra/matricespart2/Mat2OuterProductSketch";
//
//
//
//
//
// // import PrintOptionsSketch from "./sketches/python/chapter1/PrintOptionsSketch";
//
//
//
//
//
// import PrintOptionsSketch from "@/components/review/sketches/python/chapter1/PrintOptionsSketch";
// import InputOutputSketch from "@/components/review/sketches/python/chapter1/InputOutputSketch";
// import VariablesSketch from "@/components/review/sketches/python/chapter1/VariablesSketch";
// import StringsSketch from "@/components/review/sketches/python/chapter1/StringsSketch";
// import ArithmeticPrecedenceSketch from "@/components/review/sketches/python/chapter1/ArithmeticPrecedenceSketch";
// import ErrorMessagesSketch from "@/components/review/sketches/python/chapter1/ErrorMessagesSketch";
// import CommentsDocstringsSketch from "@/components/review/sketches/python/chapter1/CommentsDocstringsSketch";
// import dynamic from "next/dynamic";
// // import VideoEmbedSketch from "@/components/review/sketches/video/VideoEmbedSketch";
//
//
//
// import HCGreetingsSketch from "@/components/review/sketches/haitian-creole/HCGreetingsSketch";
// import HCPronounsSketch from "@/components/review/sketches/haitian-creole/HCPronounsSketch";
// import HCSentencesSketch from "@/components/review/sketches/haitian-creole/HCSentencesSketch";
// import HCQuestionsSketch from "@/components/review/sketches/haitian-creole/HCQuestionsSketch";
// import HCNumbersSketch from "@/components/review/sketches/haitian-creole/HCNumbersSketch";
// import OrthonormalBasisCoordsSketch from "@/components/review/sketches/linear_algebra/mod4/OrthonormalBasisCoordsSketch";
// import OrthogonalMatrixSketch from "@/components/review/sketches/linear_algebra/mod4/OrthogonalMatrixSketch";
// import GramSchmidtSketch from "@/components/review/sketches/linear_algebra/mod4/GramSchmidtSketch";
// import WeightedInnerProductSketch from "@/components/review/sketches/linear_algebra/mod4/WeightedInnerProductSketch";
// import SPD2x2Sketch from "@/components/review/sketches/linear_algebra/mod4/SPD2x2Sketch";
// import ProjectionMatrixSketch from "@/components/review/sketches/linear_algebra/mod4/ProjectionMatrixSketch";
// import ProjectionLineSketch from "@/components/review/sketches/linear_algebra/mod4/ProjectionLineSketch";
// import AngleOrthogonalitySketch from "@/components/review/sketches/linear_algebra/mod4/AngleOrthogonalitySketch";
// import InnerProductSketch from "@/components/review/sketches/linear_algebra/mod4/InnerProductSketch";
// import VectorNormsSketch from "@/components/review/sketches/linear_algebra/mod4/VectorNormsSketch";
// import GeoNormUnitBallsSketch from "@/components/review/sketches/linear_algebra/mod4/GeoNormUnitBallsSketch";
// import InnerProductGeometrySketch from "@/components/review/sketches/linear_algebra/mod4/InnerProductGeometrySketch";
// import DistanceSketch from "@/components/review/sketches/linear_algebra/mod4/DistanceSketch";
//
// import {
//   AIDataControlsSketch, AIFormatSketch, AIGetStartedSketch, AIIntroSketch,
//   AILabSketch,
//   AIRedactionSketch, AISafetySketch,
//   AIUseCasesSketch, AIVerifySketch, AIWorkflowSketch
// } from "@/components/review/sketches/ai/mod0";
//
// const VideoEmbedSketch = dynamic(() => import("@/components/review/sketches/python/chapter1/VideoEmbedSketch"), {
//   ssr: false,
// });
// const SKETCHES: Record<string, React.ComponentType<any>> = {
//   "vec.basics": VectorBasicsSketch,
//   "vec.dot": DotProductSketch,
//   "vec.projection": ProjectionSketch,
//
//   "vec.numpy": NumpyShapesSketch,
//   "vec.products": HadamardOuterSketch,
//
//   "vec.independence": IndependenceSketch,
//   "vec.span": SpanSketch,
//   "vec.basis": BasisSketch,
//   "matrices.image": MatrixAsImageSketch,
//   "matrices.slice": MatrixSliceSketch,
//   "matrices.special": SpecialMatricesSketch,
//   "matrices.hadamard_shift": HadamardShiftSketch,
//   "matrices.matmul": MatMulExplorerSketch,
//   "matrices.transform2d": Transform2DSketch,
//   "matrices.liveevil": LiveEvilSketch,
//   "matrices.symmetric": SymmetricBuilderSketch,
//   "mat2.norms": MatrixNormsSketch,
//   // "mat2.colspace": ColumnSpaceSketch,
//   "mat2.nullspace": NullSpaceSketch,
//   "mat2.rank": RankToleranceSketch,
//   "mat2.det": DeterminantSketch,
//   "mat2.charpoly": CharacteristicPolynomialSketch,
//   // ✅ fix your errors:
//   "mat2.independence": Mat2IndependenceSketch,
//   "mat2.shift": Mat2ShiftRankSketch,
//   "mat2.augment": Mat2AugmentedRankSketch,
//   // "mat2.outer": HadamardOuterSketch,
//   "mat2.rankops": Mat2RankOpsSketch,
//   "mat2.outer": Mat2OuterProductSketch,
//
//   "mat2.rowspace": Mat2RowSpaceSketch,
//
//   "mat2.leftnull": Mat2LeftNullspaceSketch,
//   "video.embed": VideoEmbedSketch,
//
//   "mat2.rankTol": RankToleranceSketch,
//   "mat2.augRank": AugmentedRankProofSketch,
//
//   "mat2.linind": LinearIndependenceRankSketch,
//
//
//
//
//
//
//
//
//   "mod4.norms2": VectorNormsSketch,
//   "mod4.inner": InnerProductSketch,
//   "mod4.angle": AngleOrthogonalitySketch,
//   "mod4.projline": ProjectionLineSketch,
//   "mod4.projmat": ProjectionMatrixSketch,
//   "mod4.onb": OrthonormalBasisCoordsSketch,
//   "mod4.orthmat": OrthogonalMatrixSketch,
//   "mod4.gs": GramSchmidtSketch,
//   "mod4.weighted": WeightedInnerProductSketch,
//   "mod4.spd": SPD2x2Sketch,
//   "geo.distance":DistanceSketch,
//   "geo.norm_unitballs": GeoNormUnitBallsSketch,
//   "geo.inner_product_geometry": InnerProductGeometrySketch,
//   "geo.norm_unitballs": dynamic(
//       () => import("@/components/review/sketches/linear_algebra/mod4/GeoNormUnitBallsSketch"),
//       { ssr: false },
//   ),
//   "geo.inner_product_geometry": dynamic(
//       () => import("@/components/review/sketches/linear_algebra/mod4/GeoInnerProductGeometrySketch"),
//       { ssr: false },
//   ),
//   "geo.angle_orthogonality": dynamic(
//       () => import("@/components/review/sketches/linear_algebra/mod4/GeoAngleOrthogonalitySketch"),
//       { ssr: false },
//   ),
//   "geo.projection_line": dynamic(
//       () => import("@/components/review/sketches/linear_algebra/mod4/GeoProjectionLineSketch"),
//       { ssr: false },
//   ),
//   "geo.projection_dataset": dynamic(
//       () => import("@/components/review/sketches/linear_algebra/mod4/GeoProjectionDatasetSketch"),
//       { ssr: false },
//   ),
//   "geo.projection_affine": dynamic(
//       () => import("@/components/review/sketches/linear_algebra/mod4/GeoProjectionAffineSketch"),
//       { ssr: false },
//   ),
//   "geo.gram_schmidt": dynamic(
//       () => import("@/components/review/sketches/linear_algebra/mod4/GeoGramSchmidtSketch"),
//       { ssr: false },
//   ),
//   // "geo.rotations_givens": dynamic(
//   //     () => import("../sketches/mod4/GeoRotationsGivensSketch"),
//   //     { ssr: false },
//   // ),
//
//
//
//   "py.print": PrintOptionsSketch,
// "py.io": InputOutputSketch,
// "py.vars": VariablesSketch,
// "py.strings": StringsSketch,
// "py.arith": ArithmeticPrecedenceSketch,
// "py.errors": ErrorMessagesSketch,
// "py.docs": CommentsDocstringsSketch,
// //  "video.embed": VideoEmbedSketch,
//   "hc.greetings": HCGreetingsSketch,
//   "hc.pronouns": HCPronounsSketch,
//   "hc.sentences": HCSentencesSketch,
//   "hc.questions": HCQuestionsSketch,
//   "hc.numbers": HCNumbersSketch,
//
//
//
//
//   // "ai0.what": AiWhatIsSketch,
//   // "ai0.prompt_builder": AiPromptBuilderSketch,
//   // "ai0.prompt_refine": AiPromptRefineSketch,
//   // "ai0.verify": AiVerifyChecklistSketch,
//   // "ai0.privacy": AiPrivacyRedactionSketch,
//   // "ai0.tone": AiToneRewriteSketch,
//
//   "ai.intro": AIIntroSketch,
//   "ai.getstarted": AIGetStartedSketch,
//   "ai.verify": AIVerifySketch,
//
//   "ai.usecases": AIUseCasesSketch,
//   "ai.workflow": AIWorkflowSketch,
//   "ai.format": AIFormatSketch,
//   "ai.safety": AISafetySketch,
//   "ai.redaction": AIRedactionSketch,
//   "ai.datacontrols": AIDataControlsSketch,
//   "ai.lab": AILabSketch,
// };
//
// export default function SketchHost({
//   sketchId,
//   props,
//   height,
// }: {
//   sketchId: string;
//   props?: any;
//   height: number;
// }) {
//   const Cmp = SKETCHES[sketchId];
//
//   if (!Cmp) {
//     return (
//       <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white/60">
//         Unknown sketch: <code className="text-white/80">{sketchId}</code>
//       </div>
//     );
//   }
//
//   return (
//     <div
//       className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hbidden"
//       //   style={{ height }}
//     >
//       {/* Give sketches a consistent box to live in */}
//       <div className="h-full w-full">
//         {/* pass height for future sketches that want to use it */}
//         <Cmp {...props} height={height} />
//       </div>
//     </div>
//   );
// }
