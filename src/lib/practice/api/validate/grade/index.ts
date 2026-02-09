// src/lib/practice/validate/grade/index.ts
import type { LoadedInstance } from "../load";
import type { SubmitAnswer } from "../schemas";

import { gradeNumeric } from "./numeric";
import { gradeSingleChoice } from "./singleChoice";
import { gradeMultiChoice } from "./multiChoice";
import { gradeMatrixInput } from "./matrixInput";
import { gradeVectorDragTarget } from "./vectorDragTarget";
import { gradeVectorDragDot } from "./vectorDragDot";
import { gradeCodeInput } from "./codeInput";
import { gradeTextInput } from "./textInput";
import { gradeDragReorder } from "./dragReorder";
import { gradeVoiceInput } from "./voiceInput";

export type GradeResult = {
  ok: boolean;
  explanation: string;
  revealAnswer: any | null;
};

export async function gradeInstance(args: {
  instance: LoadedInstance;
  expectedCanon: any;
  answer: SubmitAnswer | null;
  isReveal: boolean;
}): Promise<GradeResult> {
  switch (args.instance.kind) {
    case "numeric":
      return gradeNumeric(args);

    case "single_choice":
      return gradeSingleChoice(args);

    case "multi_choice":
      return gradeMultiChoice(args);

    case "matrix_input":
      return gradeMatrixInput(args);

    case "vector_drag_target":
      return gradeVectorDragTarget(args);

    case "vector_drag_dot":
      return gradeVectorDragDot(args);

    case "code_input":
      return gradeCodeInput(args);
    case "text_input":
      return gradeTextInput(args);

    case "drag_reorder":
      return gradeDragReorder(args);

    case "voice_input":
      return gradeVoiceInput(args);
    default:
      return {
        ok: false,
        revealAnswer: null,
        explanation: `Unsupported instance kind: ${String(args.instance.kind)}`,
      };
  }
}
