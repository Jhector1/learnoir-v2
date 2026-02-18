// "use client";
//
// import React from "react";
// import type {SketchSpec} from "./specTypes";
// import type {SavedSketchState} from "./types";
//
// import IntroStepperSketch from "./_archetypes/IntroStepperSketch";
// import ChecklistSketch from "./_archetypes/ChecklistSketch";
// import TemplatePickerSketch from "./_archetypes/TemplatePickerSketch";
// import TransformToggleSketch from "./_archetypes/TransformToggleSketch";
// import LabRunnerSketch from "./_archetypes/LabRunnerSketch";
// import FlashcardsSketch from "./_archetypes/FlashcardsSketch";
// import ReorderTokensSketch from "./_archetypes/ReorderTokensSketch";
// import ClassifierGateSketch from "./_archetypes/ClassifierGateSketch";
// import ExampleGallerySketch from "./_archetypes/ExampleGallerySketch";
// import CompareTableSketch from "./_archetypes/CompareTableSketch";
// import PipelineBuilderSketch from "./_archetypes/PipelineBuilderSketch";
// import GlossarySketch from "./_archetypes/GlossarySketch";
// import UIPathGuideSketch from "./_archetypes/UIPathGuideSketch";
// import {
//     CanvasHudSketch,
//     ChartExplorerSketch,
//     CodeTraceSketch,
//     CompareBeforeAfterSketch,
//     DatasetExplorerSketch,
//     DiagramCalloutsSketch,
//     ErrorHuntSketch,
//     FillBlankSketch, InspectorPanelSketch,
//     IOTranscriptSketch, MatrixHudSketch, MiniQuizSketch, MultiStepFormSketch,
//     PromptBuilderSketch,
//     RubricSelfCheckSketch,
//     ScenarioBranchSketch, SentenceBuilderSketch, SpacedRecallQueueSketch,
//     TimelineSketch, VectorPadHudSketch,
//     VideoLessonSketch,
//     VocabMatchSketch
// } from "@/components/review/sketches/_archetypes/archetypes";
//
// export default function SketchRenderer({
//                                            spec,
//                                            value,
//                                            onChange,
//                                            readOnly,
//                                        }: {
//     spec: SketchSpec;
//     value: SavedSketchState;
//     onChange: (s: SavedSketchState) => void;
//     readOnly?: boolean;
// }) {
//     switch (spec.archetype) {
//         case "intro_stepper":
//             return <IntroStepperSketch spec={spec} value={value} onChange={onChange} readOnly={readOnly}/>;
//
//         case "checklist":
//             return <ChecklistSketch spec={spec} value={value} onChange={onChange} readOnly={readOnly}/>;
//
//         case "template_picker":
//             return <TemplatePickerSketch spec={spec} value={value} onChange={onChange} readOnly={readOnly}/>;
//
//         case "transform_toggle":
//             return <TransformToggleSketch spec={spec} value={value} onChange={onChange} readOnly={readOnly}/>;
//
//         case "lab_runner":
//             return <LabRunnerSketch spec={spec} value={value} onChange={onChange} readOnly={readOnly}/>;
//
//         case "flashcards":
//             return <FlashcardsSketch spec={spec} value={value} onChange={onChange} readOnly={readOnly}/>;
//
//         case "reorder_tokens":
//             return <ReorderTokensSketch spec={spec} value={value} onChange={onChange} readOnly={readOnly}/>;
//
//         case "classifier_gate":
//             return <ClassifierGateSketch spec={spec} value={value} onChange={onChange} readOnly={readOnly}/>;
//
//         case "example_gallery":
//             return <ExampleGallerySketch spec={spec} value={value} onChange={onChange} readOnly={readOnly}/>;
//
//         case "compare_table":
//             return <CompareTableSketch spec={spec} value={value} onChange={onChange} readOnly={readOnly}/>;
//
//         case "pipeline_builder":
//             return <PipelineBuilderSketch spec={spec} value={value} onChange={onChange} readOnly={readOnly}/>;
//
//         case "glossary":
//             return <GlossarySketch spec={spec} value={value} onChange={onChange} readOnly={readOnly}/>;
//
//         case "ui_path_guide":
//             return <UIPathGuideSketch spec={spec} value={value} onChange={onChange} readOnly={readOnly}/>;
//
//
//         // case "intro_stepper":
//         //     return <IntroStepperSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly}/>;
//         // case "template_picker":
//         //     return <TemplatePickerSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly}/>;
//         // case "checklist":
//         //     return <ChecklistSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly}/>;
//         // case "flashcards":
//         //     return <FlashcardsSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly}/>;
//         // case "lab_runner":
//         //     return <LabRunnerSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly}/>;
//         // case "classifier_gate":
//         //     return <ClassifierGateSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly}/>;
//         // case "transform_toggle":
//         //     return <TransformToggleSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly}/>;
//         // case "reorder_tokens":
//         //     return <ReorderTokensSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly}/>;
//         case "fill_blank":
//             return <FillBlankSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly}/>;
//         case "prompt_builder":
//             return <PromptBuilderSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly}/>;
//         case "compare_before_after":
//             return <CompareBeforeAfterSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly}/>;
//         case "timeline":
//             return <TimelineSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly}/>;
//         case "scenario_branch":
//             return <ScenarioBranchSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly}/>;
//         case "rubric_self_check":
//             return <RubricSelfCheckSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly}/>;
//         case "error_hunt":
//             return <ErrorHuntSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly}/>;
//         case "code_trace":
//             return <CodeTraceSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly}/>;
//         case "io_transcript":
//             return <IOTranscriptSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly}/>;
//         case "video_lesson":
//             return <VideoLessonSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly}/>;
//         case "diagram_callouts":
//             return <DiagramCalloutsSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly}/>;
//         case "dataset_explorer":
//             return <DatasetExplorerSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly}/>;
//         case "chart_explorer":
//             return <ChartExplorerSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly}/>;
//         case "vocab_match":
//             return <VocabMatchSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly}/>;
//         case "sentence_builder":
//             return <SentenceBuilderSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly}/>;
//         case "spaced_recall_queue":
//             return <SpacedRecallQueueSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly}/>;
//         case "mini_quiz":
//             return <MiniQuizSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly}/>;
//         case "multi_step_form":
//             return <MultiStepFormSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly}/>;
//         case "inspector_panel":
//             return <InspectorPanelSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly}/>;
//         case "canvas_hud":
//             return <CanvasHudSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly}/>;
//         case "vectorpad_hud":
//             return <VectorPadHudSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly}/>;
//         case "matrix_hud":
//             return <MatrixHudSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly}/>;
//
//
//         default:
//             return null;
//     }
// }



