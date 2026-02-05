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

  const outOfAttempts =
    isAssignmentRun && attempts >= maxAttempts && current.result?.ok !== true;

  // ✅ checked should work for history too (result exists even if submitted flag doesn't)
  const checked = Boolean(current.submitted || current.result);
  const ok = current.result?.ok ?? null;

  // lock if readOnly, busy, already correct, or no attempts left
  const lockInputs = readOnly || busy || ok === true || outOfAttempts;

  // when user edits after checking, clear result/submitted (back to “unchecked” look)
  function resetCheckPatch() {
    if (readOnly) return {}; // ✅ don't mutate in summary/review
    return checked ? { submitted: false, result: null } : {};
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
  // single_choice (in-place highlight)
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
  // multi_choice (in-place per option)
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
            ...(checked ? { submitted: false, result: null } : {}),
          });
        }}
        onChange={(next) =>
          updateCurrent({
            mat: next,
            ...(checked ? { submitted: false, result: null } : {}),
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
  // code_input (show correct below if incorrect + reviewCorrect provided)
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


