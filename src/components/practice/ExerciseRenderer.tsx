// src/components/practice/ExerciseRenderer.tsx
"use client";

import React from "react";
import type { Exercise } from "@/lib/practice/types";
import type { VectorPadState } from "@/components/vectorpad/types";

import NumericExerciseUI from "./kinds/NumericExerciseUI";
import SingleChoiceExerciseUI from "./kinds/SingleChoiceExerciseUI";
import MultiChoiceExerciseUI from "./kinds/MultiChoiceExerciseUI";
import VectorDragTargetExerciseUI from "./kinds/VectorDragTargetExerciseUI";
import VectorDragDotExerciseUI from "./kinds/VectorDragDotExerciseUI";
import CodeInputExerciseUI from "./kinds/CodeInputExerciseUI";

// ✅ NEW kinds
import TextInputExerciseUI from "./kinds/TextInputExerciseUI";
import DragReorderExerciseUI from "./kinds/DragReorderExerciseUI";
import VoiceInputExerciseUI from "./kinds/VoiceInputExerciseUI";

import type { QItem } from "./practiceType";
import MatrixInputPanel from "./MatrixInputPanel";
import { resizeGrid } from "@/lib/practice/matrixHelpers";

export default function ExerciseRenderer({
  exercise,
  current,
  busy,
  isAssignmentRun,
  maxAttempts,
  padRef,
  updateCurrent,
  readOnly = false,

  // ✅ NEW (optional): provide correct item (built from expected) during review
  reviewCorrectItem = null,
}: {
  exercise: Exercise;
  current: QItem;
  busy: boolean;
  isAssignmentRun: boolean;
  maxAttempts: number;
  padRef: React.MutableRefObject<VectorPadState>;
  updateCurrent: (patch: Partial<QItem>) => void;
  readOnly?: boolean;

  reviewCorrectItem?: QItem | null;
}) {
  const attempts = current.attempts ?? 0;

  // ✅ "any result exists" includes reveal result objects (even when ok=null)
  const hasAnyResult = Boolean(current.submitted || current.result);

  // ✅ only treat ok as graded when boolean (reveal often sets ok=null)
  const ok: boolean | null =
    typeof current.result?.ok === "boolean" ? current.result.ok : null;

  // ✅ checked for STYLING should mean "graded", not merely "result object exists"
  // (prevents Reveal from forcing red/green states)
  const checked = Boolean(current.submitted || ok !== null);

  const outOfAttempts = isAssignmentRun && attempts >= maxAttempts && ok !== true;

  // lock if readOnly, busy, already correct, or no attempts left
  const lockInputs = readOnly || busy || ok === true || outOfAttempts;

  // when user edits after checking/reveal, clear result/submitted (back to “unchecked” look)
  function resetCheckPatch() {
    if (readOnly) return {}; // ✅ don't mutate in summary/review
    return hasAnyResult ? { submitted: false, result: null } : {};
  }

  // -----------------------------
  // numeric
  // -----------------------------
  if (exercise.kind === "numeric") {
    return (
      <NumericExerciseUI
        exercise={exercise}
        value={current.num}
        onChange={(num) => updateCurrent({ num, ...resetCheckPatch() })}
        disabled={lockInputs}
        checked={checked}
        ok={ok}
      />
    );
  }

  // -----------------------------
  // single_choice
  // -----------------------------
  if (exercise.kind === "single_choice") {
    const reviewCorrectId =
      reviewCorrectItem && typeof (reviewCorrectItem as any).single === "string"
        ? String((reviewCorrectItem as any).single)
        : null;

    return (
      <SingleChoiceExerciseUI
        exercise={exercise}
        value={current.single}
        onChange={(id) => updateCurrent({ single: id, ...resetCheckPatch() })}
        disabled={lockInputs}
        checked={checked}
        ok={ok}
        reviewCorrectId={reviewCorrectId}
      />
    );
  }

  // -----------------------------
  // multi_choice
  // -----------------------------
  if (exercise.kind === "multi_choice") {
    const reviewCorrectIds =
      reviewCorrectItem && Array.isArray((reviewCorrectItem as any).multi)
        ? (reviewCorrectItem as any).multi.map((x: any) => String(x))
        : null;

    return (
      <MultiChoiceExerciseUI
        exercise={exercise}
        value={current.multi}
        onChange={(ids) => updateCurrent({ multi: ids, ...resetCheckPatch() })}
        disabled={lockInputs}
        checked={checked}
        ok={ok}
        reviewCorrectIds={reviewCorrectIds}
      />
    );
  }

  // -----------------------------
  // text_input ✅ NEW
  // -----------------------------
  if (exercise.kind === "text_input") {
    const reviewCorrectText =
      reviewCorrectItem && typeof (reviewCorrectItem as any).text === "string"
        ? String((reviewCorrectItem as any).text)
        : null;

    return (
      <TextInputExerciseUI
        exercise={exercise as any}
        value={(current as any).text ?? ""}
        onChange={(text) => updateCurrent({ text, ...resetCheckPatch() })}
        disabled={lockInputs}
        checked={checked}
        ok={ok}
        reviewCorrectText={reviewCorrectText}
      />
    );
  }

  // -----------------------------
  // drag_reorder ✅ NEW
  // -----------------------------
  if (exercise.kind === "drag_reorder") {
    const reviewCorrectTokenIds =
      reviewCorrectItem && Array.isArray((reviewCorrectItem as any).reorderIds)
        ? (reviewCorrectItem as any).reorderIds.map((x: any) => String(x))
        : null;

    return (
      <DragReorderExerciseUI
        exercise={exercise as any}
        tokenIds={(current as any).reorderIds ?? []}
        onChange={(tokenIds) =>
          updateCurrent({ reorderIds: tokenIds, ...resetCheckPatch() })
        }
        disabled={lockInputs}
        checked={checked}
        ok={ok}
        reviewCorrectTokenIds={reviewCorrectTokenIds}
      />
    );
  }

  // -----------------------------
  // voice_input ✅ NEW
  // -----------------------------
  if (exercise.kind === "voice_input") {
    const reviewCorrectTranscript =
      reviewCorrectItem &&
      typeof (reviewCorrectItem as any).voiceTranscript === "string"
        ? String((reviewCorrectItem as any).voiceTranscript)
        : null;

    return (
      <VoiceInputExerciseUI
        exercise={exercise as any}
        transcript={(current as any).voiceTranscript ?? ""}
        onChangeTranscript={(voiceTranscript) =>
          updateCurrent({ voiceTranscript, ...resetCheckPatch() })
        }
        disabled={lockInputs}
        checked={checked}
        ok={ok}
        reviewCorrectTranscript={reviewCorrectTranscript}
      />
    );
  }

  // -----------------------------
  // matrix_input
  // -----------------------------
  if (exercise.kind === "matrix_input") {
    const exAny = exercise as any;

    // ✅ Always allow resizing for this kind (educational intent)
    const allowResize = true;

    // ✅ lockInputs already includes: busy, correct, or out-of-attempts, readOnly, etc.
    const panelReadOnly = lockInputs;

    return (
      <MatrixInputPanel
        labelLatex={exAny.labelLatex ?? String.raw`\mathbf{A}=`}
        rows={current.matRows}
        cols={current.matCols}
        allowResize={allowResize}
        value={current.mat}
        readOnly={panelReadOnly}
        requiredRows={exAny.rows}
        requiredCols={exAny.cols}
        onShapeChange={(r, c) => {
          updateCurrent({
            matRows: r,
            matCols: c,
            mat: resizeGrid(current.mat, r, c),
            ...(hasAnyResult ? { submitted: false, result: null } : {}),
          });
        }}
        onChange={(next) =>
          updateCurrent({
            mat: next,
            ...(hasAnyResult ? { submitted: false, result: null } : {}),
          })
        }
      />
    );
  }

  // -----------------------------
  // vector_drag_target
  // -----------------------------
  if (exercise.kind === "vector_drag_target") {
    return (
      <VectorDragTargetExerciseUI
        key={(exercise as any).id ?? (exercise as any).key ?? current.key}
        exercise={exercise}
        a={current.dragA}
        b={current.dragB}
        onChange={(a, b) =>
          updateCurrent({ dragA: a, dragB: b, ...resetCheckPatch() })
        }
        padRef={padRef}
        disabled={lockInputs}
      />
    );
  }

  // -----------------------------
  // vector_drag_dot
  // -----------------------------
  if (exercise.kind === "vector_drag_dot") {
    return (
      <VectorDragDotExerciseUI
        exercise={exercise}
        a={current.dragA}
        onChange={(a) => updateCurrent({ dragA: a, ...resetCheckPatch() })}
        padRef={padRef}
        disabled={lockInputs}
      />
    );
  }

  // -----------------------------
  // code_input
  // -----------------------------
  if (exercise.kind === "code_input") {
    const reviewCorrect =
      reviewCorrectItem && typeof (reviewCorrectItem as any)?.code === "string"
        ? {
            language: (reviewCorrectItem as any).codeLang,
            code: (reviewCorrectItem as any).code,
            stdin: (reviewCorrectItem as any).codeStdin ?? "",
          }
        : null;

    return (
      <CodeInputExerciseUI
        exercise={exercise as any}
        code={current.code}
        stdin={current.codeStdin}
        language={current.codeLang}
        onChangeCode={(code) => updateCurrent({ code, ...resetCheckPatch() })}
        onChangeStdin={(codeStdin) =>
          updateCurrent({ codeStdin, ...resetCheckPatch() })
        }
        onChangeLanguage={(codeLang) =>
          updateCurrent({ codeLang, ...resetCheckPatch() })
        }
        disabled={lockInputs}
        checked={checked}
        ok={ok}
        readOnly={readOnly}
        reviewCorrect={reviewCorrect as any}
      />
    );
  }

  return assertNever(exercise as never);
}

function assertNever(x: never): never {
  throw new Error(`Unsupported exercise kind: ${JSON.stringify(x)}`);
}