"use client";

import * as React from "react";
import type { SavedSketchState } from "./types";
import type { SketchSpec } from "./specTypes";

import {
    IntroStepperSketch,
    // TemplatePickerSketch,
    ChecklistSketch,
    FlashcardsSketch,
    LabRunnerSketch,
    ClassifierGateSketch,
    TransformToggleSketch,
    ReorderTokensSketch,
    FillBlankSketch,
    PromptBuilderSketch,
    CompareBeforeAfterSketch,
    TimelineSketch,
    ScenarioBranchSketch,
    RubricSelfCheckSketch,
    ErrorHuntSketch,
    CodeTraceSketch,
    IOTranscriptSketch,
    VideoLessonSketch,
    DiagramCalloutsSketch,
    DatasetExplorerSketch,
    ChartExplorerSketch,
    VocabMatchSketch,
    SentenceBuilderSketch,
    SpacedRecallQueueSketch,
    MiniQuizSketch,
    MultiStepFormSketch,
    InspectorPanelSketch,
    CanvasHudSketch,
    VectorPadHudSketch,
    MatrixHudSketch,
} from "@/components/sketches/_archetypes/archetypes";
import {ParagraphSketch} from "@/components/sketches/_archetypes/ParagraphSketch";
import TemplatePickerSketch from "@/components/sketches/_archetypes/TemplatePickerSketch";
import PipelineBuilderSketch from "@/components/sketches/_archetypes/PipelineBuilderSketch";
import UIPathGuideSketch from "@/components/sketches/_archetypes/UIPathGuideSketch";
import {CodeSketch} from "@/components/sketches/_archetypes/CodeSketch";
import ImageSketch from "@/components/sketches/_archetypes/ImageSketch";

export default function SketchRenderer({
                                           spec,
                                           value,
                                           onChange,
                                           readOnly,
                                       }: {
    spec: SketchSpec;
    value: SavedSketchState;
    onChange: (s: SavedSketchState) => void;
    readOnly?: boolean;
}) {
    switch (spec.archetype) {
        case "pipeline_builder":
             return <PipelineBuilderSketch spec={spec} value={value} onChange={onChange} readOnly={readOnly}/>;
        case "ui_path_guide":
            return <UIPathGuideSketch spec={spec} value={value} onChange={onChange} readOnly={readOnly}/>;
        case "code_runner":
            return <CodeSketch spec={spec}  />
        case "intro_stepper":
            return <IntroStepperSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly} />;
        case "template_picker":
            return <TemplatePickerSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly} />;
        case "checklist":
            return <ChecklistSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly} />;
        case "flashcards":
            return <FlashcardsSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly} />;
        case "lab_runner":
            return <LabRunnerSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly} />;
        case "classifier_gate":
            return <ClassifierGateSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly} />;
        case "transform_toggle":
            return <TransformToggleSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly} />;
        case "reorder_tokens":
            return <ReorderTokensSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly} />;
        case "fill_blank":
            return <FillBlankSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly} />;
        case "prompt_builder":
            return <PromptBuilderSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly} />;
        case "compare_before_after":
            return <CompareBeforeAfterSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly} />;
        case "timeline":
            return <TimelineSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly} />;
        case "scenario_branch":
            return <ScenarioBranchSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly} />;
        case "rubric_self_check":
            return <RubricSelfCheckSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly} />;
        case "error_hunt":
            return <ErrorHuntSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly} />;
        case "code_trace":
            return <CodeTraceSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly} />;
        case "io_transcript":
            return <IOTranscriptSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly} />;
        case "video_lesson":
            return <VideoLessonSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly} />;
        case "diagram_callouts":
            return <DiagramCalloutsSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly} />;
        case "dataset_explorer":
            return <DatasetExplorerSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly} />;
        case "chart_explorer":
            return <ChartExplorerSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly} />;
        case "vocab_match":
            return <VocabMatchSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly} />;
        case "sentence_builder":
            return <SentenceBuilderSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly} />;
        case "spaced_recall_queue":
            return <SpacedRecallQueueSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly} />;
        case "mini_quiz":
            return <MiniQuizSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly} />;
        case "multi_step_form":
            return <MultiStepFormSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly} />;
        case "inspector_panel":
            return <InspectorPanelSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly} />;
        case "canvas_hud":
            return <CanvasHudSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly} />;
        case "vectorpad_hud":
            return <VectorPadHudSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly} />;
        case "matrix_hud":
            return <MatrixHudSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly} />;

        case "paragraph":
            return <ParagraphSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly} />;

// ✅ NEW
        case "image":
            return <ImageSketch spec={spec as any} value={value} onChange={onChange} readOnly={readOnly} />;


        default:
            return (
                <div className="rounded-xl border border-rose-300/20 bg-rose-300/10 p-3 text-xs font-extrabold text-rose-700 dark:text-rose-200/90">
                    Unknown archetype: <span className="font-mono">{String((spec as any)?.archetype)}</span>
                </div>
            );
    }
}
